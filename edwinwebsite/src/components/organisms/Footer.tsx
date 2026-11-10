import { STRINGS } from '../../constants/strings';
import type { SocialLinks } from '../../types/profile';
import SocialLinksBar from '../molecules/SocialLinksBar';

interface FooterProps {
  email: string;
  location: string;
  social: SocialLinks;
}

function Footer({ email, location, social }: FooterProps) {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          {STRINGS.footer.contactLabel} <a href={`mailto:${email}`}>{email}</a>
        </p>
        <p className="footer-text">
          {STRINGS.footer.locationLabel} {location}
        </p>
        <SocialLinksBar social={social} />
      </div>
    </footer>
  );
}

export default Footer;
