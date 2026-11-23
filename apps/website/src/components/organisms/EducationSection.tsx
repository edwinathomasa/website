import { memo } from 'react';
import { FaGraduationCap } from 'react-icons/fa';
import { STRINGS } from '../../constants/strings';
import type { Education } from '@portfolio/shared';
import GlassSlab from '../atoms/GlassSlab';
import SectionHeader from '../atoms/SectionHeader';
import EducationCard from '../molecules/EducationCard';

export interface EducationSectionProps {
  readonly education: readonly Education[];
}

const EducationSection = memo(function EducationSection({
  education,
}: EducationSectionProps) {
  return (
    <GlassSlab id="section-education" layer={1} className="glass-card">
      <SectionHeader
        icon={<FaGraduationCap />}
        title={STRINGS.sections.education}
      />
      <div className="education-stack">
        {education.map((edu) => (
          <EducationCard
            key={`${edu.degree}-${edu.period}`}
            education={edu}
          />
        ))}
      </div>
    </GlassSlab>
  );
});

export default EducationSection;
