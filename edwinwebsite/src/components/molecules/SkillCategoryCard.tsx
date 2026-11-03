import type { SkillCategory } from '../../types/profile';
import Chip from '../atoms/Chip';

interface SkillCategoryCardProps {
  group: SkillCategory;
}

function SkillCategoryCard({ group }: SkillCategoryCardProps) {
  return (
    <div className="skill-category">
      <h3 className="skill-category-title">{group.category}</h3>
      <div className="skills-list">
        {group.items.map((skill, idx) => (
          <Chip key={idx} label={skill} variant="skill" />
        ))}
      </div>
    </div>
  );
}

export default SkillCategoryCard;
