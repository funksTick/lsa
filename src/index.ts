import { MongoClient } from 'mongodb';
import { createAdsCustomer, fetchRecentLeads } from './googleAdsClient';
import { syncLeadsToMongo } from './mongoSync';
import { upsertToQuickBase } from './quickbaseSync';
import type { PollerConfig, PollResult } from './types';


export async function runPoll(config: PollerConfig): Promise<PollResult> {
  const errors: string[] = [];
  let fetched = 0;
  let changedCount = 0;
  let qbUpserted = 0;

  const mongo = new MongoClient(config.mongoUri);

  try {
    await mongo.connect();

    const customer = createAdsCustomer(config.googleAds);
    const leads = await fetchRecentLeads(customer);
    fetched = leads.length;

    const changed = await syncLeadsToMongo(mongo, config.mongoDbName, leads);
    changedCount = changed.length;

    try {
      qbUpserted = await upsertToQuickBase(changed, config.quickBase);
    } catch (err) {
      errors.push(`QuickBase upsert failed: ${(err as Error).message}`);
    }
  } catch (err) {
    errors.push(`Poll failed: ${(err as Error).message}`);
  } finally {
    await mongo.close();
  }

  return { fetched, changed: changedCount, qbUpserted, errors };
}

export type { PollerConfig, PollResult } from './types';