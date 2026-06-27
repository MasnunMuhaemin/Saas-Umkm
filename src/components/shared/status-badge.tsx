import {
  ORDER_STATUS,
  PRODUCT_STATUS,
  TENANT_STATUS,
  SUBSCRIPTION_STATUS,
} from "@/lib/constants/status";
import { cn } from "@/lib/utils";

const MAPS = {
  order: ORDER_STATUS,
  product: PRODUCT_STATUS,
  tenant: TENANT_STATUS,
  subscription: SUBSCRIPTION_STATUS,
} as const;

type Variant = keyof typeof MAPS;

/** Badge status reusable — warna & label dari constants (satu sumber). */
export function StatusBadge({
  status,
  variant,
}: {
  status: string;
  variant: Variant;
}) {
  const map = MAPS[variant] as Record<
    string,
    { label: string; className: string }
  >;
  const item = map[status] ?? { label: status, className: "badge-muted" };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        item.className,
      )}
    >
      {item.label}
    </span>
  );
}
