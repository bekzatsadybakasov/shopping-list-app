import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import './Login.css';

const Login = () => {
  const { setCurrentUser, users } = useUser();
  const [selectedUser, setSelectedUser] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (selectedUser) {
      setCurrentUser(selectedUser);
      navigate('/');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-icon">🛒</div>
          <h1 className="login-title">Shopping Lists</h1>
          <p className="login-subtitle">Welcome! Please select your account</p>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Select User:</label>
            <div className="user-options">
              {users.map((user) => (
                <button
                  key={user}
                  type="button"
                  className={`user-option ${selectedUser === user ? 'selected' : ''}`}
                  onClick={() => setSelectedUser(user)}
                >
                  <span className="user-avatar">{user.charAt(0)}</span>
                  <span className="user-name">{user}</span>
                  {selectedUser === user && <span className="checkmark">✓</span>}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={!selectedUser}
          >
            ENTER
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;





