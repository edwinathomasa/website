import './App.css'
import profile from './data/profile'

import Header from './components/Header'
import ProfileSection from './components/ProfileSection'
import SkillsSection from './components/SkillsSection'
import ExperienceSection from './components/ExperienceSection'
import ProjectsSection from './components/ProjectsSection'
import Footer from './components/Footer'

function App() {
  return (
    <>
      <Header name={profile.name} title={profile.title} />

      <main>
        <ProfileSection profile={profile} />
        <SkillsSection skills={profile.skills} />
        <ExperienceSection experience={profile.experience} />
        <ProjectsSection projects={profile.projects} />
      </main>

      <Footer email={profile.email} location={profile.location} social={profile.social} />
    </>
  )
}

export default App