import { type PartialTask, TaskStatus, TaskPriority } from "../../types/task";
import { useState } from "react";

// Type for form submission that matches backend expectations
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

interface TaskFormProps {
  initialTask?: PartialTask;
  onSubmit: (task: TaskFormData) => Promise<void>;
  onCancel: () => void;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialTask,
  onSubmit,
  onCancel,
}) => {
  const [task, setTask] = useState<PartialTask>({
    id: initialTask?.id || "",
    title: initialTask?.title || "",
    projectId: initialTask?.projectId || "",
    createdById: initialTask?.createdById || "",
    description: initialTask?.description || null,
    status: initialTask?.status || "TODO",
    priority: initialTask?.priority || "NORMAL",
    dueDate: initialTask?.dueDate || null,
    assignedToId: initialTask?.assignedToId || null,
    project: initialTask?.project || undefined,
    createdBy: initialTask?.createdBy || undefined,
    assignedTo: initialTask?.assignedTo || undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const submission: TaskFormData = {
      title: task.title,
      description: task.description,
      status: task.status as TaskStatus,
      priority: task.priority as TaskPriority,
      dueDate: task.dueDate,
      projectId: task.projectId,
      assignedToId: task.assignedToId,
      createdById: task.createdById,
    };
    await onSubmit(submission);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Title</label>
        <input
          type="text"
          value={task.title}
          onChange={(e) => setTask({ ...task, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={task?.description || ""}
          onChange={(e) => setTask({ ...task, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={task.status}
            onChange={(e) =>
              setTask({
                ...task,
                status: e.target.value as "TODO" | "IN_PROGRESS" | "DONE",
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            value={task.priority}
            onChange={(e) =>
              setTask({
                ...task,
                priority: e.target.value as
                  | "LOW"
                  | "NORMAL"
                  | "HIGH"
                  | "URGENT",
              })
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="LOW">LOW</option>
            <option value="NORMAL">NORMAL</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          type="date"
          value={
            task.dueDate
              ? new Date(task.dueDate).toISOString().split("T")[0]
              : ""
          }
          onChange={(e) =>
            setTask({
              ...task,
              dueDate: e.target.value ? new Date(e.target.value) : undefined,
            })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        {initialTask ? "Update Task" : "Create Task"}
      </button>
    </form>
  );
};
