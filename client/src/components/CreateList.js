import React, { useState } from 'react';
import './CreateList.css';

const CreateList = ({ onSave, onCancel }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a list name');
      return;
    }

    const newList = {
      name: name.trim()
    };

    onSave(newList);
  };

  return (
    <div className="create-list">
      <div className="header">
        <h1 className="page-title">Create New List</h1>
      </div>

      <form className="create-list-form" onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="field-label">List Name:</label>
          <input
            type="text"
            className="field-input"
            placeholder="Enter list name ..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoFocus
          />
          <div className="field-hint">
           т
          </div>
        </div>
      </form>

      <div className="action-buttons">
        <button className="cancel-btn" onClick={onCancel}>
          CANCEL
        </button>
        <button className="save-btn" onClick={handleSubmit}>
          CREATE LIST
        </button>
      </div>
    </div>
  );
};

export default CreateList;

