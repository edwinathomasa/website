import { memo } from 'react';
import type { SkillCategory } from '@portfolio/shared';
import GlassSlab from '../atoms/GlassSlab';
import GlassTag from '../atoms/GlassTag';

export interface SkillCategoryCardProps {
  readonly group: SkillCategory;
}

const SkillCategoryCard = memo(function SkillCategoryCard({
  group,
}: SkillCategoryCardProps) {
  return (
    <GlassSlab as="div" layer={2} className="skill-group glass-subcard">
      <h3 className="skill-group-name">{group.category}</h3>
      <div className="tag-cloud">
        {group.items.map((skill) => (
          <GlassTag key={skill} label={skill} />
        ))}
      </div>
    </GlassSlab>
  );
});

export default SkillCategoryCard;
