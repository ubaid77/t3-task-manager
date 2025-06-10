import { useState, useEffect } from "react";
import {
  type PartialTask,
  TaskStatus,
  TaskPriority,
  Task,
} from "../../types/task";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "~/utils/api";

interface TaskListProps {
  projectId: string;
  onTaskUpdate: (updatedTask: PartialTask) => Promise<void>;
  onTaskDelete: (taskId: string) => Promise<void>;
  tasks?: Task[];
}

export const TaskList: React.FC<TaskListProps> = ({
  projectId,
  onTaskUpdate,
  onTaskDelete,
  tasks,
}) => {
  const [taskList, setTaskList] = useState<Task[]>(tasks || []);
  const queryClient = useQueryClient();

  useEffect(() => {
    setTaskList(tasks || []);
  }, [tasks]);
  const handleStatusChange = async (
    taskId: string,
    newStatus: Task["status"],
  ) => {
    const taskToUpdate = taskList.find((t) => t.id === taskId);
    if (!taskToUpdate) return;

    await onTaskUpdate({
      id: taskId,
      title: taskToUpdate.title,
      description: taskToUpdate.description,
      status: newStatus as TaskStatus,
      priority: taskToUpdate.priority as TaskPriority,
      projectId: taskToUpdate.projectId,
      createdById: taskToUpdate.createdById,
      createdBy: {
        id: taskToUpdate.createdBy.id,
        name: taskToUpdate.createdBy.name,
        email: taskToUpdate.createdBy.email || "",
        emailVerified: taskToUpdate.createdBy.emailVerified || new Date(),
        image: taskToUpdate.createdBy.image || "",
      },
    });
    await queryClient.invalidateQueries({ queryKey: ["task", "getAll"] });
  };

  const handlePriorityChange = async (
    taskId: string,
    newPriority: Task["priority"],
  ) => {
    const taskToUpdate = taskList.find((t) => t.id === taskId);
    if (!taskToUpdate) return;

    await onTaskUpdate({
      id: taskId,
      title: taskToUpdate.title,
      description: taskToUpdate.description,
      status: taskToUpdate.status as TaskStatus,
      priority: newPriority as TaskPriority,
      projectId: taskToUpdate.projectId,
      createdById: taskToUpdate.createdById,
      createdBy: {
        id: taskToUpdate.createdBy.id,
        name: taskToUpdate.createdBy.name,
        email: taskToUpdate.createdBy.email || "",
        emailVerified: taskToUpdate.createdBy.emailVerified || new Date(),
        image: taskToUpdate.createdBy.image || "",
      },
    });
    await queryClient.invalidateQueries({ queryKey: ["task", "getAll"] });
  };

  const handleDelete = async (taskId: string) => {
    await onTaskDelete(taskId);
    await queryClient.invalidateQueries({ queryKey: ["task", "getAll"] });
  };

  return (
    <div className="space-y-4">
      {taskList.map((task) => (
        <div key={task.id} className="rounded-lg border p-4">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold">{task.title}</h3>
              <p className="text-gray-600">{task.description}</p>
              <div className="mt-2 flex items-center space-x-2">
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    task.priority === "LOW"
                      ? "bg-green-100 text-green-800"
                      : task.priority === "NORMAL"
                        ? "bg-yellow-100 text-yellow-800"
                        : task.priority === "HIGH"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-red-100 text-red-800"
                  }`}
                >
                  {task.priority}
                </span>
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    task.status === "TODO"
                      ? "bg-blue-100 text-blue-800"
                      : task.status === "IN_PROGRESS"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                  }`}
                >
                  {task.status}
                </span>
                {task.assignedTo && (
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-800">
                    Assigned to: {task.assignedTo.email}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {task.dueDate && (
                <span className="text-sm text-gray-600">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              )}
              <select
                value={task.status}
                onChange={(e) =>
                  handleStatusChange(task.id, e.target.value as Task["status"])
                }
                className="rounded border px-2 py-1"
              >
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="DONE">DONE</option>
              </select>
              <select
                value={task.priority}
                onChange={(e) =>
                  handlePriorityChange(
                    task.id,
                    e.target.value as Task["priority"],
                  )
                }
                className="rounded border px-2 py-1"
              >
                <option value="LOW">LOW</option>
                <option value="NORMAL">NORMAL</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
              <button
                onClick={() => onTaskDelete(task.id)}
                className="rounded border border-red-300 px-2 py-1 text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
