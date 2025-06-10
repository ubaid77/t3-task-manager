import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "~/utils/api";
import { useQueryClient } from "@tanstack/react-query";
import { TaskList } from "~/components/tasks/TaskList";
import { TaskForm } from "~/components/tasks/TaskForm";
import { TaskFormModal } from "~/components/tasks/TaskFormModal";
import { ProjectForm } from "~/components/projects/ProjectForm";
import { ProjectSettings } from "~/components/projects/ProjectSettings";
import { Navbar } from "~/components/layout/Navbar";
import { type Task, TaskStatus, TaskPriority } from "~/types/task";

interface ProjectDetailsProps {
  projectId: string;
  onProjectUpdated?: (project: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    members: string[];
  }) => void;
}

export default function ProjectDetails({
  onProjectUpdated,
}: ProjectDetailsProps) {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const { data: project, isLoading: isProjectLoading } =
    api.project.getById.useQuery({ id: projectId });
  const {
    data: tasks,
    isLoading: isTasksLoading,
    refetch: refetchProjectTasks,
  } = api.task.getByProjectId.useQuery({
    projectId,
  });
  const createTask = api.task.create.useMutation({
    onSuccess: () => {
      void refetchProjectTasks();
    },
  });
  const updateTask = api.task.update.useMutation({
    onSuccess: () => {
      void refetchProjectTasks();
    },
  });
  const deleteTask = api.task.delete.useMutation({
    onSuccess: () => {
      void refetchProjectTasks();
    },
  });

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const queryClient = useQueryClient();

  const handleTaskCreated = async (taskId: string) => {
    setShowTaskForm(false);
    await queryClient.invalidateQueries({
      queryKey: ["task", "getByProjectId"],
    });
  };

  const handleProjectUpdated = async (project: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    members: string[];
  }) => {
    setShowProjectForm(false);
    if (onProjectUpdated) {
      onProjectUpdated(project);
    }
    // Invalidate both project list and specific project details
    await queryClient.invalidateQueries({ queryKey: ["project", "getAll"] });
    await queryClient.invalidateQueries({ queryKey: ["project", "getById"] });
  };

  if (isProjectLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="mb-4 text-2xl font-bold">Project not found</h1>
            <button
              onClick={() => router.push("/")}
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Project Details Section */}
          <div className="col-span-1 rounded-lg bg-white shadow">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowProjectForm(true)}
                    className="rounded bg-green-500 px-3 py-2 font-medium text-white hover:bg-green-600"
                  >
                    Edit Project
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="rounded bg-gray-500 px-3 py-2 font-medium text-white hover:bg-gray-600"
                  >
                    Settings
                  </button>
                </div>
              </div>

              <TaskFormModal
                projectId={projectId}
                show={showTaskForm}
                onClose={() => setShowTaskForm(false)}
                onTaskCreated={handleTaskCreated}
                refetchProject={refetchProjectTasks}
              />

              {!showProjectForm ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">
                      Project Description
                    </h3>
                    <p className="text-gray-600">
                      {project.description || "No description provided"}
                    </p>
                  </div>
                  <div>
                    <h3 className="mb-2 text-lg font-semibold">
                      Project Information
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Created By
                        </h4>
                        <p className="text-gray-600">
                          {project.owner.name ||
                            project.owner.email ||
                            "Unknown"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">
                          Created At
                        </h4>
                        <p className="text-gray-600">
                          {new Date(project.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <ProjectForm
                  initialData={{
                    id: project.id,
                    name: project.name,
                    description: project.description || null,
                    ownerId: project.ownerId,
                    members: project.members.map((member) => member.id),
                  }}
                  onSubmit={handleProjectUpdated}
                  onCancel={() => setShowProjectForm(false)}
                  refetchProject={refetchProjectTasks}
                />
              )}

              <ProjectSettings
                projectId={projectId}
                show={showSettings}
                onClose={() => setShowSettings(false)}
              />
            </div>
          </div>

          {/* Tasks Section */}
          <div className="col-span-2 rounded-lg bg-white shadow">
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold">Tasks</h2>
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="flex items-center rounded bg-blue-500 px-3 py-2 font-medium text-white hover:bg-blue-600"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="ml-2">New Task</span>
                </button>
              </div>
              {isTasksLoading ? (
                <div className="flex min-h-[400px] items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <TaskList
                  projectId={projectId}
                  onTaskUpdate={async (updatedTask) => {
                    await updateTask.mutateAsync(updatedTask);
                    await queryClient.invalidateQueries({
                      queryKey: ["task", "getByProjectId"],
                    });
                  }}
                  onTaskDelete={async (taskId) => {
                    await deleteTask.mutateAsync({ id: taskId });
                    await queryClient.invalidateQueries({
                      queryKey: ["task", "getByProjectId"],
                    });
                  }}
                  tasks={tasks}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
