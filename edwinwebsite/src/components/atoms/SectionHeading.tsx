interface SectionHeadingProps {
  title: string;
  className?: string;
}

function SectionHeading({ title, className = 'section-heading' }: SectionHeadingProps) {
  return <h2 className={className}>{title}</h2>;
}

export default SectionHeading;
