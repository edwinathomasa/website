import type {
  ClientAssignment,
  Education,
  Experience,
  Profile,
  Project,
  QARule,
  QARulesDocument,
  SkillCategory,
} from '@portfolio/shared';
import { MongoClient, type Db } from 'mongodb';
import { getBackendEnv } from '../config/env.js';
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
} from './models.js';

let cachedClient: MongoClient | null = null;
let cachedConnectPromise: Promise<MongoClient> | null = null;

async function getMongoClient(): Promise<MongoClient> {
  const { mongoDbUri } = getBackendEnv();
  if (!mongoDbUri) {
    throw new Error('MONGODB_URI environment variable is not configured.');
  }

  if (cachedClient) {
    return cachedClient;
  }

  if (!cachedConnectPromise) {
    const client = new MongoClient(mongoDbUri, {
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    cachedConnectPromise = client
      .connect()
      .then((connected) => {
        cachedClient = connected;
        return connected;
      })
      .catch((err) => {
        cachedConnectPromise = null;
        throw err;
      });
  }

  return cachedConnectPromise;
}

export async function getDb(): Promise<Db> {
  const client = await getMongoClient();
  const { mongoDbName } = getBackendEnv();
  return client.db(mongoDbName);
}

export async function pingDb(): Promise<boolean> {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Queries the 7 profile domain collections in parallel and assembles the
 * unified `@portfolio/shared` `Profile` DTO expected by web and mobile clients.
 */
export async function getProfileDocument(): Promise<Profile | null> {
  const db = await getDb();
  const { profileSlug } = getBackendEnv();

  const [
    coreDoc,
    categoryDocs,
    skillDocs,
    experienceDocs,
    assignmentDocs,
    educationDocs,
    projectDocs,
  ] = await Promise.all([
    db
      .collection<ProfileCoreDoc>(COLLECTIONS.PROFILES)
      .findOne({ slug: profileSlug }, { projection: { _id: 0 } }),
    db
      .collection<SkillCategoryDoc>(COLLECTIONS.SKILL_CATEGORIES)
      .find({ profileSlug }, { projection: { _id: 0 } })
      .sort({ sortOrder: 1 })
      .toArray(),
    db
      .collection<SkillDoc>(COLLECTIONS.SKILLS)
      .find({ profileSlug }, { projection: { _id: 0 } })
      .sort({ sortOrder: 1 })
      .toArray(),
    db
      .collection<ExperienceDoc>(COLLECTIONS.EXPERIENCES)
      .find({ profileSlug }, { projection: { _id: 0 } })
      .sort({ sortOrder: 1 })
      .toArray(),
    db
      .collection<AssignmentDoc>(COLLECTIONS.ASSIGNMENTS)
      .find({ profileSlug }, { projection: { _id: 0 } })
      .sort({ sortOrder: 1 })
      .toArray(),
    db
      .collection<EducationDoc>(COLLECTIONS.EDUCATION)
      .find({ profileSlug }, { projection: { _id: 0 } })
      .sort({ sortOrder: 1 })
      .toArray(),
    db
      .collection<ProjectDoc>(COLLECTIONS.PROJECTS)
      .find({ profileSlug }, { projection: { _id: 0 } })
      .sort({ sortOrder: 1 })
      .toArray(),
  ]);

  if (!coreDoc || !coreDoc.identity || !coreDoc.contact || !coreDoc.professionalStatus) {
    return null;
  }

  // Group skills by categorySlug
  const skillsByCategory = new Map<string, string[]>();
  for (const skill of skillDocs) {
    const existing = skillsByCategory.get(skill.categorySlug);
    if (existing) {
      existing.push(skill.name);
    } else {
      skillsByCategory.set(skill.categorySlug, [skill.name]);
    }
  }

  const skillCategories: SkillCategory[] = categoryDocs
    .map((cat) => ({
      category: cat.name,
      items: skillsByCategory.get(cat.slug) ?? [],
    }))
    .filter((group) => group.items.length > 0);

  // Group optional client assignments by experienceSlug
  const assignmentsByExperience = new Map<string, ClientAssignment[]>();
  for (const doc of assignmentDocs) {
    const assignment: ClientAssignment = {
      client: doc.client,
      role: doc.role,
      ...(doc.sector ? { sector: doc.sector } : {}),
      ...(doc.location ? { location: doc.location } : {}),
      period: doc.period,
      description: doc.description,
      ...(doc.highlights?.length ? { highlights: doc.highlights } : {}),
      ...(doc.tools?.length ? { tools: doc.tools } : {}),
    };
    const existing = assignmentsByExperience.get(doc.experienceSlug);
    if (existing) {
      existing.push(assignment);
    } else {
      assignmentsByExperience.set(doc.experienceSlug, [assignment]);
    }
  }

  const experience: Experience[] = experienceDocs.map((doc) => {
    const assignments = assignmentsByExperience.get(doc.slug);
    return {
      role: doc.role,
      company: doc.company,
      ...(doc.client ? { client: doc.client } : {}),
      ...(doc.sector ? { sector: doc.sector } : {}),
      ...(doc.location ? { location: doc.location } : {}),
      period: doc.period,
      description: doc.description,
      ...(doc.highlights?.length ? { highlights: doc.highlights } : {}),
      ...(doc.tools?.length ? { tools: doc.tools } : {}),
      ...(assignments?.length ? { assignments } : {}),
    };
  });

  const education: Education[] = educationDocs.map((doc) => ({
    degree: doc.degree,
    institution: doc.institution,
    period: doc.period,
  }));

  const projects: Project[] = projectDocs.map((doc) => ({
    title: doc.title,
    description: doc.description,
    link: doc.link,
  }));

  return {
    slug: coreDoc.slug,
    name: coreDoc.identity.name,
    title: coreDoc.identity.title,
    description: coreDoc.identity.description,
    engineeringPhilosophy: coreDoc.identity.engineeringPhilosophy,
    spokenLanguages: coreDoc.identity.spokenLanguages,
    email: coreDoc.contact.email,
    location: coreDoc.contact.location,
    linkedinUrl: coreDoc.contact.linkedinUrl,
    githubUrl: coreDoc.contact.githubUrl,
    cvDownloadUrl: coreDoc.contact.cvDownloadUrl ?? '',
    availabilityStatus: coreDoc.professionalStatus.availabilityStatus,
    workAuthorization: coreDoc.professionalStatus.workAuthorization,
    workPreferences: coreDoc.professionalStatus.workPreferences,
    social: {
      github: coreDoc.contact.githubUrl || undefined,
      linkedin: coreDoc.contact.linkedinUrl || undefined,
    },
    skillCategories,
    experience,
    education,
    projects,
  };
}

/**
 * Loads individual Q&A rule documents from `qa_rules` and groups them by tier
 * into the `QARulesDocument` structure consumed by the Q&A matcher & prompt builder.
 */
export async function getQARulesDocument(): Promise<QARulesDocument | null> {
  const db = await getDb();
  const { profileSlug } = getBackendEnv();

  const docs = await db
    .collection<QARuleDoc>(COLLECTIONS.QA_RULES)
    .find({ profileSlug }, { projection: { _id: 0 } })
    .sort({ sortOrder: 1 })
    .toArray();

  if (docs.length === 0) {
    return null;
  }

  const customResponses: QARule[] = [];
  const keywordFallbacks: QARule[] = [];
  let defaultFallback = '';

  for (const doc of docs) {
    if (doc.tier === 'custom') {
      customResponses.push({
        question: doc.question,
        triggers: doc.triggers,
        answer: doc.answer,
      });
    } else if (doc.tier === 'keyword') {
      keywordFallbacks.push({
        question: doc.question,
        triggers: doc.triggers,
        answer: doc.answer,
      });
    } else if (doc.tier === 'default') {
      defaultFallback = doc.answer;
    }
  }

  return {
    profileSlug,
    customResponses,
    keywordFallbacks,
    defaultFallback,
  };
}

export async function closeDb(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedConnectPromise = null;
  }
}
