import {
  formatNaturalList,
  formatPeriodsInText,
  getProfileTemplateVariables,
  type Profile,
  type ProfileTemplateKey,
  type QARule,
  type QARulesDocument,
} from '@portfolio/shared';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Whole-word / boundary-aware trigger matching so short triggers like "hi" or
 * "ble" never misfire inside words such as "architecture" or "able", while
 * preserving support for punctuation triggers like "ci/cd" and "master's".
 */
export function matchesTrigger(input: string, trigger: string): boolean {
  const cleanedTrigger = trigger.trim();
  if (!cleanedTrigger) return false;
  const escaped = escapeRegExp(cleanedTrigger);
  const boundaryRegex = new RegExp(
    `(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`,
    'i'
  );
  return boundaryRegex.test(input);
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
  profile: Profile
): string[] {
  const target = normalizeSectorKey(sectorQuery);
  if (!target) return [];

  const matches: string[] = [];

  for (const exp of profile.experience) {
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

export function interpolateProfileTemplate(
  template: string,
  profile: Profile
): string {
  const tokens = getProfileTemplateVariables(profile);

  return template.replace(
    /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g,
    (fullMatch, key: string) => {
      if (Object.prototype.hasOwnProperty.call(tokens, key)) {
        return tokens[key as ProfileTemplateKey];
      }
      return fullMatch;
    }
  );
}

export function resolveRuleAnswer(rule: QARule, profile: Profile): string {
  return formatPeriodsInText(interpolateProfileTemplate(rule.answer, profile));
}

export function matchSectorResponse(
  userQuestion: string,
  profile: Profile
): string | null {
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

function findBestTriggerMatch(
  userQuestion: string,
  rules: readonly QARule[]
): QARule | null {
  let bestRule: QARule | null = null;
  let bestLength = 0;

  for (const item of rules) {
    for (const trigger of item.triggers) {
      if (
        trigger.length > bestLength &&
        matchesTrigger(userQuestion, trigger)
      ) {
        bestRule = item;
        bestLength = trigger.length;
      }
    }
  }

  return bestRule;
}

export function matchCustomResponse(
  userQuestion: string,
  profile: Profile,
  qaRules: QARulesDocument
): string | null {
  const sectorMatch = matchSectorResponse(userQuestion, profile);
  if (sectorMatch) {
    return sectorMatch;
  }

  const matched = findBestTriggerMatch(userQuestion, qaRules.customResponses);
  return matched ? resolveRuleAnswer(matched, profile) : null;
}

export function matchKeywordFallback(
  userQuestion: string,
  profile: Profile,
  qaRules: QARulesDocument
): string | null {
  const matched = findBestTriggerMatch(userQuestion, qaRules.keywordFallbacks);
  return matched ? resolveRuleAnswer(matched, profile) : null;
}

export function getDefaultFallbackAnswer(
  profile: Profile,
  qaRules: QARulesDocument
): string {
  return formatPeriodsInText(
    interpolateProfileTemplate(qaRules.defaultFallback, profile)
  );
}
