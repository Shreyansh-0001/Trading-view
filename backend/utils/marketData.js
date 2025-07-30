const axios = require('axios');
const cron = require('node-cron');
const { Stock, HistoricalData, IntradayData } = require('../models/Stock');

class MarketDataService {
  constructor() {
    this.alphaVantageKey = process.env.ALPHA_VANTAGE_API_KEY;
    this.finnhubKey = process.env.FINNHUB_API_KEY;
    this.isMarketOpen = this.checkMarketHours();
    this.subscribers = [];
    this.popularSymbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'AMD', 'INTC'];
  }

  checkMarketHours() {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = now.getHours();
    
    // Market is open Monday-Friday, 9:30 AM - 4:00 PM EST
    const isWeekday = day >= 1 && day <= 5;
    const isMarketHours = hour >= 9 && hour < 16;
    
    return isWeekday && isMarketHours;
  }

  async getStockQuote(symbol) {
    try {
      // Try Alpha Vantage first
      const quote = await this.getAlphaVantageQuote(symbol);
      if (quote) return quote;

      // Fallback to Finnhub
      return await this.getFinnhubQuote(symbol);
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error.message);
      return null;
    }
  }

  async getAlphaVantageQuote(symbol) {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.alphaVantageKey}`
      );

      const quote = response.data['Global Quote'];
      if (!quote || !quote['05. price']) {
        return null;
      }

      return {
        symbol: symbol,
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
        volume: parseInt(quote['06. volume']),
        previousClose: parseFloat(quote['08. previous close']),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low']),
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Alpha Vantage API error for ${symbol}:`, error.message);
      return null;
    }
  }

  async getFinnhubQuote(symbol) {
    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${this.finnhubKey}`
      );

      const data = response.data;
      if (!data.c) {
        return null;
      }

      return {
        symbol: symbol,
        price: data.c, // current price
        change: data.d, // change
        changePercent: data.dp, // change percent
        high: data.h, // high
        low: data.l, // low
        open: data.o, // open
        previousClose: data.pc, // previous close
        timestamp: new Date()
      };
    } catch (error) {
      console.error(`Finnhub API error for ${symbol}:`, error.message);
      return null;
    }
  }

  async getHistoricalData(symbol, period = '1M') {
    try {
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${this.alphaVantageKey}`
      );

      const timeSeries = response.data['Time Series (Daily)'];
      if (!timeSeries) {
        return [];
      }

      const historicalData = [];
      const dates = Object.keys(timeSeries).slice(0, 100); // Last 100 days

      for (const date of dates) {
        const dayData = timeSeries[date];
        historicalData.push({
          symbol: symbol,
          date: new Date(date),
          open: parseFloat(dayData['1. open']),
          high: parseFloat(dayData['2. high']),
          low: parseFloat(dayData['3. low']),
          close: parseFloat(dayData['4. close']),
          volume: parseInt(dayData['5. volume'])
        });
      }

      return historicalData.reverse(); // Oldest first
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error.message);
      return [];
    }
  }

  async getCompanyInfo(symbol) {
    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/stock/profile2?symbol=${symbol}&token=${this.finnhubKey}`
      );

      const data = response.data;
      if (!data.name) {
        return null;
      }

      return {
        symbol: symbol,
        name: data.name,
        exchange: data.exchange,
        sector: data.finnhubIndustry || '',
        industry: data.gsubind || '',
        marketCap: data.marketCapitalization || 0,
        description: data.description || '',
        website: data.weburl || '',
        logo: data.logo || ''
      };
    } catch (error) {
      console.error(`Error fetching company info for ${symbol}:`, error.message);
      return null;
    }
  }

  async searchStocks(query) {
    try {
      const response = await axios.get(
        `https://finnhub.io/api/v1/search?q=${query}&token=${this.finnhubKey}`
      );

      const results = response.data.result || [];
      return results.slice(0, 10).map(item => ({
        symbol: item.symbol,
        name: item.description,
        type: item.type
      }));
    } catch (error) {
      console.error(`Error searching stocks for query "${query}":`, error.message);
      return [];
    }
  }

  async updateStockData(symbol) {
    try {
      const quote = await this.getStockQuote(symbol);
      if (!quote) return null;

      // Update or create stock record
      const stock = await Stock.findOneAndUpdate(
        { symbol: symbol },
        {
          currentPrice: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          volume: quote.volume || 0,
          dayHigh: quote.high || 0,
          dayLow: quote.low || 0,
          previousClose: quote.previousClose || 0,
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );

      // Save intraday data for real-time charts
      if (this.isMarketOpen) {
        await IntradayData.create({
          symbol: symbol,
          timestamp: quote.timestamp,
          price: quote.price,
          volume: quote.volume || 0,
          change: quote.change,
          changePercent: quote.changePercent
        });
      }

      return stock;
    } catch (error) {
      console.error(`Error updating stock data for ${symbol}:`, error.message);
      return null;
    }
  }

  async initializePopularStocks() {
    console.log('Initializing popular stocks...');
    
    for (const symbol of this.popularSymbols) {
      try {
        // Get company info
        const companyInfo = await this.getCompanyInfo(symbol);
        if (companyInfo) {
          await Stock.findOneAndUpdate(
            { symbol: symbol },
            companyInfo,
            { upsert: true }
          );
        }

        // Get current quote
        await this.updateStockData(symbol);
        
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`Error initializing ${symbol}:`, error.message);
      }
    }
    
    console.log('Popular stocks initialized');
  }

  startRealTimeUpdates(broadcastCallback) {
    this.broadcastCallback = broadcastCallback;

    // Update popular stocks every 30 seconds during market hours
    cron.schedule('*/30 * * * * *', async () => {
      if (!this.checkMarketHours()) return;

      for (const symbol of this.popularSymbols) {
        try {
          const stock = await this.updateStockData(symbol);
          if (stock && this.broadcastCallback) {
            this.broadcastCallback({
              symbol: stock.symbol,
              price: stock.currentPrice,
              change: stock.change,
              changePercent: stock.changePercent,
              volume: stock.volume,
              timestamp: stock.lastUpdated
            });
          }
        } catch (error) {
          console.error(`Error in real-time update for ${symbol}:`, error.message);
        }
      }
    });

    // Initialize popular stocks on startup
    setTimeout(() => {
      this.initializePopularStocks();
    }, 5000);

    console.log('Real-time market data updates started');
  }

  // Generate mock data for development/demo purposes
  generateMockData(symbol) {
    const basePrice = 100 + Math.random() * 400; // Random price between 100-500
    const change = (Math.random() - 0.5) * 10; // Random change between -5 to +5
    const changePercent = (change / basePrice) * 100;

    return {
      symbol: symbol,
      price: parseFloat(basePrice.toFixed(2)),
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      volume: Math.floor(Math.random() * 1000000),
      high: parseFloat((basePrice + Math.random() * 5).toFixed(2)),
      low: parseFloat((basePrice - Math.random() * 5).toFixed(2)),
      open: parseFloat((basePrice + (Math.random() - 0.5) * 3).toFixed(2)),
      previousClose: parseFloat((basePrice - change).toFixed(2)),
      timestamp: new Date()
    };
  }
}

const marketDataService = new MarketDataService();

module.exports = marketDataService;