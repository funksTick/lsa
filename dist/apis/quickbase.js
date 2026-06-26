"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tables = exports.endpoints = exports.qbApi = void 0;
const axios_1 = __importDefault(require("axios"));
const qbApi = (qbConfig) => {
    return axios_1.default.create({
        baseURL: 'https://api.quickbase.com/v1',
        headers: {
            'Content-Type': 'application/json',
            'QB-Realm-Hostname': qbConfig.realmHostname,
            Authorization: `QB-USER-TOKEN ${qbConfig.userToken}`,
        },
    });
};
exports.qbApi = qbApi;
exports.endpoints = {
    RECORDS: {
        UPSERT: '/records',
        QUERY: '/records/query'
    },
};
exports.tables = {
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
};
//# sourceMappingURL=quickbase.js.map