import type { LocalServicesLead, PollerConfig, QuickBaseRecordFields } from './types';

/**
 * Maps a LocalServicesLead onto QuickBase field IDs and upserts via the
 * merge field (lead_id). Field IDs below are placeholders — swap for your
 * actual QB_LEADS_TABLE_ID schema.
 */
function toQuickBaseFields(lead: LocalServicesLead, mergeFieldId: number): QuickBaseRecordFields {
  return {
    [mergeFieldId]: { value: lead.leadId },
    '7': { value: lead.leadType },
    '8': { value: lead.contactDetails?.consumerName ?? '' },
    '9': { value: lead.contactDetails?.phoneNumber ?? '' },
    '10': { value: lead.contactDetails?.email ?? '' },
    '11': { value: lead.leadStatus },
    '12': { value: lead.creationDateTime },
    '13': { value: lead.leadCharged },
  };
}

export async function upsertToQuickBase(
  leads: LocalServicesLead[],
  qbConfig: PollerConfig['quickBase']
): Promise<number> {
  if (leads.length === 0) return 0;

  const records = leads.map((lead) => toQuickBaseFields(lead, qbConfig.mergeFieldId));

  const res = await fetch('https://api.quickbase.com/v1/records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'QB-Realm-Hostname': qbConfig.realmHostname,
      Authorization: `QB-USER-TOKEN ${qbConfig.userToken}`,
    },
    body: JSON.stringify({
      to: qbConfig.leadsTableId,
      data: records,
      mergeFieldId: qbConfig.mergeFieldId,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`QuickBase upsert failed: ${res.status} ${body}`);
  }

  return records.length;
}