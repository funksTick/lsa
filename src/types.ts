/**
 * Types for Local Services Ads lead polling.
 *
 * Field names use the camelCase shape returned by the `google-ads-api` npm
 * client (it converts the underlying snake_case GAQL field names). If you
 * switch to raw REST against the Ads API, the wire format is snake_case
 * instead — adjust the mapping layer, not these types.
 */

export type LeadType = 'PHONE_CALL' | 'MESSAGE' | 'BOOKING' | 'UNSPECIFIED' | 'UNKNOWN';

export type LeadStatus =
  | 'NEW'
  | 'ACTIVE'
  | 'BOOKED'
  | 'DECLINED'
  | 'CONSUMER_DECLINED'
  | 'EXPIRED'
  | 'DISABLED'
  | 'WIPED_OUT' // contactDetails will be null on this status
  | 'UNSPECIFIED'
  | 'UNKNOWN';

export type CreditState = 'PENDING' | 'CREDITED' | 'NOT_CREDITED' | 'UNSPECIFIED' | 'UNKNOWN';

export interface ContactDetails {
  phoneNumber?: string;
  email?: string;
  consumerName?: string;
}

export interface CreditDetails {
  creditState?: CreditState;
  creditStateLastUpdateDateTime?: string;
}


export type ConversationChannel =
  | 'EMAIL'
  | 'MESSAGE'
  | 'PHONE_CALL'
  | 'SMS'
  | 'BOOKING'
  | 'WHATSAPP'
  | 'ADS_API'
  | 'UNSPECIFIED'
  | 'UNKNOWN';
export type ParticipantType = 'ADVERTISER' | 'CONSUMER' | 'UNSPECIFIED' | 'UNKNOWN';

export interface LeadConversation {
  resourceName: string;
  leadResourceName: string; // local_services_lead_conversation.lead — join key back to the parent lead
  participantType: ParticipantType;
  conversationChannel: ConversationChannel;
  eventDateTime: string;
  callRecordingUrl?: string; // only present for phone_call_details
}

export interface LocalServicesLead {
  leadId: string;
  resourceName: string; // needed to join against local_services_lead_conversation.lead
  leadType: LeadType;
  categoryId: string;
  serviceId: string;
  contactDetails: ContactDetails | null;
  leadStatus: LeadStatus;
  creationDateTime: string;
  locale: string;
  leadCharged: boolean;
  leadFeedbackSubmitted: boolean;
  creditDetails: CreditDetails | null;
  conversations: LeadConversation[];
  existingId?: number;
}


export interface LsaLeadDocument {
  lead_id: string;
  lead_type: LeadType;
  category_id: string;
  service_id: string;
  contact_details: ContactDetails | null;
  lead_status: LeadStatus;
  creation_date_time: string;
  locale: string;
  lead_charged: boolean;
  credit_details: CreditDetails | null;
  last_synced_at: Date;
}

export interface QuickBaseRecordFields {
  [fieldId: string]: { value: unknown };
}

export interface PollResult {
  fetched: number;
  changed: number;
  qbUpserted: number;
  errors: string[];
}

export interface PollerConfig {
  googleAds: {
    clientId: string;
    clientSecret: string;
    developerToken: string;
    refreshToken: string;
    customerId: string;
    loginCustomerId?: string;
  };
  mongoUri: string;
  mongoDbName: string;
  quickBase: {
    realmHostname: string;
    userToken: string;
  };
}