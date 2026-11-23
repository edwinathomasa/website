export interface SkillCategory {
  readonly category: string;
  readonly items: readonly string[];
}

export interface ClientAssignment {
  readonly client: string;
  readonly role: string;
  readonly sector?: string;
  readonly location?: string;
  readonly period: string;
  readonly description: string;
  readonly highlights?: readonly string[];
  readonly tools?: readonly string[];
}

export interface Experience {
  readonly role: string;
  readonly company: string;
  readonly client?: string;
  readonly sector?: string;
  readonly location?: string;
  readonly period: string;
  readonly description: string;
  readonly highlights?: readonly string[];
  readonly tools?: readonly string[];
  readonly assignments?: readonly ClientAssignment[];
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

export interface QARule {
  readonly question: string;
  readonly triggers: readonly string[];
  readonly answer: string;
}

export interface QARulesDocument {
  readonly profileSlug?: string;
  readonly customResponses: readonly QARule[];
  readonly keywordFallbacks: readonly QARule[];
  readonly defaultFallback: string;
}

export interface CustomQA {
  readonly question: string;
  readonly triggers: readonly string[];
  readonly answer: string | ((profile: Profile) => string);
}

export type AvailabilityStatus =
  | 'Employed — Open to Opportunities'
  | 'Actively Looking'
  | 'Available for Consulting'
  | 'Not Currently Available';

export type WorkAuthorizationStatus =
  | 'Permanent Resident (Sweden)'
  | 'Temporary Residence & Work Permit (Sweden)'
  | 'EU/EEA Citizen'
  | 'Requires Sponsorship';

export type WorkPreference =
  | 'Hybrid or Remote'
  | 'Hybrid'
  | 'Remote Only'
  | 'On-Site'
  | 'Fully on-Site or hybrid'
  | 'Open to Relocation';

export interface Profile {
  readonly slug?: string;
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly email: string;
  readonly location: string;
  readonly linkedinUrl: string;
  readonly githubUrl: string;
  readonly cvDownloadUrl?: string;
  readonly availabilityStatus: AvailabilityStatus;
  readonly workAuthorization: WorkAuthorizationStatus;
  readonly workPreferences: WorkPreference;
  readonly spokenLanguages: string | readonly string[];
  readonly engineeringPhilosophy: string;
  readonly social: SocialLinks;
  readonly skillCategories: readonly SkillCategory[];
  readonly experience: readonly Experience[];
  readonly education?: readonly Education[];
  readonly projects: readonly Project[];
}

export interface ExperienceDuration {
  readonly totalMonths: number;
  readonly years: number;
  readonly remainingMonths: number;
  readonly formatted: string;
}

export interface ProfileTemplateVariables {
  readonly name: string;
  readonly title: string;
  readonly location: string;
  readonly email: string;
  readonly linkedinUrl: string;
  readonly githubUrl: string;
  readonly cvDownloadUrl: string;
  readonly experienceDuration: string;
  readonly experienceYears: string;
  readonly companyCount: string;
  readonly companyList: string;
  readonly directCompanyCount: string;
  readonly directCompanyList: string;
  readonly totalRoleCount: string;
  readonly clientCount: string;
  readonly clientList: string;
  readonly sectorCount: string;
  readonly sectorList: string;
  readonly roleList: string;
  readonly projectTitles: string;
  readonly currentCompany: string;
  readonly currentRole: string;
  readonly currentPeriod: string;
  readonly currentAssignmentRole: string;
  readonly currentAssignmentClient: string;
  readonly currentLocation: string;
  readonly currentAssignmentPeriod: string;
  readonly educationSummary: string;
  readonly allSkills: string;
  readonly availabilityStatus: AvailabilityStatus;
  readonly workAuthorization: WorkAuthorizationStatus;
  readonly workPreferences: WorkPreference;
  readonly spokenLanguages: string;
  readonly engineeringPhilosophy: string;
}

export type ProfileTemplateKey = keyof ProfileTemplateVariables;
