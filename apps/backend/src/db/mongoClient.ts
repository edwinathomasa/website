import type { Profile, QARulesDocument } from '@portfolio/shared';
import { MongoClient, type Db } from 'mongodb';
import { getBackendEnv } from '../config/env.js';

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

export async function getProfileDocument(): Promise<Profile | null> {
  const db = await getDb();
  const { profileSlug } = getBackendEnv();
  const doc = await db
    .collection<Profile & { slug: string }>('profiles')
    .findOne({ slug: profileSlug }, { projection: { _id: 0 } });
  return doc ?? null;
}

export async function getQARulesDocument(): Promise<QARulesDocument | null> {
  const db = await getDb();
  const { profileSlug } = getBackendEnv();
  const doc = await db
    .collection<QARulesDocument & { profileSlug: string }>('qa_rules')
    .findOne({ profileSlug }, { projection: { _id: 0 } });
  return doc ?? null;
}

export async function closeDb(): Promise<void> {
  if (cachedClient) {
    await cachedClient.close();
    cachedClient = null;
    cachedConnectPromise = null;
  }
}
