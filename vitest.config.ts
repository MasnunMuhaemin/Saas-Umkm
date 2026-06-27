import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    env: {
      // Dummy supaya modul yang transitif menyentuh env tidak gagal saat import.
      DATABASE_URL: "mysql://root:@127.0.0.1:3306/tokopintar_test",
      AUTH_SECRET: "test-secret-key-for-vitest",
      NEXT_PUBLIC_ROOT_DOMAIN: "tokopintar.id",
    },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
