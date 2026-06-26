"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/routers/_app";

/** Hook tRPC untuk Client Component: trpc.product.list.useQuery(...) dll. */
export const trpc = createTRPCReact<AppRouter>();
