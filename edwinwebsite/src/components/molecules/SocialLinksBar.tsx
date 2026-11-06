import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { ICON_SIZES } from '../../constants/config';
import { STRINGS } from '../../constants/strings';
import type { SocialLinks } from '../../types/profile';
import ExternalLink from '../atoms/ExternalLink';

interface SocialLinksBarProps {
  social: SocialLinks;
}

function SocialLinksBar({ social }: SocialLinksBarProps) {
  return (
    <div className="social-links">
      {social.github?.trim() && (
        <ExternalLink
          href={social.github}
          ariaLabel={STRINGS.aria.githubProfile}
          className="social-icon"
        >
          <FaGithub size={ICON_SIZES.LG} />
        </ExternalLink>
      )}
      {social.linkedin?.trim() && (
        <ExternalLink
          href={social.linkedin}
          ariaLabel={STRINGS.aria.linkedinProfile}
          className="social-icon"
        >
          <FaLinkedin size={ICON_SIZES.LG} />
        </ExternalLink>
      )}
    </div>
  );
}

export default SocialLinksBar;
