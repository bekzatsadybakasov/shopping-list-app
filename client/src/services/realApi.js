import { API_BASE_URL } from '../config/apiConfig';

const apiCall = async (endpoint, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'x-uu-identity': 'user123', // В реальном приложении брать из контекста
      'x-authorities': 'Operatives',
      ...options.headers
    }
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'API request failed');
  }

  return response.json();
};

// Shopping Lists
export const getLists = async (filter = 'all', currentUser) => {
  const params = new URLSearchParams({ awid: 'workspace1', filter });
  const data = await apiCall(`/shopping-list/list?${params}`);
  return data;
};

export const getList = async (id) => {
  const params = new URLSearchParams({ id, awid: 'workspace1' });
  return apiCall(`/shopping-list/get?${params}`);
};

export const createList = async (data) => {
  return apiCall('/shopping-list/create', {
    method: 'POST',
    body: JSON.stringify({ ...data, awid: 'workspace1' })
  });
};

export const updateList = async (id, data) => {
  return apiCall('/shopping-list/update', {
    method: 'POST',
    body: JSON.stringify({ id, ...data, awid: 'workspace1' })
  });
};

export const deleteListById = async (id) => {
  return apiCall('/shopping-list/delete', {
    method: 'POST',
    body: JSON.stringify({ id, awid: 'workspace1' })
  });
};

export const archiveListById = async (id) => {
  return apiCall('/shopping-list/archive', {
    method: 'POST',
    body: JSON.stringify({ id, awid: 'workspace1' })
  });
};

export const unarchiveListById = async (id) => {
  return apiCall('/shopping-list/unarchive', {
    method: 'POST',
    body: JSON.stringify({ id, awid: 'workspace1' })
  });
};

// Members
export const addMember = async (listId, memberUuIdentity) => {
  return apiCall('/shopping-list-member/addMember', {
    method: 'POST',
    body: JSON.stringify({ id: listId, awid: 'workspace1', memberUuIdentity })
  });
};

export const removeMember = async (listId, memberUuIdentity) => {
  return apiCall('/shopping-list-member/removeMember', {
    method: 'POST',
    body: JSON.stringify({ id: listId, awid: 'workspace1', memberUuIdentity })
  });
};

export const leaveListById = async (listId) => {
  return apiCall('/shopping-list-member/leave', {
    method: 'POST',
    body: JSON.stringify({ id: listId, awid: 'workspace1' })
  });
};

// Items
export const createItem = async (listId, item) => {
  return apiCall('/shopping-list-item/create', {
    method: 'POST',
    body: JSON.stringify({ shoppingListId: listId, awid: 'workspace1', ...item })
  });
};

export const updateItem = async (listId, itemId, itemData) => {
  return apiCall('/shopping-list-item/update', {
    method: 'POST',
    body: JSON.stringify({ id: itemId, shoppingListId: listId, awid: 'workspace1', ...itemData })
  });
};

export const deleteItem = async (listId, itemId) => {
  return apiCall('/shopping-list-item/delete', {
    method: 'POST',
    body: JSON.stringify({ id: itemId, shoppingListId: listId, awid: 'workspace1' })
  });
};

export const toggleResolved = async (listId, itemId) => {
  return apiCall('/shopping-list-item/toggleResolved', {
    method: 'POST',
    body: JSON.stringify({ id: itemId, shoppingListId: listId, awid: 'workspace1' })
  });
};