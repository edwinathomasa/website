import { UI_LABELS } from '../../constants/config';
import type { SkillCategory } from '../../types/profile';
import Chip from '../atoms/Chip';
import SectionHeading from '../atoms/SectionHeading';
import SkillCategoryCard from '../molecules/SkillCategoryCard';

interface SkillsSectionProps {
  skills: string[];
  skillCategories?: SkillCategory[];
}

function SkillsSection({ skills, skillCategories }: SkillsSectionProps) {
  return (
    <section className="section-card skills">
      <SectionHeading title={UI_LABELS.SECTIONS.SKILLS} />
      {skillCategories && skillCategories.length > 0 ? (
        <div className="skill-categories">
          {skillCategories.map((group, idx) => (
            <SkillCategoryCard key={idx} group={group} />
          ))}
        </div>
      ) : (
        <div className="skills-list">
          {skills.map((skill, idx) => (
            <Chip key={idx} label={skill} variant="skill" />
          ))}
        </div>
      )}
    </section>
  );
}

export default SkillsSection;
