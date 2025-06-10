import { useState } from "react";
import { api } from "~/utils/api";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface ProjectFormProps {
  initialData?: {
    id: string;
    name: string;
    description?: string;
  };
  onSubmit: (project: { name: string; description?: string }) => void;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const createProject = api.project.create.useMutation();
  const updateProject = api.project.update.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      try {
        if (initialData) {
          await updateProject.mutateAsync({
            id: initialData.id,
            name,
            description,
          });
        } else {
          const createdProject = await createProject.mutateAsync({
            name,
            description,
          });
          // Navigate to the project page after creation
          router.push(`/projects/${createdProject.id}`);
        }

        // Invalidate project query cache
        await queryClient.invalidateQueries({
          queryKey: ["project", "getAll"],
        });

        // Close the form
        onCancel();
      } catch (error) {
        console.error("Error saving project:", error);
      }
    } catch (error) {
      console.error("Error saving project:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Project Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block h-24 w-full rounded-md border border-gray-300 bg-white shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded bg-gray-200 px-4 py-2 font-bold text-gray-700 hover:bg-gray-300"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createProject.isPending}
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          {initialData ? "Update Project" : "Create Project"}
        </button>
      </div>
    </form>
  );
};
