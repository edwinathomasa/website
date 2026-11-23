import type {
  ExperienceDuration,
  Profile,
  ProfileTemplateVariables,
} from '../types/profile.js';

export function formatNaturalList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`;
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
): ExperienceDuration {
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

/**
 * Single source of truth for all `{{placeholder}}` template variables derived
 * dynamically from any `Profile` record (e.g., loaded from MongoDB).
 */
export function getProfileTemplateVariables(
  p: Profile,
  now: Date = new Date()
): ProfileTemplateVariables {
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
      sum +
      (exp.assignments && exp.assignments.length > 0
        ? exp.assignments.length
        : 1),
    0
  );

  const duration = calculateExperienceDuration(p.experience, now);
  const allSkills = [
    ...new Set(p.skillCategories.flatMap((c) => c.items)),
  ].join(', ');
  const educationSummary = (p.education ?? [])
    .map((edu) => `${edu.degree} from ${edu.institution} (${edu.period})`)
    .join(', and a ');

  return {
    name: p.name,
    title: p.title,
    location: p.location,
    email: p.email,
    linkedinUrl: p.linkedinUrl || p.social.linkedin || '',
    githubUrl: p.githubUrl || p.social.github || '',
    cvDownloadUrl: p.cvDownloadUrl || '',
    experienceDuration: duration.formatted,
    experienceYears: String(duration.years),
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
    projectTitles: formatNaturalList(p.projects.map((proj) => proj.title)),
    currentCompany: currentExp?.company ?? '',
    currentRole: currentExp?.role ?? '',
    currentPeriod: currentExp?.period ?? '',
    currentAssignmentRole: currentAssignment?.role ?? currentExp?.role ?? '',
    currentAssignmentClient:
      currentAssignment?.client ?? currentExp?.company ?? '',
    currentLocation:
      currentAssignment?.location ?? currentExp?.location ?? p.location,
    currentAssignmentPeriod:
      currentAssignment?.period ?? currentExp?.period ?? '',
    educationSummary,
    allSkills,
    availabilityStatus: p.availabilityStatus,
    workAuthorization: p.workAuthorization,
    workPreferences: p.workPreferences,
    spokenLanguages:
      typeof p.spokenLanguages === 'string'
        ? p.spokenLanguages
        : formatNaturalList(p.spokenLanguages),
    engineeringPhilosophy: p.engineeringPhilosophy,
  };
}
