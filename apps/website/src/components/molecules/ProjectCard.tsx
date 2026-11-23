import { memo } from 'react';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { STRINGS } from '../../constants/strings';
import type { Project } from '@portfolio/shared';
import GlassSlab from '../atoms/GlassSlab';

export interface ProjectCardProps {
  readonly project: Project;
}

const ProjectCard = memo(function ProjectCard({ project }: ProjectCardProps) {
  return (
    <GlassSlab as="article" layer={2} className="glass-subcard project-card">
      <div className="project-card-top">
        <h3 className="subcard-title">{project.title}</h3>
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-inline-link depth-layer-3"
          >
            <span>{STRINGS.projects.viewProject}</span>
            <FaExternalLinkAlt size={11} />
          </a>
        )}
      </div>
      <p className="project-body">{project.description}</p>
    </GlassSlab>
  );
});

export default ProjectCard;
