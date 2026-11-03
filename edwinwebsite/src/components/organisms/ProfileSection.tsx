import profileImage from '../../assets/image/edwin.jpg';
import { UI_LABELS } from '../../constants/config';
import type { Profile } from '../../types/profile';
import Avatar from '../atoms/Avatar';

interface ProfileSectionProps {
  profile: Profile;
}

function ProfileSection({ profile }: ProfileSectionProps) {
  return (
    <section className="section-card profile">
      <Avatar src={profileImage} alt={`${profile.name}'s profile`} />
      <div className="profile-details">
        <p className="profile-description">{profile.description}</p>
        <p className="profile-contact">
          <strong>{UI_LABELS.PROFILE.EMAIL_LABEL}</strong>{' '}
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
        </p>
        <p className="profile-contact">
          <strong>{UI_LABELS.PROFILE.LOCATION_LABEL}</strong> {profile.location}
        </p>
      </div>
    </section>
  );
}

export default ProfileSection;
