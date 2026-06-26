"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncLeadsToMongo = syncLeadsToMongo;
/**
 * Upserts leads into the lsa_leads collection, keyed on lead_id.
 * Returns only the leads that are new or whose status/charge/credit state
 * changed since the last sync — that subset is what gets pushed to QuickBase,
 * so reps aren't re-notified about leads with no real change.
 */
async function syncLeadsToMongo(mongo, dbName, leads) {
    const col = mongo.db(dbName).collection('lsa_leads');
    const changed = [];
    for (const lead of leads) {
        const existing = await col.findOne({ lead_id: lead.leadId });
        const isChanged = !existing ||
            existing.lead_status !== lead.leadStatus ||
            existing.lead_charged !== lead.leadCharged ||
            existing.credit_details?.creditState !== lead.creditDetails?.creditState;
        await col.updateOne({ lead_id: lead.leadId }, {
            $set: {
                lead_id: lead.leadId,
                lead_type: lead.leadType,
                category_id: lead.categoryId,
                service_id: lead.serviceId,
                contact_details: lead.contactDetails ?? null, // null if WIPED_OUT
                lead_status: lead.leadStatus,
                creation_date_time: lead.creationDateTime,
                locale: lead.locale,
                lead_charged: lead.leadCharged,
                credit_details: lead.creditDetails ?? null,
                last_synced_at: new Date(),
            },
        }, { upsert: true });
        if (isChanged)
            changed.push(lead);
    }
    return changed;
}
//# sourceMappingURL=mongoSync.js.map