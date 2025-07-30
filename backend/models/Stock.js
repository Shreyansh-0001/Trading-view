const mongoose = require('mongoose');

const StockSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  exchange: {
    type: String,
    required: true
  },
  sector: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    default: ''
  },
  marketCap: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  logo: {
    type: String,
    default: ''
  },
  currentPrice: {
    type: Number,
    required: true,
    default: 0
  },
  previousClose: {
    type: Number,
    default: 0
  },
  change: {
    type: Number,
    default: 0
  },
  changePercent: {
    type: Number,
    default: 0
  },
  volume: {
    type: Number,
    default: 0
  },
  avgVolume: {
    type: Number,
    default: 0
  },
  dayHigh: {
    type: Number,
    default: 0
  },
  dayLow: {
    type: Number,
    default: 0
  },
  fiftyTwoWeekHigh: {
    type: Number,
    default: 0
  },
  fiftyTwoWeekLow: {
    type: Number,
    default: 0
  },
  pe: {
    type: Number,
    default: 0
  },
  eps: {
    type: Number,
    default: 0
  },
  dividend: {
    type: Number,
    default: 0
  },
  dividendYield: {
    type: Number,
    default: 0
  },
  beta: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Historical price data schema
const HistoricalDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  date: {
    type: Date,
    required: true
  },
  open: {
    type: Number,
    required: true
  },
  high: {
    type: Number,
    required: true
  },
  low: {
    type: Number,
    required: true
  },
  close: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    required: true
  },
  adjustedClose: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create compound index for efficient queries
HistoricalDataSchema.index({ symbol: 1, date: -1 });
StockSchema.index({ symbol: 1 });
StockSchema.index({ name: 'text', symbol: 'text' });

// Real-time price data schema for intraday data
const IntradayDataSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true
  },
  timestamp: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  volume: {
    type: Number,
    default: 0
  },
  change: {
    type: Number,
    default: 0
  },
  changePercent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// TTL index to automatically delete old intraday data (keep for 7 days)
IntradayDataSchema.index({ timestamp: 1 }, { expireAfterSeconds: 604800 });
IntradayDataSchema.index({ symbol: 1, timestamp: -1 });

module.exports = {
  Stock: mongoose.model('Stock', StockSchema),
  HistoricalData: mongoose.model('HistoricalData', HistoricalDataSchema),
  IntradayData: mongoose.model('IntradayData', IntradayDataSchema)
};