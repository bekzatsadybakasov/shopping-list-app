import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import api from '../services';
import CreateList from './CreateList';
import UserSelector from './UserSelector';
import ListMenu from './ListMenu';
import ConfirmDialog from './ConfirmDialog';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';
import './ShoppingListsPage.css';

const ShoppingListsPage = () => {
  const { currentUser } = useUser();
  const [lists, setLists] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showCreateList, setShowCreateList] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, listId: null, listName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    updateLists();
  }, [currentUser, filter]);

  const updateLists = async () => {
    setLoading(true);
    setError(null);
    try {
      const filterValue = filter === 'Archived' ? 'archived' : 'all';
      const response = await api.getLists(filterValue, currentUser);
      setLists(response.itemList || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading lists:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLists = lists.filter(list => {
    const isOwner = list.owner === currentUser;
    const isMember = list.members?.some(m => m.name === currentUser);
    
    if (filter === 'Archived') return true;
    if (filter === 'All') return true;
    if (filter === 'Owned') return isOwner;
    if (filter === 'Shared') return isMember && !isOwner;
    return true;
  });

  const handleListClick = (listId) => {
    navigate(`/list/${listId}`);
  };

  const handleCreateList = async (newList) => {
    try {
      const list = await api.createList({
        name: newList.name,
        owner: currentUser,
        members: [{ id: 1, name: currentUser, isOwner: true }],
        items: []
      });
      await updateLists();
      setShowCreateList(false);
      navigate(`/list/${list.id}`);
    } catch (err) {
      setError(err.message);
      alert('Error creating list: ' + err.message);
    }
  };

  const handleArchive = async (listId) => {
    try {
      await api.archiveListById(listId);
      await updateLists();
    } catch (err) {
      setError(err.message);
      alert('Error archiving list: ' + err.message);
    }
  };

  const handleUnarchive = async (listId) => {
    try {
      await api.unarchiveListById(listId);
      await updateLists();
    } catch (err) {
      setError(err.message);
      alert('Error unarchiving list: ' + err.message);
    }
  };

  const handleDelete = (listId) => {
    const list = lists.find(l => l.id === listId);
    if (list) {
      setDeleteConfirm({ isOpen: true, listId, listName: list.name });
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirm.listId) {
      try {
        await api.deleteListById(deleteConfirm.listId);
        await updateLists();
      } catch (err) {
        setError(err.message);
        alert('Error deleting list: ' + err.message);
      }
    }
    setDeleteConfirm({ isOpen: false, listId: null, listName: '' });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, listId: null, listName: '' });
  };

  const handleLeave = async (listId) => {
    try {
      await api.leaveListById(listId, currentUser);
      await updateLists();
    } catch (err) {
      setError(err.message);
      alert('Error leaving list: ' + err.message);
    }
  };

  if (loading && lists.length === 0) {
    return <LoadingSpinner />;
  }

  if (error && lists.length === 0) {
    return <ErrorMessage message={error} onRetry={updateLists} />;
  }

  return (
    <div className="shopping-lists-page">
      <UserSelector />
      {error && <ErrorMessage message={error} onRetry={updateLists} />}
      <div className="header">
        <div className="header-title">
          <span className="cart-icon">🛒</span>
          <h1>MY SHOPPING LISTS</h1>
        </div>
      </div>

      <div className="filter-bar">
        {['All', 'Owned', 'Shared', 'Archived'].map((filterName) => (
          <button
            key={filterName}
            className={`filter-btn ${filter === filterName ? 'active' : ''}`}
            onClick={() => setFilter(filterName)}
          >
            {filterName}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner />}

      <div className="lists-container">
        {filter !== 'Archived' && (
          <button
            className="create-list-btn"
            onClick={() => setShowCreateList(true)}
          >
            + CREATE NEW LIST
          </button>
        )}
        {filteredLists.map((list) => (
          <div
            key={list.id}
            className="list-card"
            onClick={() => handleListClick(list.id)}
          >
            <div className="list-card-header">
              <h2 className="list-title">{list.name}</h2>
              <ListMenu
                list={list}
                currentUser={currentUser}
                onArchive={handleArchive}
                onUnarchive={handleUnarchive}
                onDelete={handleDelete}
                onLeave={handleLeave}
              />
            </div>
            <div className="list-details">
              <div className="detail-item">
                <span className="detail-label">PROGRESS:</span>
                <span className="detail-value">
                  {list.progress?.completed || 0}/{list.progress?.total || 0} ✓
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">MEMBERS:</span>
                <span className="detail-value">
                  👥 {list.memberCount || 0}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">UPDATED:</span>
                <span className="detail-value">
                  🕐 {list.updated || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreateList && (
        <div className="modal-overlay" onClick={() => setShowCreateList(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CreateList
              onSave={handleCreateList}
              onCancel={() => setShowCreateList(false)}
            />
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Delete Shopping List"
        message={`Are you sure you want to delete "${deleteConfirm.listName}"? This action cannot be undone.`}
        confirmText="DELETE"
        cancelText="CANCEL"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        type="danger"
      />
    </div>
  );
};

export default ShoppingListsPage; 