import { hash } from "node:crypto";
import type { BalanceChanges, TransferInstruction } from "./types";

export class Logger {
  private static readonly EMOJIS = {
    HASH: '🔑',
    START: '🚀',
    CONNECT: '📡',
    MONITOR: '🔍',
    TRANSFER: '📤',
    RECEIVER: '📥',
    TOKEN: '🪙',
    AMOUNT: '💰',
    ERROR: '❌',
    WARNING: '⚠️',
    SUCCESS: '✅',
    PONG: '💓',
    SLOT: '🎯',
    SHUTDOWN: '🛑',
    FOUND: '🔍',
  } as const;

  static info(message: string, ...args: unknown[]): void {
    console.log(message, ...args);
  }

  static error(message: string, error?: unknown): void {
    console.error(`${this.EMOJIS.ERROR} ${message}`);
    if (error) {
      if (error instanceof Error) {
        console.error('- Stack trace:', error.stack);
      } else {
        console.error('- Error details:', error);
      }
    }
  }

  static warn(message: string, ...args: unknown[]): void {
    console.warn(`${this.EMOJIS.WARNING} ${message}`, ...args);
  }

  static success(message: string): void {
    console.log(`${this.EMOJIS.SUCCESS} ${message}`);
  }

  static transfer(transfer: TransferInstruction): void {
    const { sender, receiver, token, amount } = transfer;
    console.log(`========================================`);
    transfer.hash && console.log(`${this.EMOJIS.HASH} Hash: ${transfer.hash}`);
    console.log(`${this.EMOJIS.TRANSFER} From: ${sender}`);
    console.log(`${this.EMOJIS.RECEIVER} To: ${receiver}`);
    console.log(`${this.EMOJIS.TOKEN}  Token: ${token}`);
    console.log(`${this.EMOJIS.AMOUNT} Amount: ${amount.toString()} ${token}`);
  }

  static transferDetails(transactionData: {
    hash: string;
    transfer: {
      sender: string;
      receiver: string;
      token: string;
      senderOffCurveAccount: string;
      amount: bigint;
      decimals: number;
    };
  }): void {
    const { hash, transfer } = transactionData;
    
    console.log(`${this.EMOJIS.FOUND} Found transfer instruction`);
    console.log('- Hash:', hash);
    console.log('- Sender:', transfer.sender);
    console.log('- Receiver:', transfer.receiver);
    console.log('- Token:', transfer.token);
    console.log('- Sender Off Curve Account:', transfer.senderOffCurveAccount);
    console.log('- Amount:', transfer.amount.toString());
    console.log('- Decimals:', transfer.decimals);
  }

  static startup(endpoint: string): void {
    console.log(`${this.EMOJIS.START} Starting SPL token transfer monitoring...`);
    console.log(`${this.EMOJIS.CONNECT} Endpoint: ${endpoint}`);
    console.log(`${this.EMOJIS.MONITOR} Monitoring all transactions for SPL token transfers`);
  }

  static pong(id: number): void {
    console.log(`${this.EMOJIS.PONG} Keepalive pong received (id: ${id})`);
  }

  static slot(slot: number): void {
    console.log(`${this.EMOJIS.SLOT} Slot update: ${slot}`);
  }

  static shutdown(signal: string): void {
    console.log(`\n${this.EMOJIS.SHUTDOWN} Received ${signal}, shutting down...`);
  }
} 