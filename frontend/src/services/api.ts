import axios, { AxiosInstance, AxiosResponse } from 'axios';
import {
  AuthResponse,
  User,
  Stock,
  ChartData,
  CompanyInfo,
  Watchlist,
  Portfolio,
  Transaction,
  TradeOrder,
  MarketMover,
  SearchResult,
  MarketMoverType,
  ChartPeriod
} from '../types';

class ApiService {
  private api: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post('/auth/login', { email, password });
    return response.data;
  }

  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async verifyToken(): Promise<{ valid: boolean; user?: User }> {
    const response = await this.api.get('/auth/verify');
    return response.data;
  }

  // Stock endpoints
  async getPopularStocks(): Promise<{ stocks: Stock[]; timestamp: string }> {
    const response = await this.api.get('/stocks/popular');
    return response.data;
  }

  async searchStocks(query: string): Promise<{ results: SearchResult[]; source: string }> {
    const response = await this.api.get(`/stocks/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async getStockQuote(symbol: string): Promise<Stock> {
    const response = await this.api.get(`/stocks/quote/${symbol}`);
    return response.data;
  }

  async getHistoricalData(
    symbol: string,
    period: ChartPeriod = '1M',
    interval: 'daily' | 'intraday' = 'daily'
  ): Promise<ChartData> {
    const response = await this.api.get(
      `/stocks/history/${symbol}?period=${period}&interval=${interval}`
    );
    return response.data;
  }

  async getCompanyInfo(symbol: string): Promise<CompanyInfo> {
    const response = await this.api.get(`/stocks/company/${symbol}`);
    return response.data;
  }

  async getMarketMovers(type: MarketMoverType = 'gainers'): Promise<{ type: string; movers: MarketMover[] }> {
    const response = await this.api.get(`/stocks/movers?type=${type}`);
    return response.data;
  }

  // User endpoints
  async getUserProfile(): Promise<{ user: User }> {
    const response = await this.api.get('/users/profile');
    return response.data;
  }

  async updateUserProfile(updates: Partial<User>): Promise<{ message: string; user: User }> {
    const response = await this.api.put('/users/profile', updates);
    return response.data;
  }

  // Watchlist endpoints
  async getWatchlists(): Promise<{ watchlists: Watchlist[] }> {
    const response = await this.api.get('/users/watchlists');
    return response.data;
  }

  async createWatchlist(name: string): Promise<{ message: string; watchlist: Watchlist }> {
    const response = await this.api.post('/users/watchlists', { name });
    return response.data;
  }

  async addToWatchlist(watchlistId: string, symbol: string): Promise<{ message: string; stock: Stock }> {
    const response = await this.api.post(`/users/watchlists/${watchlistId}/stocks`, { symbol });
    return response.data;
  }

  async removeFromWatchlist(watchlistId: string, symbol: string): Promise<{ message: string }> {
    const response = await this.api.delete(`/users/watchlists/${watchlistId}/stocks/${symbol}`);
    return response.data;
  }

  // Portfolio endpoints
  async getPortfolio(): Promise<{ portfolio: Portfolio }> {
    const response = await this.api.get('/users/portfolio');
    return response.data;
  }

  async executeTrade(order: TradeOrder): Promise<{
    message: string;
    transaction: Transaction;
    newCashBalance: number;
  }> {
    const response = await this.api.post('/users/portfolio/trade', order);
    return response.data;
  }

  async getTransactions(page: number = 1, limit: number = 20): Promise<{
    transactions: Transaction[];
    totalTransactions: number;
    currentPage: number;
    totalPages: number;
  }> {
    const response = await this.api.get(`/users/portfolio/transactions?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string; uptime: number }> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // Utility methods
  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  removeAuthToken(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isAuthenticated(): boolean {
    return !!this.getAuthToken();
  }
}

export const apiService = new ApiService();
export default apiService;