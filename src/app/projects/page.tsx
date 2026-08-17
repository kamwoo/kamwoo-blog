import { ProjectCard } from '@/components/project-card';
import { projects } from './data';

const ProjectsPage = () => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 pb-12'>
      {projects.map((project) => (
        <ProjectCard key={project.name} project={project} />
      ))}
    </div>
  );
};

export default ProjectsPage;
