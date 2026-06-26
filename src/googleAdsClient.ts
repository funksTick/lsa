import { GoogleAdsApi, Customer, enums } from 'google-ads-api';
import type { LocalServicesLead, PollerConfig, LeadConversation } from './types';

export function createAdsCustomer(config: PollerConfig['googleAds']): Customer {
  const client = new GoogleAdsApi({
    client_id: config.clientId,
    client_secret: config.clientSecret,
    developer_token: config.developerToken,
  });

  return client.Customer({
    customer_id: config.customerId,
    login_customer_id: config.loginCustomerId,
    refresh_token: config.refreshToken,
  });
}

/**
 * Pulls Local Services leads. No webhook exists for LSA (only the separate
 * Lead Form Extension product has one), so polling is the only option.
 *
 * GAQL date filtering on creation_date_time hasn't been verified against
 * this resource for all API versions — we pull the full set ordered by
 * creation date and let Mongo's upsert/dedupe do the real filtering. If you
 * confirm a working WHERE clause for your API version, add it here to cut
 * row volume instead of relying solely on the dedupe pass downstream.
 */
export async function fetchRecentLeads(customer: Customer): Promise<LocalServicesLead[]> {
  const leadQuery = `
    SELECT
      local_services_lead.id,
      local_services_lead.lead_type,
      local_services_lead.category_id,
      local_services_lead.service_id,
      local_services_lead.contact_details,
      local_services_lead.lead_status,
      local_services_lead.creation_date_time,
      local_services_lead.locale,
      local_services_lead.lead_charged,
      local_services_lead.lead_feedback_submitted,
      local_services_lead.credit_details.credit_state,
      local_services_lead.credit_details.credit_state_last_update_date_time,
      local_services_lead.resource_name
    FROM local_services_lead
    ORDER BY local_services_lead.creation_date_time DESC
  `;

  const conversationQuery = `
    SELECT
      local_services_lead_conversation.phone_call_details.call_recording_url,
      local_services_lead_conversation.resource_name,
      local_services_lead_conversation.participant_type,
      local_services_lead_conversation.lead,
      local_services_lead_conversation.id,
      local_services_lead_conversation.event_date_time,
      local_services_lead_conversation.conversation_channel
    FROM local_services_lead_conversation
    ORDER BY local_services_lead_conversation.event_date_time
  `
  const [leadRows, conversationRows] = await Promise.all([
      customer.query(leadQuery),
      customer.query(conversationQuery),
    ]);

   const conversationsByLead = new Map<string, LeadConversation[]>();
  for (const row of conversationRows) {
    const c = row.local_services_lead_conversation as any;
    const leadResourceName: string = c.lead;
    const conversation: LeadConversation = {
      resourceName: c.resource_name,
      leadResourceName,
      participantType:
        typeof c.participant_type === 'number'
          ? ((enums.LocalServicesParticipantType[c.participant_type] as LeadConversation['participantType']) ??
              'UNSPECIFIED')
          : c.participant_type ?? 'UNSPECIFIED',
      conversationChannel:
        typeof c.conversation_channel === 'number'
          ? ((enums.LocalServicesLeadConversationType[
              c.conversation_channel
            ] as LeadConversation['conversationChannel']) ?? 'UNSPECIFIED')
          : c.conversation_channel ?? 'UNSPECIFIED',
      eventDateTime: c.event_date_time,
      callRecordingUrl: c.phone_call_details?.call_recording_url,
    };
 
    const existing = conversationsByLead.get(leadResourceName);
    if (existing) {
      existing.push(conversation);
    } else {
      conversationsByLead.set(leadResourceName, [conversation]);
    }
  }
   return leadRows.map((row) => {
    const raw = row.local_services_lead as any;
 
    const leadType =
      typeof raw.lead_type === 'number'
        ? (enums.LocalServicesLeadType[raw.lead_type] as LocalServicesLead['leadType'])
        : raw.lead_type ?? 'UNSPECIFIED';
 
    const leadStatus =
      typeof raw.lead_status === 'number'
        ? (enums.LocalServicesLeadStatus[raw.lead_status] as LocalServicesLead['leadStatus'])
        : raw.lead_status ?? 'UNSPECIFIED';
 
    return {
      leadId: String(raw.id),
      resourceName: raw.resource_name,
      leadType,
      categoryId: raw.category_id,
      serviceId: raw.service_id,
      contactDetails: raw.contact_details
        ? {
            phoneNumber: raw.contact_details.phone_number,
            email: raw.contact_details.email,
            consumerName: raw.contact_details.consumer_name,
          }
        : null,
      leadStatus,
      creationDateTime: raw.creation_date_time,
      locale: raw.locale,
      leadCharged: raw.lead_charged ?? false,
      leadFeedbackSubmitted: raw.lead_feedback_submitted ?? false,
      creditDetails: raw.credit_details
        ? {
            creditState: raw.credit_details.credit_state,
            creditStateLastUpdateDateTime: raw.credit_details.credit_state_last_update_date_time,
          }
        : null,
      conversations: conversationsByLead.get(raw.resource_name) ?? [],
    };
  });
}

export function patchGoogleAdsErrorBug(customer: Customer): void {
  const proto = Object.getPrototypeOf(customer);
  const original = proto.getGoogleAdsError;
  if (!original || (original as any).__lsaPatched) return;
 
  proto.getGoogleAdsError = function patchedGetGoogleAdsError(error: any) {
    try {
      return original.call(this, error);
    } catch (formatterBug) {
      console.error(
        '--- google-ads-api error formatter crashed; dumping raw error ---'
      );
      console.error('typeof error:', typeof error);
      console.error('error instanceof Error:', error instanceof Error);
      console.error('Object.keys(error):', error ? Object.keys(error) : 'N/A');
      console.error('Object.getOwnPropertyNames(error):', error ? Object.getOwnPropertyNames(error) : 'N/A');
      try {
        console.error('JSON.stringify(error):', JSON.stringify(error, Object.getOwnPropertyNames(error || {})));
      } catch (jsonErr) {
        console.error('(could not JSON.stringify the error)');
      }
      console.error('String(error):', String(error));
      console.error('error?.metadata:', error?.metadata);
      return error; 
    }
  };
  (proto.getGoogleAdsError as any).__lsaPatched = true;
}