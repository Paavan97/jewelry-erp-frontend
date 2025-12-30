import client from './client';

/**
 * Generic response structure for config endpoints
 */
export interface ConfigResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

/**
 * General Configuration
 */
export interface GeneralConfig {
  [key: string]: any;
}

/**
 * Tax Configuration
 */
export interface TaxConfig {
  [key: string]: any;
}

/**
 * Invoice Configuration
 */
export interface InvoiceConfig {
  [key: string]: any;
}

/**
 * Numbering Configuration
 */
export interface NumberingConfig {
  [key: string]: any;
}

/**
 * Finance Configuration
 */
export interface FinanceConfig {
  [key: string]: any;
}

/**
 * Feature Configuration
 */
export interface FeatureConfig {
  [key: string]: any;
}

/**
 * Get General Configuration
 * @returns General configuration data
 */
export async function getGeneralConfig(): Promise<GeneralConfig> {
  const response = await client.get<ConfigResponse<GeneralConfig>>('/config/general');
  return response.data.data;
}

/**
 * Update General Configuration
 * @param data - General configuration data to update
 * @returns Updated general configuration
 */
export async function updateGeneralConfig(data: Partial<GeneralConfig>): Promise<GeneralConfig> {
  const response = await client.put<ConfigResponse<GeneralConfig>>('/config/general', data);
  return response.data.data;
}

/**
 * Get Tax Configuration
 * @returns Tax configuration data
 */
export async function getTaxConfig(): Promise<TaxConfig> {
  const response = await client.get<ConfigResponse<TaxConfig>>('/config/tax');
  return response.data.data;
}

/**
 * Update Tax Configuration
 * @param data - Tax configuration data to update
 * @returns Updated tax configuration
 */
export async function updateTaxConfig(data: Partial<TaxConfig>): Promise<TaxConfig> {
  const response = await client.put<ConfigResponse<TaxConfig>>('/config/tax', data);
  return response.data.data;
}

/**
 * Get Invoice Configuration
 * @returns Invoice configuration data
 */
export async function getInvoiceConfig(): Promise<InvoiceConfig> {
  const response = await client.get<ConfigResponse<InvoiceConfig>>('/config/invoice');
  return response.data.data;
}

/**
 * Update Invoice Configuration
 * @param data - Invoice configuration data to update
 * @returns Updated invoice configuration
 */
export async function updateInvoiceConfig(data: Partial<InvoiceConfig>): Promise<InvoiceConfig> {
  const response = await client.put<ConfigResponse<InvoiceConfig>>('/config/invoice', data);
  return response.data.data;
}

/**
 * Get Numbering Configuration
 * @returns Numbering configuration data
 */
export async function getNumberingConfig(): Promise<NumberingConfig> {
  const response = await client.get<ConfigResponse<NumberingConfig>>('/config/numbering');
  return response.data.data;
}

/**
 * Update Numbering Configuration
 * @param data - Numbering configuration data to update
 * @returns Updated numbering configuration
 */
export async function updateNumberingConfig(data: Partial<NumberingConfig>): Promise<NumberingConfig> {
  const response = await client.put<ConfigResponse<NumberingConfig>>('/config/numbering', data);
  return response.data.data;
}

/**
 * Get Finance Configuration
 * @returns Finance configuration data
 */
export async function getFinanceConfig(): Promise<FinanceConfig> {
  const response = await client.get<ConfigResponse<FinanceConfig>>('/config/finance');
  return response.data.data;
}

/**
 * Update Finance Configuration
 * @param data - Finance configuration data to update
 * @returns Updated finance configuration
 */
export async function updateFinanceConfig(data: Partial<FinanceConfig>): Promise<FinanceConfig> {
  const response = await client.put<ConfigResponse<FinanceConfig>>('/config/finance', data);
  return response.data.data;
}

/**
 * Get Feature Configuration
 * @returns Feature configuration data
 */
export async function getFeatureConfig(): Promise<FeatureConfig> {
  const response = await client.get<ConfigResponse<FeatureConfig>>('/config/feature');
  return response.data.data;
}

/**
 * Update Feature Configuration
 * @param data - Feature configuration data to update
 * @returns Updated feature configuration
 */
export async function updateFeatureConfig(data: Partial<FeatureConfig>): Promise<FeatureConfig> {
  const response = await client.put<ConfigResponse<FeatureConfig>>('/config/feature', data);
  return response.data.data;
}

