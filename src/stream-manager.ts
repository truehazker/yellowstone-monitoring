import type { ClientDuplexStream } from "@grpc/grpc-js";
import Client, { SubscribeRequest, SubscribeUpdate } from "@triton-one/yellowstone-grpc";
import { CONFIG } from './config';
import { Logger } from './logger';

export class StreamManager {
  private client: Client;
  private stream!: ClientDuplexStream<SubscribeRequest, SubscribeUpdate>;
  private isConnected = false;
  private reconnectAttempts = 0;
  private keepaliveInterval?: NodeJS.Timeout;

  constructor(
    private endpoint: string,
    private onData: (data: SubscribeUpdate) => void,
    private onError?: (error: Error) => void
  ) {
    this.client = new Client(endpoint, undefined, {
      "grpc.max_receive_message_length": CONFIG.GRPC_MAX_MESSAGE_LENGTH
    });
  }

  async connect(subscribeRequest: SubscribeRequest): Promise<void> {
    try {
      Logger.info(`Connecting to ${this.endpoint}...`);
      this.stream = await this.client.subscribe();
      this.isConnected = true;
      this.reconnectAttempts = 0;

      this.setupEventHandlers(subscribeRequest);
      await this.writeRequest(subscribeRequest);
      this.startKeepalive();
      
      Logger.success("Connected and subscribed successfully");
    } catch (error) {
      Logger.error("Connection failed", error);
      await this.reconnect(subscribeRequest);
    }
  }

  private setupEventHandlers(subscribeRequest: SubscribeRequest): void {
    this.stream.on("data", this.handleData.bind(this));
    this.stream.on("error", this.handleStreamError.bind(this));
    this.stream.on("end", () => this.handleDisconnect(subscribeRequest));
    this.stream.on("close", () => this.handleDisconnect(subscribeRequest));
  }

  private async writeRequest(request: SubscribeRequest): Promise<void> {
    return new Promise((resolve, reject) => {
      this.stream.write(request, (err: Error) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private handleData(data: SubscribeUpdate): void {
    try {
      this.onData(data);
    } catch (error) {
      Logger.error("Error processing data", error);
    }
  }

  private handleStreamError(error: unknown): void {
    Logger.error("Stream error", error);
    this.isConnected = false;
    if (this.onError && error instanceof Error) {
      this.onError(error);
    }
  }

  private async handleDisconnect(subscribeRequest: SubscribeRequest): Promise<void> {
    if (this.isConnected) {
      Logger.info("Stream disconnected, attempting to reconnect...");
      this.isConnected = false;
      await this.reconnect(subscribeRequest);
    }
  }

  private async reconnect(subscribeRequest: SubscribeRequest): Promise<void> {
    if (this.reconnectAttempts >= CONFIG.MAX_RECONNECT_ATTEMPTS) {
      Logger.error("Max reconnection attempts reached. Giving up.");
      return;
    }

    this.reconnectAttempts++;
    const delay = this.calculateReconnectDelay();
    
    Logger.info(`Reconnect attempt ${this.reconnectAttempts}/${CONFIG.MAX_RECONNECT_ATTEMPTS} in ${delay}ms...`);
    
    setTimeout(() => {
      this.connect(subscribeRequest).catch(console.error);
    }, delay);
  }

  private calculateReconnectDelay(): number {
    return CONFIG.BASE_RECONNECT_DELAY_MS * Math.pow(2, Math.min(this.reconnectAttempts - 1, 5));
  }

  private startKeepalive(): void {
    this.keepaliveInterval = setInterval(() => {
      if (this.isConnected) {
        const pingRequest: SubscribeRequest = {
          ping: { id: Date.now() },
          accounts: {},
          accountsDataSlice: [],
          transactions: {},
          slots: {},
          blocks: {},
          blocksMeta: {},
          entry: {},
          transactionsStatus: {}
        };
        
        this.writeRequest(pingRequest).catch(console.error);
      }
    }, CONFIG.KEEPALIVE_INTERVAL_MS);
  }

  disconnect(): void {
    if (this.keepaliveInterval) {
      clearInterval(this.keepaliveInterval);
    }
    if (this.stream) {
      this.stream.end();
    }
    this.isConnected = false;
  }
}
