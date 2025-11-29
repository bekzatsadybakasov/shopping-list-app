import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import api from '../services';
import ManageMembers from './ManageMembers';
import AddItem from './AddItem';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadListData();
  }, [listId]);

  const loadListData = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await api.getList(listId);
      if (list) {
        setListData(list);
        setListName(list.name);
      } else {
        setError('List not found');
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to load list');
      console.error('Error loading list:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !listData) {
    return <ErrorMessage message={error} onRetry={loadListData} />;
  }

  if (!listData) {
    return null;
  }

  const isOwner = listData.owner === currentUser || listData.ownerUuIdentity === currentUser;
  const isMember = listData.members?.some(m => 
    m.name === currentUser || m.uuIdentity === currentUser
  ) || isOwner;
  
  if (!isOwner && !isMember) {
    navigate('/');
    return null;
  }

  const handleBack = () => {
    navigate('/');
  };

  const handleSaveName = async () => {
    if (!listName.trim()) {
      setListName(listData.name);
      setIsEditingName(false);
      return;
    }
    try {
      setError(null);
      const updated = await api.updateList(listData.id, { name: listName.trim() });
      setListData(updated);
      setIsEditingName(false);
    } catch (err) {
      setError(err.message || 'Failed to update list name');
      setListName(listData.name);
      setIsEditingName(false);
    }
  };

  const handleArchive = async () => {
    if (window.confirm(`Are you sure you want to archive "${listData.name}"?`)) {
      try {
        setError(null);
        await api.archiveListById(listData.id);
        navigate('/');
      } catch (err) {
        setError(err.message || 'Failed to archive list');
      }
    }
  };

  const handleToggleItemResolved = async (itemId) => {
    try {
      setError(null);
      const updated = await api.toggleResolved(listData.id, itemId);
      setListData(updated);
    } catch (err) {
      setError(err.message || 'Failed to toggle item status');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      setError(null);
      await api.deleteItem(listData.id, itemId);
      const updated = await api.getList(listData.id);
      setListData(updated);
    } catch (err) {
      setError(err.message || 'Failed to delete item');
    }
  };

  const handleAddItem = async (newItem) => {
    try {
      setError(null);
      if (editingItem) {
        // Update existing item
        const updated = await api.updateItem(
          listData.id, 
          editingItem.id, 
          {
            name: newItem.name,
            quantity: newItem.quantity,
            measure: newItem.measure
          }
        );
        setListData(updated);
        setEditingItem(null);
        setShowAddItem(false);
      } else {
        // Add new item
        const updated = await api.createItem(listData.id, {
          name: newItem.name,
          quantity: newItem.quantity,
          measure: newItem.measure
        });
        setListData(updated);
        setShowAddItem(false);
      }
    } catch (err) {
      setError(err.message || 'Failed to save item');
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowAddItem(true);
  };

  const handleUpdateMembers = async (updatedMembers) => {
    try {
      setError(null);
      // Convert members format if needed
      const membersToSave = updatedMembers.map(m => ({
        uuIdentity: m.name || m.uuIdentity,
        isOwner: m.isOwner || false
      }));
      
      const updated = await api.updateList(listData.id, { members: membersToSave });
      setListData(updated);
      setShowManageMembers(false);
    } catch (err) {
      setError(err.message || 'Failed to update members');
    }
  };

  const handleSaveChanges = () => {
    // Changes are already saved via individual handlers
    alert('All changes saved!');
  };

  const filteredItems = (listData.items || []).filter(item => {
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
      setIsEditingName(false);
    }
  };

  return (
    <div className="shopping-list-detail">
      {error && <ErrorMessage message={error} onRetry={null} />}
      
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
            {(listData.members || []).map((member, index) => (
              <span key={member.id || member.uuIdentity || index} className="member-tag">
                {member.name || member.uuIdentity}
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
                <span className={`item-name ${item.resolved ? 'resolved' : ''}`}>
                  {item.name}
                </span>
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
        onClick={() => {
          setEditingItem(null);
          setShowAddItem(true);
        }}
      >
        + ADD
      </button>

      <div className="action-buttons">
        <button className="save-btn" onClick={handleSaveChanges}>
          ✓ SAVE
        </button>
      </div>

      {showManageMembers && (
        <div className="modal-overlay" onClick={() => setShowManageMembers(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <ManageMembers
              listData={listData}
              currentUser={currentUser}
              onClose={() => setShowManageMembers(false)}
              onSave={handleUpdateMembers}
            />
          </div>
        </div>
      )}

      {showAddItem && (
        <div className="modal-overlay" onClick={() => {
          setShowAddItem(false);
          setEditingItem(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AddItem
              item={editingItem}
              onSave={handleAddItem}
              onCancel={() => {
                setShowAddItem(false);
                setEditingItem(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingListDetail;
