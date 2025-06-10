import { createTRPCRouter, protectedProcedure, TRPCError } from "~/server/api/trpc";
import { db } from "~/server/db";
import { z } from "zod";

// Define input schemas for project operations
const projectInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

const partialProjectInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});

export const projectRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db.project.findMany({
      where: {
        OR: [
          { ownerId: ctx.session.user.id },
          { members: { some: { id: ctx.session.user.id } } },
        ],
      },
      include: {
        owner: true,
        members: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return projects;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
        include: {
          owner: true,
          members: true,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      // Check if user is either the owner or a member
      const isAuthorized = 
        project.ownerId === ctx.session.user.id ||
        project.members.some(member => member.id === ctx.session.user.id);

      if (!isAuthorized) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You don't have access to this project",
        });
      }

      return project;
    }),

  create: protectedProcedure
    .input(projectInputSchema)
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.create({
        data: {
          ...input,
          owner: {
            connect: { id: ctx.session.user.id },
          },
          members: {
            connect: { id: ctx.session.user.id },
          },
        },
      });
      return project;
    }),

  update: protectedProcedure
    .input(partialProjectInputSchema)
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
        include: { owner: true },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (project.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You can only update projects you own",
        });
      }

      const updatedProject = await ctx.db.project.update({
        where: { id: input.id },
        data: {
          ...input,
          id: undefined,
        },
      });
      return updatedProject;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
        include: { owner: true },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }

      if (project.ownerId !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You can only delete projects you own",
        });
      }

      await ctx.db.project.delete({
        where: { id: input.id },
      });
      return true;
    }),
});
