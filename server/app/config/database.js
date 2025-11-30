const mongoose = require('mongoose');

// Используем MongoDB Atlas с правильными параметрами
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://bekzat130103_db_user:rgsba5130103@cluster0.f5e1gm0.mongodb.net/shopping-list?retryWrites=true&w=majority';

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    // Продолжаем работу, но API будет возвращать ошибки при обращении к БД
    console.log('⚠️  Server will continue, but database operations will fail');
  }
};

module.exports = connectDB;

