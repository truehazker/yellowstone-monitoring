import { StreamManager } from './monitoring/stream-manager';
import { CONFIG, SUBSCRIBE_REQUEST } from './common/config';
import { TransactionHandler } from './monitoring/transaction-handler';

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
      console.log(`Connecting to ${CONFIG.ENDPOINT}...`);
      await this.streamManager.connect(SUBSCRIBE_REQUEST);
      this.setupGracefulShutdown();
    } catch (error) {
      console.error('Failed to start application', error);
      process.exit(1);
    }
  }

  /**
   * Handles stream errors
   */
  private handleError(error: Error): void {
    console.error('Stream error', error);
  }

  /**
   * Sets up graceful shutdown handlers
   */
  private setupGracefulShutdown(): void {
    const shutdownSignals = ['SIGINT', 'SIGTERM'] as const;
    
    for (const signal of shutdownSignals) {
      process.on(signal, () => {
        console.log(`Shutting down...`);
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
  console.error('Uncaught exception', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection', reason);
  process.exit(1);
});

// Start the application
main().catch((error) => {
  console.error("Fatal error in main function", error);
  process.exit(1);
});
