import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getListById, updateList, archiveList, unarchiveList } from '../data/mockData';
import ManageMembers from './ManageMembers';
import AddItem from './AddItem';
import './ShoppingListDetail.css';

const ShoppingListDetail = () => {
  const { listId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [listData, setListData] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [listName, setListName] = useState('');
  const [showManageMembers, setShowManageMembers] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemFilter, setItemFilter] = useState('all');

  useEffect(() => {
    const list = getListById(listId);
    if (list) {
      setListData(list);
      setListName(list.name);
    } else {
      navigate('/');
    }
  }, [listId, navigate]);

  if (!listData) {
    return <div>Loading...</div>;
  }

  const isOwner = listData.owner === currentUser;
  const isMember = listData.members.some(m => m.name === currentUser);
  
  if (!isOwner && !isMember) {
    navigate('/');
    return null;
  }

  const handleBack = () => {
    navigate('/');
  };

  const handleSaveName = () => {
    if (!listName.trim()) {
      setListName(listData.name);
      setIsEditingName(false);
      return;
    }
    const updated = updateList(listData.id, { name: listName.trim() });
    setListData(updated);
    setIsEditingName(false);
  };

  const handleArchive = () => {
    if (window.confirm(`Are you sure you want to archive "${listData.name}"?`)) {
      archiveList(listData.id);
      navigate('/');
    }
  };

  const handleToggleItemResolved = (itemId) => {
    const updatedItems = listData.items.map(item =>
      item.id === itemId ? { ...item, resolved: !item.resolved } : item
    );
    const completed = updatedItems.filter(i => i.resolved).length;
    const updated = updateList(listData.id, {
      items: updatedItems,
      progress: { completed, total: updatedItems.length }
    });
    setListData(updated);
  };

  const handleDeleteItem = (itemId) => {
    const updatedItems = listData.items.filter(item => item.id !== itemId);
    const completed = updatedItems.filter(i => i.resolved).length;
    const updated = updateList(listData.id, {
      items: updatedItems,
      progress: { completed, total: updatedItems.length }
    });
    setListData(updated);
  };

  const handleAddItem = (newItem) => {
    if (editingItem) {
      // Update existing item
      const updatedItems = listData.items.map(item =>
        item.id === editingItem.id ? { ...newItem, id: editingItem.id } : item
      );
      const completed = updatedItems.filter(i => i.resolved).length;
      const updated = updateList(listData.id, {
        items: updatedItems,
        progress: { completed, total: updatedItems.length }
      });
      setListData(updated);
      setEditingItem(null);
      setShowAddItem(false);
    } else {
      // Add new item
      const updatedItems = [...listData.items, newItem];
      const completed = updatedItems.filter(i => i.resolved).length;
      const updated = updateList(listData.id, {
        items: updatedItems,
        progress: { completed, total: updatedItems.length }
      });
      setListData(updated);
      setShowAddItem(false);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowAddItem(true);
  };

  const handleUpdateMembers = (updatedMembers) => {
    const updated = updateList(listData.id, { members: updatedMembers });
    setListData(updated);
    setShowManageMembers(false);
  };

  const handleSaveChanges = () => {
    // Save all changes
    alert('Changes saved!');
  };

  const handleDeleteList = () => {
    if (window.confirm(`Are you sure you want to delete "${listData.name}"? This cannot be undone.`)) {
      const { deleteList } = require('../data/mockData');
      deleteList(listData.id);
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
    handleSaveName();
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
          <div className="name-edit-container">
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              onKeyDown={handleNameKeyDown}
              onBlur={handleNameBlur}
              className="name-input"
              placeholder="List name (you can include emoji)..."
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
                setIsEditingName(false);
              }}
              title="Cancel (Esc)"
            >
              ✕
            </button>
          </div>
        ) : (
          <h1 
            className={`list-title ${isOwner ? 'editable' : ''}`}
            onClick={handleNameClick}
            title={isOwner ? 'Click to edit name' : ''}
          >
            {listData.name}
            {isOwner && <span className="edit-hint"> ✏️</span>}
          </h1>
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
            onSave={(updatedMembers) => handleUpdateMembers(updatedMembers)}
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

