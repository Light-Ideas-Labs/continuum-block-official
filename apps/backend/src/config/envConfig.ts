import { config } from "dotenv";
import { z } from "zod";


// Load correct .env file based on NODE_ENV
const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.development";
config({ path: envFile });

// Merge process.env with aliases (aliases win if defined)
const mergedEnv = { ...process.env };
const urlOptional = z.string().url().optional().or(z.literal("").transform(() => undefined));
const secret = (name: string) => z.string().min(1, `${name} is required`);

const envSchema = z.object({
// app settings
APP_PORT: z.string().min(2).max(100).default("5000"),
APP_HOST: z.string().min(2).max(100).default("localhost"),
APP_FRONTEND_URL: urlOptional,
APP_NAME: z.string().min(2).max(100).default("continuum-block-backend-api"),

// Node enviroment
NODE_ENV: z.enum(["production", "development", "test"]).default("production"),

// AWS Hosting - Use this later
AWS_REGION: z.string().default("eu-north-1"),
S3_BUCKET_NAME: z.string().default("continuumblockbucket"),  // YOUR-S3-BUCKET-NAME
CLOUDFRONT_DOMAIN: z.string().default("YOUR-CLOUDFRONT-DOMAIN"),

// Cloudinary
CLOUDINARY_NAME: z.string().default("dbfydlpwo"),
CLOUDINARY_API_KEY: secret("CLOUDINARY_API_KEY"),
CLOUDINARY_API_SECRET: secret("CLOUDINARY_API_SECRET"),

// STRIPE_SECRET_KEY=YOUR-STRIPE-SECRET-KEY

// Mongo database
PRO_MONGO_URI: secret("PRO_MONGO_URI"),
DEV_MONGO_URI: secret("DEV_MONGO_URI"),

// Redis
REDIS_URL: z.string().default("localhost"),

// Clerk Auth
CLERK_PUBLISHABLE_KEY: secret("CLERK_PUBLISHABLE_KEY"),
CLERK_SECRET_KEY: secret("CLERK_SECRET_KEY"),

TWITTER_API_URL: z.string().default("https://api.twitter.com/2"),
TWITTER_API_KEY: secret("TWITTER_API_KEY"),
TWITTER_API_SECRET: secret("TWITTER_API_SECRET"),
TWITTER_ACCESS_TOKEN: secret("TWITTER_ACCESS_TOKEN"),
TWITTER_ACCESS_TOKEN_SECRET: secret("TWITTER_ACCESS_TOKEN_SECRET"),

TWITTER_BEARER_TOKEN: secret("TWITTER_BEARER_TOKEN"),

// currency exchange rate
EXCHANGE_RATE_API_KEY: secret("EXCHANGE_RATE_API_KEY"),

// Mpesa
MPESA_CONSUMER_KEY: secret("MPESA_CONSUMER_KEY"),
MPESA_CONSUMER_SECRET: secret("MPESA_CONSUMER_SECRET"),
MPESA_ENVIRONMENT: z.string().default("sandbox"),
MPESA_BUSINESS_SHORT_CODE: z.string().default("174379"),
MPESA_TILL_NUMBER: z.string().default("600980"),
MPESA_INITIATOR_NAME: z.string().default("Test Initiator"),
MPESA_PASSWORD: secret("MPESA_PASSWORD"),
MPESA_PASS_KEY: secret("MPESA_PASS_KEY"),
MPESA_BASE_URL: z.string().default("https://sandbox.safaricom.co.ke"),
OAuth_TOKEN_URL: z.string().default("https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"),
LIPA_NA_MPESA_URL: z.string().default("https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest"),
MPESA_B2C_URL: z.string().default("https://sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest"),
MPESA_B2B_URL: z.string().default("https://sandbox.safaricom.co.ke/mpesa/b2b/v1/paymentrequest"),
MPESA_C2B_URL: z.string().default("https://sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl"),
CALL_BACK_URL: z.string().default("https://ventiqo-backend-api.onrender.com/"),

// Flutterwave
FLW_CLIENT_SECRET_KEY: secret("FLW_CLIENT_SECRET_KEY"),

 // Timezone for logging
 TIME_ZONE: z.string().default("Africa/Nairobi"),
});

const parsed = envSchema.safeParse(mergedEnv);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  console.error(parsed.error.format());
  process.exit(1);
}

// Safe log for Mongo (mask credentials)
try {
  const mongo = parsed.data.PRO_MONGO_URI;
  // extract host part if URI-like
  const host = mongo.startsWith("mongodb") ? mongo.split("@").pop()?.split("/")[0]?.split("?")[0] : "unknown";
  console.log("🔌 Connecting to MongoDB host:", host ?? "unknown");
} catch (error) {


}

export type Env = z.infer<typeof envSchema>;
export const env: Env & {isDevelopment: boolean; isProduction: boolean; isTest: boolean; } = {
  ...parsed.data,
  isDevelopment: parsed.data.NODE_ENV === "development",
  isProduction: parsed.data.NODE_ENV === "production",
  isTest: parsed.data.NODE_ENV === "test",
};

