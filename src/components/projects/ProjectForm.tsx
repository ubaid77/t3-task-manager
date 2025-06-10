import { useState } from "react";
import { api } from "~/utils/api";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Listbox } from "@headlessui/react";
import { Fragment } from "react";
import { useSession } from "next-auth/react";

interface ProjectFormProps {
  initialData?: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    members: string[];
  };
  onSubmit: (project: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    members: string[];
  }) => void;
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
  const [description, setDescription] = useState<string | undefined>(
    initialData?.description || undefined,
  );
  const [selectedMembers, setSelectedMembers] = useState<string[]>(
    initialData?.members || [],
  );
  const { data: session, status } = useSession();
  const { data: users } = api.user.getAll.useQuery();
  const createProject = api.project.create.useMutation();
  const updateProject = api.project.update.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (status !== "authenticated") {
        throw new Error("Not authenticated");
      }

      if (!session?.user) {
        throw new Error("No session found");
      }

      const projectData = {
        name,
        description: description || null,
        ownerId: session.user.id,
        members: selectedMembers,
      };

      if (initialData) {
        await updateProject.mutateAsync({
          ...projectData,
          id: initialData.id,
        });
      } else {
        const createdProject = await createProject.mutateAsync(projectData);
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
  };

  const handleProjectUpdated = (project: {
    name: string;
    description: string | null;
    ownerId: string;
    members: string[];
  }) => {
    onSubmit({
      ...project,
      id: initialData?.id || "",
    });
  };

  if (status !== "authenticated") {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return <div>No session found</div>;
  }

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

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Members
        </label>
        <Listbox value={selectedMembers} onChange={setSelectedMembers} multiple>
          <Listbox.Button className="w-full">
            <div className="flex items-center justify-between rounded-md border bg-white px-4 py-2">
              <span className="text-gray-700">
                {selectedMembers.length} selected
              </span>
              <svg
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </Listbox.Button>
          <Listbox.Options className="mt-1 max-h-60 rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {users?.map((user) => (
              <Listbox.Option
                key={user.id}
                value={user.id}
                className={({ active }) =>
                  `relative cursor-default select-none py-2 pl-3 pr-9 ${
                    active ? "bg-blue-100 text-blue-900" : "text-gray-900"
                  }`
                }
              >
                <div className="flex items-center">
                  <span className="ml-3 block truncate">
                    {user.name || user.email}
                  </span>
                </div>
                {selectedMembers.includes(user.id) ? (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                    <svg
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                ) : null}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
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
