import type { CompiledInstruction, InnerInstruction } from '@triton-one/yellowstone-grpc/dist/types/grpc/solana-storage';

// Core Transfer Types
export interface SPLTokenTransfer {
  from: string;
  to: string;
  token: string;
  amount: number;
}

export interface TransferInstruction {
  senderOffCurveAccount: string;
  token: string;
  receiver: string;
  sender: string;
  amount: bigint;
  decimals: number;
}

export interface TransactionData {
  hash: string;
  transfer: TransferInstruction;
}

// Error Types
export class TransferParseError extends Error {
  constructor(message: string, public readonly transactionHash?: string) {
    super(message);
    this.name = 'TransferParseError';
  }
}

export class InvalidAccountError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidAccountError';
  }
}

// Type Guards
export function isValidTransferInstruction(
  instruction: InnerInstruction, 
  accountKeys: Uint8Array[]
): instruction is InnerInstruction & { data: Uint8Array; accounts: number[] } {
  return (
    instruction.data?.[0] !== undefined &&
    [12, 3].includes(instruction.data[0]) &&
    instruction.accounts?.length === 4 &&
    accountKeys.length > 0
  );
}

export function isValidAccountKey(accountKey: unknown): accountKey is Uint8Array {
  return accountKey instanceof Uint8Array && accountKey.length > 0;
} 