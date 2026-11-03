import { UI_LABELS } from '../../constants/config';
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
          {UI_LABELS.PROFILE.VIEW_PROJECT}
        </ExternalLink>
      )}
    </div>
  );
}

export default ProjectCard;
