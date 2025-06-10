import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "~/utils/api";
import { useQueryClient } from "@tanstack/react-query";
import { type Project } from "@prisma/client";
import { TaskStatus, TaskPriority } from "~/types/task";
import { type PartialTask } from "~/types/task";
import { Navbar } from "~/components/layout/Navbar";
import { ProjectForm } from "~/components/projects/ProjectForm";
import { ProjectList } from "~/components/projects/ProjectList";

interface TaskFormData {
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date | null;
  projectId: string;
  assignedToId?: string | null;
  createdById: string;
}

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const queryClient = useQueryClient();
  const {
    data: projects,
    isLoading: isProjectsLoading,
    refetch: refetchProjects,
  } = api.project.getAll.useQuery();
  const { data: tasks, refetch: refetchTasks } = api.task.getAll.useQuery();
  const createProject = api.project.create.useMutation();
  const deleteTask = api.task.delete.useMutation();
  const updateTask = api.task.update.useMutation({
    onSuccess: () => {
      refetchTasks();
    },
  });
  const createTask = api.task.create.useMutation({
    onSuccess: () => {
      refetchTasks();
    },
  });
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  useEffect(() => {
    // Only redirect if session is fully loaded and is null
    if (session === null) {
      router.push("/api/auth/signin");
    }
  }, [session]);

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="mx-auto h-32 w-32 animate-spin rounded-full border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (session === null) {
    router.push("/api/auth/signin");
    return null;
  }

  const handleTaskUpdate = async (task: PartialTask) => {
    try {
      const updatedTask = {
        id: task.id,
        title: task.title,
        description: task.description || null,
        status: task.status || "TODO",
        priority: task.priority || "NORMAL",
        dueDate: task.dueDate || null,
        projectId: task.projectId,
        assignedToId: task.assignedToId || null,
        createdById: task.createdById,
      };
      await updateTask.mutateAsync(updatedTask);
      await queryClient.invalidateQueries({ queryKey: ["task", "getAll"] });
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleProjectCreated = async (project: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    members: string[];
  }) => {
    const createdProject = await createProject.mutateAsync({
      name: project.name,
      description: project.description,
      ownerId: project.ownerId,
      members: project.members,
    });
    setSelectedProjectId(createdProject.id);
    setShowProjectForm(false);
    // Invalidate project query cache
    await queryClient.invalidateQueries({ queryKey: ["project", "getAll"] });
    // Wait for cache to update before redirecting
    await new Promise((resolve) => setTimeout(resolve, 100));
  };

  const handleNewTask = async (task: TaskFormData) => {
    if (!selectedProjectId) {
      return;
    }
    await createTask.mutateAsync({
      ...task,
      projectId: selectedProjectId,
      createdById: session?.user?.id || "",
    });
    await queryClient.invalidateQueries({ queryKey: ["task", "getAll"] });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="rounded-lg bg-white shadow">
          <div className="p-6">
            <div className="mb-8 flex items-center justify-between">
              <h1 className="text-3xl font-bold">Projects</h1>
              <button
                onClick={() => setShowProjectForm(true)}
                className="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
              >
                New Project
              </button>
            </div>

            {showProjectForm && (
              <ProjectForm
                onSubmit={handleProjectCreated}
                onCancel={() => setShowProjectForm(false)}
                refetchProject={refetchProjects}
              />
            )}

            <div className="mt-8">
              {isProjectsLoading ? (
                <div className="flex min-h-[200px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <ProjectList projects={projects || []} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
