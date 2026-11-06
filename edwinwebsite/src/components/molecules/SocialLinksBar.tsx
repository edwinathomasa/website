import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { ICON_SIZES, UI_LABELS } from '../../constants/config';
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
          ariaLabel={UI_LABELS.ARIA.GITHUB}
          className="social-icon"
        >
          <FaGithub size={ICON_SIZES.LG} />
        </ExternalLink>
      )}
      {social.linkedin?.trim() && (
        <ExternalLink
          href={social.linkedin}
          ariaLabel={UI_LABELS.ARIA.LINKEDIN}
          className="social-icon"
        >
          <FaLinkedin size={ICON_SIZES.LG} />
        </ExternalLink>
      )}
    </div>
  );
}

export default SocialLinksBar;
