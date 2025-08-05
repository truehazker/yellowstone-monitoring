// import * as bs58 from 'bs58';
// import { processBuffers, readU64LE } from './common/utils';
// import type { 
//   TransferInstruction, 
//   TransactionData
// } from './common/types';
// import { 
//   TransferParseError, 
//   InvalidAccountError,
//   isValidTransferInstruction, 
//   isValidAccountKey 
// } from './common/types';
// import { AMOUNT_DATA_LENGTH, DECIMALS_INDEX } from './common/config';
// import type { CompiledInstruction, InnerInstruction } from '@triton-one/yellowstone-grpc/dist/types/grpc/solana-storage';
// import type { SubscribeUpdateTransactionInfo } from "@triton-one/yellowstone-grpc";


// export class TransferParser {
//   /**
//    * Extracts transaction data from a subscription update
//    */
//   static extractTransactionData(data: SubscribeUpdateTransactionInfo): TransactionData | null {
//     const accountKeys = data.transaction?.message?.accountKeys;
//     const hash = processBuffers(data.signature);
//     const instructions = data.transaction?.message?.instructions;
//     const instructionBatches = data.meta?.innerInstructions;

//     if (!accountKeys || !instructionBatches) {
//       return null;
//     }

//     // Merge instructions with inner instructions for processing
//     if (instructionBatches[0]) {
//       instructionBatches[0].instructions.push(...(instructions as InnerInstruction[]));
//     }

//     const transfers: TransferInstruction[] = [];
//     for (const instructionBatch of instructionBatches) {
//       const transfer = this.extractTransferFromInstructions(
//         instructionBatch.instructions, 
//         accountKeys, 
//         hash
//       );
//       if (transfer) {
//         transfers.push(transfer);
//       }
//     }

//     return { hash, transfers };
//   }

//   /**
//    * Extracts transfer instruction from compiled instructions
//    */
//   private static extractTransferFromInstructions(
//     instructions: CompiledInstruction[] | undefined, 
//     accountKeys: Uint8Array[],
//     hash?: string
//   ): TransferInstruction | null {
//     if (!instructions) {
//       return null;
//     }

//     for (const instruction of instructions) {
//       if (!isValidTransferInstruction(instruction, accountKeys)) {
//         continue;
//       }

//       try {
//         return this.parseTransferInstruction(instruction, accountKeys);
//       } catch (error) {
//         const message = error instanceof Error ? error.message : String(error);
//         if (!message.includes('Invalid account index in instruction')) {
//           console.warn(
//             `⚠️ Failed to parse transfer instruction in transaction: ${hash}`, 
//             message
//           );
//         }
//         continue;
//       }
//     }

//     return null;
//   }

//   /**
//    * Parses a single transfer instruction
//    */
//   private static parseTransferInstruction(
//     instruction: CompiledInstruction, 
//     accountKeys: Uint8Array[]
//   ): TransferInstruction {
//     const discriminator = instruction.data?.[0];
//     const accountsRaw = instruction.accounts;
    
//     // Validate account indices
//     if (!this.validateAccountIndices(Array.from(accountsRaw), accountKeys.length)) {
//       throw new TransferParseError('Invalid account index in instruction');
//     }

//     // Extract account keys with validation
//     const accountKeysMap = this.extractAccountKeys(Array.from(accountsRaw), accountKeys);

//     // Parse amount and decimals
//     const amountData = instruction.data.slice(1, 1 + AMOUNT_DATA_LENGTH);
//     const amount = readU64LE(amountData);
//     const decimals = this.parseDecimals(instruction.data);

//     return {
//       senderOffCurveAccount: accountKeysMap.senderOffCurveAccount,
//       token: accountKeysMap.token,
//       receiver: accountKeysMap.receiver,
//       sender: accountKeysMap.sender,
//       amount,
//       decimals
//     };
//   }

//   /**
//    * Validates account indices are within bounds
//    */
//   private static validateAccountIndices(accounts: number[], accountKeysLength: number): boolean {
//     return accounts.every(index => index >= 0 && index < accountKeysLength);
//   }

//   /**
//    * Extracts and validates account keys from instruction
//    */
//   private static extractAccountKeys(accountsRaw: number[], accountKeys: Uint8Array[]) {
//     const senderOffCurveAccountKey = accountKeys[accountsRaw[0]!];
//     const tokenKey = accountKeys[accountsRaw[1]!];
//     const receiverKey = accountKeys[accountsRaw[2]!];
//     const senderKey = accountKeys[accountsRaw[3]!];

//     if (!senderOffCurveAccountKey || !tokenKey || !receiverKey || !senderKey) {
//       throw new TransferParseError('Missing account keys in instruction');
//     }

//     return {
//       senderOffCurveAccount: this.encodeAccount(senderOffCurveAccountKey),
//       token: this.encodeAccount(tokenKey),
//       receiver: this.encodeAccount(receiverKey),
//       sender: this.encodeAccount(senderKey),
//     };
//   }

//   /**
//    * Parses decimals from instruction data
//    */
//   private static parseDecimals(data: Uint8Array): number {
//     return data[DECIMALS_INDEX] ? Number(data[DECIMALS_INDEX]) : -1;
//   }

//   /**
//    * Encodes account key to base58 string
//    */
//   private static encodeAccount(accountKey: Uint8Array): string {
//     if (!isValidAccountKey(accountKey)) {
//       throw new InvalidAccountError('Invalid account key: expected Uint8Array');
//     }
//     return bs58.default.encode(accountKey);
//   }
// } 