# TradingView Clone

A full-featured trading platform clone built with React.js, Node.js, Express.js, and MongoDB, featuring real-time market data streaming.

![TradingView Clone](https://img.shields.io/badge/Status-Development-yellow.svg)
![License](https://img.shields.io/badge/License-ISC-blue.svg)

## 🚀 Features

- **Real-time Market Data**: Live stock quotes and price updates via WebSocket
- **Interactive Trading Interface**: Modern, responsive UI with TradingView-like experience
- **User Authentication**: Secure login/register system with JWT tokens
- **Portfolio Management**: Track investments, buying power, and performance
- **Watchlists**: Create and manage custom stock watchlists
- **Stock Search**: Advanced search functionality with real-time suggestions
- **Dark/Light Theme**: Toggle between themes with user preferences
- **Virtual Trading**: $100,000 virtual account for risk-free trading
- **Market News**: Integrated news feed for market updates
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## 🛠 Tech Stack

### Frontend
- **React.js** with TypeScript
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Recharts** for data visualization
- **Socket.io Client** for real-time data
- **Axios** for API communication
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **WebSocket** for real-time communication
- **JWT** for authentication
- **bcrypt** for password hashing
- **Real-time Market APIs** (Alpha Vantage, Finnhub)

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local installation or MongoDB Atlas)
- **API Keys** (optional, for real market data):
  - Alpha Vantage API key
  - Finnhub API key

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd tradingview-clone
```

### 2. Install Dependencies

```bash
# Install root dependencies and all project dependencies
npm run setup
```

### 3. Environment Configuration

#### Backend Environment (.env)
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/tradingview-clone
JWT_SECRET=your-super-secret-jwt-key-here
ALPHA_VANTAGE_API_KEY=your-alpha-vantage-api-key
FINNHUB_API_KEY=your-finnhub-api-key
NODE_ENV=development
```

#### Frontend Environment (.env)
```bash
cd frontend
cp .env.example .env
```

The frontend `.env` is already configured for local development.

### 4. Start MongoDB

Make sure MongoDB is running on your system:

```bash
# If using local MongoDB
mongod

# Or if using MongoDB as a service
sudo systemctl start mongod  # Linux
brew services start mongodb  # macOS
```

### 5. Run the Application

```bash
# Run both backend and frontend in development mode
npm run dev
```

This will start:
- Backend server on `http://localhost:5000`
- Frontend development server on `http://localhost:3000`

### 6. Access the Application

Open your browser and navigate to `http://localhost:3000`

**Demo Credentials:**
- Email: `demo@tradingview.com`
- Password: `demo123`

Or create a new account using the registration form.

## 📁 Project Structure

```
tradingview-clone/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   ├── middleware/
│   │   ├── auth.js
│   │   └── validation.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Stock.js
│   │   └── News.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── stocks.js
│   │   └── users.js
│   ├── utils/
│   │   └── marketData.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   └── common/
│   │   ├── context/
│   │   │   └── AuthContext.tsx
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── StockPage.tsx
│   │   │   ├── PortfolioPage.tsx
│   │   │   └── WatchlistPage.tsx
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── websocket.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
├── package.json
└── README.md
```

## 🔧 Available Scripts

### Root Level Commands

```bash
# Development (runs both frontend and backend)
npm run dev

# Production (runs both frontend and backend)
npm start

# Install all dependencies
npm run setup

# Build frontend for production
npm run build
```

### Backend Commands

```bash
# Development with hot reload
npm run backend:dev

# Production
npm run backend:start

# Install backend dependencies only
npm run backend:install
```

### Frontend Commands

```bash
# Development server
npm run frontend:dev

# Production build
npm run frontend:build

# Install frontend dependencies only
npm run frontend:install
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/verify` - Token verification

### Stocks
- `GET /api/stocks/popular` - Get popular stocks
- `GET /api/stocks/search?q={query}` - Search stocks
- `GET /api/stocks/quote/{symbol}` - Get stock quote
- `GET /api/stocks/history/{symbol}` - Get historical data
- `GET /api/stocks/company/{symbol}` - Get company info
- `GET /api/stocks/movers?type={gainers|losers|active}` - Market movers

### User Management
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users/watchlists` - Get user watchlists
- `POST /api/users/watchlists` - Create watchlist
- `GET /api/users/portfolio` - Get portfolio
- `POST /api/users/portfolio/trade` - Execute trade

## 🔌 WebSocket Events

### Client to Server
```javascript
// Subscribe to stock updates
{
  "type": "subscribe",
  "symbols": ["AAPL", "GOOGL", "MSFT"]
}

// Unsubscribe from stock updates
{
  "type": "unsubscribe",
  "symbols": ["AAPL"]
}
```

### Server to Client
```javascript
// Market data update
{
  "type": "marketData",
  "data": {
    "symbol": "AAPL",
    "price": 175.43,
    "change": 2.15,
    "changePercent": 1.24,
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

## 🎨 UI Features

- **Modern Design**: Clean, professional interface inspired by TradingView
- **Dark/Light Theme**: Automatic theme switching based on user preference
- **Responsive Layout**: Optimized for all screen sizes
- **Real-time Updates**: Live price updates without page refresh
- **Interactive Charts**: Advanced charting capabilities (coming soon)
- **Intuitive Navigation**: Easy-to-use navigation and search

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Rate limiting (recommended for production)
- Environment variable protection

## 📊 Market Data

The application supports multiple market data providers:

- **Alpha Vantage**: For historical data and company information
- **Finnhub**: For real-time quotes and company profiles
- **Mock Data**: For development and demo purposes

## 🚧 Development Status

This project is currently in development. Completed features:

- ✅ Project setup and structure
- ✅ Backend API with Express.js and MongoDB
- ✅ Real-time WebSocket communication
- ✅ User authentication system
- ✅ Frontend with React.js and TypeScript
- ✅ Responsive UI with Tailwind CSS
- ✅ Market data integration
- 🚧 Advanced charting (in progress)
- 🚧 Portfolio management (in progress)
- 🚧 Watchlist functionality (in progress)
- 🚧 Market news integration (in progress)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by TradingView's professional trading interface
- Market data provided by Alpha Vantage and Finnhub
- Icons by Lucide React
- UI components styled with Tailwind CSS

## 📞 Support

If you encounter any issues or have questions, please:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include error logs and steps to reproduce

---

**Happy Trading! 📈**