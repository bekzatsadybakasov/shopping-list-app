import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { getListsForUser, getArchivedListsForUser, archiveList, unarchiveList, deleteList, leaveList } from '../data/mockData';
import CreateList from './CreateList';
import UserSelector from './UserSelector';
import ListMenu from './ListMenu';
import ConfirmDialog from './ConfirmDialog';
import './ShoppingListsPage.css';

const ShoppingListsPage = () => {
  const { currentUser } = useUser();
  const [lists, setLists] = useState([]);
  const [filter, setFilter] = useState('All');
  const [showCreateList, setShowCreateList] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, listId: null, listName: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // Update lists when user changes
    updateLists();
  }, [currentUser, filter]);

  const updateLists = () => {
    if (filter === 'Archived') {
      const archivedLists = getArchivedListsForUser(currentUser);
      setLists(archivedLists);
    } else {
      const userLists = getListsForUser(currentUser);
      setLists(userLists);
    }
  };

  const filteredLists = lists.filter(list => {
    const isOwner = list.owner === currentUser;
    const isMember = list.members.some(m => m.name === currentUser);
    
    // For Archived filter, lists are already filtered by getArchivedListsForUser
    if (filter === 'Archived') return true;
    
    if (filter === 'All') return true;
    if (filter === 'Owned') return isOwner;
    if (filter === 'Shared') return isMember && !isOwner;
    return true;
  });

  const handleListClick = (listId) => {
    navigate(`/list/${listId}`);
  };

  const handleCreateList = (newList) => {
    const { addList } = require('../data/mockData');
    const list = addList({
      name: newList.name,
      owner: currentUser,
      members: [{ id: 1, name: currentUser, isOwner: true }],
      items: []
    });
    // Refresh lists
    updateLists();
    setShowCreateList(false);
    navigate(`/list/${list.id}`);
  };

  const handleArchive = (listId) => {
    archiveList(listId);
    updateLists();
  };

  const handleUnarchive = (listId) => {
    unarchiveList(listId);
    updateLists();
  };

  const handleDelete = (listId) => {
    const list = lists.find(l => l.id === listId);
    if (list) {
      setDeleteConfirm({ isOpen: true, listId, listName: list.name });
    }
  };

  const confirmDelete = () => {
    if (deleteConfirm.listId) {
      deleteList(deleteConfirm.listId);
      updateLists();
    }
    setDeleteConfirm({ isOpen: false, listId: null, listName: '' });
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, listId: null, listName: '' });
  };

  const handleLeave = (listId) => {
    leaveList(listId, currentUser);
    updateLists();
  };

  return (
    <div className="shopping-lists-page">
      <UserSelector />
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
                  {list.progress.completed}/{list.progress.total} ✓
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">MEMBERS:</span>
                <span className="detail-value">
                  👥 {list.memberCount}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">UPDATED:</span>
                <span className="detail-value">
                  🕐 {list.updated}
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

