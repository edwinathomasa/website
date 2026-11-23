import {
  formatNaturalList,
  formatPeriodsInText,
  type ChatMessage,
  type Profile,
  type QARulesDocument,
} from '@portfolio/shared';
import {
  getDefaultFallbackAnswer,
  matchCustomResponse,
  matchKeywordFallback,
  resolveRuleAnswer,
} from './qaMatcher.js';

export function buildSystemInstruction(
  profile: Profile,
  qaRules: QARulesDocument
): string {
  const resolvedCustomQA = [
    ...qaRules.customResponses,
    ...qaRules.keywordFallbacks,
  ]
    .map((item) => `Q: ${item.question}\nA: ${resolveRuleAnswer(item, profile)}`)
    .join('\n\n');

  const fullProfileJson = formatPeriodsInText(JSON.stringify(profile, null, 2));

  return `You are ${profile.name}, a ${profile.title} based in ${profile.location}.
You are speaking directly to a visitor on your portfolio website in a friendly, confident, professional first-person voice ("I", "my").

Strict Grounding & Conversation Rules:
- Answer strictly from the complete Profile JSON provided below. Never invent companies, client assignments, dates, highlights, or tools that are not present in the profile.
- Always maintain conversational memory across turns. When the user uses pronouns or follow-up references such as "there", "that company", "that role", "that client", "that project", "those tools", "they", or "it", resolve them using the prior conversation messages and answer using the exact matching record from the Profile JSON (including its \`tools\`, \`highlights\`, \`sector\`, \`period\`, and \`assignments\`).
- Keep every answer concise and natural for spoken voice and text chat (2 to 4 sentences max, no markdown bullet lists, no asterisks, and no code blocks).
- Always express dates and periods using full month names and years (for example, say "June 2024" instead of "06/2024", and "March 2023 to May 2024" instead of "03/2023 – 05/2024").
- If someone asks something unrelated to your professional background, skills, experience, education, projects, or contact details, politely steer the conversation back to your engineering work.

Preferred Custom Q&A Reference:
${resolvedCustomQA}

Complete Profile JSON:
${fullProfileJson}`;
}

const FOLLOW_UP_REFERENCE_PATTERN =
  /\b(there|that company|that role|that client|that project|that job|that assignment|those tools|those skills|that tech|at that|in that|they|them|it)\b/i;

export function hasContextualFollowUpReference(question: string): boolean {
  return FOLLOW_UP_REFERENCE_PATTERN.test(question);
}

interface ExperienceContextEntry {
  readonly label: string;
  readonly employer: string;
  readonly role: string;
  readonly period: string;
  readonly description: string;
  readonly highlights: readonly string[];
  readonly tools: readonly string[];
  readonly searchNames: readonly string[];
}

function getAllExperienceEntries(profile: Profile): ExperienceContextEntry[] {
  const entries: ExperienceContextEntry[] = [];

  for (const exp of profile.experience) {
    if (exp.assignments && exp.assignments.length > 0) {
      for (const assignment of exp.assignments) {
        entries.push({
          label: assignment.client,
          employer: exp.company,
          role: assignment.role,
          period: assignment.period,
          description: assignment.description,
          highlights: assignment.highlights ?? [],
          tools: assignment.tools ?? [],
          searchNames: [
            assignment.client.toLowerCase(),
            assignment.client.split(/\s+/)[0].toLowerCase(),
          ],
        });
      }
    }

    entries.push({
      label: exp.company,
      employer: exp.company,
      role: exp.role,
      period: exp.period,
      description: exp.description,
      highlights: exp.highlights ?? [],
      tools: exp.tools ?? [],
      searchNames: [
        exp.company.toLowerCase(),
        ...(exp.client ? [exp.client.toLowerCase()] : []),
      ],
    });
  }

  return entries;
}

function findReferencedEntryFromHistory(
  history: readonly ChatMessage[],
  profile: Profile
): ExperienceContextEntry | null {
  const entries = getAllExperienceEntries(profile);

  for (let i = history.length - 1; i >= 0; i--) {
    const text = history[i].content.toLowerCase();
    for (const entry of entries) {
      if (
        entry.searchNames.some(
          (name) => name.length >= 4 && text.includes(name)
        )
      ) {
        return entry;
      }
    }
  }

  return null;
}

export function buildLocalFallbackAnswer(
  question: string,
  history: readonly ChatMessage[],
  profile: Profile,
  qaRules: QARulesDocument
): string {
  const q = question.toLowerCase().trim();
  const isFollowUp =
    history.length > 0 && hasContextualFollowUpReference(question);

  if (isFollowUp) {
    const referenced = findReferencedEntryFromHistory(history, profile);
    if (referenced) {
      const asksAboutTools =
        /\b(tool|tools|tech|stack|technology|technologies|language|languages|framework|frameworks|used|use)\b/.test(
          q
        );
      if (asksAboutTools && referenced.tools.length > 0) {
        return formatPeriodsInText(
          `At ${referenced.label}, I used ${formatNaturalList(referenced.tools)}.`
        );
      }

      const asksAboutRoleOrWork =
        /\b(role|did you do|responsibilit|work|highlight|build|built|project)\b/.test(
          q
        );
      if (asksAboutRoleOrWork) {
        const extra =
          referenced.highlights.length > 0
            ? ` ${referenced.highlights[0]}`
            : '';
        return formatPeriodsInText(
          `At ${referenced.label} (${referenced.period}), I worked as a ${referenced.role}. ${referenced.description}${extra}`
        );
      }

      const toolsText =
        referenced.tools.length > 0
          ? ` I worked with ${formatNaturalList(referenced.tools)}.`
          : '';
      return formatPeriodsInText(
        `At ${referenced.label} (${referenced.period}), I worked as a ${referenced.role}. ${referenced.description}${toolsText}`
      );
    }
  }

  const customMatch = matchCustomResponse(question, profile, qaRules);
  if (customMatch) {
    return customMatch;
  }

  const keywordMatch = matchKeywordFallback(question, profile, qaRules);
  if (keywordMatch) {
    return keywordMatch;
  }

  for (const exp of profile.experience) {
    if (exp.assignments) {
      for (const assignment of exp.assignments) {
        if (
          q.includes(assignment.client.toLowerCase()) ||
          q.includes(assignment.role.toLowerCase())
        ) {
          return formatPeriodsInText(
            `While employed at ${exp.company}, I worked as a consultant (${assignment.role}) for ${assignment.client} (${assignment.period}). ${assignment.description} I worked extensively with ${(assignment.tools ?? []).join(', ')}.`
          );
        }
      }
    }

    if (
      q.includes(exp.company.toLowerCase()) ||
      q.includes(exp.role.toLowerCase()) ||
      (exp.client && q.includes(exp.client.toLowerCase()))
    ) {
      const assignmentSummary = exp.assignments?.length
        ? ` My client assignments include ${exp.assignments.map((a) => `${a.client} (${a.role}, ${a.period})`).join(', ')}.`
        : '';
      const toolsSummary = exp.tools?.length
        ? ` I worked extensively with ${exp.tools.join(', ')}.`
        : '';
      return formatPeriodsInText(
        `During my time as ${exp.role} at ${exp.company} (${exp.period}), ${exp.description}${assignmentSummary}${toolsSummary}`
      );
    }
  }

  return getDefaultFallbackAnswer(profile, qaRules);
}
