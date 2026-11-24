import type { Experience } from '@portfolio/shared';

export const experienceSeed: readonly Experience[] = [
  {
    role: 'Senior Software Consultant',
    company: 'Alten',
    sector: 'Engineering & Technology Consulting',
    location: 'Sweden',
    period: '01/2023 – Ongoing',
    description:
      'Employed as a Senior Software Consultant at Alten, delivering native Android, iOS, BLE, and AOSP engineering across client assignments for Niox Group, EcarX Sweden AB, and Axfood.',
    assignments: [
      {
        client: 'Niox Group',
        role: 'Sr. Software Developer',
        sector: 'MedTech',
        location: 'Sweden',
        period: '06/2024 – Ongoing',
        description:
          'Developing cross-platform mobile apps interfacing with Niox IoT devices via BLE for data acquisition and cloud telemetry, following Atomic Design principles.',
        highlights: [
          'Architecting cross-platform BLE communication layers in Swift and Kotlin, implementing custom GATT service/characteristic discovery, notification subscribers, and ATT MTU negotiation for optimized throughput.',
          'Engineering secure telemetry protocols over BLE using Kotlin Coroutines and StateFlow to handle high-frequency data streaming to cloud backends via REST APIs.',
          'Implementing MVVM architecture, local database storage, and Atomic Design for scalable and modular codebases.',
          'Engineering a programmable mock BLE peripheral server using Python and the bless library to simulate and mock devices across macOS and Windows operating systems.',
          'Designing and integrating automated XCTest and Espresso UI testing suites within CI/CD pipelines, increasing core module test coverage to 85%.',
          'Implementing robust offline-first synchronization using Room and Realm databases to buffer telemetry packets during BLE connection dropouts.',
        ],
        tools: [
          'Python',
          'bless',
          'Kotlin',
          'Jetpack Compose',
          'Dagger 2',
          'Hilt',
          'MVVM',
          'Swift',
          'SwiftUI',
          'CoreBluetooth',
        ],
      },
      {
        client: 'EcarX Sweden AB',
        role: 'Android Embedded Developer',
        sector: 'Automotive',
        location: 'Sweden',
        period: '03/2023 – 05/2024',
        description:
          'Architected background services for real-time Vehicle Energy Model (VEM) updates within Google Automotive Services (AOSP Soong build environment).',
        highlights: [
          'Optimized AOSP Soong Build System configuration files (Android.bp) for custom OEM module targets, HAL bindings, and Google Maps UI customization.',
          'Implemented low-latency IPC using AIDL interfaces and background system services for real-time VEM telemetry stream monitoring.',
          'Collaborated with cross-functional teams to integrate and test custom system-level features, ensuring smooth execution within the Android Automotive OS architecture.',
        ],
        tools: [
          'Java',
          'Kotlin',
          'AOSP',
          'Google Automotive Services',
          'Soong',
          'Gradle',
          'Make',
        ],
      },
      {
        client: 'Axfood',
        role: 'iOS App Developer',
        sector: 'Grocery Retail & Wholesale',
        location: 'Sweden',
        period: '01/2023 – 05/2023',
        description:
          'Enhanced Willys and Hemköp iOS applications by integrating telemetry, privacy compliance SDKs, and UX improvements.',
        highlights: [
          'Integrated Firebase Analytics, Crashlytics for end-to-end app telemetry.',
          'Implemented OneTrust SDK to manage user consent modification and ensure GDPR data privacy compliance.',
        ],
        tools: [
          'Swift',
          'Objective-C',
          'Xcode',
          'CocoaPods',
          'Firebase',
          'OneTrust SDK',
          'Scrum',
        ],
      },
    ],
  },
  {
    role: 'Mobile App Developer',
    company: 'Renz Sweden AB',
    sector: 'Mailboxes & Parcel Lockers',
    location: 'Sweden',
    period: '03/2019 – 01/2023',
    description:
      'Developed BLE-enabled mobile applications for myRenzbox smart parcel systems to handle hardware actuation, access codes, and real-time delivery notifications.',
    highlights: [
      'Engineered React Native applications with custom native modules for secure AES-encrypted packet framing and BLE GATT commands to trigger physical lock hardware actuation.',
      'Integrated Firebase backend services for serverless push notifications and multi-language European localization.',
      'Established automated CI/CD build pipelines with GitHub Actions to streamline release management and maintain rigorous security standards for BLE app distributions.',
      'Engineered a modular Node.js BLE communication package supporting cross-platform Android and iOS operation.',
    ],
    tools: [
      'React Native',
      'TypeScript',
      'CoreBluetooth',
      'Android Native',
      'Firebase',
      'REST APIs',
    ],
  },
  {
    role: 'Software Developer',
    company: 'Fagerhults Belysning AB',
    sector: 'Lighting Solutions',
    location: 'Sweden',
    period: '08/2018 – 03/2019',
    description:
      'Engineered IoT mobile application interface to control smart lighting systems over BLE Mesh.',
    highlights: [
      'Implemented BLE Mesh networking protocols enabling device controls (power, dimming) and data tunneling.',
      'Developed and maintained cross-platform Xamarin (.NET/C#) applications connected to backend APIs.',
    ],
    tools: ['Xamarin', '.NET', 'C#', 'BLE Mesh', 'REST APIs'],
  },
  {
    role: 'Front End Developer',
    company: 'GE Healthcare',
    sector: 'MedTech',
    location: 'Sweden',
    period: '08/2017 – 02/2018',
    description:
      'Developed clinical data visualization modules and user interfaces for medical software applications.',
    tools: ['.NET', 'C#', 'XML', 'Scrum'],
  },
  {
    role: 'Mobile Software Developer',
    company: 'Bring Logistics',
    sector: 'Logistics',
    location: 'Sweden',
    period: '02/2015 – 07/2017',
    description:
      'Developed cross-platform mobile solution for logistics goods categorization and terminal communication.',
    highlights: [
      'Built cross-platform Cordova mobile app with custom UI/UX for terminal goods tracking.',
      'Implemented native Bluetooth file transfer capabilities between mobile devices and hardware terminals.',
    ],
    tools: ['Apache Cordova', 'JavaScript', 'HTML5/CSS3', 'Bluetooth API'],
  },
  {
    role: 'Consultant',
    company: 'Sutherland Global Services',
    client: 'McAfee',
    sector: 'Cybersecurity & Technical Support',
    location: 'India',
    period: '01/2013 – 08/2014',
    description:
      'Provided technical support and data analysis for McAfee diagnostic tools.',
    highlights: [
      'Delivered tier-2 technical support and collected analytical data for Virtual Assistance automation tools using Oracle CRM.',
    ],
    tools: ['Oracle CRM on Demand', 'Diagnostic Tools'],
  },
];
