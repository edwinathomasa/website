export interface SkillCategory {
  readonly category: string;
  readonly items: readonly string[];
}

export interface Experience {
  readonly role: string;
  readonly company: string;
  readonly location?: string;
  readonly period: string;
  readonly description: string;
  readonly highlights?: readonly string[];
  readonly tools?: readonly string[];
}

export interface Education {
  readonly degree: string;
  readonly institution: string;
  readonly period: string;
}

export interface Project {
  readonly title: string;
  readonly description: string;
  readonly link: string;
}

export interface SocialLinks {
  readonly github?: string;
  readonly linkedin?: string;
}

export interface CustomQA {
  readonly question: string;
  readonly triggers: readonly string[];
  readonly answer: string | ((profile: Profile) => string);
}

export interface Profile {
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly email: string;
  readonly location: string;
  readonly social: SocialLinks;
  readonly skillCategories: readonly SkillCategory[];
  readonly experience: readonly Experience[];
  readonly education?: readonly Education[];
  readonly projects: readonly Project[];
}
