import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import type { QARulesDocument } from '@portfolio/shared';
import { getBackendEnv } from '../src/config/env.js';
import {
  COLLECTIONS,
  type AssignmentDoc,
  type EducationDoc,
  type ExperienceDoc,
  type ProfileCoreDoc,
  type ProjectDoc,
  type QARuleDoc,
  type SkillCategoryDoc,
  type SkillDoc,
} from '../src/db/models.js';
import { closeDb, getDb } from '../src/db/mongoClient.js';
import { profileSeed } from '../src/seed/profileSeed.js';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function seed(): Promise<void> {
  const { profileSlug } = getBackendEnv();
  const db = await getDb();
  const now = new Date();

  const qaRulesRaw = await readFile(
    new URL('../src/seed/qaRules.json', import.meta.url),
    'utf-8'
  );
  const qaRules = JSON.parse(qaRulesRaw) as QARulesDocument;

  // 1. profiles (core identity, contact, professionalStatus)
  const profileCoreDoc: ProfileCoreDoc = {
    slug: profileSlug,
    identity: {
      name: profileSeed.name,
      title: profileSeed.title,
      description: profileSeed.description,
      engineeringPhilosophy: profileSeed.engineeringPhilosophy,
      spokenLanguages: profileSeed.spokenLanguages,
    },
    contact: {
      email: profileSeed.email,
      location: profileSeed.location,
      linkedinUrl: profileSeed.linkedinUrl,
      githubUrl: profileSeed.githubUrl,
      cvDownloadUrl: profileSeed.cvDownloadUrl ?? '',
    },
    professionalStatus: {
      availabilityStatus: profileSeed.availabilityStatus,
      workAuthorization: profileSeed.workAuthorization,
      workPreferences: profileSeed.workPreferences,
    },
    updatedAt: now,
  };

  await db
    .collection<ProfileCoreDoc>(COLLECTIONS.PROFILES)
    .replaceOne({ slug: profileSlug }, profileCoreDoc, { upsert: true });

  // 2 & 3. skill_categories + skills
  const categoryDocs: SkillCategoryDoc[] = [];
  const skillDocs: SkillDoc[] = [];

  profileSeed.skillCategories.forEach((group, catIdx) => {
    const categorySlug = slugify(group.category);
    categoryDocs.push({
      slug: categorySlug,
      profileSlug,
      name: group.category,
      sortOrder: catIdx,
      updatedAt: now,
    });

    group.items.forEach((skillName, skillIdx) => {
      skillDocs.push({
        profileSlug,
        categorySlug,
        name: skillName,
        sortOrder: skillIdx,
        updatedAt: now,
      });
    });
  });

  await db
    .collection<SkillCategoryDoc>(COLLECTIONS.SKILL_CATEGORIES)
    .deleteMany({ profileSlug });
  if (categoryDocs.length > 0) {
    await db
      .collection<SkillCategoryDoc>(COLLECTIONS.SKILL_CATEGORIES)
      .insertMany(categoryDocs);
  }

  await db
    .collection<SkillDoc>(COLLECTIONS.SKILLS)
    .deleteMany({ profileSlug });
  if (skillDocs.length > 0) {
    await db.collection<SkillDoc>(COLLECTIONS.SKILLS).insertMany(skillDocs);
  }

  // 4 & 5. experiences + optional client assignments
  const experienceDocs: ExperienceDoc[] = [];
  const assignmentDocs: AssignmentDoc[] = [];

  profileSeed.experience.forEach((exp, expIdx) => {
    const experienceSlug = slugify(`${exp.company}-${exp.role}`);
    experienceDocs.push({
      slug: experienceSlug,
      profileSlug,
      company: exp.company,
      role: exp.role,
      ...(exp.client ? { client: exp.client } : {}),
      ...(exp.sector ? { sector: exp.sector } : {}),
      ...(exp.location ? { location: exp.location } : {}),
      period: exp.period,
      description: exp.description,
      ...(exp.highlights?.length ? { highlights: exp.highlights } : {}),
      ...(exp.tools?.length ? { tools: exp.tools } : {}),
      sortOrder: expIdx,
      updatedAt: now,
    });

    (exp.assignments ?? []).forEach((assignment, assignIdx) => {
      assignmentDocs.push({
        profileSlug,
        experienceSlug,
        client: assignment.client,
        role: assignment.role,
        ...(assignment.sector ? { sector: assignment.sector } : {}),
        ...(assignment.location ? { location: assignment.location } : {}),
        period: assignment.period,
        description: assignment.description,
        ...(assignment.highlights?.length
          ? { highlights: assignment.highlights }
          : {}),
        ...(assignment.tools?.length ? { tools: assignment.tools } : {}),
        sortOrder: assignIdx,
        updatedAt: now,
      });
    });
  });

  await db
    .collection<ExperienceDoc>(COLLECTIONS.EXPERIENCES)
    .deleteMany({ profileSlug });
  if (experienceDocs.length > 0) {
    await db
      .collection<ExperienceDoc>(COLLECTIONS.EXPERIENCES)
      .insertMany(experienceDocs);
  }

  await db
    .collection<AssignmentDoc>(COLLECTIONS.ASSIGNMENTS)
    .deleteMany({ profileSlug });
  if (assignmentDocs.length > 0) {
    await db
      .collection<AssignmentDoc>(COLLECTIONS.ASSIGNMENTS)
      .insertMany(assignmentDocs);
  }

  // 6. education
  const educationDocs: EducationDoc[] = (profileSeed.education ?? []).map(
    (edu, idx) => ({
      profileSlug,
      degree: edu.degree,
      institution: edu.institution,
      period: edu.period,
      sortOrder: idx,
      updatedAt: now,
    })
  );

  await db
    .collection<EducationDoc>(COLLECTIONS.EDUCATION)
    .deleteMany({ profileSlug });
  if (educationDocs.length > 0) {
    await db
      .collection<EducationDoc>(COLLECTIONS.EDUCATION)
      .insertMany(educationDocs);
  }

  // 7. projects
  const projectDocs: ProjectDoc[] = profileSeed.projects.map((proj, idx) => ({
    profileSlug,
    title: proj.title,
    description: proj.description,
    link: proj.link,
    sortOrder: idx,
    updatedAt: now,
  }));

  await db
    .collection<ProjectDoc>(COLLECTIONS.PROJECTS)
    .deleteMany({ profileSlug });
  if (projectDocs.length > 0) {
    await db
      .collection<ProjectDoc>(COLLECTIONS.PROJECTS)
      .insertMany(projectDocs);
  }

  // 8. qa_rules (1 document per rule)
  const qaRuleDocs: QARuleDoc[] = [
    ...qaRules.customResponses.map((rule, idx) => ({
      profileSlug,
      ruleKey: `custom-${idx + 1}-${slugify(rule.question).slice(0, 40)}`,
      tier: 'custom' as const,
      question: rule.question,
      triggers: rule.triggers,
      answer: rule.answer,
      sortOrder: idx,
      updatedAt: now,
    })),
    ...qaRules.keywordFallbacks.map((rule, idx) => ({
      profileSlug,
      ruleKey: `keyword-${idx + 1}-${slugify(rule.question).slice(0, 40)}`,
      tier: 'keyword' as const,
      question: rule.question,
      triggers: rule.triggers,
      answer: rule.answer,
      sortOrder: idx,
      updatedAt: now,
    })),
    {
      profileSlug,
      ruleKey: 'default-fallback',
      tier: 'default' as const,
      question: 'Default fallback response',
      triggers: [],
      answer: qaRules.defaultFallback,
      sortOrder: 0,
      updatedAt: now,
    },
  ];

  await db
    .collection<QARuleDoc>(COLLECTIONS.QA_RULES)
    .deleteMany({ profileSlug });
  if (qaRuleDocs.length > 0) {
    await db.collection<QARuleDoc>(COLLECTIONS.QA_RULES).insertMany(qaRuleDocs);
  }

  // Ensure fast query indexes across all 8 collections
  await Promise.all([
    db.collection(COLLECTIONS.PROFILES).createIndex({ slug: 1 }, { unique: true }),
    db
      .collection(COLLECTIONS.SKILL_CATEGORIES)
      .createIndex({ profileSlug: 1, slug: 1 }, { unique: true }),
    db
      .collection(COLLECTIONS.SKILLS)
      .createIndex({ profileSlug: 1, categorySlug: 1, sortOrder: 1 }),
    db
      .collection(COLLECTIONS.EXPERIENCES)
      .createIndex({ profileSlug: 1, slug: 1 }, { unique: true }),
    db
      .collection(COLLECTIONS.ASSIGNMENTS)
      .createIndex({ profileSlug: 1, experienceSlug: 1, sortOrder: 1 }),
    db
      .collection(COLLECTIONS.EDUCATION)
      .createIndex({ profileSlug: 1, sortOrder: 1 }),
    db
      .collection(COLLECTIONS.PROJECTS)
      .createIndex({ profileSlug: 1, sortOrder: 1 }),
    db
      .collection(COLLECTIONS.QA_RULES)
      .createIndex({ profileSlug: 1, ruleKey: 1 }, { unique: true }),
  ]);

  console.log(
    `Seeded 8 MongoDB collections for '${profileSlug}':\n` +
      `  - ${COLLECTIONS.PROFILES}: 1\n` +
      `  - ${COLLECTIONS.SKILL_CATEGORIES}: ${categoryDocs.length}\n` +
      `  - ${COLLECTIONS.SKILLS}: ${skillDocs.length}\n` +
      `  - ${COLLECTIONS.EXPERIENCES}: ${experienceDocs.length}\n` +
      `  - ${COLLECTIONS.ASSIGNMENTS}: ${assignmentDocs.length}\n` +
      `  - ${COLLECTIONS.EDUCATION}: ${educationDocs.length}\n` +
      `  - ${COLLECTIONS.PROJECTS}: ${projectDocs.length}\n` +
      `  - ${COLLECTIONS.QA_RULES}: ${qaRuleDocs.length}`
  );
}

seed()
  .catch((err) => {
    console.error('MongoDB seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await closeDb();
  });
