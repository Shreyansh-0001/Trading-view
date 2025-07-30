const validateRegistration = (req, res, next) => {
  const { username, email, password, firstName, lastName } = req.body;
  const errors = [];

  // Username validation
  if (!username || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  if (username && username.length > 30) {
    errors.push('Username must be less than 30 characters');
  }
  if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  // Email validation
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  // Password validation
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Name validation
  if (!firstName || firstName.trim().length < 1) {
    errors.push('First name is required');
  }
  if (!lastName || lastName.trim().length < 1) {
    errors.push('Last name is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validateStockSymbol = (req, res, next) => {
  const { symbol } = req.params;
  
  if (!symbol) {
    return res.status(400).json({
      message: 'Stock symbol is required'
    });
  }

  if (symbol.length > 10 || !/^[A-Za-z]+$/.test(symbol)) {
    return res.status(400).json({
      message: 'Invalid stock symbol format'
    });
  }

  req.params.symbol = symbol.toUpperCase();
  next();
};

const validateTradeOrder = (req, res, next) => {
  const { symbol, shares, type } = req.body;
  const errors = [];

  if (!symbol) {
    errors.push('Stock symbol is required');
  } else if (!/^[A-Za-z]+$/.test(symbol)) {
    errors.push('Invalid stock symbol format');
  }

  if (!shares) {
    errors.push('Number of shares is required');
  } else if (!Number.isInteger(shares) || shares <= 0) {
    errors.push('Shares must be a positive integer');
  }

  if (!type) {
    errors.push('Order type is required');
  } else if (!['buy', 'sell'].includes(type)) {
    errors.push('Order type must be either "buy" or "sell"');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      message: 'Validation failed',
      errors
    });
  }

  req.body.symbol = symbol.toUpperCase();
  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateStockSymbol,
  validateTradeOrder
};