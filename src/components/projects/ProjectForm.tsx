import { useState } from 'react';
import { api } from '~/utils/api';

interface ProjectFormProps {
  initialData?: {
    id: string;
    name: string;
    description?: string;
  };
  onSubmit: (project: { name: string; description?: string }) => void;
  onCancel: () => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const createProject = api.project.create.useMutation();
  const updateProject = api.project.update.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData) {
        await updateProject.mutateAsync({
          id: initialData.id,
          name,
          description,
        });
      } else {
        await createProject.mutateAsync({
          name,
          description,
        });
      }
      const projectData = {
        name,
        description: description || undefined,
      };
      onSubmit(projectData);
    } catch (error) {
      console.error('Error saving project:', error);
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={createProject.isPending}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {initialData ? 'Update Project' : 'Create Project'}
        </button>
      </div>
    </form>
  );
};
