import type { Profile } from '../types/profile';

const profile: Profile = {
  name: "Edwin Thomas",
  title: "Senior Mobile & Embedded Systems Software Engineer",
  description:
    "Senior Mobile & Embedded Systems Software Engineer with over 10 years of cross-platform and native engineering experience across IoT, Automotive, MedTech, and Logistics sectors. Proven track record architecting and deploying production mobile applications and SDKs using Kotlin Multiplatform (KMP), native Android (Kotlin, Jetpack Compose, Coroutines), native iOS (Swift, SwiftUI), and React Native (Redux Toolkit). Deep specialization in Bluetooth Low Energy (BLE) communication lifecycle management and BLE Mesh networks. Adept at driving hardware-to-cloud telemetry, building mock peripheral environments (Python/bless) to guide firmware optimization, and integrating Google Automotive Services (GAS) within AOSP for flagship electric vehicles.",
  email: "edwinjohnya@gmail.com",
  location: "Sweden",
  social: {
    github: "https://github.com/edwinathomasa",
    linkedin: "https://www.linkedin.com/in/edwin-thomas-atokaran/",
  },
  skillCategories: [
    {
      category: "Mobile Platforms",
      items: ["Android (Kotlin, Java, Jetpack Compose)", "iOS (Swift, SwiftUI, CoreBluetooth)"],
    },
    {
      category: "BLE Expertise",
      items: ["Central/peripheral roles", "Bonding", "GATT services", "FDC protocol", "Notifications/indications"],
    },
    {
      category: "Cloud & Analytics",
      items: ["Firebase (Analytics, Crashlytics, Realtime DB)", "AWS"],
    },
    {
      category: "Cross-Platform",
      items: ["Kotlin Multiplatform (KMP)", "React Native (TypeScript, JavaScript, Redux Toolkit)", "Xamarin"],
    },
    {
      category: "Architecture",
      items: ["MVVM", "MVI", "Atomic Design", "Hilt", "Dagger 2", "AOSP (Soong)"],
    },
    {
      category: "Tools",
      items: ["Android Studio", "Xcode", "Git", "GitHub", "GitLab", "Gradle", "Make"],
    },
    {
      category: "Build & CI/CD",
      items: ["Soong", "Gradle", "GitHub Actions", "Agile", "Scrum"],
    },
  ],
  experience: [
    {
      role: "Sr. Software Developer",
      company: "Alten - Niox Group",
      location: "Sweden",
      period: "06/2024 – Ongoing",
      description:
        "Developing cross-platform mobile apps interfacing with Niox IoT devices via BLE for data acquisition and cloud telemetry, following Atomic Design principles.",
      highlights: [
        "Architecting cross-platform BLE communication layers in Swift and Kotlin, implementing custom GATT service/characteristic discovery, notification subscribers, and ATT MTU negotiation for optimized throughput.",
        "Engineering secure telemetry protocols over BLE using Kotlin Coroutines and StateFlow to handle high-frequency data streaming to cloud backends via REST APIs.",
        "Implementing MVVM architecture, local database storage, and Atomic Design for scalable and modular codebases.",
        "Engineering a programmable mock BLE peripheral server using Python and the bless library to simulate and mock devices across macOS and Windows operating systems.",
        "Designing and integrating automated XCTest and Espresso UI testing suites within CI/CD pipelines, increasing core module test coverage to 85%.",
        "Implementing robust offline-first synchronization using Room and Realm databases to buffer telemetry packets during BLE connection dropouts.",
      ],
      tools: [
        "Python",
        "bless",
        "Kotlin",
        "Jetpack Compose",
        "Dagger 2",
        "Hilt",
        "MVVM",
        "Swift",
        "SwiftUI",
        "CoreBluetooth",
      ],
    },
    {
      role: "Android Embedded Developer",
      company: "Alten - EcarX Sweden AB",
      location: "Sweden",
      period: "03/2023 – 05/2024",
      description:
        "Architected background services for real-time Vehicle Energy Model (VEM) updates within Google Automotive Services (AOSP Soong build environment).",
      highlights: [
        "Optimized AOSP Soong Build System configuration files (Android.bp) for custom OEM module targets, HAL bindings, and Google Maps UI customization.",
        "Implemented low-latency IPC using AIDL interfaces and background system services for real-time VEM telemetry stream monitoring.",
        "Collaborated with cross-functional teams to integrate and test custom system-level features, ensuring smooth execution within the Android Automotive OS architecture.",
      ],
      tools: [
        "Java",
        "Kotlin",
        "AOSP",
        "Google Automotive Services",
        "Soong",
        "Gradle",
        "Make",
      ],
    },
    {
      role: "iOS App Developer",
      company: "Alten - Axfood",
      location: "Sweden",
      period: "01/2023 – 05/2023",
      description:
        "Enhanced Willys and Hemköp iOS applications by integrating telemetry, privacy compliance SDKs, and UX improvements.",
      highlights: [
        "Integrated Firebase Analytics, Crashlytics for end-to-end app telemetry.",
        "Implemented OneTrust SDK to manage user consent modification and ensure GDPR data privacy compliance.",
      ],
      tools: [
        "Swift",
        "Objective-C",
        "Xcode",
        "CocoaPods",
        "Firebase",
        "OneTrust SDK",
        "Scrum",
      ],
    },
    {
      role: "Mobile App Developer",
      company: "Renz Sweden AB",
      location: "Sweden",
      period: "03/2019 – 01/2023",
      description:
        "Developed BLE-enabled mobile applications for myRenzbox smart parcel systems to handle hardware actuation, access codes, and real-time delivery notifications.",
      highlights: [
        "Engineered React Native applications with custom native modules for secure AES-encrypted packet framing and BLE GATT commands to trigger physical lock hardware actuation.",
        "Integrated Firebase backend services for serverless push notifications and multi-language European localization.",
        "Established automated CI/CD build pipelines with GitHub Actions to streamline release management and maintain rigorous security standards for BLE app distributions.",
        "Engineered a modular Node.js BLE communication package supporting cross-platform Android and iOS operation.",
      ],
      tools: [
        "React Native",
        "TypeScript",
        "CoreBluetooth",
        "Android Native",
        "Firebase",
        "REST APIs",
      ],
    },
    {
      role: "Software Developer",
      company: "FAGERHULTS BELYSNING AB",
      location: "Sweden",
      period: "08/2018 – 03/2019",
      description:
        "Engineered IoT mobile application interface to control smart lighting systems over BLE mesh.",
      highlights: [
        "Implemented BLE mesh networking protocols enabling device controls (power, dimming) and data tunneling.",
        "Developed and maintained cross-platform Xamarin (.NET/C#) applications connected to backend APIs.",
      ],
      tools: ["Xamarin", ".NET", "C#", "BLE Mesh", "REST APIs"],
    },
    {
      role: "Front End Developer",
      company: "GE Healthcare",
      location: "Sweden",
      period: "08/2017 – 02/2018",
      description:
        "Developed clinical data visualization modules and user interfaces for medical software applications.",
      tools: [".NET", "C#", "XML", "Scrum"],
    },
    {
      role: "Mobile App Developer",
      company: "Bring Logistics",
      location: "Sweden",
      period: "02/2015 – 07/2017",
      description:
        "Developed cross-platform mobile solution for logistics goods categorization and terminal communication.",
      highlights: [
        "Built cross-platform Cordova mobile app with custom UI/UX for terminal goods tracking.",
        "Implemented native Bluetooth file transfer capabilities between mobile devices and hardware terminals.",
      ],
      tools: ["Apache Cordova", "JavaScript", "HTML5/CSS3", "Bluetooth API"],
    },
    {
      role: "Consultant McAfee",
      company: "Sutherland Global Services - Mcafee",
      location: "India",
      period: "01/2013 – 08/2014",
      description:
        "Provided technical support and data analysis for McAfee diagnostic tools.",
      highlights: [
        "Delivered tier-2 technical support and collected analytical data for Virtual Assistance automation tools using Oracle CRM.",
      ],
      tools: ["Oracle CRM on Demand", "Diagnostic Tools"],
    },
  ],
  education: [
    {
      degree: "Master of Information Technology and Management",
      institution: "Jönköping University",
      period: "2014 – 2016",
    },
    {
      degree: "Bachelor's degree in Computer Science and Engineering",
      institution: "Anna University, Chennai",
      period: "2008 – 2012",
    },
  ],
  projects: [
    {
      title: "Niox MedTech BLE & Telemetry Platform",
      description:
        "Cross-platform iOS (Swift/SwiftUI) and Android (Kotlin/Jetpack Compose) applications interfacing with Niox medical IoT devices over BLE, backed by a Python/bless mock BLE peripheral server and offline-first Room/Realm synchronization.",
      link: "",
    },
    {
      title: "Renz Smart Parcel box BLE Apps",
      description:
        "React Native mobile application with custom native BLE modules and AES-encrypted packet framing for physical parcel lock actuation, delivery management, and serverless Firebase push notifications.",
      link: "",
    },
    {
      title: "AOSP Vehicle Energy Model (VEM) Service",
      description:
        "Background system service and AIDL IPC layer within Google Automotive Services (AOSP/Soong) for EcarX, delivering real-time vehicle energy telemetry and Google Maps UI integration.",
      link: "",
    },
  ],
};

export default profile;
