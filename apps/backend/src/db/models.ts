import type {
  AvailabilityStatus,
  WorkAuthorizationStatus,
  WorkPreference,
} from '@portfolio/shared';

export const COLLECTIONS = {
  PROFILES: 'profiles',
  SKILL_CATEGORIES: 'skill_categories',
  SKILLS: 'skills',
  EXPERIENCES: 'experiences',
  ASSIGNMENTS: 'assignments',
  EDUCATION: 'education',
  PROJECTS: 'projects',
  QA_RULES: 'qa_rules',
} as const;

export interface ProfileCoreDoc {
  readonly slug: string;
  readonly identity: {
    readonly name: string;
    readonly title: string;
    readonly description: string;
    readonly engineeringPhilosophy: string;
    readonly spokenLanguages: string | readonly string[];
  };
  readonly contact: {
    readonly email: string;
    readonly location: string;
    readonly linkedinUrl: string;
    readonly githubUrl: string;
    readonly cvDownloadUrl?: string;
  };
  readonly professionalStatus: {
    readonly availabilityStatus: AvailabilityStatus;
    readonly workAuthorization: WorkAuthorizationStatus;
    readonly workPreferences: WorkPreference;
  };
  readonly updatedAt: Date;
}

export interface SkillCategoryDoc {
  readonly slug: string;
  readonly profileSlug: string;
  readonly name: string;
  readonly sortOrder: number;
  readonly updatedAt: Date;
}

export interface SkillDoc {
  readonly profileSlug: string;
  readonly categorySlug: string;
  readonly name: string;
  readonly sortOrder: number;
  readonly updatedAt: Date;
}

export interface ExperienceDoc {
  readonly slug: string;
  readonly profileSlug: string;
  readonly company: string;
  readonly role: string;
  readonly client?: string;
  readonly sector?: string;
  readonly location?: string;
  readonly period: string;
  readonly description: string;
  readonly highlights?: readonly string[];
  readonly tools?: readonly string[];
  readonly sortOrder: number;
  readonly updatedAt: Date;
}

export interface AssignmentDoc {
  readonly profileSlug: string;
  readonly experienceSlug: string;
  readonly client: string;
  readonly role: string;
  readonly sector?: string;
  readonly location?: string;
  readonly period: string;
  readonly description: string;
  readonly highlights?: readonly string[];
  readonly tools?: readonly string[];
  readonly sortOrder: number;
  readonly updatedAt: Date;
}

export interface EducationDoc {
  readonly profileSlug: string;
  readonly degree: string;
  readonly institution: string;
  readonly period: string;
  readonly sortOrder: number;
  readonly updatedAt: Date;
}

export interface ProjectDoc {
  readonly profileSlug: string;
  readonly title: string;
  readonly description: string;
  readonly link: string;
  readonly sortOrder: number;
  readonly updatedAt: Date;
}

export type QARuleTier = 'custom' | 'keyword' | 'default';

export interface QARuleDoc {
  readonly profileSlug: string;
  readonly ruleKey: string;
  readonly tier: QARuleTier;
  readonly question: string;
  readonly triggers: readonly string[];
  readonly answer: string;
  readonly sortOrder: number;
  readonly updatedAt: Date;
}
