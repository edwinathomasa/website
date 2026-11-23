import { memo } from 'react';
import { FaCode } from 'react-icons/fa';
import { STRINGS } from '../../constants/strings';
import type { SkillCategory } from '@portfolio/shared';
import GlassSlab from '../atoms/GlassSlab';
import SectionHeader from '../atoms/SectionHeader';
import SkillCategoryCard from '../molecules/SkillCategoryCard';

export interface SkillsSectionProps {
  readonly skillCategories: readonly SkillCategory[];
}

const SkillsSection = memo(function SkillsSection({
  skillCategories,
}: SkillsSectionProps) {
  return (
    <GlassSlab id="section-skills" layer={1} className="glass-card">
      <SectionHeader icon={<FaCode />} title={STRINGS.sections.skills} />
      <div className="skills-stack">
        {skillCategories.map((group) => (
          <SkillCategoryCard key={group.category} group={group} />
        ))}
      </div>
    </GlassSlab>
  );
});

export default SkillsSection;
