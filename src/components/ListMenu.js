import React, { useState, useEffect, useRef } from 'react';
import './ListMenu.css';

const ListMenu = ({ list, currentUser, onArchive, onDelete, onUnarchive, onLeave }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  const isOwner = list.owner === currentUser;
  const isMember = list.members?.some(m => m.name === currentUser && !m.isOwner) || false;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleArchive = () => {
    onArchive(list.id);
    setIsOpen(false);
  };

  const handleUnarchive = () => {
    onUnarchive(list.id);
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${list.name}"? This cannot be undone.`)) {
      onDelete(list.id);
      setIsOpen(false);
    }
  };

  const handleLeave = () => {
    if (window.confirm(`Are you sure you want to leave "${list.name}"?`)) {
      onLeave(list.id);
      setIsOpen(false);
    }
  };

  return (
    <div className="list-menu-container" ref={menuRef}>
      <button
        className="ellipsis-btn"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
      >
        ⋯
      </button>
      {isOpen && (
        <div className="list-menu-dropdown">
          {!list.archived && (
            <>
              {isOwner && (
                <>
                  <button className="menu-item" onClick={handleArchive}>
                    📁 Archive
                  </button>
                  <button className="menu-item delete" onClick={handleDelete}>
                    🗑️ Delete
                  </button>
                </>
              )}
              {isMember && (
                <button className="menu-item leave" onClick={handleLeave}>
                  🚪 Leave List
                </button>
              )}
            </>
          )}
          {list.archived && isOwner && (
            <>
              <button className="menu-item" onClick={handleUnarchive}>
                📤 Unarchive
              </button>
              <button className="menu-item delete" onClick={handleDelete}>
                🗑️ Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ListMenu;

