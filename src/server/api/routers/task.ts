import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { z } from "zod";
import { TaskStatus, TaskPriority } from "~/types/task";
import { TRPCError } from "@trpc/server";
import { type Task } from "@prisma/client";

const taskInputSchema = z.object({
  title: z.string(),
  description: z.string().optional().nullable(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  dueDate: z.date().optional().nullable(),
  projectId: z.string(),
  assignedToId: z.string().optional().nullable(),
  createdById: z.string(),
});

const partialTaskInputSchema = taskInputSchema.partial();

export const taskRouter = createTRPCRouter({
  getByProjectId: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const tasks = await ctx.db.task.findMany({
        where: {
          projectId: input.projectId,
          OR: [
            { assignedToId: ctx.session.user.id },
            { createdById: ctx.session.user.id },
          ],
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          project: true,
          assignedTo: true,
          createdBy: true,
        },
      });
      return tasks;
    }),
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const tasks = await ctx.db.task.findMany({
      where: {
        OR: [
          { assignedToId: ctx.session.user.id },
          { createdById: ctx.session.user.id },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        project: true,
        assignedTo: true,
        createdBy: true,
      },
    });
    return tasks;
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const task = await ctx.db.task.findUnique({
        where: { 
          id: input.id,
          AND: {
            OR: [
              { assignedToId: ctx.session.user.id },
              { createdById: ctx.session.user.id }
            ]
          }
        },
        include: {
          project: true,
          assignedTo: true,
          createdBy: true,
        },
      });
      if (!task) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found or unauthorized",
        });
      }
      return task;
    }),

  create: protectedProcedure
    .input(taskInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!input.projectId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Project ID is required to create a task",
        });
      }
      const task = await ctx.db.task.create({
        data: {
          title: input.title,
          description: input.description,
          status: input.status,
          priority: input.priority,
          dueDate: input.dueDate,
          projectId: input.projectId,
          assignedToId: input.assignedToId,
          createdById: ctx.session.user.id,
        },
        include: {
          createdBy: true,
          assignedTo: true,
          project: true
        }
      });
      return task;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      ...partialTaskInputSchema.shape
    }))
    .mutation(async ({ ctx, input }) => {
      const existingTask = await ctx.db.task.findUnique({
        where: { id: input.id },
        include: {
          createdBy: true,
          assignedTo: true,
          project: true
        }
      });

      if (!existingTask) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found"
        });
      }

      const updateData = {} as Partial<Task>;
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined) updateData.description = input.description;
      if (input.status !== undefined) updateData.status = input.status;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.dueDate !== undefined) updateData.dueDate = input.dueDate;
      if (input.projectId !== undefined) updateData.projectId = input.projectId;
      if (input.assignedToId !== undefined) updateData.assignedToId = input.assignedToId;
      if (input.createdById !== undefined) updateData.createdById = input.createdById;

      const updatedTask = await ctx.db.task.update({
        where: { id: input.id },
        data: updateData,
        include: {
          createdBy: true,
          assignedTo: true,
          project: true
        }
      });

      return updatedTask;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const task = await ctx.db.task.findUnique({
        where: { id: input.id },
        include: {
          createdBy: true,
        },
      });

      if (!task || task.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You can only delete tasks you created",
        });
      }

      await ctx.db.task.delete({
        where: { id: input.id },
      });
      return true;
    }),
});
