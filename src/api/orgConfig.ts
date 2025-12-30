import client from './client';

export interface OrgConfig {
  modules: {
    sales: { enabled: boolean };
    purchase: { enabled: boolean };
    stock: { enabled: boolean };
    manufacturing: { enabled: boolean };
    accounting: { enabled: boolean };
  };
  pricing: {
    allowGrossWeight: boolean;
    allowNetWeight: boolean;
    allowStonePrice: boolean;
    allowMakingCharges: boolean;
    taxMode: 'include' | 'exclude';
  };
  itemFields: {
    showPurity: boolean;
    showHallmark: boolean;
    showStoneDetails: boolean;
    showCertificate: boolean;
  };
  documents: {
    invoiceTemplates: string[];
    barcodeTemplates: string[];
  };
  reports: {
    allowCustomReports: boolean;
  };
  workflows: {
    requireApprovalForPurchase: boolean;
    requireApprovalForManufacturing: boolean;
  };
  permissions: {
    userRoles: string[];
  };
}

export interface OrgConfigResponse {
  success: boolean;
  data: OrgConfig;
}

/**
 * Fetch organization configuration
 * @returns Organization configuration
 */
export async function fetchOrgConfig(): Promise<OrgConfig> {
  const response = await client.get<OrgConfigResponse>('/org/config');
  return response.data.data;
}

