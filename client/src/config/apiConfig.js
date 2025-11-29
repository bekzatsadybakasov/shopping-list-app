// Переключатель между mock и real API
export const USE_MOCK_API = true; // Установите false для реального API
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';