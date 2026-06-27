import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { billingService } from "@/server/services/shared/billing.service";
import { captureError } from "@/lib/logger";

const webhookSchema = z.object({
  amount: z.number(),
  order_id: z.string(),
  project: z.string(),
  status: z.string(),
  payment_method: z.string().optional(),
  completed_at: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = webhookSchema.parse(await req.json());

    // Pertahanan dasar: project harus cocok
    if (body.project !== process.env.PAKASIR_PROJECT) {
      return NextResponse.json({ error: "Invalid project" }, { status: 403 });
    }

    if (body.status === "completed") {
      // confirmPayment verifikasi ulang ke API Pakasir (tidak percaya webhook mentah)
      await billingService.confirmPayment(body.order_id, body);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    captureError(err, { where: "pakasir.webhook" });
    // Balas 200 agar Pakasir tidak retry tanpa henti; error sudah dicatat
    return NextResponse.json({ received: false }, { status: 200 });
  }
}
