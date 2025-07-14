import React from 'react';
import profileImage from '../assets/image/edwin.jpg';
import type { Profile } from '../data/profile';

interface ProfileSectionProps {
  profile: Profile;
}

function ProfileSection({ profile }: ProfileSectionProps) {
  return (
    <section className="profile">
      <img
        src={profileImage}
        alt={`${profile.name}'s profile`}
        className="profile-image"
      />
      <div className="profile-details">
        <p className="profile-description">{profile.description}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Location:</strong> {profile.location}</p>
      </div>
    </section>
  );
}

export default ProfileSection;