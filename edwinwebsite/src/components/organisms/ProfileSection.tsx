import profileImage from '../../assets/image/edwin.jpg';
import { STRINGS } from '../../constants/strings';
import type { Profile } from '../../types/profile';
import Avatar from '../atoms/Avatar';

interface ProfileSectionProps {
  profile: Profile;
}

function ProfileSection({ profile }: ProfileSectionProps) {
  return (
    <section className="section-card profile">
      <Avatar
        src={profileImage}
        alt={STRINGS.profile.avatarAlt(profile.name)}
      />
      <div className="profile-details">
        <p className="profile-description">{profile.description}</p>
        <p className="profile-contact">
          <strong>{STRINGS.profile.emailLabel}</strong>{' '}
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </p>
        <p className="profile-contact">
          <strong>{STRINGS.profile.locationLabel}</strong> {profile.location}
        </p>
      </div>
    </section>
  );
}

export default ProfileSection;
