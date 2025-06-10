import { useState, useEffect } from "react";
import { api } from "~/utils/api";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { User } from "@prisma/client";
import { Session } from "next-auth";
import { useQueryClient } from "@tanstack/react-query";

interface ProfileProps {
  projectId: string;
}

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function Profile() {
  const { data: session, status } = useSession();
  const {
    data: profile,
    isLoading,
    refetch: refetchProfile,
  } = api.user.getProfile.useQuery();
  const updateProfile = api.user.updateProfile.useMutation({
    onSuccess: async () => {
      await refetchProfile();
      setShowEditForm(false);
    },
  });
  const queryClient = useQueryClient();
  const [showEditForm, setShowEditForm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name ?? "",
        email: profile.email ?? "",
      });
    }
  }, [profile, reset]);

  // Handle session status
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-semibold">
            Please sign in to view your profile
          </h2>
          <Link
            href="/api/auth/signin"
            className="text-blue-500 hover:text-blue-700"
          >
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync(data);
      setShowEditForm(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleFormSubmit = handleSubmit(onSubmit);

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

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="rounded-lg bg-white p-6 shadow">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Profile Settings</h1>
          <button
            onClick={() => setShowEditForm(!showEditForm)}
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          >
            {showEditForm ? "Cancel" : "Edit Profile"}
          </button>
        </div>

        {showEditForm ? (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                {...register("name")}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-gray-50 sm:text-sm"
              />
              {errors.name && (
                <p className="mt-1 text-sm font-medium text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                {...register("email")}
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-gray-50 sm:text-sm"
              />
              {errors.email && (
                <p className="mt-1 text-sm font-medium text-red-600">
                  {errors.email.message}
                </p>
              )}
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
                Name
              </label>
              <p className="mt-1 text-gray-900">{profile?.name}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <p className="mt-1 text-gray-900">{profile?.email}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
