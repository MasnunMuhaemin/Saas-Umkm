import { NextResponse } from "next/server";
import { billingService } from "@/server/services/shared/billing.service";

/** Cron harian: lifecycle langganan (ACTIVE→PAST_DUE→EXPIRED + suspend). */
export async function GET(req: Request) {
  if (
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await billingService.runLifecycle();
  return NextResponse.json(result);
}
