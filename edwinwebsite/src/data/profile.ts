// src/data/profile.ts

export interface Experience {
  role: string;
  company: string;
  period: string;
  description: string;
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

export interface Profile {
  name: string;
  title: string;
  description: string;
  email: string;
  location: string;
  social: SocialLinks;
  skills: string[];
  experience: Experience[];
  projects: Project[];
}

const profile: Profile = {
  name: "Edwin Thomas Atokaran",
  title: "Mobile App Developer | React Native Developer | Web Developer | AOSP Developer",
  description:
    "Experienced mobile developer with 8+ years in building native Android and iOS applications, cross-platform React Native apps, and embedded AOSP services. Skilled in BLE, Kotlin, Swift, React Native, and backend integration. Passionate about creating seamless user experiences and robust system-level solutions.",
  email: "edwinjohnya@gmail.com",
  location: "Gothenburg, Sweden",
  social: {
    github: "https://github.com/edwinathomasa",
    linkedin: "https://www.linkedin.com/in/edwin-thomas-atokaran/",
    website: "",
  },
  skills: [
    "Android",
    "iOS",
    "React Native",
    "Kotlin",
    "Swift",
    "BLE",
    "AOSP",
    "Node.js",
    "GraphQL",
    "TypeScript",
    "Xamarin",
    "MVVM",
    "Git"
  ],
  experience: [
    {
      role: "Mobile Application Developer - NIOX",
      company: "ALTEN Sweden",
      period: "August 2024 – Present",
      description:
        "Developing cross-platform medical apps with native Android (Kotlin) and iOS (Swift). Built the full BLE communication stack, enabling secure data transmission from medical devices to backend services. Involved in the complete product lifecycle including planning, architecture, UI design, and publishing.",
    },
    {
      role: "AOSP Embedded Developer",
      company: "ECARX",
      period: "January 2023 – July 2025",
      description:
        "Created a background service in AOSP to update Vehicle Energy Models (VEM) via Google Maps. Customized the AOSP Soong build system, collaborated with OEMs, and implemented real-time energy monitoring algorithms.",
    },
    {
      role: "Mobile Application Developer",
      company: "Renz Sweden AB",
      period: "March 2019 – January 2023",
      description:
        "Developed BLE-enabled React Native mobile apps for smart parcel box systems. Implemented device communication, push notifications via Firebase, and delivery management features with backend API integration.",
    },
    {
      role: "Software Developer",
      company: "Fagerhult Belysning AB",
      period: "August 2018 – March 2019",
      description:
        "Contributed to a BLE mesh-based smart lighting system. Built a Xamarin app to control lighting states and tunnel data through to backend services.",
    },
    {
      role: "Software Developer",
      company: "GE Healthcare",
      period: "August 2017 – February 2018",
      description:
        "Designed UI for managing medical device documentation, improving technician workflows. Conducted usability testing and refined the UX for CD-based file navigation.",
    },
    {
      role: "Mobile Application Developer",
      company: "Bring Sverige",
      period: "February 2015 – July 2017",
      description:
        "Developed a cross-platform logistics app to manage goods categorization in terminals. Initially built for Android, later extended to iOS.",
    },
    {
      role: "Service Delivery",
      company: "Sutherland",
      period: "January 2013 – August 2014",
      description:
        "Worked with Oracle CRM for client communication, issue categorization, and enterprise data documentation. Gained experience in information-driven decision-making using enterprise tools.",
    },
  ],
  projects: [
    {
      title: "NIOX BLE Medical App",
      description:
        "A cross-platform medical companion app for iOS and Android with complete BLE stack integration. Used in real-time medical data collection and device communication.",
      link: "",
    },
    {
      title: "Parcel Box BLE App",
      description:
        "Mobile app for RENZ Parcel Box system allowing BLE-based box control, delivery management, and push notifications. Developed using React Native.",
      link: "",
    },
    {
      title: "AOSP VEM Service",
      description:
        "Custom AOSP service for ECARX to monitor and update vehicle energy usage using dynamic Google Maps-based modeling and build system extensions.",
      link: "",
    },
  ],
};

export default profile;