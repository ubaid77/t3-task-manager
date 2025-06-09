import { useRouter } from 'next/navigation';
import { type Prisma } from '@prisma/client';

interface Project extends Prisma.ProjectGetPayload<{
  include: {
    owner: true;
    members: true;
  }
}> {}

interface ProjectListProps {
  projects: Project[];
}

export const ProjectList: React.FC<ProjectListProps> = ({ projects }) => {
  const router = useRouter();

  const handleProjectClick = (projectId: string) => {
    router.push(`/projects/${projectId}`);
  };

  return (
    <div className="space-y-4">
      {projects?.map((project) => (
        <div
          key={project.id}
          onClick={() => handleProjectClick(project.id)}
          className="cursor-pointer rounded-lg border p-4 hover:bg-gray-50"
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">{project.name}</h3>
              {project.description && (
                <p className="text-gray-600 mt-1">{project.description}</p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Created by {project.owner.name || 'Unknown'}
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {project.members.map((member) => (
                  <span key={member.id} className="rounded-full bg-gray-100 px-2 py-1 text-sm">
                    {member.name || 'Anonymous'}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
