import type { SkillCategory } from '@portfolio/shared';

export const skillsSeed: readonly SkillCategory[] = [
  {
    category: 'Programming Languages',
    items: [
      'Kotlin',
      'Swift',
      'Java',
      'Objective-C',
      'TypeScript',
      'JavaScript',
      'Python',
      'C#',
    ],
  },
  {
    category: 'Mobile Platforms & Frameworks',
    items: [
      'Android',
      'Jetpack Compose',
      'iOS',
      'SwiftUI',
      'CoreBluetooth',
      'Android Automotive (AOSP / GAS)',
    ],
  },
  {
    category: 'Cross-Platform',
    items: [
      'Kotlin Multiplatform (KMP)',
      'React Native',
      'Redux Toolkit',
      'Xamarin (.NET)',
      'Apache Cordova',
    ],
  },
  {
    category: 'BLE Expertise',
    items: [
      'Central/Peripheral Roles',
      'Bonding',
      'GATT Services',
      'BLE Mesh',
      'FDC Protocol',
      'Notifications/Indications',
    ],
  },
  {
    category: 'Cloud & Analytics',
    items: [
      'AWS',
      'Firebase (Analytics, Crashlytics, Realtime DB)',
      'REST APIs',
      'OneTrust SDK',
    ],
  },
  {
    category: 'Architecture',
    items: [
      'MVVM',
      'MVI',
      'Atomic Design',
      'Hilt',
      'Dagger 2',
      'AOSP (Soong)',
      'AIDL',
    ],
  },
  {
    category: 'Tools',
    items: [
      'Android Studio',
      'Xcode',
      'Git',
      'GitHub',
      'GitLab',
      'Gradle',
      'Make',
      'CocoaPods',
    ],
  },
  {
    category: 'Build & CI/CD',
    items: ['Soong', 'Gradle', 'GitHub Actions', 'Agile', 'Scrum'],
  },
];
