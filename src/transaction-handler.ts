import { TransferParser } from './transfer-parser';
import { Logger } from './logger';
import type { SPLTokenTransfer } from './types';
import type { SubscribeUpdate, SubscribeUpdateTransactionInfo } from "@triton-one/yellowstone-grpc";

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
      const transactionData = TransferParser.extractTransactionData(data);
      if (transactionData) {
        TransactionHandler.processTransfer(transactionData);
      }
    } catch (error) {
      Logger.error('Error processing transaction', error);
    }
  }

  /**
   * Processes a transfer (placeholder for future database integration)
   */
  private static async processTransfer(transactionData: {
    hash: string;
    transfer: {
      sender: string;
      receiver: string;
      token: string;
      amount: bigint;
      decimals: number;
    };
  }): Promise<void> {
    const { transfer } = transactionData;
    
    const splTransfer: SPLTokenTransfer = {
      from: transfer.sender,
      to: transfer.receiver,
      token: transfer.token,
      amount: Number(transfer.amount),
    };

    Logger.transfer(splTransfer);

    // TODO: Save transfer to database
    // await TransactionHandler.saveTransferToDatabase(splTransfer);
  }
} 