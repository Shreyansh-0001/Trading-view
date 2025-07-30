const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  avatar: {
    type: String,
    default: ''
  },
  watchlists: [{
    name: {
      type: String,
      required: true,
      default: 'My Watchlist'
    },
    symbols: [{
      symbol: String,
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  portfolio: {
    totalValue: {
      type: Number,
      default: 0
    },
    cashBalance: {
      type: Number,
      default: 100000 // Starting with $100,000 virtual money
    },
    positions: [{
      symbol: String,
      shares: Number,
      averagePrice: Number,
      currentPrice: Number,
      totalValue: Number,
      gainLoss: Number,
      gainLossPercent: Number,
      purchaseDate: {
        type: Date,
        default: Date.now
      }
    }],
    transactions: [{
      type: {
        type: String,
        enum: ['buy', 'sell'],
        required: true
      },
      symbol: String,
      shares: Number,
      price: Number,
      total: Number,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }]
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'dark'
    },
    defaultChart: {
      type: String,
      enum: ['candlestick', 'line', 'bar'],
      default: 'candlestick'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get user's full name
UserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Transform JSON output
UserSchema.set('toJSON', {
  transform: function(doc, ret) {
    delete ret.password;
    return ret;
  }
});

module.exports = mongoose.model('User', UserSchema);