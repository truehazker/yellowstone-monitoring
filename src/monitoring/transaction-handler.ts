import type { SubscribeUpdate, SubscribeUpdateTransactionInfo } from "@triton-one/yellowstone-grpc";
import { Logger } from "../common/logger";
import bs58 from 'bs58';
import { struct, u8, nu64} from '@solana/buffer-layout';
import type { CompiledInstruction, InnerInstruction } from "@triton-one/yellowstone-grpc/dist/types/grpc/solana-storage";


interface TransferLayout {
  instruction: number;
  amount: number;
}

interface TransferCheckedLayout {
  instruction: number;
  amount: number;
  decimals: number;
}

interface AccountsTransfer {
  source: string;
  mint?: string;
  destination: string;
  owner: string;
}

interface Transfer {
  type: 'transfer' | 'transferChecked';
  amount: number;
  decimals?: number;
  accounts: AccountsTransfer;
}

const TRANSFER_LAYOUT = struct<TransferLayout>([ u8('instruction'), nu64('amount') ]);
const TRANSFER_CHECKED_LAYOUT = struct<TransferCheckedLayout>([ u8('instruction'), nu64('amount'), u8('decimals') ]);

export class TransactionHandler {
  /**
   * Handles incoming transaction updates from the stream
   */
  static handleTransactionUpdate(data: SubscribeUpdate): void {
    if (data.transaction?.transaction) {
      TransactionHandler.handleTransaction(data.transaction.transaction);
    }
    
    if (data.pong) {
      Logger.pong(data.pong.id);
    }

    if (data.slot) {
      Logger.slot(Number(data.slot.slot));
    }
  }

  /**
   * Processes a single transaction
   */
  private static handleTransaction(data: SubscribeUpdateTransactionInfo): void {
    try {
      // console.log(JSON.stringify(data, null, 2));
      const signature = bs58.encode(data.signature);
      const instructions = data.transaction?.message?.instructions;
      const innerInstructions = data.meta?.innerInstructions;
      const accountKeys = data.transaction?.message?.accountKeys;

      console.log('\n===============================================\n');
      console.log(`📊 Transaction ${signature}:`);
      console.log(`├─ Total account keys: ${accountKeys?.length || 0}`);
      console.log(`├─ Outer instructions: ${instructions?.length || 0}`);
      console.log(`└─ Inner instruction batches: ${innerInstructions?.length || 0}`);

      const allTransfers: Transfer[] = [];

      const getAccount = (index: number) => accountKeys![index];

      const parseInstruction = (ix: CompiledInstruction | InnerInstruction, context: string) => {
        const account = getAccount(ix.programIdIndex);
        if (!account) {
          console.log(`│  └─ ❌ No program account found for index ${ix.programIdIndex}`);
          return;
        }
        
        const programId = bs58.encode(account);
        console.log(`│   ├─ 🔍 Program ID: ${programId}`);
        
        if (programId !== 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') {
          console.log(`│   └─ ⏭️ Skipping non-SPL Token program`);
          return;
        }

        const decoded = decodeSPLInstruction(ix.data);
        if (!decoded) {
          console.log(`│   └─ ❌ Instruction is not a transfer`);
          return;
        }

        console.log(`│   ├─ 📝 Instruction type: ${decoded.type}, amount: ${decoded.amount}`);

        console.log(`│   └─ 📋 Account indices: [${ix.accounts?.join(', ')}]`);

        const accounts = Array.from(ix.accounts ?? []).map(getAccount).filter((account): account is Uint8Array<ArrayBufferLike> => account !== undefined);

        console.log(`│   ├─ ✅ Valid accounts found: ${accounts.length}`);

        const accountsRecord: AccountsTransfer = {
          source: '',
          destination: '',
          owner: '',
        };

        if (decoded.type === 'transferChecked' && accounts.length === 4) {
          accountsRecord.source = bs58.encode(accounts[0]!);
          accountsRecord.mint = bs58.encode(accounts[1]!);
          accountsRecord.destination = bs58.encode(accounts[2]!);
          accountsRecord.owner = bs58.encode(accounts[3]!);
          console.log(`│     └─ ✅ transferChecked with 4 accounts - VALID`);
        } else if (decoded.type === 'transfer' && accounts.length === 3) {
          accountsRecord.source = bs58.encode(accounts[0]!);
          accountsRecord.destination = bs58.encode(accounts[1]!);
          accountsRecord.owner = bs58.encode(accounts[2]!);
          console.log(`│     └─ ✅ transfer with 3 accounts - VALID`);
        } else if (decoded.type === 'transferChecked' && accounts.length === 3) {
          // Handle transferChecked with 3 accounts (some implementations)
          accountsRecord.source = bs58.encode(accounts[0]!);
          accountsRecord.destination = bs58.encode(accounts[1]!);
          accountsRecord.owner = bs58.encode(accounts[2]!);
          console.log(`│     └─ ⚠️ transferChecked with 3 accounts - ACCEPTED (variant)`);
        } else if (decoded.type === 'transfer' && accounts.length === 4) {
          // Handle transfer with 4 accounts (some implementations)
          accountsRecord.source = bs58.encode(accounts[0]!);
          accountsRecord.mint = bs58.encode(accounts[1]!);
          accountsRecord.destination = bs58.encode(accounts[2]!);
          accountsRecord.owner = bs58.encode(accounts[3]!);
          console.log(`│     └─ ⚠️ transfer with 4 accounts - ACCEPTED (variant)`);
        } else {
          console.log(`│     ├─ ❌ BROKEN: ${decoded.type} with ${accounts.length} accounts (expected ${decoded.type === 'transferChecked' ? '3 or 4' : '3 or 4'})`);
          console.log(`│     ├─ 📍 Context: ${context}`);
          console.log(`│     ├─ 🔍 Account indices: [${ix.accounts?.join(', ')}]`);
          console.log(`│     └─ 🔍 Valid accounts: ${accounts.length}`);
          return;
        }

        allTransfers.push({
          ...decoded,
          accounts: accountsRecord,
        });
      }

      // Outer
      instructions?.forEach((ix, index) => {
        const isLast = index === (instructions?.length || 0) - 1;
        const prefix = isLast ? '└─' : '├─';
        console.log(`${prefix} 📦 Processing outer instruction ${index + 1}:`);
        parseInstruction(ix, `outer instruction ${index + 1}`);
      });

      // Inner
      innerInstructions?.forEach((batch, batchIndex) => {
        const isLastBatch = batchIndex === (innerInstructions?.length || 0) - 1;
        const batchPrefix = isLastBatch ? '└─' : '├─';
        console.log(`${batchPrefix} 📦 Processing inner instruction batch ${batchIndex + 1}:`);
        
        batch.instructions.forEach((ix, index) => {
          const isLastInstruction = index === batch.instructions.length - 1;
          const instructionPrefix = isLastInstruction ? '└─' : '├─';
          console.log(`│   ${instructionPrefix} 📦 Processing inner instruction ${index + 1}:`);
          parseInstruction(ix, `inner instruction ${batchIndex + 1}.${index + 1}`);
        });
      });

      if (allTransfers.length > 0) {
        console.log(`└─ 🎉 Found ${allTransfers.length} valid transfers:`);
        console.log(JSON.stringify(allTransfers, null, 2));
      } else {
        console.log(`└─ ⚠️ No valid transfers found in transaction`);
      }

    } catch (error) {
      Logger.error('Error processing transaction', error);
    }
  }
}

function decodeSPLInstruction(base58Data: Uint8Array<ArrayBufferLike>): Omit<Transfer, 'accounts'> | null {
  const opcode = base58Data[0];

  if (opcode === 3 && base58Data.length === 9) {
    const { amount } = TRANSFER_LAYOUT.decode(base58Data);
    return { type: 'transfer', amount };
  }

  if (opcode === 12 && base58Data.length === 10) {
    const { amount, decimals } = TRANSFER_CHECKED_LAYOUT.decode(base58Data);
    return { type: 'transferChecked', amount, decimals };
  }

  return null;
}