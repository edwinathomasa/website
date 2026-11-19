import { memo } from 'react';

export interface AvatarRingProps {
  readonly src: string;
  readonly alt: string;
}

const AvatarRing = memo(function AvatarRing({ src, alt }: AvatarRingProps) {
  return (
    <div className="avatar-ring depth-layer-3">
      <img src={src} alt={alt} className="profile-avatar" />
    </div>
  );
});

export default AvatarRing;
