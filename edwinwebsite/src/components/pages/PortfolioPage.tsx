import { memo, useCallback, useRef } from 'react';
import { usePortfolioState } from '../../state/PortfolioContext';
import EducationSection from '../organisms/EducationSection';
import ExperienceSection from '../organisms/ExperienceSection';
import ProfileHeroSection from '../organisms/ProfileHeroSection';
import ProjectsSection from '../organisms/ProjectsSection';
import ResumeFooter from '../organisms/ResumeFooter';
import SkillsSection from '../organisms/SkillsSection';
import TopNavigationBar from '../organisms/TopNavigationBar';
import PortfolioTemplate from '../templates/PortfolioTemplate';

export interface PortfolioPageProps {
  readonly onNavigateBack?: () => void;
}

const PortfolioPage = memo(function PortfolioPage({
  onNavigateBack,
}: PortfolioPageProps) {
  const profile = usePortfolioState();
  const sidebarScrollRef = useRef<HTMLElement | null>(null);
  const mainScrollRef = useRef<HTMLElement | null>(null);

  const handleScrollSection = useCallback(
    (sectionId: string, pane: 'sidebar' | 'main') => {
      const container =
        pane === 'sidebar' ? sidebarScrollRef.current : mainScrollRef.current;
      if (!container) return;
      const target = container.querySelector<HTMLElement>(`#${sectionId}`);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    []
  );

  const monogram = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('');

  return (
    <PortfolioTemplate
      sidebarRef={sidebarScrollRef}
      mainRef={mainScrollRef}
      topbar={
        <TopNavigationBar
          monogram={monogram}
          title={profile.name}
          onNavigateBack={onNavigateBack}
          social={profile.social}
          hasEducation={Boolean(profile.education && profile.education.length > 0)}
          onScrollSection={handleScrollSection}
        />
      }
      sidebar={
        <>
          <ProfileHeroSection profile={profile} />
          <SkillsSection skillCategories={profile.skillCategories} />
          {profile.education && profile.education.length > 0 && (
            <EducationSection education={profile.education} />
          )}
        </>
      }
      mainContent={
        <>
          <ExperienceSection experience={profile.experience} />
          <ProjectsSection projects={profile.projects} />
          <ResumeFooter profile={profile} />
        </>
      }
    />
  );
});

export default PortfolioPage;
