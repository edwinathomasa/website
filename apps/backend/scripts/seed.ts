import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import type { QARulesDocument } from '@portfolio/shared';
import { getBackendEnv } from '../src/config/env.js';
import { closeDb, getDb } from '../src/db/mongoClient.js';
import { profileSeed } from '../src/seed/profileSeed.js';

async function seed(): Promise<void> {
  const { profileSlug } = getBackendEnv();
  const db = await getDb();

  const qaRulesRaw = await readFile(
    new URL('../src/seed/qaRules.json', import.meta.url),
    'utf-8'
  );
  const qaRules = JSON.parse(qaRulesRaw) as QARulesDocument;

  const now = new Date();

  await db.collection('profiles').updateOne(
    { slug: profileSlug },
    {
      $set: {
        ...profileSeed,
        slug: profileSlug,
        updatedAt: now,
      },
    },
    { upsert: true }
  );

  await db.collection('qa_rules').updateOne(
    { profileSlug },
    {
      $set: {
        ...qaRules,
        profileSlug,
        updatedAt: now,
      },
    },
    { upsert: true }
  );

  console.log(
    `Seeded MongoDB collections 'profiles' and 'qa_rules' for slug '${profileSlug}'.`
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
