import type { Project } from '@portfolio/shared';

export const projectsSeed: readonly Project[] = [
  {
    title: 'Niox MedTech BLE & Telemetry Platform',
    description:
      'Cross-platform iOS (Swift/SwiftUI) and Android (Kotlin/Jetpack Compose) applications interfacing with Niox medical IoT devices over BLE, backed by a Python/bless mock BLE peripheral server and offline-first Room/Realm synchronization.',
    link: '',
  },
  {
    title: 'Renz Smart Parcel Box BLE Apps',
    description:
      'React Native mobile application with custom native BLE modules and AES-encrypted packet framing for physical parcel lock actuation, delivery management, and serverless Firebase push notifications.',
    link: '',
  },
  {
    title: 'AOSP Vehicle Energy Model (VEM) Service',
    description:
      'Background system service and AIDL IPC layer within Google Automotive Services (AOSP/Soong) for EcarX, delivering real-time vehicle energy telemetry and Google Maps UI integration.',
    link: '',
  },
];
