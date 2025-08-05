// import { TransferParser } from './transfer-parser';
// import { Logger } from './common/logger';
// import type { BalanceChanges, TransferInstruction } from './common/types';
// import type { SubscribeUpdate, SubscribeUpdateTransactionInfo } from "@triton-one/yellowstone-grpc";
// import { drizzle } from 'drizzle-orm/libsql';
// import { balancesTable } from './db/schema';
// import type { TokenBalance, TransactionStatusMeta } from '@triton-one/yellowstone-grpc/dist/types/grpc/solana-storage';

// const db = drizzle(process.env.DB_FILE_NAME!);

// export class BalanceHandler {
//   static async parseBalances(preBalances: TokenBalance[], postBalances: TokenBalance[], sender: string, receiver: string): Promise<BalanceChanges> {
//     // Find sender's balances
//     const senderPreBalance = this.findBalanceForAddress(preBalances, sender);
//     const senderPostBalance = this.findBalanceForAddress(postBalances, sender);
    
//     // Find receiver's balances
//     const receiverPreBalance = this.findBalanceForAddress(preBalances, receiver);
//     const receiverPostBalance = this.findBalanceForAddress(postBalances, receiver);

//     return {
//       senderBalances: {
//         previousBalance: senderPreBalance?.uiTokenAmount?.amount ? BigInt(senderPreBalance.uiTokenAmount.amount) : BigInt(0),
//         newBalance: senderPostBalance?.uiTokenAmount?.amount ? BigInt(senderPostBalance.uiTokenAmount.amount) : BigInt(0)
//       },
//       receiverBalances: {
//         previousBalance: receiverPreBalance?.uiTokenAmount?.amount ? BigInt(receiverPreBalance.uiTokenAmount.amount) : BigInt(0),
//         newBalance: receiverPostBalance?.uiTokenAmount?.amount ? BigInt(receiverPostBalance.uiTokenAmount.amount) : BigInt(0)
//       }
//     };
//   }

//   /**
//    * Find all balances for a specific address
//    */
//   static findBalanceForAddress(
//     balances: TokenBalance[], 
//     address: string
//   ): TokenBalance | undefined {
//     return balances.find(balance => balance.owner === address);
//   }
// }

// export class TransactionHandler {
//   /**
//    * Handles incoming transaction updates from the stream
//    */
//   static handleTransactionUpdate(data: SubscribeUpdate): void {
//     if (data.transaction?.transaction) {
//       TransactionHandler.handleTransaction(data.transaction.transaction);
//     }
    
//     if (data.pong) {
//       Logger.pong(data.pong.id);
//     }

//     if (data.slot) {
//       Logger.slot(Number(data.slot.slot));
//     }
//   }

//   /**
//    * Processes a single transaction
//    */
//   private static handleTransaction(data: SubscribeUpdateTransactionInfo): void {
//     try {
//       const transactionData = TransferParser.extractTransactionData(data);
//       if (transactionData) {
//         for (const transfer of transactionData.transfers) {
//           TransactionHandler.processTransfer(transfer, data.meta, transactionData.hash);
//         }
//       }
//     } catch (error) {
//       Logger.error('Error processing transaction', error);
//     }
//   }

//   /**
//    * Processes a transfer (placeholder for future database integration)
//    */
//   private static async processTransfer(transfer: TransferInstruction & Partial<BalanceChanges>, meta: TransactionStatusMeta | undefined, hash: string): Promise<void> {
//     Logger.transfer({...transfer, hash});

//     // update balances in database
//     // await db.insert(balancesTable).values({
//     //   address: transfer.sender,
//     //   token: transfer.token,
//     //   amount: Number(transfer.amount), // ignore bigint for now
//     // });
//   }
// } 