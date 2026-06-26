/**
 * Label & warna status. Pakai SEMANTIC class (bukan bg-green-100 hardcode),
 * supaya warna konsisten & bisa diubah dari satu tempat (design token di globals.css).
 */

export const ORDER_STATUS = {
  PENDING: { label: "Menunggu", className: "badge-warning" },
  PROCESSING: { label: "Diproses", className: "badge-info" },
  SHIPPED: { label: "Dikirim", className: "badge-accent" },
  COMPLETED: { label: "Selesai", className: "badge-success" },
  CANCELLED: { label: "Dibatalkan", className: "badge-danger" },
} as const;

export const PRODUCT_STATUS = {
  ACTIVE: { label: "Aktif", className: "badge-success" },
  INACTIVE: { label: "Nonaktif", className: "badge-muted" },
  OUT_OF_STOCK: { label: "Habis", className: "badge-danger" },
} as const;

export const TENANT_STATUS = {
  ACTIVE: { label: "Aktif", className: "badge-success" },
  TRIAL: { label: "Trial", className: "badge-info" },
  SUSPENDED: { label: "Disuspend", className: "badge-danger" },
  EXPIRED: { label: "Kedaluwarsa", className: "badge-muted" },
} as const;

export const SUBSCRIPTION_STATUS = {
  PENDING: { label: "Menunggu Bayar", className: "badge-warning" },
  ACTIVE: { label: "Aktif", className: "badge-success" },
  PAST_DUE: { label: "Jatuh Tempo", className: "badge-warning" },
  EXPIRED: { label: "Kedaluwarsa", className: "badge-danger" },
  CANCELLED: { label: "Dibatalkan", className: "badge-muted" },
} as const;
