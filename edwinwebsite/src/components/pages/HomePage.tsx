import profile from '../../data/profile';
import AiVoiceWidget from '../organisms/AiVoiceWidget';
import EducationSection from '../organisms/EducationSection';
import ExperienceSection from '../organisms/ExperienceSection';
import Footer from '../organisms/Footer';
import Header from '../organisms/Header';
import ProfileSection from '../organisms/ProfileSection';
import ProjectsSection from '../organisms/ProjectsSection';
import SkillsSection from '../organisms/SkillsSection';
import PortfolioTemplate from '../templates/PortfolioTemplate';

function HomePage() {
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
      floatingAction={<AiVoiceWidget />}
    >
      <ProfileSection profile={profile} />
      <SkillsSection
        skills={profile.skills}
        skillCategories={profile.skillCategories}
      />
      <ExperienceSection experience={profile.experience} />
      {profile.education && profile.education.length > 0 && (
        <EducationSection education={profile.education} />
      )}
      <ProjectsSection projects={profile.projects} />
    </PortfolioTemplate>
  );
}

export default HomePage;
