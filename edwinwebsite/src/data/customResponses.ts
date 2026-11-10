import type { CustomQA } from '../types/profile';
import { formatPeriodsInText } from '../utils/speechFormat';
import profile from './profile';

/**
 * Add or edit custom Q&A responses here.
 * - `question`: Example question for reference (and passed to Gemini context).
 * - `triggers`: Lowercase phrases/keywords that immediately return this exact answer.
 * - `answer`: A static string OR a function `(p) => string` that dynamically reads from `profile.ts`.
 */
export const customResponses: CustomQA[] = [
  {
    question: 'How many companies have you worked in?',
    triggers: [
      'how many companies',
      'how many company',
      'companies have you worked',
      'companies did you work',
      'list of companies',
      'which companies',
    ],
    answer: (p) => {
      const companyNames = p.experience.map((exp) => exp.company).join(', ');
      return `I have worked in ${p.experience.length} companies: ${companyNames}.`;
    },
  },
  {
    question: 'How many years of experience do you have?',
    triggers: [
      'how many years',
      'years of experience',
      'total experience',
    ],
    answer: () =>
      'I have over 10 years of software engineering experience across MedTech, Automotive, IoT, and Logistics sectors.',
  },
  {
    question: 'Where are you located?',
    triggers: [
      'where are you located',
      'where do you live',
      'which country',
      'your location',
      'current location',
    ],
    answer: (p) => `I am currently based in ${p.location}.`,
  },
  {
    question: 'What is your current job or role?',
    triggers: [
      'current role',
      'current job',
      'where do you work now',
      'working right now',
    ],
    answer: (p) => {
      const current = p.experience[0];
      return `I am currently working as a ${current.role} at ${current.company} in ${current.location} (${current.period}).`;
    },
  },
  {
    question: 'What is your educational background?',
    triggers: [
      'what did you study',
      'your education',
      'your degree',
      'which university',
    ],
    answer: (p) => {
      const degrees = (p.education ?? [])
        .map((edu) => `${edu.degree} from ${edu.institution} (${edu.period})`)
        .join(', and a ');
      return `I hold a ${degrees}.`;
    },
  },
  {
    question: 'Which programming languages are you familiar with?',
    triggers: [
      'what programming languages',
      'which languages',
      'programming skills',
      'tech stack',
    ],
    answer: (p) => {
      const allSkills = [...new Set(p.skillCategories.flatMap((c) => c.items))];
      return `I am proficient in ${allSkills.join(', ')}.`;
    },
  },
];

export function resolveCustomAnswer(item: CustomQA): string {
  const raw = typeof item.answer === 'function' ? item.answer(profile) : item.answer;
  return formatPeriodsInText(raw);
}

export function matchCustomResponse(userQuestion: string): string | null {
  const normalized = userQuestion.toLowerCase().trim();

  for (const item of customResponses) {
    if (item.triggers.some((trigger) => normalized.includes(trigger.toLowerCase()))) {
      return resolveCustomAnswer(item);
    }
  }

  return null;
}
