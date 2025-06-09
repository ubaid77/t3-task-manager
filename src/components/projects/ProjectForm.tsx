import { useState } from 'react';
import { api } from '~/utils/api';

interface ProjectFormProps {
  onProjectCreated?: (projectId: string) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onProjectCreated }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const createProject = api.project.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createProject.mutateAsync({
        name,
        description,
      });
      if (result && onProjectCreated) {
        onProjectCreated(result.id);
      }
    } catch (error) {
      console.error('Error creating project:', error);
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

      <button
        type="submit"
        disabled={createProject.isPending}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Create Project
      </button>
    </form>
  );
};
