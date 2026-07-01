import { z } from "zod";
import { router, superAdminProcedure } from "@/server/trpc";
import { auditService } from "@/server/services/superadmin/audit.service";

export const auditAdminRouter = router({
  list: superAdminProcedure
    .input(z.object({ page: z.number().int().min(1).default(1) }))
    .query(({ input }) => auditService.list(input.page)),
});
