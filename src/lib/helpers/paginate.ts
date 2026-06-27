import { PER_PAGE } from "@/lib/constants/config";

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

/**
 * Paginasi generik — pakai untuk SEMUA model (product, order, customer, tenant).
 * Pass delegate Prisma + where + opsi. Hapus duplikasi findMany+count di tiap service.
 */
export async function paginate<T>(
  delegate: {
    findMany: (args: unknown) => Promise<T[]>;
    count: (args: unknown) => Promise<number>;
  },
  options: {
    where?: unknown;
    include?: unknown;
    select?: unknown;
    orderBy?: unknown;
    page?: number;
    perPage?: number;
  },
): Promise<Paginated<T>> {
  const {
    where,
    include,
    select,
    orderBy = { createdAt: "desc" },
    page = 1,
    perPage = PER_PAGE,
  } = options;

  const [data, total] = await Promise.all([
    delegate.findMany({
      where,
      // include & select tidak boleh dikirim bersamaan ke Prisma
      ...(select ? { select } : { include }),
      orderBy,
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    delegate.count({ where }),
  ]);

  return { data, total, page, perPage, lastPage: Math.ceil(total / perPage) };
}
