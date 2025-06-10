import { useState } from "react";
import { api } from "~/utils/api";
import { TaskForm } from "./TaskForm";
import {
  type Task,
  type PartialTask,
  TaskStatus,
  TaskPriority,
  type TaskFormData,
} from "~/types/task";
import { useQueryClient } from "@tanstack/react-query";

interface TaskFormModalProps {
  projectId: string;
  show: boolean;
  onClose: () => void;
  onTaskCreated: (taskId: string) => void;
  initialTask?: PartialTask;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  projectId,
  show,
  onClose,
  onTaskCreated,
}) => {
  const [initialData, setInitialData] = useState<PartialTask | undefined>(
    undefined,
  );
  const createTask = api.task.create.useMutation();
  const queryClient = useQueryClient();

  const handleSubmit = async (taskData: TaskFormData) => {
    const createdTask = await createTask.mutateAsync({
      ...taskData,
      projectId,
    });
    await queryClient.invalidateQueries({
      queryKey: ["task", "getByProjectId", projectId],
    });
    onTaskCreated(createdTask.id);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold">Create Task</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <TaskForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          initialTask={initialData}
        />
      </div>
    </div>
  );
};
