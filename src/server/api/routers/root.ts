import { createTRPCRouter } from "~/server/api/trpc";
import { taskRouter } from "./task";

export const appRouter = createTRPCRouter({
  task: taskRouter,
});

export type AppRouter = typeof appRouter;
