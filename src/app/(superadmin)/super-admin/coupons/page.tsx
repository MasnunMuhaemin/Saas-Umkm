import { getServerTrpc } from "@/lib/trpc/server";
import { CouponManager } from "./_components/coupon-manager";

export default async function CouponsPage() {
  const api = await getServerTrpc();
  const initial = await api.superadmin.coupon.list();
  return <CouponManager initial={initial} />;
}
