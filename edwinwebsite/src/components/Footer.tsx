import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import type { SocialLinks } from '../data/profile';

interface FooterProps {
  email: string;
  location: string;
  social: SocialLinks;
}

function Footer({ email, location, social }: FooterProps) {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          Contact: <a href={`mailto:${email}`}>{email}</a>
        </p>
        <p>Location: {location}</p>
        <div className="social-links">
          {social.github?.trim() && (
            <a
              href={social.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Profile"
              className="social-icon"
            >
              <FaGithub size={24} />
            </a>
          )}
          {social.linkedin?.trim() && (
            <a
              href={social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn Profile"
              className="social-icon"
            >
              <FaLinkedin size={24} />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;