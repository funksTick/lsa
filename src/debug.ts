
import * as dotenv from 'dotenv';
dotenv.config();

import { runPoll } from './index';
import type { PollerConfig } from './types';

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) {
    throw new Error(`Missing required env var: ${key} (check your .env file)`);
  }
  return val;
}

const config: PollerConfig = {
  googleAds: {
    clientId: requireEnv('GOOGLE_ADS_CLIENT_ID'),
    clientSecret: requireEnv('GOOGLE_ADS_CLIENT_SECRET'),
    developerToken: requireEnv('GOOGLE_ADS_DEVELOPER_TOKEN'),
    refreshToken: requireEnv('GOOGLE_ADS_REFRESH_TOKEN'),
    customerId: requireEnv('GOOGLE_ADS_CUSTOMER_ID'),
    loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || undefined,
  },
  mongoUri: requireEnv('LSA_MONGODB_URI'),
  mongoDbName: process.env.LSA_MONGODB_DBNAME || 'onesolar',
  quickBase: {
    realmHostname: requireEnv('QB_REALM_HOSTNAME'),
    userToken: requireEnv('QB_USER_TOKEN'),
  },
};

console.log('Config loaded. Calling runPoll()...');
console.log('(set a breakpoint on the line above, or inside src/index.ts / googleAdsClient.ts / quickbaseSync.ts, then F5 / step in)');

runPoll(config)
  .then((result) => {
    console.log('--- runPoll result ---');
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.errors.length > 0 ? 1 : 0);
  })
  .catch((err) => {
    console.error('runPoll threw (should not happen — runPoll catches internally):');
    console.error(err);
    process.exit(1);
  });