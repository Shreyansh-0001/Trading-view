const express = require('express');
const User = require('../models/User');
const { Stock } = require('../models/Stock');
const { auth } = require('../middleware/auth');
const { validateTradeOrder } = require('../middleware/validation');
const marketDataService = require('../utils/marketData');

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        avatar: user.avatar,
        preferences: user.preferences,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      message: 'Error fetching user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, preferences } = req.body;
    const updateData = {};

    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      message: 'Error updating user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Get user's watchlists
router.get('/watchlists', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Populate watchlists with current stock data
    const watchlistsWithData = await Promise.all(
      user.watchlists.map(async (watchlist) => {
        const symbolsData = await Promise.all(
          watchlist.symbols.map(async (item) => {
            const stock = await Stock.findOne({ symbol: item.symbol });
            return {
              symbol: item.symbol,
              addedAt: item.addedAt,
              currentPrice: stock?.currentPrice || 0,
              change: stock?.change || 0,
              changePercent: stock?.changePercent || 0,
              name: stock?.name || item.symbol
            };
          })
        );

        return {
          _id: watchlist._id,
          name: watchlist.name,
          symbols: symbolsData,
          createdAt: watchlist.createdAt
        };
      })
    );

    res.json({
      watchlists: watchlistsWithData
    });
  } catch (error) {
    console.error('Error fetching watchlists:', error);
    res.status(500).json({
      message: 'Error fetching watchlists',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Create new watchlist
router.post('/watchlists', auth, async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name || name.trim().length === 0) {
      return res.status(400).json({
        message: 'Watchlist name is required'
      });
    }

    const user = await User.findById(req.user._id);
    
    user.watchlists.push({
      name: name.trim(),
      symbols: []
    });

    await user.save();

    res.status(201).json({
      message: 'Watchlist created successfully',
      watchlist: user.watchlists[user.watchlists.length - 1]
    });
  } catch (error) {
    console.error('Error creating watchlist:', error);
    res.status(500).json({
      message: 'Error creating watchlist',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Add stock to watchlist
router.post('/watchlists/:watchlistId/stocks', auth, async (req, res) => {
  try {
    const { watchlistId } = req.params;
    const { symbol } = req.body;

    if (!symbol) {
      return res.status(400).json({
        message: 'Stock symbol is required'
      });
    }

    const user = await User.findById(req.user._id);
    const watchlist = user.watchlists.id(watchlistId);

    if (!watchlist) {
      return res.status(404).json({
        message: 'Watchlist not found'
      });
    }

    // Check if symbol already exists in watchlist
    const existingSymbol = watchlist.symbols.find(item => item.symbol === symbol.toUpperCase());
    if (existingSymbol) {
      return res.status(400).json({
        message: 'Stock already in watchlist'
      });
    }

    // Verify stock exists and get basic info
    let stock = await Stock.findOne({ symbol: symbol.toUpperCase() });
    if (!stock) {
      // Try to fetch from API
      const updatedStock = await marketDataService.updateStockData(symbol.toUpperCase());
      if (!updatedStock) {
        return res.status(404).json({
          message: 'Stock not found'
        });
      }
      stock = updatedStock;
    }

    watchlist.symbols.push({
      symbol: symbol.toUpperCase(),
      addedAt: new Date()
    });

    await user.save();

    res.json({
      message: 'Stock added to watchlist successfully',
      stock: {
        symbol: stock.symbol,
        name: stock.name,
        currentPrice: stock.currentPrice,
        change: stock.change,
        changePercent: stock.changePercent
      }
    });
  } catch (error) {
    console.error('Error adding stock to watchlist:', error);
    res.status(500).json({
      message: 'Error adding stock to watchlist',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Remove stock from watchlist
router.delete('/watchlists/:watchlistId/stocks/:symbol', auth, async (req, res) => {
  try {
    const { watchlistId, symbol } = req.params;

    const user = await User.findById(req.user._id);
    const watchlist = user.watchlists.id(watchlistId);

    if (!watchlist) {
      return res.status(404).json({
        message: 'Watchlist not found'
      });
    }

    watchlist.symbols = watchlist.symbols.filter(item => item.symbol !== symbol.toUpperCase());
    await user.save();

    res.json({
      message: 'Stock removed from watchlist successfully'
    });
  } catch (error) {
    console.error('Error removing stock from watchlist:', error);
    res.status(500).json({
      message: 'Error removing stock from watchlist',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Get user's portfolio
router.get('/portfolio', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Update current prices for all positions
    const updatedPositions = await Promise.all(
      user.portfolio.positions.map(async (position) => {
        const stock = await Stock.findOne({ symbol: position.symbol });
        if (stock) {
          const currentValue = position.shares * stock.currentPrice;
          const totalCost = position.shares * position.averagePrice;
          const gainLoss = currentValue - totalCost;
          const gainLossPercent = (gainLoss / totalCost) * 100;

          return {
            symbol: position.symbol,
            name: stock.name,
            shares: position.shares,
            averagePrice: position.averagePrice,
            currentPrice: stock.currentPrice,
            totalValue: currentValue,
            gainLoss: gainLoss,
            gainLossPercent: gainLossPercent,
            purchaseDate: position.purchaseDate
          };
        }
        return position;
      })
    );

    // Calculate total portfolio value
    const totalPositionsValue = updatedPositions.reduce((sum, pos) => sum + pos.totalValue, 0);
    const totalPortfolioValue = totalPositionsValue + user.portfolio.cashBalance;

    res.json({
      portfolio: {
        totalValue: totalPortfolioValue,
        cashBalance: user.portfolio.cashBalance,
        positions: updatedPositions,
        totalGainLoss: updatedPositions.reduce((sum, pos) => sum + pos.gainLoss, 0),
        totalGainLossPercent: totalPositionsValue > 0 ? 
          (updatedPositions.reduce((sum, pos) => sum + pos.gainLoss, 0) / (totalPositionsValue - updatedPositions.reduce((sum, pos) => sum + pos.gainLoss, 0))) * 100 : 0
      }
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    res.status(500).json({
      message: 'Error fetching portfolio',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Execute trade order
router.post('/portfolio/trade', auth, validateTradeOrder, async (req, res) => {
  try {
    const { symbol, shares, type } = req.body;
    
    // Get current stock price
    let stock = await Stock.findOne({ symbol });
    if (!stock) {
      const updatedStock = await marketDataService.updateStockData(symbol);
      if (!updatedStock) {
        return res.status(404).json({
          message: 'Stock not found'
        });
      }
      stock = updatedStock;
    }

    const user = await User.findById(req.user._id);
    const currentPrice = stock.currentPrice;
    const totalCost = shares * currentPrice;

    if (type === 'buy') {
      // Check if user has enough cash
      if (user.portfolio.cashBalance < totalCost) {
        return res.status(400).json({
          message: 'Insufficient funds'
        });
      }

      // Find existing position or create new one
      let position = user.portfolio.positions.find(pos => pos.symbol === symbol);
      
      if (position) {
        // Update existing position
        const totalShares = position.shares + shares;
        const totalValue = (position.shares * position.averagePrice) + totalCost;
        position.averagePrice = totalValue / totalShares;
        position.shares = totalShares;
      } else {
        // Create new position
        user.portfolio.positions.push({
          symbol: symbol,
          shares: shares,
          averagePrice: currentPrice,
          currentPrice: currentPrice,
          totalValue: totalCost,
          gainLoss: 0,
          gainLossPercent: 0,
          purchaseDate: new Date()
        });
      }

      // Deduct cash
      user.portfolio.cashBalance -= totalCost;

    } else if (type === 'sell') {
      // Find position
      const position = user.portfolio.positions.find(pos => pos.symbol === symbol);
      
      if (!position) {
        return res.status(400).json({
          message: 'No position found for this stock'
        });
      }

      if (position.shares < shares) {
        return res.status(400).json({
          message: 'Insufficient shares to sell'
        });
      }

      // Update position
      position.shares -= shares;
      
      // Remove position if no shares left
      if (position.shares === 0) {
        user.portfolio.positions = user.portfolio.positions.filter(pos => pos.symbol !== symbol);
      }

      // Add cash from sale
      user.portfolio.cashBalance += totalCost;
    }

    // Add transaction record
    user.portfolio.transactions.push({
      type: type,
      symbol: symbol,
      shares: shares,
      price: currentPrice,
      total: totalCost,
      timestamp: new Date()
    });

    await user.save();

    res.json({
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} order executed successfully`,
      transaction: {
        type: type,
        symbol: symbol,
        shares: shares,
        price: currentPrice,
        total: totalCost
      },
      newCashBalance: user.portfolio.cashBalance
    });
  } catch (error) {
    console.error('Error executing trade:', error);
    res.status(500).json({
      message: 'Error executing trade',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

// Get transaction history
router.get('/portfolio/transactions', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const user = await User.findById(req.user._id);
    
    const transactions = user.portfolio.transactions
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice((page - 1) * limit, page * limit);

    res.json({
      transactions: transactions,
      totalTransactions: user.portfolio.transactions.length,
      currentPage: parseInt(page),
      totalPages: Math.ceil(user.portfolio.transactions.length / limit)
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      message: 'Error fetching transactions',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
});

module.exports = router;