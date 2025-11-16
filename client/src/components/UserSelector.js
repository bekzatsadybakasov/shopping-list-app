import React from 'react';
import { useUser } from '../context/UserContext';
import './UserSelector.css';

const UserSelector = () => {
  const { currentUser, setCurrentUser, users } = useUser();

  return (
    <div className="user-selector">
      <span className="user-label">Logged in as:</span>
      <select
        className="user-select"
        value={currentUser}
        onChange={(e) => setCurrentUser(e.target.value)}
      >
        {users.map(user => (
          <option key={user} value={user}>{user}</option>
        ))}
      </select>
    </div>
  );
};

export default UserSelector;








