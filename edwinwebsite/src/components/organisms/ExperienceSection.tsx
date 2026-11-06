import { STRINGS } from '../../constants/strings';
import type { Experience } from '../../types/profile';
import SectionHeading from '../atoms/SectionHeading';
import TimelineItem from '../molecules/TimelineItem';

interface ExperienceSectionProps {
  readonly experience: readonly Experience[];
}

function ExperienceSection({ experience }: ExperienceSectionProps) {
  return (
    <section className="section-card experience">
      <SectionHeading title={STRINGS.sections.experience} />
      <div className="timeline-list">
        {experience.map((exp) => (
          <TimelineItem
            key={`${exp.company}-${exp.period}`}
            title={STRINGS.experience.roleHeading(exp.role, exp.company, exp.location)}
            subtitle={<em>{exp.period}</em>}
            description={exp.description}
            highlights={exp.highlights}
            footer={
              exp.tools && exp.tools.length > 0 ? (
                <p className="timeline-tools">
                  <strong>{STRINGS.experience.toolsLabel}</strong>{' '}
                  {exp.tools.join(STRINGS.common.listSeparator)}
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
