require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const http = require('http');
const WebSocket = require('ws');
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const stockRoutes = require('./routes/stocks');
const userRoutes = require('./routes/users');
const marketDataService = require('./utils/marketData');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-domain.com'] 
    : ['http://localhost:3000'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/users', userRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// WebSocket Server for real-time data
const wss = new WebSocket.Server({ server });

const clients = new Set();

wss.on('connection', (ws) => {
  console.log('New WebSocket connection established');
  clients.add(ws);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      console.log('Received message:', data);

      // Handle different message types
      switch (data.type) {
        case 'subscribe':
          // Subscribe to specific stock symbols
          if (data.symbols && Array.isArray(data.symbols)) {
            ws.subscribedSymbols = data.symbols;
            console.log(`Client subscribed to: ${data.symbols.join(', ')}`);
          }
          break;
        case 'unsubscribe':
          // Unsubscribe from symbols
          if (data.symbols && Array.isArray(data.symbols)) {
            ws.subscribedSymbols = ws.subscribedSymbols?.filter(
              symbol => !data.symbols.includes(symbol)
            ) || [];
          }
          break;
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clients.delete(ws);
  });

  // Send initial connection confirmation
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    timestamp: new Date().toISOString()
  }));
});

// Broadcast real-time data to all connected clients
const broadcastMarketData = (data) => {
  const message = JSON.stringify({
    type: 'marketData',
    data: data,
    timestamp: new Date().toISOString()
  });

  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      // Only send data for symbols the client is subscribed to
      if (!client.subscribedSymbols || 
          client.subscribedSymbols.includes(data.symbol)) {
        client.send(message);
      }
    }
  });
};

// Start market data service
marketDataService.startRealTimeUpdates(broadcastMarketData);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;