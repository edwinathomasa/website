import { UI_LABELS } from '../../constants/config';
import type { Project } from '../../types/profile';
import SectionHeading from '../atoms/SectionHeading';
import ProjectCard from '../molecules/ProjectCard';

interface ProjectsSectionProps {
  projects: Project[];
}

function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section className="section-card projects">
      <SectionHeading title={UI_LABELS.SECTIONS.PROJECTS} />
      <div className="projects-list">
        {projects.map((project, idx) => (
          <ProjectCard key={idx} project={project} />
        ))}
      </div>
    </section>
  );
}

export default ProjectsSection;
