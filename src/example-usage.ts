/**
 * Example usage of the refactored Yellowstone monitoring modules
 * This file demonstrates how to use the individual components
 */

import { CONFIG, SUBSCRIBE_REQUEST } from './config';
import { Logger } from './logger';
import { TransferParser } from './transfer-parser';
import { TransactionHandler } from './transaction-handler';
import { StreamManager } from './stream-manager';
import type { SubscribeUpdate } from "@triton-one/yellowstone-grpc";

// Example 1: Using the Logger
function exampleLoggerUsage() {
  Logger.info('This is an info message');
  Logger.success('Operation completed successfully');
  Logger.warn('This is a warning message');
  Logger.error('This is an error message', new Error('Example error'));
  
  Logger.transfer({
    from: 'sender123',
    to: 'receiver456',
    token: 'token789',
    amount: 1000
  });
}

// Example 2: Using the TransferParser (if you have transaction data)
function exampleTransferParserUsage() {
  // This would be used with actual transaction data
  // const transactionData = TransferParser.extractTransactionData(actualTransaction);
  Logger.info('TransferParser is ready to use with transaction data');
}

// Example 3: Using the TransactionHandler
function exampleTransactionHandlerUsage() {
  // This would be used with actual subscription updates
  // TransactionHandler.handleTransactionUpdate(actualUpdate);
  Logger.info('TransactionHandler is ready to process updates');
}

// Example 4: Using the StreamManager
async function exampleStreamManagerUsage() {
  const streamManager = new StreamManager(
    CONFIG.ENDPOINT,
    (data: SubscribeUpdate) => {
      TransactionHandler.handleTransactionUpdate(data);
    },
    (error: Error) => {
      Logger.error('Stream error', error);
    }
  );

  try {
    await streamManager.connect(SUBSCRIBE_REQUEST);
    Logger.success('Stream manager connected successfully');
    
    // In a real application, you would keep this running
    // For this example, we'll disconnect after a short delay
    setTimeout(() => {
      streamManager.disconnect();
      Logger.info('Stream manager disconnected');
    }, 5000);
  } catch (error) {
    Logger.error('Failed to connect stream manager', error);
  }
}

// Example 5: Configuration usage
function exampleConfigUsage() {
  Logger.info(`Endpoint: ${CONFIG.ENDPOINT}`);
  Logger.info(`Max reconnect attempts: ${CONFIG.MAX_RECONNECT_ATTEMPTS}`);
  Logger.info(`Keepalive interval: ${CONFIG.KEEPALIVE_INTERVAL_MS}ms`);
}

// Run examples
if (require.main === module) {
  Logger.info('Running example usage...');
  
  exampleLoggerUsage();
  exampleTransferParserUsage();
  exampleTransactionHandlerUsage();
  exampleConfigUsage();
  
  // Uncomment to test stream manager (requires network connection)
  // exampleStreamManagerUsage();
} 