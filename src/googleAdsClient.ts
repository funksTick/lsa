import { GoogleAdsApi, Customer } from 'google-ads-api';
import type { LocalServicesLead, PollerConfig } from './types';

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


export async function fetchRecentLeads(customer: Customer): Promise<LocalServicesLead[]> {
  const query = `
    SELECT
      local_services_lead.lead_id,
      local_services_lead.lead_type,
      local_services_lead.category_id,
      local_services_lead.service_id,
      local_services_lead.contact_details.phone_number,
      local_services_lead.contact_details.email,
      local_services_lead.contact_details.consumer_name,
      local_services_lead.lead_status,
      local_services_lead.creation_date_time,
      local_services_lead.locale,
      local_services_lead.lead_charged,
      local_services_lead.lead_feedback_submitted,
      local_services_lead.credit_details.credit_state,
      local_services_lead.credit_details.credit_state_last_update_date_time
    FROM local_services_lead
    ORDER BY local_services_lead.creation_date_time DESC
  `;

  const rows = await customer.query(query);
  return rows.map((row) => row.local_services_lead as LocalServicesLead);
}