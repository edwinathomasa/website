import { memo } from 'react';
import { FaFolderOpen } from 'react-icons/fa';
import { STRINGS } from '../../constants/strings';
import type { Project } from '@portfolio/shared';
import GlassSlab from '../atoms/GlassSlab';
import SectionHeader from '../atoms/SectionHeader';
import ProjectCard from '../molecules/ProjectCard';

export interface ProjectsSectionProps {
  readonly projects: readonly Project[];
}

const ProjectsSection = memo(function ProjectsSection({
  projects,
}: ProjectsSectionProps) {
  return (
    <GlassSlab id="section-projects" layer={1} className="glass-card">
      <SectionHeader
        icon={<FaFolderOpen />}
        title={STRINGS.sections.projects}
      />

      <div className="projects-grid">
        {projects.map((project) => (
          <ProjectCard key={project.title} project={project} />
        ))}
      </div>
    </GlassSlab>
  );
});

export default ProjectsSection;
