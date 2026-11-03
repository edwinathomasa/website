export interface SkillCategory {
  category: string;
  items: string[];
}

export interface Experience {
  role: string;
  company: string;
  location?: string;
  period: string;
  description: string;
  highlights?: string[];
  tools?: string[];
}

export interface Education {
  degree: string;
  institution: string;
  period: string;
}

export interface Project {
  title: string;
  description: string;
  link: string;
}

export interface SocialLinks {
  github?: string;
  linkedin?: string;
  website?: string;
}

export interface CustomQA {
  question: string;
  triggers: string[];
  answer: string | ((profile: Profile) => string);
}

export interface Profile {
  name: string;
  title: string;
  description: string;
  email: string;
  location: string;
  social: SocialLinks;
  skills: string[];
  skillCategories?: SkillCategory[];
  experience: Experience[];
  education?: Education[];
  projects: Project[];
}

