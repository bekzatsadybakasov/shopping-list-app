import React, { useState } from 'react';
import './ManageMembers.css';

const ManageMembers = ({ listData, currentUser, onClose, onSave }) => {
  const [members, setMembers] = useState([...listData.members]);
  const [showInvite, setShowInvite] = useState(false);

  const isOwner = listData.owner === currentUser;

  const handleRemoveMember = (memberId) => {
    if (members.find(m => m.id === memberId)?.isOwner) {
      alert('Cannot remove the owner');
      return;
    }
    setMembers(members.filter(m => m.id !== memberId));
  };

  const handleLeave = () => {
    if (window.confirm('Are you sure you want to leave this list?')) {
      const updatedMembers = members.filter(m => m.name !== currentUser);
      onSave(updatedMembers);
      onClose();
    }
  };

  const handleInvite = () => {
    // Simple invite - just add a user from available users
    const availableUsers = ['Alex', 'Kate', 'Ben'];
    const userToAdd = availableUsers.find(u => 
      u !== currentUser && !members.some(m => m.name === u)
    );
    
    if (!userToAdd) {
      alert('No available users to invite');
      return;
    }
    
    const maxId = Math.max(...members.map(m => m.id), 0);
    setMembers([...members, { id: maxId + 1, name: userToAdd, isOwner: false }]);
  };

  const handleSaveChanges = () => {
    onSave(members);
    onClose();
  };

  const owner = members.find(m => m.isOwner);
  const regularMembers = members.filter(m => !m.isOwner);

  return (
    <div className="manage-members">
      <div className="header">
        <h1 className="page-title">Manage Members</h1>
      </div>

      <div className="owner-section">
        <div className="owner-card">
          <span className="owner-label">
            👑 Owner:
          </span>
          <span className="member-tag owner-tag">
            {owner?.name}
          </span>
        </div>
      </div>

      <div className="members-list-section">
        <h2 className="section-title">Members:</h2>
        {regularMembers.map((member) => (
          <div key={member.id} className="member-card">
            <span className="member-icon">👤</span>
            <span className="member-name">{member.name}</span>
            {isOwner ? (
              <button
                className="remove-btn"
                onClick={() => handleRemoveMember(member.id)}
              >
                ✗ Remove
              </button>
            ) : member.name === currentUser ? (
              <button className="leave-btn" onClick={handleLeave}>
                Leave
              </button>
            ) : null}
          </div>
        ))}
      </div>

      {isOwner && (
        <button className="invite-btn" onClick={handleInvite}>
          + INVITE
        </button>
      )}

      <div className="action-buttons">
        <button className="save-changes-btn" onClick={handleSaveChanges}>
          SAVE CHANGES
        </button>
        <button className="close-btn" onClick={onClose}>
          CLOSE
        </button>
      </div>
    </div>
  );
};

export default ManageMembers;

