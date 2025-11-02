import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import ShoppingListsPage from './components/ShoppingListsPage';
import ShoppingListDetail from './components/ShoppingListDetail';
import './App.css';

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<ShoppingListsPage />} />
            <Route path="/list/:listId" element={<ShoppingListDetail />} />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
