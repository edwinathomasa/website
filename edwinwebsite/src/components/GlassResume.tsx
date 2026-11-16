import { memo, useRef } from 'react';
import {
  FaArrowLeft,
  FaBriefcase,
  FaCode,
  FaEnvelope,
  FaExternalLinkAlt,
  FaFolderOpen,
  FaGithub,
  FaGraduationCap,
  FaLinkedin,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import profileAvatar from '../assets/image/edwin.jpg';
import { STRINGS } from '../constants/strings';
import { usePortfolioState } from '../state/PortfolioContext';
import GlassVoiceAssistant from './GlassVoiceAssistant';
import TiltCard from './TiltCard';

export interface GlassResumeProps {
  readonly onNavigateBack?: () => void;
}

const GlassResume = memo(function GlassResume({
  onNavigateBack,
}: GlassResumeProps) {
  const profile = usePortfolioState();
  const sidebarScrollRef = useRef<HTMLElement | null>(null);
  const mainScrollRef = useRef<HTMLElement | null>(null);

  const scrollToSection = (sectionId: string, pane: 'sidebar' | 'main') => {
    const container =
      pane === 'sidebar' ? sidebarScrollRef.current : mainScrollRef.current;
    if (!container) return;
    const target = container.querySelector<HTMLElement>(`#${sectionId}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="resume-viewport">
      {/* Elevated Top Glass Navigation Dock */}
      <header className="glass-panel depth-layer-1 resume-topbar">
        <div className="topbar-identity">
          {onNavigateBack && (
            <button
              type="button"
              className="glass-icon-link depth-layer-3"
              onClick={onNavigateBack}
              aria-label="Back to home screen"
              title="Back"
            >
              <FaArrowLeft size={14} />
            </button>
          )}
          <span className="topbar-monogram depth-layer-3" aria-hidden="true">
            {profile.name
              .split(' ')
              .map((part) => part[0])
              .join('')}
          </span>
          <div>
            <h1 className="topbar-name">{profile.name}</h1>
            <p className="topbar-role">{profile.title}</p>
          </div>
        </div>

        <nav className="topbar-nav" aria-label="Resume Sections">
          <button
            type="button"
            className="glass-nav-btn depth-layer-3"
            onClick={() => scrollToSection('section-experience', 'main')}
          >
            <FaBriefcase size={12} />
            <span>{STRINGS.sections.experience}</span>
          </button>
          <button
            type="button"
            className="glass-nav-btn depth-layer-3"
            onClick={() => scrollToSection('section-projects', 'main')}
          >
            <FaFolderOpen size={12} />
            <span>{STRINGS.sections.projects}</span>
          </button>
          <button
            type="button"
            className="glass-nav-btn depth-layer-3"
            onClick={() => scrollToSection('section-skills', 'sidebar')}
          >
            <FaCode size={12} />
            <span>{STRINGS.sections.skills}</span>
          </button>
          {profile.education && profile.education.length > 0 && (
            <button
              type="button"
              className="glass-nav-btn depth-layer-3"
              onClick={() => scrollToSection('section-education', 'sidebar')}
            >
              <FaGraduationCap size={13} />
              <span>{STRINGS.sections.education}</span>
            </button>
          )}
        </nav>

        <div className="topbar-links">
          {profile.social.github && (
            <a
              href={profile.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-icon-link depth-layer-3"
              aria-label={STRINGS.aria.githubProfile}
            >
              <FaGithub size={17} />
            </a>
          )}
          {profile.social.linkedin && (
            <a
              href={profile.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-icon-link depth-layer-3"
              aria-label={STRINGS.aria.linkedinProfile}
            >
              <FaLinkedin size={17} />
            </a>
          )}
        </div>
      </header>

      {/* Main Workspace with Transparent Scrolling Containers */}
      <div className="resume-grid">
        {/* Left Transparent Scrolling Container: Profile, Contact, Skills, Education */}
        <aside
          ref={sidebarScrollRef}
          className="glass-panel depth-recessed glass-scroll resume-sidebar-scroll"
          aria-label="Profile Summary and Technical Skills"
        >
          <TiltCard layer={1} maxTilt={3} className="glass-card profile-hero-card">
            <div className="avatar-ring depth-layer-3">
              <img
                src={profileAvatar}
                alt={STRINGS.profile.avatarAlt(profile.name)}
                className="profile-avatar"
              />
            </div>

            <h2 className="hero-name">{profile.name}</h2>
            <p className="hero-title">{profile.title}</p>

            <div className="contact-pills">
              <a
                href={`mailto:${profile.email}`}
                className="glass-meta-pill depth-layer-3"
              >
                <FaEnvelope size={12} />
                <span>{profile.email}</span>
              </a>
              <span className="glass-meta-pill depth-layer-3">
                <FaMapMarkerAlt size={12} />
                <span>{profile.location}</span>
              </span>
            </div>

            <p className="profile-summary">{profile.description}</p>
          </TiltCard>

          <TiltCard
            id="section-skills"
            layer={1}
            maxTilt={2.5}
            className="glass-card"
          >
            <header className="section-header">
              <FaCode className="section-icon" />
              <h2 className="section-title">{STRINGS.sections.skills}</h2>
            </header>
            <div className="skills-stack">
              {profile.skillCategories.map((group) => (
                <div
                  key={group.category}
                  className="skill-group glass-subcard depth-layer-2"
                >
                  <h3 className="skill-group-name">{group.category}</h3>
                  <div className="tag-cloud">
                    {group.items.map((skill) => (
                      <span key={skill} className="glass-tag depth-layer-3">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TiltCard>

          {profile.education && profile.education.length > 0 && (
            <TiltCard
              id="section-education"
              layer={1}
              maxTilt={3}
              className="glass-card"
            >
              <header className="section-header">
                <FaGraduationCap className="section-icon" />
                <h2 className="section-title">{STRINGS.sections.education}</h2>
              </header>
              <div className="education-stack">
                {profile.education.map((edu) => (
                  <TiltCard
                    key={`${edu.degree}-${edu.period}`}
                    as="article"
                    layer={2}
                    maxTilt={3.5}
                    className="glass-subcard"
                  >
                    <span className="period-badge depth-layer-3">
                      {edu.period}
                    </span>
                    <h3 className="subcard-title">{edu.degree}</h3>
                    <p className="subcard-subtitle">{edu.institution}</p>
                  </TiltCard>
                ))}
              </div>
            </TiltCard>
          )}
        </aside>

        {/* Right Transparent Scrolling Container: Experience & Projects */}
        <main
          ref={mainScrollRef}
          className="glass-panel depth-recessed glass-scroll resume-main-scroll"
          aria-label="Career Experience and Projects"
        >
          {/* Career Experience Section */}
          <TiltCard
            id="section-experience"
            layer={1}
            maxTilt={1.8}
            className="glass-card"
          >
            <header className="section-header">
              <FaBriefcase className="section-icon" />
              <h2 className="section-title">{STRINGS.sections.experience}</h2>
              <span className="section-count depth-layer-3">
                {profile.experience.length} Roles
              </span>
            </header>

            <div className="experience-timeline">
              <div className="timeline-track depth-recessed" aria-hidden="true" />
              {profile.experience.map((exp) => (
                <TiltCard
                  key={`${exp.company}-${exp.role}-${exp.period}`}
                  as="article"
                  layer={2}
                  maxTilt={3.2}
                  className="glass-subcard timeline-card"
                >
                  <div className="timeline-card-header">
                    <div>
                      <h3 className="timeline-role">{exp.role}</h3>
                      <p className="timeline-company">
                        {exp.company}
                        {exp.location ? ` · ${exp.location}` : ''}
                      </p>
                    </div>
                    <span className="period-badge depth-layer-3">
                      {exp.period}
                    </span>
                  </div>

                  <p className="timeline-overview">{exp.description}</p>

                  {exp.highlights && exp.highlights.length > 0 && (
                    <ul className="timeline-bullets">
                      {exp.highlights.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                  )}

                  {exp.tools && exp.tools.length > 0 && (
                    <div className="timeline-tools-row depth-recessed">
                      <span className="tools-label">
                        {STRINGS.experience.toolsLabel}
                      </span>
                      <div className="tag-cloud">
                        {exp.tools.map((tool) => (
                          <span
                            key={tool}
                            className="glass-tag glass-tag-sm depth-layer-3"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </TiltCard>
              ))}
            </div>
          </TiltCard>

          {/* Projects Section */}
          <TiltCard
            id="section-projects"
            layer={1}
            maxTilt={2.5}
            className="glass-card"
          >
            <header className="section-header">
              <FaFolderOpen className="section-icon" />
              <h2 className="section-title">{STRINGS.sections.projects}</h2>
            </header>

            <div className="projects-grid">
              {profile.projects.map((project) => (
                <TiltCard
                  key={project.title}
                  as="article"
                  layer={2}
                  maxTilt={3.6}
                  className="glass-subcard project-card"
                >
                  <div className="project-card-top">
                    <h3 className="subcard-title">{project.title}</h3>
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-inline-link depth-layer-3"
                      >
                        <span>{STRINGS.projects.viewProject}</span>
                        <FaExternalLinkAlt size={11} />
                      </a>
                    )}
                  </div>
                  <p className="project-body">{project.description}</p>
                </TiltCard>
              ))}
            </div>
          </TiltCard>

          {/* Transparent Glass Footer */}
          <footer className="glass-footer depth-layer-1">
            <p>
              {profile.name} · {profile.title} · {profile.location}
            </p>
            <div className="footer-links">
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              {profile.social.github && (
                <a
                  href={profile.social.github}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub
                </a>
              )}
              {profile.social.linkedin && (
                <a
                  href={profile.social.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  LinkedIn
                </a>
              )}
            </div>
          </footer>
        </main>
      </div>

      <GlassVoiceAssistant />
    </div>
  );
});

export default GlassResume;
