import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { api } from "~/utils/api";
import { type Task, TaskStatus, TaskPriority, PartialTask } from "~/types/task";
import { TaskList } from "~/components/tasks/TaskList";
import { TaskForm } from "~/components/tasks/TaskForm";
import { SignOutButton } from "~/components/auth/SignOutButton";
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
  const { data: allTasks, refetch } = api.task.getAll.useQuery();
  const { data: allProjects } = api.project.getAll.useQuery();
  const createTask = api.task.create.useMutation();
  const updateTask = api.task.update.useMutation();
  const deleteTask = api.task.delete.useMutation();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showProjectForm, setShowProjectForm] = useState(false);

  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // Only redirect if session is fully loaded and is null
    if (session === null) {
      router.push("/api/auth/signin");
    }
  }, [session]);

  if (session === undefined) {
    return <div>Loading...</div>;
  }

  const handleTaskDelete = async (taskId: string) => {
    try {
      await deleteTask.mutateAsync({ id: taskId });
      await refetch();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleTaskUpdate = async (task: PartialTask) => {
    try {
      const updatedTask = {
        id: task.id,
        title: task.title,
        description: task.description || null,
        status: task.status || 'TODO',
        priority: task.priority || 'NORMAL',
        dueDate: task.dueDate || null,
        projectId: task.projectId,
        assignedToId: task.assignedToId || null,
        createdById: task.createdById,
      };
      await updateTask.mutateAsync(updatedTask);
      await refetch();
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  const handleProjectCreated = (projectId: string) => {
    setSelectedProjectId(projectId);
    setShowProjectForm(false);
  };

  const handleNewTask = async (task: TaskFormData) => {
    try {
      if (!selectedProjectId) {
        throw new Error('Please select a project first');
      }
      
      const newTask = {
        title: task.title,
        description: task.description || null,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || null,
        projectId: selectedProjectId,
        assignedToId: task.assignedToId || null,
        createdById: task.createdById
      };
      await createTask.mutateAsync(newTask);
      await refetch();
      setShowForm(false);
    } catch (error) {
      console.error("Error creating task:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Task Management</h1>
        <SignOutButton />
      </div>

      <div className="flex gap-8">
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Tasks</h2>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              New Task
            </button>
          </div>

          {showForm && (
            <TaskForm
              onSubmit={handleNewTask}
              onCancel={() => setShowForm(false)}
            />
          )}

          <TaskList
            tasks={allTasks || []}
            onTaskUpdate={handleTaskUpdate}
            onTaskDelete={handleTaskDelete}
          />
        </div>

        <div className="w-1/3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Projects</h2>
            <button
              onClick={() => setShowProjectForm(true)}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
            >
              New Project
            </button>
          </div>

          {showProjectForm && (
            <ProjectForm
              onProjectCreated={handleProjectCreated}
            />
          )}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Project
            </label>
            <select
              value={selectedProjectId || ''}
              onChange={(e) => setSelectedProjectId(e.target.value || null)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a project...</option>
              {allProjects?.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <ProjectList
            projects={allProjects || []}
          />
        </div>
      </div>
    </div>
  );
}
