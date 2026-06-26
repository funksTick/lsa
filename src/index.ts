import { MongoClient } from 'mongodb';
import { createAdsCustomer, fetchRecentLeads, patchGoogleAdsErrorBug } from './googleAdsClient';
import { syncLeadsToMongo } from './mongoSync';
import { upsertToQuickBase } from './quickbaseSync';
import type { PollerConfig, PollResult } from './types';

/**
 * Single entry point for the Node-RED function node to call.
 *
 * Node-RED function nodes run in a vm sandbox and don't transpile TS, so this
 * compiled module is loaded with `require()` from the function node body —
 * see node-red-flow.json for the wiring. Keeping this as one async function
 * with a plain object in/out makes it trivial to call from that sandbox:
 *
 *   const { runPoll } = require('/home/pi/lsa-lead-poller/dist');
 *   const result = await runPoll(config);
 *   node.send({ payload: result });
 */
export async function runPoll(config: PollerConfig): Promise<PollResult> {
  const errors: string[] = [];
  let fetched = 0;
  let changedCount = 0;
  let qbUpserted = 0;

  const mongo = new MongoClient(config.mongoUri);

  try {
    await mongo.connect();

    const customer = createAdsCustomer(config.googleAds);
    patchGoogleAdsErrorBug(customer);
    const leads = await fetchRecentLeads(customer);
    fetched = leads.length;
    // console.log(`Leads: ${JSON.stringify(leads.slice(0,10))}`)
    // return {
    //   fetched: leads.length,
    //   changed: 0,
    //   qbUpserted: 0,
    //   errors: ['asd']
    //  }
    const changed = await syncLeadsToMongo(mongo, config.mongoDbName, leads);
    changedCount = changed.length;

    try {
      qbUpserted = await upsertToQuickBase(changed, config.quickBase);
    } catch (err) {
      console.error('--- upsertToQuickBase catch: raw error dump ---');
      console.error('err:', err);
      errors.push(`QuickBase upsert failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  } catch (err) {
    console.error('--- runPoll outer catch: raw error dump ---');
    console.error('typeof err:', typeof err);
    console.error('err instanceof Error:', err instanceof Error);
    console.error('err:', err);
    try {
      console.error('JSON.stringify(err):', JSON.stringify(err, Object.getOwnPropertyNames(err || {})));
    } catch {
      console.error('(could not JSON.stringify err)');
    }
    errors.push(`Poll failed: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    await mongo.close();
  }

  return { fetched, changed: changedCount, qbUpserted, errors };
}

export type { PollerConfig, PollResult } from './types';