import { STRINGS } from '../../constants/strings';
import type { Project } from '../../types/profile';
import ExternalLink from '../atoms/ExternalLink';

interface ProjectCardProps {
  project: Project;
}

function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="project-item">
      <h3 className="project-title">{project.title}</h3>
      <p className="project-description">{project.description}</p>
      {project.link?.trim() && (
        <ExternalLink href={project.link} className="project-link">
          {STRINGS.projects.viewProject}
        </ExternalLink>
      )}
    </div>
  );
}

export default ProjectCard;
