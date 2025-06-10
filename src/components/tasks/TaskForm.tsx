import { type PartialTask, TaskStatus, TaskPriority } from "../../types/task";
import { useState } from "react";
import { api } from "~/utils/api";
import { Listbox } from "@headlessui/react";

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
  projectId: string;
}

export const TaskForm: React.FC<TaskFormProps> = ({
  initialTask,
  onSubmit,
  onCancel,
  projectId,
}: TaskFormProps) => {
  const { data: project } = api.project.getById.useQuery({ id: projectId });
  const [task, setTask] = useState<PartialTask>({
    id: initialTask?.id || "",
    title: initialTask?.title || "",
    projectId: projectId,
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
  const [isLoading, setIsLoading] = useState(false);

  // Filter members to exclude the creator
  const availableMembers =
    project?.members?.filter((member) => member.id !== task.createdById) || [];

  const selectedMember = availableMembers.find(
    (member) => member.id === task.assignedToId,
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const submission: TaskFormData = {
      title: task.title,
      description: task.description,
      status: task.status!,
      priority: task.priority!,
      dueDate: task.dueDate,
      projectId: task.projectId,
      assignedToId: task.assignedToId,
      createdById: task.createdById,
    };
    await onSubmit(submission);
    setIsLoading(false);
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

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Assign To
        </label>
        <Listbox
          value={task.assignedToId}
          onChange={(value) => setTask({ ...task, assignedToId: value })}
        >
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full cursor-default rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:text-sm">
              <span className="block truncate">
                {selectedMember?.email || "Not assigned"}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="none"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7 7l3-3 3 3m0 6l-3 3-3-3"
                  />
                </svg>
              </span>
            </Listbox.Button>

            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
              <Listbox.Option
                value=""
                className="relative cursor-default select-none py-2 pl-10 pr-4 text-gray-900"
              >
                <span className="block truncate">Not assigned</span>
              </Listbox.Option>
              {availableMembers.map((member) => (
                <Listbox.Option
                  key={member.id}
                  value={member.id}
                  className="relative cursor-default select-none py-2 pl-10 pr-4 text-gray-900"
                >
                  <span className="block truncate">{member.email}</span>
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </div>
        </Listbox>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
          isLoading
            ? "cursor-not-allowed bg-gray-400 text-gray-600"
            : "bg-blue-600 text-white hover:bg-blue-700"
        }`}
      >
        {isLoading ? (
          <>
            <svg
              className="-ml-1 mr-3 h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </>
        ) : initialTask ? (
          "Update Task"
        ) : (
          "Create Task"
        )}
      </button>
    </form>
  );
};
