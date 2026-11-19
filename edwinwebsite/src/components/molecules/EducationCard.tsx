import { memo } from 'react';
import type { Education } from '../../types/profile';
import GlassSlab from '../atoms/GlassSlab';
import PeriodBadge from '../atoms/PeriodBadge';

export interface EducationCardProps {
  readonly education: Education;
}

const EducationCard = memo(function EducationCard({
  education,
}: EducationCardProps) {
  return (
    <GlassSlab as="article" layer={2} className="glass-subcard">
      <PeriodBadge text={education.period} />
      <h3 className="subcard-title">{education.degree}</h3>
      <p className="subcard-subtitle">{education.institution}</p>
    </GlassSlab>
  );
});

export default EducationCard;
