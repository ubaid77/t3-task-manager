import { type Prisma } from '@prisma/client';

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export type Task = Prisma.TaskGetPayload<{
  include: {
    project: true;
    createdBy: true;
    assignedTo: true;
  }
}>;

export type PartialTask = {
  id: string;
  title: string;
  projectId: string;
  createdById: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
  assignedToId?: string | null;
  project?: {
    id: string;
    name: string | null;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    ownerId: string;
  };
  createdBy?: {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
  };
  assignedTo?: {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
  } | null;
};
