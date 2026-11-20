import type { CustomQA, Profile } from '../types/profile';
import { formatPeriodsInText } from '../utils/speechFormat';
import profile from './profile';
import qaRules from './qaRules.json';

export function interpolateProfileTemplate(
  template: string,
  p: Profile = profile
): string {
  const currentExp = p.experience[0];
  const allSkills = [
    ...new Set(p.skillCategories.flatMap((c) => c.items)),
  ].join(', ');
  const degrees = (p.education ?? [])
    .map((edu) => `${edu.degree} from ${edu.institution} (${edu.period})`)
    .join(', and a ');

  const tokens: Record<string, string> = {
    name: p.name,
    title: p.title,
    location: p.location,
    email: p.email,
    companyCount: String(p.experience.length),
    companyList: p.experience.map((exp) => exp.company).join(', '),
    currentRole: currentExp?.role ?? '',
    currentCompany: currentExp?.company ?? '',
    currentLocation: currentExp?.location ?? p.location,
    currentPeriod: currentExp?.period ?? '',
    educationSummary: degrees,
    allSkills,
    projectTitles: p.projects.map((proj) => proj.title).join(', '),
  };

  return template.replace(
    /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
    (fullMatch, key: string) =>
      Object.prototype.hasOwnProperty.call(tokens, key)
        ? tokens[key]
        : fullMatch
  );
}

/**
 * Custom Q&A rules loaded from `src/data/qaRules.json`.
 */
export const customResponses: CustomQA[] = qaRules.customResponses.map(
  (rule) => ({
    question: rule.question,
    triggers: rule.triggers,
    answer: (p: Profile) => interpolateProfileTemplate(rule.answer, p),
  })
);

/**
 * Keyword fallback rules loaded from `src/data/qaRules.json`.
 */
export const keywordFallbacks: CustomQA[] = qaRules.keywordFallbacks.map(
  (rule) => ({
    question: rule.question,
    triggers: rule.triggers,
    answer: (p: Profile) => interpolateProfileTemplate(rule.answer, p),
  })
);

export function resolveCustomAnswer(item: CustomQA): string {
  const raw =
    typeof item.answer === 'function' ? item.answer(profile) : item.answer;
  return formatPeriodsInText(interpolateProfileTemplate(raw, profile));
}

export function matchCustomResponse(userQuestion: string): string | null {
  const normalized = userQuestion.toLowerCase().trim();

  for (const item of customResponses) {
    if (
      item.triggers.some((trigger) =>
        normalized.includes(trigger.toLowerCase())
      )
    ) {
      return resolveCustomAnswer(item);
    }
  }

  return null;
}

export function matchKeywordFallback(userQuestion: string): string | null {
  const normalized = userQuestion.toLowerCase().trim();

  for (const item of keywordFallbacks) {
    if (
      item.triggers.some((trigger) =>
        normalized.includes(trigger.toLowerCase())
      )
    ) {
      return resolveCustomAnswer(item);
    }
  }

  return null;
}

export function getDefaultFallbackAnswer(): string {
  return formatPeriodsInText(
    interpolateProfileTemplate(qaRules.defaultFallback, profile)
  );
}
