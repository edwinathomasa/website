import type {
  AvailabilityStatus,
  WorkAuthorizationStatus,
  WorkPreference,
} from '@portfolio/shared';

const GITHUB_URL = 'https://github.com/edwinathomasa';
const LINKEDIN_URL = 'https://www.linkedin.com/in/edwin-thomas-atokaran/';

export interface ProfileCoreSeed {
  readonly slug: string;
  readonly name: string;
  readonly title: string;
  readonly description: string;
  readonly email: string;
  readonly location: string;
  readonly linkedinUrl: string;
  readonly githubUrl: string;
  readonly cvDownloadUrl: string;
  readonly availabilityStatus: AvailabilityStatus;
  readonly workAuthorization: WorkAuthorizationStatus;
  readonly workPreferences: WorkPreference;
  readonly spokenLanguages: string | readonly string[];
  readonly engineeringPhilosophy: string;
}

export const profileSeed: ProfileCoreSeed = {
  slug: 'edwin-thomas',
  name: 'Edwin Thomas',
  title: 'Senior Mobile & Embedded Systems Software Engineer',
  description:
    'Senior Mobile & Embedded Systems Software Engineer with over 10 years of cross-platform and native engineering experience across IoT, Automotive, MedTech, and Logistics sectors. Proven track record architecting and deploying production mobile applications and SDKs using Kotlin Multiplatform (KMP), native Android (Kotlin, Jetpack Compose, Coroutines), native iOS (Swift, SwiftUI), and React Native (Redux Toolkit). Deep specialization in Bluetooth Low Energy (BLE) communication lifecycle management and BLE Mesh networks. Adept at driving hardware-to-cloud telemetry, building mock peripheral environments (Python/bless) to guide firmware optimization, and integrating Google Automotive Services (GAS) within AOSP for flagship electric vehicles.',
  email: 'edwinjohnya@gmail.com',
  location: 'Helsingborg, Sweden',
  linkedinUrl: LINKEDIN_URL,
  githubUrl: GITHUB_URL,
  cvDownloadUrl: '',
  availabilityStatus: 'Employed — Open to Opportunities',
  workAuthorization: 'Permanent Resident (Sweden)',
  workPreferences: 'Fully on-Site or hybrid',
  spokenLanguages: 'Fluent in English; studying Swedish',
  engineeringPhilosophy:
    'I focus on clean, modular architectures such as MVVM, MVI, and Atomic Design paired with reusable SDKs, automated CI/CD testing pipelines, and programmable hardware/BLE peripheral mocking (Python/bless) to deliver reliable production software.',
};
