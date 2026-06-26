import type { LocalServicesLead, PollerConfig, QuickBaseRecordFields } from './types';
import { qbApi, endpoints, tables } from './apis/quickbase';
import { formatPhoneNumber } from './utils/formatPhone';



async function queryExisting(lead: LocalServicesLead, qbConfig: PollerConfig['quickBase']){
    const fields = tables.LEADS.FIELDS
    const phone = lead?.contactDetails?.phoneNumber ? formatPhoneNumber(lead.contactDetails?.phoneNumber) : null;
    console.log(`Formatted query phone: ${phone}`)
    if(!phone) return null
    const data = {
        from: tables.LEADS.id,
        select: [fields.MERGE],
        where: `{${fields.LEAD_PHONE}.EX.${phone}}`
    }
    const res = await qbApi(qbConfig).post(endpoints.RECORDS.QUERY, data);
    const existing = res.data?.data?.[0];
    if(!existing) return null
    return existing[fields.MERGE].value

}

function toQuickBaseFields(lead: LocalServicesLead): QuickBaseRecordFields {
    const fields = tables.LEADS.FIELDS;
    const firstConversation = lead.conversations?.[0];
    const callTime = firstConversation?.eventDateTime
        ? firstConversation.eventDateTime.split('.')[0].replace(' ', 'T')
        : null;
  return {
    ...( lead.existingId && {[fields.MERGE]: {value: lead.existingId}}),
    [fields.G_LEAD_ID]: { value: lead.leadId ?? '' },
    [fields.LEAD_SOURCE]: { value: 'Google Local Service Ads'},
    [fields.CAMPAIGN]: { value: 'Google Local Service Ads'},
    [fields.G_LEAD_TYPE]: { value: lead.leadType ?? 'UNSPECIFIED' },
    ...( !lead.existingId && {
        [fields.LEAD_NAME]: { value: lead.contactDetails?.consumerName ?? '' },
        [fields.LEAD_PHONE]: { value: lead.contactDetails?.phoneNumber ?? '' },
        [fields.LEAD_EMAIL]: { value: lead.contactDetails?.email ?? '' },
        [fields.LEAD_STATUS]: { value: lead.leadStatus ?? 'UNSPECIFIED' },
    }),
    [fields.G_LEAD_CHARGED]: { value: lead.leadCharged ?? false },
    [fields.G_CALL_RECORDING]: {value: firstConversation?.callRecordingUrl ?? ''},
    ...( callTime && { [fields.G_CALL_TIME]: { value: callTime } }),
  }
}

export async function upsertToQuickBase(
  leads: LocalServicesLead[],
  qbConfig: PollerConfig['quickBase']
): Promise<number> {
  if (leads.length === 0) return 0;
    for ( const lead of leads){
        const existing = await queryExisting(lead, qbConfig);
        if(!existing) continue;
        lead.existingId = existing
    }
    const records = leads.map((lead) => toQuickBaseFields(lead));
    
  const body =  {
    to: tables.LEADS.id,
    data: records
  }
  const res = await qbApi(qbConfig).post(endpoints.RECORDS.UPSERT, body)

  if (res.status !== 200 && res.status !== 207) {
    throw new Error(`QuickBase upsert failed: ${res.statusText} ${JSON.stringify(res.data)}`);
  }
  if (res.status === 207) {
    console.warn('QuickBase upsert returned partial success (207):', JSON.stringify(res.data?.metadata ?? res.data));
  }

  return records.length;
}