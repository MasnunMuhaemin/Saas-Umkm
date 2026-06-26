import "server-only";
import { cache } from "react";
import { appRouter } from "@/server/routers/_app";
import { createCallerFactory, createContext } from "@/server/trpc";

const createCaller = createCallerFactory(appRouter);

/**
 * Server caller tRPC untuk RSC (pengganti fetch manual).
 * Pakai: const api = await getServerTrpc(); const data = await api.me();
 * `cache` memastikan 1 context per request.
 */
export const getServerTrpc = cache(async () =>
  createCaller(await createContext()),
);
