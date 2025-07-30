import { io, Socket } from 'socket.io-client';
import { WebSocketMessage, MarketDataUpdate } from '../types';

class WebSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private subscribers: Map<string, Set<(data: MarketDataUpdate) => void>> = new Map();
  private isConnected = false;

  constructor() {
    this.connect();
  }

  private connect(): void {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5000';
    
    try {
      this.socket = io(wsUrl, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval,
      });

      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
      this.scheduleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      // Resubscribe to all symbols after reconnection
      const allSymbols = Array.from(this.subscribers.keys());
      if (allSymbols.length > 0) {
        this.subscribeToSymbols(allSymbols);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected:', reason);
      this.isConnected = false;
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, try to reconnect
        this.scheduleReconnect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.isConnected = false;
      this.scheduleReconnect();
    });

    this.socket.on('marketData', (message: WebSocketMessage) => {
      this.handleMarketData(message);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  private handleMarketData(message: WebSocketMessage): void {
    if (message.type === 'marketData' && message.data) {
      const marketData: MarketDataUpdate = message.data;
      const symbol = marketData.symbol;
      
      // Notify all subscribers for this symbol
      const symbolSubscribers = this.subscribers.get(symbol);
      if (symbolSubscribers) {
        symbolSubscribers.forEach(callback => {
          try {
            callback(marketData);
          } catch (error) {
            console.error('Error in market data callback:', error);
          }
        });
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      this.connect();
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  public subscribe(symbol: string, callback: (data: MarketDataUpdate) => void): () => void {
    // Add callback to subscribers
    if (!this.subscribers.has(symbol)) {
      this.subscribers.set(symbol, new Set());
    }
    this.subscribers.get(symbol)!.add(callback);

    // Subscribe to symbol if connected
    if (this.isConnected) {
      this.subscribeToSymbols([symbol]);
    }

    // Return unsubscribe function
    return () => {
      this.unsubscribe(symbol, callback);
    };
  }

  public unsubscribe(symbol: string, callback: (data: MarketDataUpdate) => void): void {
    const symbolSubscribers = this.subscribers.get(symbol);
    if (symbolSubscribers) {
      symbolSubscribers.delete(callback);
      
      // If no more subscribers for this symbol, unsubscribe from server
      if (symbolSubscribers.size === 0) {
        this.subscribers.delete(symbol);
        if (this.isConnected) {
          this.unsubscribeFromSymbols([symbol]);
        }
      }
    }
  }

  private subscribeToSymbols(symbols: string[]): void {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('message', JSON.stringify({
      type: 'subscribe',
      symbols: symbols,
      timestamp: new Date().toISOString()
    }));
  }

  private unsubscribeFromSymbols(symbols: string[]): void {
    if (!this.socket || !this.isConnected) return;

    this.socket.emit('message', JSON.stringify({
      type: 'unsubscribe',
      symbols: symbols,
      timestamp: new Date().toISOString()
    }));
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.subscribers.clear();
  }

  // Utility method to subscribe to multiple symbols at once
  public subscribeToMultiple(
    symbols: string[], 
    callback: (symbol: string, data: MarketDataUpdate) => void
  ): () => void {
    const unsubscribeFunctions = symbols.map(symbol => 
      this.subscribe(symbol, (data) => callback(symbol, data))
    );

    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }
}

// Create singleton instance
export const websocketService = new WebSocketService();
export default websocketService;