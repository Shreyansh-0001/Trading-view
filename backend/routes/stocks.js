const express = require('express');
const { Stock, HistoricalData, IntradayData } = require('../models/Stock');
const marketDataService = require('../utils/marketData');
const { auth, optionalAuth } = require('../middleware/auth');
const { validateStockSymbol } = require('../middleware/validation');

const router = express.Router();

// Get popular/trending stocks
router.get('/popular', optionalAuth, async (req, res) => {
  try {
    const popularStocks = await Stock.find({
      symbol: { $in: marketDataService.popularSymbols }
    }).sort({ volume: -1 }).limit(10);

    res.json({
      stocks: popularStocks,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error fetching popular stocks:', error);
    res.status(500).json({
      message: 'Error fetching popular stocks',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Search stocks
router.get('/search', optionalAuth, async (req, res) => {
  try {
    const { q: query } = req.query;
    
    if (!query || query.trim().length < 1) {
      return res.status(400).json({
        message: 'Search query is required'
      });
    }

    // Search in database first
    const dbResults = await Stock.find({
      $or: [
        { symbol: { $regex: query, $options: 'i' } },
        { name: { $regex: query, $options: 'i' } }
      ]
    }).limit(10);

    // If we have good results from DB, return them
    if (dbResults.length >= 5) {
      return res.json({
        results: dbResults.map(stock => ({
          symbol: stock.symbol,
          name: stock.name,
          exchange: stock.exchange,
          currentPrice: stock.currentPrice,
          change: stock.change,
          changePercent: stock.changePercent
        })),
        source: 'database'
      });
    }

    // Otherwise, search via API
    const apiResults = await marketDataService.searchStocks(query);
    
    res.json({
      results: apiResults,
      source: 'api'
    });
  } catch (error) {
    console.error('Error searching stocks:', error);
    res.status(500).json({
      message: 'Error searching stocks',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Get stock quote
router.get('/quote/:symbol', validateStockSymbol, optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;

    // Try to get from database first
    let stock = await Stock.findOne({ symbol });

    // If not in database or data is stale (older than 5 minutes), fetch fresh data
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    if (!stock || stock.lastUpdated < fiveMinutesAgo) {
      const updatedStock = await marketDataService.updateStockData(symbol);
      if (updatedStock) {
        stock = updatedStock;
      }
    }

    if (!stock) {
      return res.status(404).json({
        message: `Stock with symbol ${symbol} not found`
      });
    }

    res.json({
      symbol: stock.symbol,
      name: stock.name,
      currentPrice: stock.currentPrice,
      change: stock.change,
      changePercent: stock.changePercent,
      volume: stock.volume,
      dayHigh: stock.dayHigh,
      dayLow: stock.dayLow,
      previousClose: stock.previousClose,
      marketCap: stock.marketCap,
      pe: stock.pe,
      eps: stock.eps,
      dividend: stock.dividend,
      dividendYield: stock.dividendYield,
      beta: stock.beta,
      fiftyTwoWeekHigh: stock.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: stock.fiftyTwoWeekLow,
      exchange: stock.exchange,
      sector: stock.sector,
      industry: stock.industry,
      lastUpdated: stock.lastUpdated
    });
  } catch (error) {
    console.error(`Error fetching quote for ${req.params.symbol}:`, error);
    res.status(500).json({
      message: 'Error fetching stock quote',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Get historical data
router.get('/history/:symbol', validateStockSymbol, optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { period = '1M', interval = 'daily' } = req.query;

    let historicalData = [];

    if (interval === 'intraday') {
      // Get intraday data for real-time charts
      const startDate = new Date();
      startDate.setHours(startDate.getHours() - 24); // Last 24 hours

      historicalData = await IntradayData.find({
        symbol,
        timestamp: { $gte: startDate }
      }).sort({ timestamp: 1 });

      historicalData = historicalData.map(data => ({
        timestamp: data.timestamp,
        price: data.price,
        volume: data.volume,
        change: data.change,
        changePercent: data.changePercent
      }));
    } else {
      // Get daily historical data
      let daysBack = 30; // Default 1 month
      
      switch (period) {
        case '1W':
          daysBack = 7;
          break;
        case '1M':
          daysBack = 30;
          break;
        case '3M':
          daysBack = 90;
          break;
        case '6M':
          daysBack = 180;
          break;
        case '1Y':
          daysBack = 365;
          break;
        case '5Y':
          daysBack = 1825;
          break;
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysBack);

      historicalData = await HistoricalData.find({
        symbol,
        date: { $gte: startDate }
      }).sort({ date: 1 });

      // If no data in database, fetch from API
      if (historicalData.length === 0) {
        const apiData = await marketDataService.getHistoricalData(symbol, period);
        
        // Save to database for future use
        if (apiData.length > 0) {
          await HistoricalData.insertMany(apiData);
          historicalData = apiData;
        }
      }

      historicalData = historicalData.map(data => ({
        date: data.date,
        open: data.open,
        high: data.high,
        low: data.low,
        close: data.close,
        volume: data.volume
      }));
    }

    res.json({
      symbol,
      period,
      interval,
      data: historicalData,
      count: historicalData.length
    });
  } catch (error) {
    console.error(`Error fetching historical data for ${req.params.symbol}:`, error);
    res.status(500).json({
      message: 'Error fetching historical data',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Get company information
router.get('/company/:symbol', validateStockSymbol, optionalAuth, async (req, res) => {
  try {
    const { symbol } = req.params;

    let stock = await Stock.findOne({ symbol });

    // If company info is missing, fetch from API
    if (!stock || !stock.description) {
      const companyInfo = await marketDataService.getCompanyInfo(symbol);
      if (companyInfo) {
        stock = await Stock.findOneAndUpdate(
          { symbol },
          companyInfo,
          { upsert: true, new: true }
        );
      }
    }

    if (!stock) {
      return res.status(404).json({
        message: `Company information for ${symbol} not found`
      });
    }

    res.json({
      symbol: stock.symbol,
      name: stock.name,
      description: stock.description,
      exchange: stock.exchange,
      sector: stock.sector,
      industry: stock.industry,
      marketCap: stock.marketCap,
      website: stock.website,
      logo: stock.logo
    });
  } catch (error) {
    console.error(`Error fetching company info for ${req.params.symbol}:`, error);
    res.status(500).json({
      message: 'Error fetching company information',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Get market movers (gainers, losers, most active)
router.get('/movers', optionalAuth, async (req, res) => {
  try {
    const { type = 'gainers' } = req.query;

    let sortCriteria = {};
    let filterCriteria = { currentPrice: { $gt: 0 } };

    switch (type) {
      case 'gainers':
        sortCriteria = { changePercent: -1 };
        filterCriteria.changePercent = { $gt: 0 };
        break;
      case 'losers':
        sortCriteria = { changePercent: 1 };
        filterCriteria.changePercent = { $lt: 0 };
        break;
      case 'active':
        sortCriteria = { volume: -1 };
        break;
      default:
        sortCriteria = { changePercent: -1 };
    }

    const movers = await Stock.find(filterCriteria)
      .sort(sortCriteria)
      .limit(20)
      .select('symbol name currentPrice change changePercent volume marketCap');

    res.json({
      type,
      movers: movers.map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: stock.currentPrice,
        change: stock.change,
        changePercent: stock.changePercent,
        volume: stock.volume,
        marketCap: stock.marketCap
      }))
    });
  } catch (error) {
    console.error('Error fetching market movers:', error);
    res.status(500).json({
      message: 'Error fetching market movers',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;