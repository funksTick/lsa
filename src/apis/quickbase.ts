import axios from 'axios';
import { type PollerConfig } from '../types';

export const qbApi = (qbConfig: PollerConfig['quickBase']) => {
    return axios.create({
        baseURL: 'https://api.quickbase.com/v1',
        headers: {
        'Content-Type': 'application/json',
        'QB-Realm-Hostname': qbConfig.realmHostname,
        Authorization: `QB-USER-TOKEN ${qbConfig.userToken}`,
        },
    })
}

export const endpoints = {
    RECORDS: {
        UPSERT: '/records',
        QUERY: '/records/query'
    },
}

export const tables = {
    LEADS: {
        id: 'bt3nck43k',
        FIELDS: {
            MERGE: '3',
            LEAD_SOURCE: '106',
            CAMPAIGN: '117',
            G_LEAD_TYPE: '500',
            LEAD_NAME: '7',
            LEAD_PHONE: '114',
            LEAD_EMAIL: '15',
            LEAD_STATUS: '8',
            G_LEAD_CHARGED: '498',
            G_LEAD_ID: '499'
        }
    }
}