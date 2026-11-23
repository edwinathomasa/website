import { memo } from 'react';
import {
  FaBriefcase,
  FaCode,
  FaFolderOpen,
  FaGithub,
  FaGraduationCap,
  FaLinkedin,
} from 'react-icons/fa';
import { STRINGS } from '../../constants/strings';
import type { SocialLinks, VoiceState } from '@portfolio/shared';
import GlassSlab from '../atoms/GlassSlab';
import IconCircleButton from '../atoms/IconCircleButton';
import StatusDot from '../atoms/StatusDot';
import TopbarIdentity from '../molecules/TopbarIdentity';

export interface TopNavigationBarProps {
  readonly monogram: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly onNavigateBack?: () => void;
  readonly social?: SocialLinks;
  readonly hasEducation?: boolean;
  readonly onScrollSection?: (
    sectionId: string,
    pane: 'sidebar' | 'main'
  ) => void;
  readonly voiceStatus?: VoiceState;
}

const TopNavigationBar = memo(function TopNavigationBar({
  monogram,
  title,
  subtitle,
  onNavigateBack,
  social,
  hasEducation = false,
  onScrollSection,
  voiceStatus,
}: TopNavigationBarProps) {
  return (
    <GlassSlab
      as="header"
      layer={1}
      className={`glass-panel resume-topbar ${
        voiceStatus ? 'ai-topbar' : ''
      }`.trim()}
    >
      <TopbarIdentity
        monogram={monogram}
        title={title}
        subtitle={subtitle}
        onNavigateBack={onNavigateBack}
      />

      {onScrollSection && (
        <nav className="topbar-nav" aria-label="Resume Sections">
          <button
            type="button"
            className="glass-nav-btn depth-layer-3"
            onClick={() => onScrollSection('section-experience', 'main')}
          >
            <FaBriefcase size={12} />
            <span>{STRINGS.sections.experience}</span>
          </button>
          <button
            type="button"
            className="glass-nav-btn depth-layer-3"
            onClick={() => onScrollSection('section-projects', 'main')}
          >
            <FaFolderOpen size={12} />
            <span>{STRINGS.sections.projects}</span>
          </button>
          <button
            type="button"
            className="glass-nav-btn depth-layer-3"
            onClick={() => onScrollSection('section-skills', 'sidebar')}
          >
            <FaCode size={12} />
            <span>{STRINGS.sections.skills}</span>
          </button>
          {hasEducation && (
            <button
              type="button"
              className="glass-nav-btn depth-layer-3"
              onClick={() => onScrollSection('section-education', 'sidebar')}
            >
              <FaGraduationCap size={13} />
              <span>{STRINGS.sections.education}</span>
            </button>
          )}
        </nav>
      )}

      {social && (
        <div className="topbar-links">
          {social.github && (
            <IconCircleButton
              href={social.github}
              ariaLabel={STRINGS.aria.githubProfile}
            >
              <FaGithub size={17} />
            </IconCircleButton>
          )}
          {social.linkedin && (
            <IconCircleButton
              href={social.linkedin}
              ariaLabel={STRINGS.aria.linkedinProfile}
            >
              <FaLinkedin size={17} />
            </IconCircleButton>
          )}
        </div>
      )}

      {voiceStatus && (
        <div className="ai-status-pill depth-layer-3">
          <StatusDot status={voiceStatus} />
          <span>{STRINGS.voice.status[voiceStatus]}</span>
        </div>
      )}
    </GlassSlab>
  );
});

export default TopNavigationBar;
