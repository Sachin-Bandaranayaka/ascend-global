import { z } from 'zod';

// Environment configuration schema
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url('Invalid Supabase URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, 'Supabase anon key is required'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'Supabase service role key is required').optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  // Meta Conversions API configuration
  META_ACCESS_TOKEN: z.string().min(1, 'Meta access token is required').optional(),
  META_DATASET_ID: z.string().min(1, 'Meta dataset ID is required').optional(),
  META_TEST_EVENT_CODE: z.string().optional(), // For testing
  META_CAPI_GATEWAY_URL: z.string().optional(), // New field for CAPI Gateway URL
});

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse({
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NODE_ENV: process.env.NODE_ENV,
      META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN,
      META_DATASET_ID: process.env.META_DATASET_ID,
      META_TEST_EVENT_CODE: process.env.META_TEST_EVENT_CODE,
      META_CAPI_GATEWAY_URL: process.env.META_CAPI_GATEWAY_URL,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.issues.map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Environment validation failed:\n${errorMessages.join('\n')}`);
    }
    throw error;
  }
}

// Export validated config
export const config = validateEnv();

// Feature flags
export const features = {
  enableSignup: false, // Disabled as per requirements
  enablePasswordReset: true,
  enableEmailVerification: true,
  enableDebugLogs: config.NODE_ENV === 'development',
  enableMetaConversions: !!(config.META_ACCESS_TOKEN && config.META_DATASET_ID),
} as const;

// App constants
export const constants = {
  APP_NAME: 'Ascend Global',
  DEFAULT_REDIRECT_URL: '/dashboard',
  LOGIN_URL: '/login',
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
} as const;

// Meta Conversions API constants
export const metaConfig = {
  API_VERSION: 'v23.0',
  ENDPOINT: config.META_CAPI_GATEWAY_URL || `https://graph.facebook.com/v23.0/${config.META_DATASET_ID}/events`,
  ACCESS_TOKEN: config.META_ACCESS_TOKEN,
  DATASET_ID: config.META_DATASET_ID,
  TEST_EVENT_CODE: config.META_TEST_EVENT_CODE,
  USE_CAPI_GATEWAY: !!config.META_CAPI_GATEWAY_URL,
} as const;