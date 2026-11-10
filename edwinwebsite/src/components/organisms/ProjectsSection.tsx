import { STRINGS } from '../../constants/strings';
import type { Project } from '../../types/profile';
import SectionHeading from '../atoms/SectionHeading';
import ProjectCard from '../molecules/ProjectCard';

interface ProjectsSectionProps {
  readonly projects: readonly Project[];
}

function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section className="section-card projects">
      <SectionHeading title={STRINGS.sections.projects} />
      <div className="projects-list">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </section>
  );
}

export default ProjectsSection;
