import React from 'react';
import type { Experience } from '../data/profile';

interface ExperienceSectionProps {
  experience: Experience[];
}

function ExperienceSection({ experience }: ExperienceSectionProps) {
  return (
    <section className="experience">
      <h2 className="experience-heading">Experience</h2>
      <div className="experience-list">
        {experience.map((exp, idx) => (
          <div key={idx} className="experience-item">
            <h3 className="experience-title">
              {exp.role} at {exp.company}
            </h3>
            <p className="experience-period"><em>{exp.period}</em></p>
            <p className="experience-description">{exp.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default ExperienceSection;