import { CommitmentLevel, SubscribeRequest } from "@triton-one/yellowstone-grpc";
import { config } from "dotenv";

config();

// Application Configuration
const ENDPOINT = process.env.ENDPOINT!;

if (!ENDPOINT) {
  throw new Error("ENDPOINT is not set");
}

export const CONFIG = {
  ENDPOINT,
  KEEPALIVE_INTERVAL_MS: 30000,
  MAX_RECONNECT_ATTEMPTS: 10,
  BASE_RECONNECT_DELAY_MS: 1000,
  GRPC_MAX_MESSAGE_LENGTH: 64 * 1024 * 1024, // 64MB
} as const;

// Subscription Request Configuration
export const SUBSCRIBE_REQUEST: SubscribeRequest = {
  accounts: {},
  accountsDataSlice: [],
  commitment: CommitmentLevel.CONFIRMED,
  slots: {},
  transactions: {
    allTxs: {
      vote: false,
      failed: false,
      accountInclude: [],
      accountExclude: [],
      accountRequired: [],
    }
  },
  transactionsStatus: {},
  blocks: {},
  blocksMeta: {},
  entry: {}
} as const;
