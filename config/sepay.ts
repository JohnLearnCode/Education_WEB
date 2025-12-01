import { SePayPgClient } from 'sepay-pg-node';

/**
 * SePay Payment Gateway Configuration
 * 
 * Environment Variables Required:
 * - SEPAY_ENV: 'sandbox' | 'production'
 * - SEPAY_MERCHANT_ID: Your merchant ID from SePay
 * - SEPAY_SECRET_KEY: Your secret key from SePay
 */

const sepayConfig = {
  env: (process.env.SEPAY_ENV || 'sandbox') as 'sandbox' | 'production',
  merchant_id: process.env.SEPAY_MERCHANT_ID || '',
  secret_key: process.env.SEPAY_SECRET_KEY || ''
};

// Validate required config
if (!sepayConfig.merchant_id || !sepayConfig.secret_key) {
  console.warn('⚠️ SePay configuration is incomplete. Please set SEPAY_MERCHANT_ID and SEPAY_SECRET_KEY environment variables.');
}

// Create SePay client instance
export const sepayClient = new SePayPgClient(sepayConfig);

// Export config for reference
export { sepayConfig };
