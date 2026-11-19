import { memo } from 'react';
import type { Profile } from '../../types/profile';
import GlassSlab from '../atoms/GlassSlab';

export interface ResumeFooterProps {
  readonly profile: Profile;
}

const ResumeFooter = memo(function ResumeFooter({
  profile,
}: ResumeFooterProps) {
  return (
    <GlassSlab as="footer" layer={1} className="glass-footer">
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
    </GlassSlab>
  );
});

export default ResumeFooter;
