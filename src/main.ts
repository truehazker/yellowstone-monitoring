import { StreamManager } from './stream-manager';
import { TransactionHandler } from './transaction-handler';
import { CONFIG, SUBSCRIBE_REQUEST } from './config';
import { Logger } from './logger';

/**
 * Application entry point for SPL token transfer monitoring
 */
class Application {
  private streamManager: StreamManager;

  constructor() {
    this.streamManager = new StreamManager(
      CONFIG.ENDPOINT,
      TransactionHandler.handleTransactionUpdate,
      this.handleError
    );
  }

  /**
   * Starts the application
   */
  async start(): Promise<void> {
    try {
      Logger.startup(CONFIG.ENDPOINT);
      await this.streamManager.connect(SUBSCRIBE_REQUEST);
      this.setupGracefulShutdown();
    } catch (error) {
      Logger.error('Failed to start application', error);
      process.exit(1);
    }
  }

  /**
   * Handles stream errors
   */
  private handleError(error: Error): void {
    Logger.error('Stream error', error);
  }

  /**
   * Sets up graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const shutdownSignals = ['SIGINT', 'SIGTERM'] as const;
    
    for (const signal of shutdownSignals) {
      process.on(signal, () => {
        Logger.shutdown(signal);
        this.shutdown();
      });
    }
  }

  /**
   * Performs graceful shutdown
   */
  private shutdown(): void {
    this.streamManager.disconnect();
    process.exit(0);
  }
}

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  const app = new Application();
  await app.start();
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  Logger.error('Uncaught exception', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  Logger.error('Unhandled promise rejection', reason);
  process.exit(1);
});

// Start the application
main().catch((error) => {
  Logger.error("Fatal error in main function", error);
  process.exit(1);
});
