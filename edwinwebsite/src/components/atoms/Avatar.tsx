interface AvatarProps {
  src: string;
  alt: string;
}

function Avatar({ src, alt }: AvatarProps) {
  return <img src={src} alt={alt} className="profile-image" />;
}

export default Avatar;
