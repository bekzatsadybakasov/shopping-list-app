const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./app/config/database');

// Подключение к MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock session middleware (для тестирования)
app.use((req, res, next) => {
  // В реальном приложении здесь будет проверка токена
  req.session = {
    uuIdentity: req.headers['x-uu-identity'] || 'user123',
    authorizedProfiles: req.headers['x-authorities'] 
      ? req.headers['x-authorities'].split(',') 
      : ['Operatives']
  };
  next();
});

// Routes
const shoppingListRoutes = require('./app/server/api/shopping-list');
const shoppingListMemberRoutes = require('./app/server/api/shopping-list-member');
const shoppingListItemRoutes = require('./app/server/api/shopping-list-item');

app.use('/api/shopping-list', shoppingListRoutes);
app.use('/api/shopping-list-member', shoppingListMemberRoutes);
app.use('/api/shopping-list-item', shoppingListItemRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 500,
    error: err.message,
    uuAppErrorMap: {}
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    error: 'Endpoint not found',
    uuAppErrorMap: {}
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

