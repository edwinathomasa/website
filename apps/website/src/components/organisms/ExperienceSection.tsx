import { memo } from 'react';
import { FaBriefcase } from 'react-icons/fa';
import { STRINGS } from '../../constants/strings';
import type { Experience } from '@portfolio/shared';
import GlassSlab from '../atoms/GlassSlab';
import SectionHeader from '../atoms/SectionHeader';
import ExperienceTimelineCard from '../molecules/ExperienceTimelineCard';

export interface ExperienceSectionProps {
  readonly experience: readonly Experience[];
}

const ExperienceSection = memo(function ExperienceSection({
  experience,
}: ExperienceSectionProps) {
  return (
    <GlassSlab id="section-experience" layer={1} className="glass-card">
      <SectionHeader
        icon={<FaBriefcase />}
        title={STRINGS.sections.experience}
        countText={`${experience.length} Companies`}
      />

      <div className="experience-timeline">
        <div className="timeline-track depth-recessed" aria-hidden="true" />
        {experience.map((exp) => (
          <ExperienceTimelineCard
            key={`${exp.company}-${exp.role}-${exp.period}`}
            experience={exp}
          />
        ))}
      </div>
    </GlassSlab>
  );
});

export default ExperienceSection;
