import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import ShoppingListsPage from './components/ShoppingListsPage';
import ShoppingListDetail from './components/ShoppingListDetail';
import Login from './components/Login';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useUser();
  return currentUser ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <ShoppingListsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/list/:listId" 
        element={
          <ProtectedRoute>
            <ShoppingListDetail />
          </ProtectedRoute>
        } 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
