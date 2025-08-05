import type { TokenBalance } from "@triton-one/yellowstone-grpc/dist/types/grpc/solana-storage";
import { drizzle } from 'drizzle-orm/libsql';
import 'dotenv/config';
import { balancesTable } from "../db/schema";

const db = drizzle(process.env.DB_FILE_NAME!);

export interface BalanceChanges {
  sender: string;
  token: string;
  amount: number;
}

export async function updateBalances(postBalances: TokenBalance[]): Promise<void> {
  // TODO: We can accelerate it by updating only the balances that have changed
  for (const balance of postBalances) {
    const token = balance.mint;
    if (token === 'So11111111111111111111111111111111111111112') { // Skip SOL balance updates
      continue;
    }

    const address = balance.owner;
    const amount = balance.uiTokenAmount?.uiAmount;

    if (!address || !token || !amount) {
      continue;
    }

    await db.insert(balancesTable)
      .values({
        address,
        token,
        amount,
      })
      .onConflictDoUpdate({ target: balancesTable.id, set: { amount } }); // update the balance if it already exists
  }
}
