import { createTRPCRouter, publicProcedure } from "../trpc";
import { Session } from "next-auth";
import { User } from "@prisma/client";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";

interface ExtendedSession extends Session {
  user: User;
}

const isAuthed = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }
  return next({
    ctx: {
      ...ctx,
      session: ctx.session as ExtendedSession,
    },
  });
});

export const userRouter = createTRPCRouter({
  getProfile: isAuthed.query(({ ctx }) => {
    const session = ctx.session as ExtendedSession;
    const profile = {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      image: session.user.image,
    };
    return profile;
  }),

  updateProfile: isAuthed.input(z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
  })).mutation(async ({ ctx, input }) => {
    const session = ctx.session as ExtendedSession;
    const updatedUser = await ctx.db.user.update({
      where: { id: session.user.id },
      data: {
        name: input.name,
        email: input.email,
      },
    });

    return updatedUser;
  }),

  getAll: publicProcedure.query(async ({ ctx }) => {
    return await ctx.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  }),

  getProjectSettings: isAuthed.input(z.object({ projectId: z.string() })).query(async ({ ctx, input }) => {
    const session = ctx.session as ExtendedSession;
    const project = await ctx.db.project.findUnique({
      where: { id: input.projectId },
      include: {
        members: true,
      },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    return {
      name: project.name,
      description: project.description,
      members: project.members,
    };
  }),

  updateProjectSettings: isAuthed.input(z.object({
    projectId: z.string(),
    name: z.string().optional(),
    description: z.string().optional(),
    members: z.array(z.string()).optional(),
  })).mutation(async ({ ctx, input }) => {
    const session = ctx.session as ExtendedSession;
    const project = await ctx.db.project.update({
      where: { id: input.projectId },
      data: {
        name: input.name,
        description: input.description,
        members: input.members
          ? {
              set: input.members.map((id) => ({ id })),
            }
          : undefined,
      },
    });

    return project;
  }),
});
