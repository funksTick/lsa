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
  | 'ACTIVE'
  | 'BOOKED'
  | 'CONSUMER_DECLINED'
  | 'EXPIRED'
  | 'DISABLED'
  | 'DISPUTED'
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


export interface LocalServicesLead {
  leadId: string;
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