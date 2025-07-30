export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: string;
  lastLogin: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  defaultChart: 'candlestick' | 'line' | 'bar';
  notifications: {
    email: boolean;
    push: boolean;
  };
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Stock {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  dayHigh: number;
  dayLow: number;
  previousClose: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
  dividend?: number;
  dividendYield?: number;
  beta?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
  exchange?: string;
  sector?: string;
  industry?: string;
  lastUpdated: string;
}

export interface StockQuote {
  symbol: string;
  name?: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume?: number;
  dayHigh?: number;
  dayLow?: number;
  previousClose?: number;
  lastUpdated?: string;
}

export interface HistoricalDataPoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface IntradayDataPoint {
  timestamp: string;
  price: number;
  volume?: number;
  change?: number;
  changePercent?: number;
}

export interface ChartData {
  symbol: string;
  period: string;
  interval: string;
  data: HistoricalDataPoint[] | IntradayDataPoint[];
  count: number;
}

export interface CompanyInfo {
  symbol: string;
  name: string;
  description: string;
  exchange: string;
  sector: string;
  industry: string;
  marketCap: number;
  website: string;
  logo: string;
}

export interface Watchlist {
  _id: string;
  name: string;
  symbols: WatchlistItem[];
  createdAt: string;
}

export interface WatchlistItem {
  symbol: string;
  addedAt: string;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  name?: string;
}

export interface Portfolio {
  totalValue: number;
  cashBalance: number;
  positions: Position[];
  totalGainLoss: number;
  totalGainLossPercent: number;
}

export interface Position {
  symbol: string;
  name: string;
  shares: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  gainLoss: number;
  gainLossPercent: number;
  purchaseDate: string;
}

export interface Transaction {
  type: 'buy' | 'sell';
  symbol: string;
  shares: number;
  price: number;
  total: number;
  timestamp: string;
}

export interface TradeOrder {
  symbol: string;
  shares: number;
  type: 'buy' | 'sell';
}

export interface MarketMover {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
}

export interface SearchResult {
  symbol: string;
  name: string;
  type?: string;
  exchange?: string;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
}

export interface WebSocketMessage {
  type: 'connection' | 'marketData' | 'subscribe' | 'unsubscribe';
  status?: string;
  data?: any;
  timestamp: string;
}

export interface MarketDataUpdate {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
  timestamp: string;
}

export interface NewsArticle {
  title: string;
  summary: string;
  content?: string;
  url: string;
  source: {
    name: string;
    logo?: string;
  };
  author?: string;
  publishedAt: string;
  category: 'general' | 'earnings' | 'merger' | 'ipo' | 'dividend' | 'analyst' | 'economic';
  relatedSymbols: string[];
  sentiment: {
    score: number;
    label: 'positive' | 'negative' | 'neutral';
  };
  imageUrl?: string;
  tags: string[];
  views: number;
  isBreaking: boolean;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
}

export type ChartPeriod = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | '5Y';
export type ChartType = 'candlestick' | 'line' | 'bar';
export type MarketMoverType = 'gainers' | 'losers' | 'active';