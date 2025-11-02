import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ManageMembers from './ManageMembers';
import AddItem from './AddItem';
import './ShoppingListDetail.css';

// Mock data for a shopping list
const MOCK_LIST_DATA = {
  1: {
    id: 1,
    name: 'Car care',
    icon: '🚗',
    color: '#ff4444',
    owner: 'Alex',
    members: [
      { id: 1, name: 'Alex', isOwner: true },
      { id: 2, name: 'Kate', isOwner: false },
      { id: 3, name: 'Ben', isOwner: false }
    ],
    items: [
      { id: 1, name: 'Winter tires', quantity: 4, measure: 'pcs', resolved: true },
      { id: 2, name: 'Brake pads', quantity: 2, measure: 'pcs', resolved: false },
      { id: 3, name: 'Engine oil', quantity: 5, measure: 'liters', resolved: false }
    ]
  },
  2: {
    id: 2,
    name: 'Garden care',
    icon: '🌱',
    color: '#44ff44',
    owner: 'Kate',
    members: [
      { id: 1, name: 'Kate', isOwner: true },
      { id: 2, name: 'Ben', isOwner: false }
    ],
    items: [
      { id: 1, name: 'Fertilizer', quantity: 10, measure: 'kg', resolved: false },
      { id: 2, name: 'Seeds', quantity: 3, measure: 'pcs', resolved: false },
      { id: 3, name: 'Garden tools', quantity: 5, measure: 'pcs', resolved: false },
      { id: 4, name: 'Watering can', quantity: 2, measure: 'pcs', resolved: false }
    ]
  },
  3: {
    id: 3,
    name: 'Tools',
    icon: '🔧',
    color: '#4444ff',
    owner: 'Ben',
    members: [
      { id: 1, name: 'Ben', isOwner: true },
      { id: 2, name: 'Alex', isOwner: false },
      { id: 3, name: 'Kate', isOwner: false }
    ],
    items: [
      { id: 1, name: 'Hammer', quantity: 1, measure: 'pcs', resolved: true },
      { id: 2, name: 'Screwdriver set', quantity: 1, measure: 'pcs', resolved: false }
    ]
  }
};

const ShoppingListDetail = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const [listData, setListData] = useState(MOCK_LIST_DATA[parseInt(listId)] || MOCK_LIST_DATA[1]);
  const [isEditingName, setIsEditingName] = useState(false);
  const [listName, setListName] = useState(listData.name);
  const [listIcon, setListIcon] = useState(listData.icon);
  const [listColor, setListColor] = useState(listData.color);
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemFilter, setItemFilter] = useState('all'); // 'all', 'unresolved', 'resolved'
  const currentUser = 'Alex'; // Mock current user

  const isOwner = listData.owner === currentUser;

  const handleBack = () => {
    navigate('/');
  };

  const handleSaveName = () => {
    setListData({ ...listData, name: listName, icon: listIcon, color: listColor });
    setIsEditingName(false);
  };

  const handleArchive = () => {
    // Archive functionality
    alert('List archived');
  };

  const handleToggleItemResolved = (itemId) => {
    setListData({
      ...listData,
      items: listData.items.map(item =>
        item.id === itemId ? { ...item, resolved: !item.resolved } : item
      )
    });
  };

  const handleDeleteItem = (itemId) => {
    setListData({
      ...listData,
      items: listData.items.filter(item => item.id !== itemId)
    });
  };

  const handleAddItem = (newItem) => {
    if (editingItem) {
      // Update existing item
      setListData({
        ...listData,
        items: listData.items.map(item =>
          item.id === editingItem.id ? { ...newItem, id: editingItem.id } : item
        )
      });
      setEditingItem(null);
      setShowAddItem(false);
    } else {
      // Add new item
      setListData({
        ...listData,
        items: [...listData.items, newItem]
      });
      setShowAddItem(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowAddItem(true);
  };

  const handleUpdateMembers = (updatedListData) => {
    setListData(updatedListData);
    setShowManageMembers(false);
  };

  const handleSaveChanges = () => {
    // Save all changes
    alert('Changes saved!');
  };

  const handleDeleteList = () => {
    if (window.confirm('Are you sure you want to delete this list?')) {
      navigate('/');
    }
  };

  const filteredItems = listData.items.filter(item => {
    if (itemFilter === 'all') return true;
    if (itemFilter === 'unresolved') return !item.resolved;
    if (itemFilter === 'resolved') return item.resolved;
    return true;
  });

  const handleNameClick = () => {
    if (isOwner) {
      setIsEditingName(true);
    }
  };

  const handleNameKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      setListName(listData.name);
      setIsEditingName(false);
    }
  };

  const handleNameBlur = () => {
    if (listName.trim()) {
      handleSaveName();
    } else {
      setListName(listData.name);
      setListIcon(listData.icon);
      setListColor(listData.color);
      setIsEditingName(false);
    }
  };

  return (
    <div className="shopping-list-detail">
      <div className="header">
        <div className="nav-bar">
          <button className="back-btn" onClick={handleBack}>
            ← BACK
          </button>
          <button className="archive-btn" onClick={handleArchive}>
            📁 Archive
          </button>
        </div>
      </div>

      <div className="list-title-section">
        {isEditingName ? (
          <div className="edit-container-full">
            <div className="icon-edit-section">
              <span className="icon-preview" style={{ color: listColor }}>
                {listIcon}
              </span>
              <div className="icon-edit-controls">
                <input
                  type="text"
                  value={listIcon}
                  onChange={(e) => setListIcon(e.target.value.slice(0, 2))}
                  className="icon-input-small"
                  placeholder="Icon"
                  maxLength="2"
                />
                <input
                  type="color"
                  value={listColor}
                  onChange={(e) => setListColor(e.target.value)}
                  className="color-input"
                  title="Color"
                />
              </div>
            </div>
            <div className="name-edit-container">
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                onKeyDown={handleNameKeyDown}
                onBlur={handleNameBlur}
                className="name-input"
                autoFocus
              />
              <button 
                className="save-name-btn" 
                onClick={handleSaveName}
                title="Save (Enter)"
              >
                ✓
              </button>
              <button 
                className="cancel-name-btn" 
                onClick={() => {
                  setListName(listData.name);
                  setListIcon(listData.icon);
                  setListColor(listData.color);
                  setIsEditingName(false);
                }}
                title="Cancel (Esc)"
              >
                ✕
              </button>
            </div>
          </div>
        ) : (
          <>
            <span 
              className={`list-icon-large ${isOwner ? 'editable-icon' : ''}`}
              style={{ color: listData.color }}
              onClick={isOwner ? handleNameClick : undefined}
              title={isOwner ? 'Click to edit' : ''}
            >
              {listData.icon}
            </span>
            <h1 
              className={`list-title ${isOwner ? 'editable' : ''}`}
              onClick={handleNameClick}
              title={isOwner ? 'Click to edit name and icon' : ''}
            >
              {listData.name}
              {isOwner && <span className="edit-hint"> ✏️</span>}
            </h1>
          </>
        )}
      </div>

      <div className="members-section">
        <div className="members-card">
          <div className="members-header">
            <span className="members-label">Members:</span>
            <button
              className="ellipsis-btn"
              onClick={() => setShowManageMembers(true)}
            >
              ⋯
            </button>
          </div>
          <div className="members-list">
            {listData.members.map((member) => (
              <span key={member.id} className="member-tag">
                {member.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="filter-section">
        <button
          className={`filter-btn ${itemFilter === 'all' ? 'active' : ''}`}
          onClick={() => setItemFilter('all')}
        >
          All
        </button>
        <button
          className={`filter-btn ${itemFilter === 'unresolved' ? 'active' : ''}`}
          onClick={() => setItemFilter('unresolved')}
        >
          Unresolved
        </button>
        <button
          className={`filter-btn ${itemFilter === 'resolved' ? 'active' : ''}`}
          onClick={() => setItemFilter('resolved')}
        >
          Resolved
        </button>
      </div>

      <div className="items-container">
        {filteredItems.map((item) => (
          <div key={item.id} className="item-card">
            <div className="item-content">
              <div className="item-info">
                <span className="item-name">{item.name}</span>
                <span className="item-quantity">
                  {item.quantity} {item.measure}
                </span>
              </div>
              <div className="item-actions">
                <button
                  className="edit-item-btn"
                  onClick={() => handleEditItem(item)}
                >
                  ✏️
                </button>
                <button
                  className="delete-item-btn"
                  onClick={() => handleDeleteItem(item.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
            <div className="item-status">
              {item.resolved ? (
                <>
                  <span className="resolved-checkmark">✓</span>
                  <button
                    className="undo-btn"
                    onClick={() => handleToggleItemResolved(item.id)}
                  >
                    UNDO
                  </button>
                </>
              ) : (
                <button
                  className="resolve-btn"
                  onClick={() => handleToggleItemResolved(item.id)}
                >
                  Mark as resolved
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <button
        className="add-item-btn"
        onClick={() => setShowAddItem(true)}
      >
        + ADD
      </button>

      <div className="action-buttons">
        <button className="delete-list-btn" onClick={handleDeleteList}>
          ✗ Delete
        </button>
        <button className="save-btn" onClick={handleSaveChanges}>
          ✓ SAVE
        </button>
      </div>

      {showManageMembers && (
        <div className="modal-overlay">
          <ManageMembers
            listData={listData}
            currentUser={currentUser}
            onClose={() => setShowManageMembers(false)}
            onSave={handleUpdateMembers}
          />
        </div>
      )}

      {showAddItem && (
        <div className="modal-overlay">
          <AddItem
            item={editingItem}
            onSave={handleAddItem}
            onCancel={() => {
              setShowAddItem(false);
              setEditingItem(null);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ShoppingListDetail;

