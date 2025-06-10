import { useState } from "react";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { Session } from "next-auth";
import { User } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface ProjectSettingsProps {
  projectId: string;
  show: boolean;
  onClose: () => void;
}

interface Member {
  id: string;
  email: string | null;
  name: string | null;
  emailVerified: Date | null;
  image: string | null;
}

const projectSettingsSchema = z.object({
  name: z.string(),
  description: z.string(),
  members: z.array(z.string()),
});

type ProjectSettingsFormData = z.infer<typeof projectSettingsSchema>;

export function ProjectSettings({
  projectId,
  show,
  onClose,
}: ProjectSettingsProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { data: projectSettings } = api.user.getProjectSettings.useQuery({
    projectId,
  });
  const updateProjectSettings = api.user.updateProjectSettings.useMutation();

  const [showEditForm, setShowEditForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectSettingsFormData>({
    resolver: zodResolver(projectSettingsSchema),
    defaultValues: {
      name: projectSettings?.name || "",
      description: projectSettings?.description || "",
      members: projectSettings?.members?.map((m: Member) => m.id) || [],
    },
  });

  const onSubmit = async (data: ProjectSettingsFormData) => {
    try {
      await updateProjectSettings.mutateAsync({
        projectId,
        ...data,
      });
      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating project settings:", error);
    }
  };

  const handleFormSubmit = handleSubmit(onSubmit);

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Link
          href="/api/auth/signin"
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
        >
          Sign In
        </Link>
      </div>
    );
  }

  if (!projectId) {
    void router.push("/");
    return null;
  }

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-2xl rounded-lg bg-white p-6">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Project Settings</h1>
          <button
            onClick={onClose}
            className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700"
          >
            Close
          </button>
        </div>

        {showEditForm ? (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <input
                {...register("name")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                {...register("description")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Members
              </label>
              <select
                {...register("members")}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                multiple
              >
                {projectSettings?.members?.map((member: Member) => (
                  <option key={member.id} value={member.id}>
                    {member.email}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                className="rounded bg-gray-500 px-4 py-2 font-bold text-white hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Project Name
              </label>
              <p className="mt-1 text-gray-900">{projectSettings?.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <p className="mt-1 text-gray-900">
                {projectSettings?.description}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Members
              </label>
              <ul className="mt-1 list-inside list-disc text-gray-900">
                {projectSettings?.members?.map((member: Member) => (
                  <li key={member.id}>{member.email}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
