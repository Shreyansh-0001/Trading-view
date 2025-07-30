const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  summary: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    default: ''
  },
  url: {
    type: String,
    required: true,
    unique: true
  },
  source: {
    name: {
      type: String,
      required: true
    },
    logo: {
      type: String,
      default: ''
    }
  },
  author: {
    type: String,
    default: ''
  },
  publishedAt: {
    type: Date,
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'earnings', 'merger', 'ipo', 'dividend', 'analyst', 'economic'],
    default: 'general'
  },
  relatedSymbols: [{
    type: String,
    uppercase: true
  }],
  sentiment: {
    score: {
      type: Number,
      min: -1,
      max: 1,
      default: 0
    },
    label: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    }
  },
  imageUrl: {
    type: String,
    default: ''
  },
  tags: [{
    type: String,
    lowercase: true
  }],
  views: {
    type: Number,
    default: 0
  },
  isBreaking: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
NewsSchema.index({ publishedAt: -1 });
NewsSchema.index({ relatedSymbols: 1, publishedAt: -1 });
NewsSchema.index({ category: 1, publishedAt: -1 });
NewsSchema.index({ isBreaking: 1, publishedAt: -1 });
NewsSchema.index({ title: 'text', summary: 'text', content: 'text' });

// TTL index to automatically delete old news (keep for 30 days)
NewsSchema.index({ publishedAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('News', NewsSchema);