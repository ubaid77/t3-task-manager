import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { db } from "~/server/db";
import { z } from "zod";

// Define input schemas for project operations
const projectInputSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  description: z.string().nullable(),
  ownerId: z.string(),
  members: z.array(z.string()),
});

const partialProjectInputSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  members: z.array(z.string()).optional(),
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
          name: input.name,
          description: input.description,
          owner: {
            connect: { id: input.ownerId },
          },
          members: {
            connect: input.members.map(id => ({ id })),
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
          name: input.name,
          description: input.description,
          members: {
            set: input.members?.map(id => ({ id })) || [],
          },
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
