interface AvatarProps {
  src: string;
  alt: string;
  className?: string;
}

function Avatar({ src, alt, className = 'profile-image' }: AvatarProps) {
  return <img src={src} alt={alt} className={className} />;
}

export default Avatar;
