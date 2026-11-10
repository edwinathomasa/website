import { memo, type ReactNode } from 'react';
import type { Profile } from '../../types/profile';
import EducationSection from '../organisms/EducationSection';
import ExperienceSection from '../organisms/ExperienceSection';
import Footer from '../organisms/Footer';
import Header from '../organisms/Header';
import ProfileSection from '../organisms/ProfileSection';
import ProjectsSection from '../organisms/ProjectsSection';
import SkillsSection from '../organisms/SkillsSection';
import PortfolioTemplate from '../templates/PortfolioTemplate';

interface HomePageProps {
  readonly profile: Profile;
  readonly floatingAction?: ReactNode;
}

const HomePage = memo(function HomePage({
  profile,
  floatingAction,
}: HomePageProps) {
  return (
    <PortfolioTemplate
      header={<Header name={profile.name} title={profile.title} />}
      footer={
        <Footer
          email={profile.email}
          location={profile.location}
          social={profile.social}
        />
      }
      floatingAction={floatingAction}
    >
      <ProfileSection profile={profile} />
      <SkillsSection skillCategories={profile.skillCategories} />
      <ExperienceSection experience={profile.experience} />
      {profile.education && profile.education.length > 0 && (
        <EducationSection education={profile.education} />
      )}
      <ProjectsSection projects={profile.projects} />
    </PortfolioTemplate>
  );
});

export default HomePage;
