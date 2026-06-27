import { TRPCError } from "@trpc/server";
import { prisma } from "@/server/db";
import { formatDate } from "@/lib/helpers/format";
import type { PosOrderInput } from "@/lib/validations/order.schema";
import type { Prisma } from "@/generated/prisma/client";

const invoiceListSelect = {
  id: true,
  orderNumber: true,
  total: true,
  paymentMethod: true,
  paymentStatus: true,
  createdAt: true,
  customer: { select: { name: true } },
  _count: { select: { items: true } },
} satisfies Prisma.OrderSelect;

export type InvoiceRow = Prisma.OrderGetPayload<{
  select: typeof invoiceListSelect;
}>;

function genOrderNumber() {
  // INV-<base36 waktu>-<2 digit acak> → unik & terurut waktu
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.floor(Math.random() * 100)
    .toString()
    .padStart(2, "0");
  return `INV-${ts}${rnd}`;
}

export const orderService = {
  /** Baris untuk export CSV riwayat order (sudah di-coerce, aman ke client). */
  async exportRows(tenantId: string) {
    const rows = await prisma.order.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      select: {
        orderNumber: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
        status: true,
        customer: { select: { name: true } },
        createdAt: true,
      },
    });
    return rows.map((o) => ({
      orderNumber: o.orderNumber,
      date: formatDate(o.createdAt),
      customer: o.customer?.name ?? "Umum",
      total: o.total,
      paymentMethod: o.paymentMethod ?? "",
      paymentStatus: o.paymentStatus,
      status: o.status,
    }));
  },

  /** Data untuk terminal POS: produk aktif + daftar pelanggan. */
  async getPosData(tenantId: string) {
    const [products, customers] = await Promise.all([
      prisma.product.findMany({
        where: { tenantId, status: "ACTIVE" },
        select: {
          id: true,
          name: true,
          price: true,
          stock: true,
          category: { select: { name: true } },
          variants: {
            select: { id: true, name: true, price: true, stock: true },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { name: "asc" },
        take: 200,
      }),
      prisma.customer.findMany({
        where: { tenantId },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);
    return { products, customers };
  },

  /**
   * Simpan transaksi POS (kasir internal). Hitung total dari harga DB (jangan
   * percaya harga klien), kurangi stok, naikkan soldCount, update statistik
   * pelanggan — semua dalam 1 transaksi.
   */
  async createPos(tenantId: string, input: PosOrderInput) {
    const products = await prisma.product.findMany({
      where: { tenantId, id: { in: input.items.map((i) => i.productId) } },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        variants: { select: { id: true, name: true, price: true, stock: true } },
      },
    });
    const byId = new Map(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const lines = input.items.map((i) => {
      const p = byId.get(i.productId);
      if (!p)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Produk tidak ditemukan atau bukan milik Anda.",
        });

      // Pakai harga/stok/nama dari varian bila dipilih.
      let name = p.name;
      let price = p.price;
      let stock = p.stock;
      let variantId: string | null = null;
      if (i.variantId) {
        const v = p.variants.find((x) => x.id === i.variantId);
        if (!v)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Varian tidak ditemukan.",
          });
        name = `${p.name} - ${v.name}`;
        price = v.price;
        stock = v.stock;
        variantId = v.id;
      }

      if (stock < i.quantity)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `Stok "${name}" tidak mencukupi (tersisa ${stock}).`,
        });

      const lineSubtotal = price * i.quantity;
      subtotal += lineSubtotal;
      return {
        productId: p.id,
        variantId,
        productName: name,
        price,
        quantity: i.quantity,
        subtotal: lineSubtotal,
      };
    });
    const orderItems = lines.map(({ variantId, ...rest }) => rest);

    const discount = Math.min(input.discount, subtotal);
    const total = subtotal - discount;

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          tenantId,
          customerId: input.customerId || null,
          orderNumber: genOrderNumber(),
          subtotal,
          discount,
          total,
          status: "COMPLETED",
          paymentMethod: input.paymentMethod,
          paymentStatus: "PAID",
          paidAt: new Date(),
          items: { create: orderItems },
        },
        select: { id: true, orderNumber: true, total: true },
      });

      for (const line of lines) {
        if (line.variantId) {
          await tx.productVariant.update({
            where: { id: line.variantId },
            data: { stock: { decrement: line.quantity } },
          });
          await tx.product.update({
            where: { id: line.productId },
            data: { soldCount: { increment: line.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: line.productId },
            data: {
              stock: { decrement: line.quantity },
              soldCount: { increment: line.quantity },
            },
          });
        }
      }

      if (input.customerId) {
        await tx.customer.update({
          where: { id: input.customerId },
          data: {
            totalOrders: { increment: 1 },
            totalSpent: { increment: total },
          },
        });
      }

      return order;
    });
  },

  /** Daftar invoice (riwayat transaksi POS). */
  getInvoices: (tenantId: string): Promise<InvoiceRow[]> =>
    prisma.order.findMany({
      where: { tenantId },
      select: invoiceListSelect,
      orderBy: { createdAt: "desc" },
      take: 100,
    }),

  /** Detail invoice (struk) milik tenant. Lempar jika bukan miliknya. */
  getInvoiceById: (tenantId: string, id: string) =>
    prisma.order.findFirstOrThrow({
      where: { id, tenantId },
      select: {
        id: true,
        orderNumber: true,
        subtotal: true,
        discount: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
        createdAt: true,
        customer: { select: { name: true, phone: true, address: true } },
        items: {
          select: {
            productName: true,
            price: true,
            quantity: true,
            subtotal: true,
          },
        },
      },
    }),
};
