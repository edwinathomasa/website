import { UI_LABELS } from '../../constants/config';
import type { Experience } from '../../types/profile';
import SectionHeading from '../atoms/SectionHeading';
import TimelineItem from '../molecules/TimelineItem';

interface ExperienceSectionProps {
  experience: Experience[];
}

function ExperienceSection({ experience }: ExperienceSectionProps) {
  return (
    <section className="section-card experience">
      <SectionHeading title={UI_LABELS.SECTIONS.EXPERIENCE} />
      <div className="timeline-list">
        {experience.map((exp, idx) => (
          <TimelineItem
            key={idx}
            title={`${exp.role} — ${exp.company}${exp.location ? ` | ${exp.location}` : ''}`}
            subtitle={<em>{exp.period}</em>}
            description={exp.description}
            highlights={exp.highlights}
            footer={
              exp.tools && exp.tools.length > 0 ? (
                <p className="timeline-tools">
                  <strong>{UI_LABELS.PROFILE.TOOLS_LABEL}</strong> {exp.tools.join(', ')}
                </p>
              ) : null
            }
          />
        ))}
      </div>
    </section>
  );
}

export default ExperienceSection;
