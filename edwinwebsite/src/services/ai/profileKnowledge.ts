import {
  customResponses,
  matchCustomResponse,
  resolveCustomAnswer,
} from '../../data/customResponses';
import profile from '../../data/profile';

const RESOLVED_CUSTOM_QA = customResponses
  .map((item) => `Q: ${item.question}\nA: ${resolveCustomAnswer(item)}`)
  .join('\n\n');

export const SYSTEM_INSTRUCTION = `You are ${profile.name}, a ${profile.title} based in ${profile.location}.
You are speaking directly to a visitor on your portfolio website in a friendly, confident, professional first-person voice ("I", "my").
Keep every answer concise and natural for spoken voice output (2 to 4 sentences max, no markdown bullet lists, no asterisks or code blocks).

Preferred Custom Q&A Answers:
${RESOLVED_CUSTOM_QA}

Full Profile Data:
${JSON.stringify(profile, null, 2)}

If someone asks something unrelated to your professional background, skills, experience, education, projects, or contact details, politely steer the conversation back to your engineering work.`;

const KEYWORD_MATCHERS: Array<{ keywords: string[]; reply: () => string }> = [
  {
    keywords: ['who are you', 'introduce', 'about you', 'yourself', 'hello', 'hi'],
    reply: () =>
      `Hi there! I'm ${profile.name}, a ${profile.title} based in ${profile.location} with over 10 years of experience in native Android, iOS, Kotlin Multiplatform, React Native, and Bluetooth Low Energy systems. How can I help you today?`,
  },
  {
    keywords: ['contact', 'email', 'reach', 'hire'],
    reply: () =>
      `You can reach me directly by email at ${profile.email}, or connect with me on LinkedIn and GitHub from the links at the bottom of the page. I'm currently based in ${profile.location}.`,
  },
  {
    keywords: ['ble', 'bluetooth'],
    reply: () =>
      `Bluetooth Low Energy is one of my core specialties. I've architected cross-platform BLE GATT communication layers in Swift, Kotlin, and React Native, worked with BLE Mesh at Fagerhults, built AES-encrypted parcel lock actuation at Renz, and created Python bless mock peripherals at NIOX Group.`,
  },
  {
    keywords: ['automotive', 'aosp', 'ecarx'],
    reply: () =>
      `At ALTEN - ECARX Sweden AB, I worked as an Android Embedded Developer where I architected background services for real-time Vehicle Energy Model updates within Google Automotive Services and AOSP using Soong and AIDL.`,
  },
  {
    keywords: ['project'],
    reply: () =>
      `Some of my key projects include ${profile.projects.map((p) => p.title).join(', ')}. Feel free to ask me about any of them in detail!`,
  },
  {
    keywords: ['skill', 'tech', 'stack', 'language'],
    reply: () =>
      `My core technical stack covers Android with Kotlin and Jetpack Compose, iOS with Swift and SwiftUI, Kotlin Multiplatform, React Native, Bluetooth Low Energy, and AOSP with Google Automotive Services.`,
  },
  {
    keywords: ['experience', 'work', 'career'],
    reply: () => {
      const companies = profile.experience.map((e) => e.company).join(', ');
      return `I have worked across ${profile.experience.length} companies (${companies}) over my 10+ year career in MedTech, Automotive, IoT, and Logistics.`;
    },
  },
];

export function buildLocalFallbackAnswer(question: string): string {
  const customMatch = matchCustomResponse(question);
  if (customMatch) {
    return customMatch;
  }

  const q = question.toLowerCase();

  for (const matcher of KEYWORD_MATCHERS) {
    if (matcher.keywords.some((kw) => q.includes(kw))) {
      return matcher.reply();
    }
  }

  for (const exp of profile.experience) {
    if (q.includes(exp.company.toLowerCase()) || q.includes(exp.role.toLowerCase())) {
      return `During my time as ${exp.role} at ${exp.company} (${exp.period}), ${exp.description} I worked extensively with ${(exp.tools ?? []).join(', ')}.`;
    }
  }

  return `I'm ${profile.name}, a ${profile.title} in ${profile.location}. I specialize in Android, iOS, Kotlin Multiplatform, React Native, BLE, and AOSP. Feel free to ask about my work at NIOX, ECARX, Renz, my skills, or how to get in touch!`;
}
