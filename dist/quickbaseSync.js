"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertToQuickBase = upsertToQuickBase;
const quickbase_1 = require("./apis/quickbase");
const formatPhone_1 = require("./utils/formatPhone");
async function queryExisting(lead, qbConfig) {
    const fields = quickbase_1.tables.LEADS.FIELDS;
    const phone = lead?.contactDetails?.phoneNumber ? (0, formatPhone_1.formatPhoneNumber)(lead.contactDetails?.phoneNumber) : null;
    if (!phone)
        return null;
    const data = {
        from: quickbase_1.tables.LEADS.id,
        select: [fields.MERGE],
        where: `{${fields.LEAD_PHONE}.EX.${phone}}`
    };
    const res = await (0, quickbase_1.qbApi)(qbConfig).post(quickbase_1.endpoints.RECORDS.QUERY, data);
    const existing = res.data?.data?.[0];
    if (!existing)
        return null;
    return existing[fields.MERGE].value;
}
const BASE_URL = `https://api.quickbase.com`;
function toQuickBaseFields(lead) {
    const fields = quickbase_1.tables.LEADS.FIELDS;
    return {
        ...(lead.existingId && { [fields.MERGE]: { value: lead.existingId } }),
        [fields.G_LEAD_ID]: { value: lead.leadId },
        [fields.LEAD_SOURCE]: { value: 'Google Local Service Ads' },
        [fields.CAMPAIGN]: { value: 'Google Local Service Ads' },
        [fields.G_LEAD_TYPE]: { value: lead.leadType },
        [fields.LEAD_NAME]: { value: lead.contactDetails?.consumerName ?? '' },
        [fields.LEAD_PHONE]: { value: lead.contactDetails?.phoneNumber ?? '' },
        [fields.LEAD_EMAIL]: { value: lead.contactDetails?.email ?? '' },
        [fields.LEAD_STATUS]: { value: lead.leadStatus },
        [fields.G_LEAD_CHARGED]: { value: lead.leadCharged },
    };
}
async function upsertToQuickBase(leads, qbConfig) {
    if (leads.length === 0)
        return 0;
    for (const lead of leads) {
        const existing = await queryExisting(lead, qbConfig);
        if (!existing)
            continue;
        lead.existingId = existing;
    }
    const records = leads.map((lead) => toQuickBaseFields(lead));
    const body = {
        to: quickbase_1.tables.LEADS.id,
        data: records
    };
    const res = await (0, quickbase_1.qbApi)(qbConfig).post(quickbase_1.endpoints.RECORDS.UPSERT, body);
    if (res.status !== 200) {
        throw new Error(`QuickBase upsert failed: ${res.statusText} ${res.data}`);
    }
    return records.length;
}
//# sourceMappingURL=quickbaseSync.js.map