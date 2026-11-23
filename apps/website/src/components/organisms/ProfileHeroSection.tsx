import { memo } from 'react';
import {
  FaBriefcase,
  FaCheckCircle,
  FaEnvelope,
  FaLaptopHouse,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import profileAvatar from '../../assets/image/edwin.jpg';
import { STRINGS } from '../../constants/strings';
import type { Profile } from '@portfolio/shared';
import AvatarRing from '../atoms/AvatarRing';
import GlassSlab from '../atoms/GlassSlab';

export interface ProfileHeroSectionProps {
  readonly profile: Profile;
}

const ProfileHeroSection = memo(function ProfileHeroSection({
  profile,
}: ProfileHeroSectionProps) {
  return (
    <GlassSlab layer={1} className="glass-card profile-hero-card">
      <AvatarRing
        src={profileAvatar}
        alt={STRINGS.profile.avatarAlt(profile.name)}
      />

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
        <span className="glass-meta-pill depth-layer-3">
          <FaBriefcase size={12} />
          <span>{profile.availabilityStatus}</span>
        </span>
        <span className="glass-meta-pill depth-layer-3">
          <FaCheckCircle size={12} />
          <span>{profile.workAuthorization}</span>
        </span>
        <span className="glass-meta-pill depth-layer-3">
          <FaLaptopHouse size={12} />
          <span>{profile.workPreferences}</span>
        </span>
      </div>

      <p className="profile-summary">{profile.description}</p>
    </GlassSlab>
  );
});

export default ProfileHeroSection;
