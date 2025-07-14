function SkillsSection({ skills }: { skills: string[] }) {
  return (
    <section className="skills">
      <h2>Skills</h2>
      <p>{skills.join(' | ')}</p>
    </section>
  )
}

export default SkillsSection