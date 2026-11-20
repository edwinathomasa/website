import {
  customResponses,
  getDefaultFallbackAnswer,
  keywordFallbacks,
  matchCustomResponse,
  matchKeywordFallback,
  resolveCustomAnswer,
} from '../../data/customResponses';
import profile from '../../data/profile';
import { formatPeriodsInText } from '../../utils/speechFormat';

const RESOLVED_CUSTOM_QA = [...customResponses, ...keywordFallbacks]
  .map((item) => `Q: ${item.question}\nA: ${resolveCustomAnswer(item)}`)
  .join('\n\n');

export const SYSTEM_INSTRUCTION = `You are ${profile.name}, a ${profile.title} based in ${profile.location}.
You are speaking directly to a visitor on your portfolio website in a friendly, confident, professional first-person voice ("I", "my").
Keep every answer concise and natural for spoken voice output (2 to 4 sentences max, no markdown bullet lists, no asterisks or code blocks).
Always express dates and periods using full month names and years (for example, say "June 2024" instead of "06/2024", and "March 2023 to May 2024" instead of "03/2023 – 05/2024").

Preferred Custom Q&A Answers:
${RESOLVED_CUSTOM_QA}

Full Profile Data:
${formatPeriodsInText(JSON.stringify(profile, null, 2))}

If someone asks something unrelated to your professional background, skills, experience, education, projects, or contact details, politely steer the conversation back to your engineering work.`;

export function buildLocalFallbackAnswer(question: string): string {
  const customMatch = matchCustomResponse(question);
  if (customMatch) {
    return customMatch;
  }

  const keywordMatch = matchKeywordFallback(question);
  if (keywordMatch) {
    return keywordMatch;
  }

  const q = question.toLowerCase();

  for (const exp of profile.experience) {
    if (
      q.includes(exp.company.toLowerCase()) ||
      q.includes(exp.role.toLowerCase())
    ) {
      return formatPeriodsInText(
        `During my time as ${exp.role} at ${exp.company} (${exp.period}), ${exp.description} I worked extensively with ${(exp.tools ?? []).join(', ')}.`
      );
    }
  }

  return getDefaultFallbackAnswer();
}
