import { STRINGS } from '../../constants/strings';
import type { SkillCategory } from '../../types/profile';
import SectionHeading from '../atoms/SectionHeading';
import SkillCategoryCard from '../molecules/SkillCategoryCard';

interface SkillsSectionProps {
  readonly skillCategories: readonly SkillCategory[];
}

function SkillsSection({ skillCategories }: SkillsSectionProps) {
  return (
    <section className="section-card skills">
      <SectionHeading title={STRINGS.sections.skills} />
      <div className="skill-categories">
        {skillCategories.map((group) => (
          <SkillCategoryCard key={group.category} group={group} />
        ))}
      </div>
    </section>
  );
}

export default SkillsSection;
