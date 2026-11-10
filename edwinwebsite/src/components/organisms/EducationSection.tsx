import { STRINGS } from '../../constants/strings';
import type { Education } from '../../types/profile';
import SectionHeading from '../atoms/SectionHeading';
import TimelineItem from '../molecules/TimelineItem';

interface EducationSectionProps {
  readonly education: readonly Education[];
}

function EducationSection({ education }: EducationSectionProps) {
  return (
    <section className="section-card education">
      <SectionHeading title={STRINGS.sections.education} />
      <div className="timeline-list">
        {education.map((edu) => (
          <TimelineItem
            key={`${edu.institution}-${edu.period}`}
            title={edu.degree}
            subtitle={
              <>
                {edu.institution}{' '}
                <span className="education-period">
                  {STRINGS.education.periodBadge(edu.period)}
                </span>
              </>
            }
          />
        ))}
      </div>
    </section>
  );
}

export default EducationSection;
