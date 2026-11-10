interface SectionHeadingProps {
  title: string;
}

function SectionHeading({ title }: SectionHeadingProps) {
  return <h2 className="section-heading">{title}</h2>;
}

export default SectionHeading;
