"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPoll = runPoll;
const mongodb_1 = require("mongodb");
const googleAdsClient_1 = require("./googleAdsClient");
const mongoSync_1 = require("./mongoSync");
const quickbaseSync_1 = require("./quickbaseSync");
async function runPoll(config) {
    const errors = [];
    let fetched = 0;
    let changedCount = 0;
    let qbUpserted = 0;
    const mongo = new mongodb_1.MongoClient(config.mongoUri);
    try {
        await mongo.connect();
        const customer = (0, googleAdsClient_1.createAdsCustomer)(config.googleAds);
        const leads = await (0, googleAdsClient_1.fetchRecentLeads)(customer);
        fetched = leads.length;
        const changed = await (0, mongoSync_1.syncLeadsToMongo)(mongo, config.mongoDbName, leads);
        changedCount = changed.length;
        try {
            qbUpserted = await (0, quickbaseSync_1.upsertToQuickBase)(changed, config.quickBase);
        }
        catch (err) {
            errors.push(`QuickBase upsert failed: ${err.message}`);
        }
    }
    catch (err) {
        errors.push(`Poll failed: ${err.message}`);
    }
    finally {
        await mongo.close();
    }
    return { fetched, changed: changedCount, qbUpserted, errors };
}
//# sourceMappingURL=index.js.map