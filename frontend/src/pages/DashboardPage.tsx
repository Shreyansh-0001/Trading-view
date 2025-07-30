import React from 'react';
import { 
  TrendingUp, 
  User, 
  LogOut, 
  Search,
  PieChart,
  BookmarkPlus,
  Activity,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Mock data for demonstration
  const portfolioValue = 105250.75;
  const dayChange = 2150.25;
  const dayChangePercent = 2.09;

  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.15, changePercent: 1.24 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2847.63, change: -15.22, changePercent: -0.53 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, change: 4.67, changePercent: 1.25 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 891.29, change: -12.45, changePercent: -1.38 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3342.88, change: 28.91, changePercent: 0.87 },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number, isPercent = false) => {
    const formatted = isPercent 
      ? `${change > 0 ? '+' : ''}${change.toFixed(2)}%`
      : formatPrice(change);
    
    return {
      value: formatted,
      isPositive: change > 0,
      isNegative: change < 0,
    };
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Navigation Header */}
      <header className="bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900 dark:text-white">
                TradingView Clone
              </span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search stocks..."
                  className="input pl-10 w-full"
                />
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {state.user?.fullName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  @{state.user?.username}
                </p>
              </div>
              <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {state.user?.firstName}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Here's what's happening in your portfolio today.
          </p>
        </div>

        {/* Portfolio Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Portfolio Value */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Portfolio Value
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(portfolioValue)}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                <PieChart className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {dayChange > 0 ? (
                <ArrowUpRight className="w-4 h-4 text-success-600 dark:text-success-400" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-danger-600 dark:text-danger-400" />
              )}
              <span className={`ml-1 text-sm font-medium ${
                dayChange > 0 ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'
              }`}>
                {formatChange(dayChange).value} ({formatChange(dayChangePercent, true).value})
              </span>
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                today
              </span>
            </div>
          </div>

          {/* Buying Power */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Buying Power
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatPrice(100000)}
                </p>
              </div>
              <div className="w-12 h-12 bg-success-100 dark:bg-success-900 rounded-full flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-success-600 dark:text-success-400" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Available for trading
            </p>
          </div>

          {/* Active Positions */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Positions
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  12
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              Across your portfolio
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Popular Stocks */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Popular Stocks
              </h2>
              <button className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium">
                View All
              </button>
            </div>
            
            <div className="space-y-4">
              {popularStocks.map((stock) => {
                const change = formatChange(stock.change);
                const changePercent = formatChange(stock.changePercent, true);
                
                return (
                  <div key={stock.symbol} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 dark:bg-dark-700 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {stock.symbol.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {stock.symbol}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {stock.name}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatPrice(stock.price)}
                      </p>
                      <p className={`text-sm ${
                        change.isPositive ? 'text-success-600 dark:text-success-400' : 
                        change.isNegative ? 'text-danger-600 dark:text-danger-400' : 
                        'text-gray-500 dark:text-gray-400'
                      }`}>
                        {change.value} ({changePercent.value})
                      </p>
                    </div>
                    
                    <button className="ml-4 p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400">
                      <BookmarkPlus className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Quick Actions
            </h2>
            
            <div className="space-y-4">
              <button className="w-full p-4 text-left rounded-lg border border-gray-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                    <Search className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Search & Trade
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Find and trade stocks instantly
                    </p>
                  </div>
                </div>
              </button>

              <button className="w-full p-4 text-left rounded-lg border border-gray-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <PieChart className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      View Portfolio
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Manage your investments
                    </p>
                  </div>
                </div>
              </button>

              <button className="w-full p-4 text-left rounded-lg border border-gray-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                    <BookmarkPlus className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Manage Watchlists
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Track your favorite stocks
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;