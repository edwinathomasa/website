import type { CustomQA, Profile } from '../types/profile';
import { formatPeriodsInText } from '../utils/speechFormat';
import profile from './profile';
import qaRules from './qaRules.json';

function formatNaturalList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
}

function normalizeSectorKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

const SECTOR_STOP_WORDS = new Set([
  'and',
  'the',
  'for',
  'solutions',
  'solution',
  'support',
  'technical',
  'engineering',
  'technology',
  'consulting',
  'sector',
  'industry',
]);

function stemToken(word: string): string {
  const cleaned = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleaned.length > 4 && cleaned.endsWith('es')) {
    return cleaned.slice(0, -2);
  }
  if (cleaned.length > 4 && cleaned.endsWith('s')) {
    return cleaned.slice(0, -1);
  }
  return cleaned;
}

function extractSectorSearchTerms(sector: string): string[] {
  const terms = new Set<string>();
  const fullCompact = normalizeSectorKey(sector);
  if (fullCompact.length >= 4) {
    terms.add(fullCompact);
    terms.add(stemToken(fullCompact));
  }

  for (const part of sector.split(/[\s,&/+-]+/)) {
    const cleaned = normalizeSectorKey(part);
    if (cleaned.length >= 4 && !SECTOR_STOP_WORDS.has(cleaned)) {
      terms.add(cleaned);
      const stemmed = stemToken(cleaned);
      if (stemmed.length >= 4) {
        terms.add(stemmed);
      }
    }
  }

  return [...terms];
}

function indefiniteArticle(role: string): 'an' | 'a' {
  return /^[aeiou]/i.test(role.trim()) ? 'an' : 'a';
}

export function getCompaniesBySector(
  sectorQuery: string,
  p: Profile = profile
): string[] {
  const target = normalizeSectorKey(sectorQuery);
  if (!target) return [];

  const matches: string[] = [];

  for (const exp of p.experience) {
    if (exp.assignments && exp.assignments.length > 0) {
      for (const assignment of exp.assignments) {
        if (
          assignment.sector &&
          normalizeSectorKey(assignment.sector).includes(target)
        ) {
          matches.push(
            `${assignment.client} (as ${indefiniteArticle(assignment.role)} ${assignment.role} through ${exp.company}, ${assignment.period})`
          );
        }
      }
    } else if (exp.sector && normalizeSectorKey(exp.sector).includes(target)) {
      const clientNote = exp.client ? ` for ${exp.client}` : '';
      matches.push(
        `${exp.company}${clientNote} (as ${indefiniteArticle(exp.role)} ${exp.role}, ${exp.period})`
      );
    }
  }

  return matches;
}

function parseMonthIndex(token: string, now: Date): number | null {
  const cleaned = token.trim().toLowerCase();
  if (cleaned === 'ongoing' || cleaned === 'present' || cleaned === 'now') {
    return now.getFullYear() * 12 + now.getMonth();
  }
  const match = /^(\d{1,2})\/(\d{4})$/.exec(cleaned);
  if (!match) return null;
  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12) return null;
  return year * 12 + (month - 1);
}

export function calculateExperienceDuration(
  experience: Profile['experience'],
  now: Date = new Date()
): {
  readonly totalMonths: number;
  readonly years: number;
  readonly remainingMonths: number;
  readonly formatted: string;
} {
  const intervals: Array<[number, number]> = [];

  for (const exp of experience) {
    const parts = exp.period.split(/\s*[–—-]\s*/);
    if (parts.length !== 2) continue;
    const start = parseMonthIndex(parts[0], now);
    const end = parseMonthIndex(parts[1], now);
    if (start !== null && end !== null && end >= start) {
      intervals.push([start, end]);
    }
  }

  intervals.sort((a, b) => a[0] - b[0]);

  const merged: Array<[number, number]> = [];
  for (const [start, end] of intervals) {
    const last = merged[merged.length - 1];
    if (last && start <= last[1] + 1) {
      last[1] = Math.max(last[1], end);
    } else {
      merged.push([start, end]);
    }
  }

  const totalMonths = merged.reduce(
    (sum, [start, end]) => sum + (end - start + 1),
    0
  );
  const years = Math.floor(totalMonths / 12);
  const remainingMonths = totalMonths % 12;

  const yearLabel = `${years} ${years === 1 ? 'year' : 'years'}`;
  const formatted =
    years > 0 && remainingMonths > 0
      ? `over ${yearLabel}`
      : years > 0
        ? yearLabel
        : `${remainingMonths} ${remainingMonths === 1 ? 'month' : 'months'}`;

  return { totalMonths, years, remainingMonths, formatted };
}

export function interpolateProfileTemplate(
  template: string,
  p: Profile = profile
): string {
  const currentExp = p.experience[0];
  const currentAssignment = currentExp?.assignments?.[0];
  const directCompanies = p.experience
    .filter((exp) => !exp.assignments || exp.assignments.length === 0)
    .map((exp) => exp.company);
  const consultantClients = p.experience.flatMap((exp) =>
    (exp.assignments ?? []).map((a) => a.client)
  );
  const seenRoles = new Set<string>();
  const uniqueRoles: string[] = [];
  for (const exp of p.experience) {
    const roleCandidates =
      exp.assignments && exp.assignments.length > 0
        ? exp.assignments.map((a) => a.role)
        : [exp.role];
    for (const role of roleCandidates) {
      const key = role.trim().toLowerCase();
      if (key && !seenRoles.has(key)) {
        seenRoles.add(key);
        uniqueRoles.push(role.trim());
      }
    }
  }
  const sectors = [
    ...new Set(
      p.experience.flatMap((exp) =>
        exp.assignments && exp.assignments.length > 0
          ? exp.assignments
              .map((a) => a.sector)
              .filter((s): s is string => Boolean(s))
          : exp.sector
            ? [exp.sector]
            : []
      )
    ),
  ];
  const totalRoleCount = p.experience.reduce(
    (sum, exp) =>
      sum + (exp.assignments && exp.assignments.length > 0 ? exp.assignments.length : 1),
    0
  );
  const duration = calculateExperienceDuration(p.experience);
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
    experienceYears: String(duration.years),
    experienceDuration: duration.formatted,
    companyCount: String(p.experience.length),
    companyList: formatNaturalList(p.experience.map((exp) => exp.company)),
    directCompanyCount: String(directCompanies.length),
    directCompanyList: formatNaturalList(directCompanies),
    totalRoleCount: String(totalRoleCount),
    clientCount: String(consultantClients.length),
    clientList: formatNaturalList(consultantClients),
    sectorCount: String(sectors.length),
    sectorList: formatNaturalList(sectors),
    roleList: formatNaturalList(uniqueRoles),
    currentRole: currentExp?.role ?? '',
    currentCompany: currentExp?.company ?? '',
    currentLocation: currentExp?.location ?? p.location,
    currentPeriod: currentExp?.period ?? '',
    currentAssignmentRole: currentAssignment?.role ?? currentExp?.role ?? '',
    currentAssignmentClient:
      currentAssignment?.client ?? currentExp?.company ?? '',
    currentAssignmentPeriod:
      currentAssignment?.period ?? currentExp?.period ?? '',
    educationSummary: degrees,
    allSkills,
    projectTitles: formatNaturalList(p.projects.map((proj) => proj.title)),
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

export function matchSectorResponse(userQuestion: string): string | null {
  const normalized = userQuestion.toLowerCase().trim();
  const asksAboutCompany =
    /\b(compan(?:y|ies)|work(?:ed)?|employer|client|firm|sector|which)\b/.test(
      normalized
    );
  if (!asksAboutCompany) return null;

  const compactQuestion = normalizeSectorKey(normalized);
  const questionStems = new Set(
    normalized
      .split(/[\s,?.!/-]+/)
      .map((word) => stemToken(word))
      .filter((w) => w.length >= 4)
  );

  const allSectors = [
    ...new Set(
      profile.experience.flatMap((exp) =>
        exp.assignments && exp.assignments.length > 0
          ? exp.assignments
              .map((a) => a.sector)
              .filter((s): s is string => Boolean(s))
          : exp.sector
            ? [exp.sector]
            : []
      )
    ),
  ];

  for (const sector of allSectors) {
    const terms = extractSectorSearchTerms(sector);
    const matched = terms.some(
      (term) => compactQuestion.includes(term) || questionStems.has(term)
    );

    if (matched) {
      const companies = getCompaniesBySector(sector, profile);
      if (companies.length > 0) {
        return formatPeriodsInText(
          `In the ${sector} sector, I worked at ${formatNaturalList(companies)}.`
        );
      }
    }
  }

  return null;
}

export function matchCustomResponse(userQuestion: string): string | null {
  // 1. Check dynamic sector-specific company queries first (e.g. "Which automotive/med tech/logistic company did you work in?")
  const sectorMatch = matchSectorResponse(userQuestion);
  if (sectorMatch) {
    return sectorMatch;
  }

  // 2. Otherwise match general Q&A rules from qaRules.json
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
