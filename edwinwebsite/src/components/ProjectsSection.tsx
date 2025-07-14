import React from 'react';
import type { Project } from '../data/profile';

interface ProjectsSectionProps {
  projects: Project[];
}

function ProjectsSection({ projects }: ProjectsSectionProps) {
  return (
    <section className="projects">
      <h2 className="projects-heading">Projects</h2>
      <div className="projects-list">
        {projects.map((project, idx) => (
          <div key={idx} className="project-item">
            <h3 className="project-title">{project.title}</h3>
            <p className="project-description">{project.description}</p>
            {project.link?.trim() && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="project-link"
              >
                View Project
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

export default ProjectsSection;