import { useRouter } from "next/router";
import { useState } from "react";
import { api } from "~/utils/api";
import { useQueryClient } from "@tanstack/react-query";
import { TaskList } from "~/components/tasks/TaskList";
import { TaskForm } from "~/components/tasks/TaskForm";
import { ProjectForm } from "~/components/projects/ProjectForm";
import { ProjectSettings } from "~/components/projects/ProjectSettings";
import { Navbar } from "~/components/layout/Navbar";
import { type Task, TaskStatus, TaskPriority } from "~/types/task";

interface ProjectDetailsProps {
  params: {
    projectId: string;
  };
}

export default function ProjectDetails({ params }: ProjectDetailsProps) {
  const router = useRouter();
  const projectId = router.query.projectId as string;
  const { data: project } = api.project.getById.useQuery({ id: projectId });
  const { data: tasks } = api.task.getByProjectId.useQuery({
    projectId,
  });
  const createTask = api.task.create.useMutation();
  const updateTask = api.task.update.useMutation();
  const deleteTask = api.task.delete.useMutation();

  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const queryClient = useQueryClient();

  const handleTaskCreated = async (taskId: string) => {
    setShowTaskForm(false);
    await queryClient.invalidateQueries({ queryKey: ['task', 'getByProjectId'] });
  };

  const handleProjectUpdated = async () => {
    setShowProjectForm(false);
    await queryClient.invalidateQueries({ queryKey: ['project', 'getAll'] });
  };

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Project not found</h1>
          <div className="flex space-x-4">
            <button
              onClick={() => setShowProjectForm(true)}
              className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
            >
              Edit Project
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700"
            >
              Settings
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
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold">{project.name}</h1>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  New Task
                </button>
                <button
                  onClick={() => setShowProjectForm(true)}
                  className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                >
                  Edit Project
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700"
                >
                  Settings
                </button>
              </div>
            </div>

            {showTaskForm && (
              <TaskForm
                onSubmit={async (task) => {
                  await createTask.mutateAsync({
                    ...task,
                    projectId,
                    createdById: task.createdById,
                  });
                  await handleTaskCreated('');
                }}
                onCancel={() => setShowTaskForm(false)}
              />
            )}

            <ProjectForm
              initialData={{
                id: project.id,
                name: project.name,
                description: project.description || undefined
              }}
              onSubmit={handleProjectUpdated}
              onCancel={() => setShowProjectForm(false)}
            />
            <ProjectSettings
              projectId={projectId}
              show={showSettings}
              onClose={() => setShowSettings(false)}
            />

            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-4">Tasks</h2>
              <TaskList
                tasks={tasks || []}
                onTaskUpdate={async (updatedTask) => {
                  await updateTask.mutateAsync(updatedTask);
                  await queryClient.invalidateQueries({ queryKey: ['task', 'getByProjectId'] });
                }}
                onTaskDelete={async (taskId) => {
                  await deleteTask.mutateAsync({ id: taskId });
                  await queryClient.invalidateQueries({ queryKey: ['task', 'getByProjectId'] });
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
