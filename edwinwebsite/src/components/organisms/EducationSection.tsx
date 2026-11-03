import { UI_LABELS } from '../../constants/config';
import type { Education } from '../../types/profile';
import SectionHeading from '../atoms/SectionHeading';
import TimelineItem from '../molecules/TimelineItem';

interface EducationSectionProps {
  education: Education[];
}

function EducationSection({ education }: EducationSectionProps) {
  return (
    <section className="section-card education">
      <SectionHeading title={UI_LABELS.SECTIONS.EDUCATION} />
      <div className="timeline-list">
        {education.map((edu, idx) => (
          <TimelineItem
            key={idx}
            title={edu.degree}
            subtitle={
              <>
                {edu.institution}{' '}
                <span className="education-period">({edu.period})</span>
              </>
            }
          />
        ))}
      </div>
    </section>
  );
}

export default EducationSection;
