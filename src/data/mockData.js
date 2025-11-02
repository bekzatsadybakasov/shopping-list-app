// Shared data storage for all lists
let listsData = [
  {
    id: 1,
    name: '🚗 Car care:',
    progress: { completed: 2, total: 3 },
    memberCount: 3,
    updated: '19.10.2025',
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
    ],
    archived: false
  },
  {
    id: 2,
    name: '🌱 Garden care:',
    progress: { completed: 0, total: 4 },
    memberCount: 2,
    updated: '10.10.2025',
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
    ],
    archived: false
  },
  {
    id: 3,
    name: '🔧 Tools:',
    progress: { completed: 1, total: 2 },
    memberCount: 3,
    updated: '1.09.2025',
    owner: 'Ben',
    members: [
      { id: 1, name: 'Ben', isOwner: true },
      { id: 2, name: 'Alex', isOwner: false },
      { id: 3, name: 'Kate', isOwner: false }
    ],
    items: [
      { id: 1, name: 'Hammer', quantity: 1, measure: 'pcs', resolved: true },
      { id: 2, name: 'Screwdriver set', quantity: 1, measure: 'pcs', resolved: false }
    ],
    archived: false
  }
];

export const getAllLists = () => listsData;

export const getListById = (id) => {
  return listsData.find(list => list.id === parseInt(id));
};

export const addList = (list) => {
  const maxId = Math.max(...listsData.map(l => l.id), 0);
  const newList = {
    ...list,
    id: maxId + 1,
    progress: list.progress || { completed: 0, total: 0 },
    memberCount: list.members?.length || 1,
    updated: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
    archived: false
  };
  listsData.push(newList);
  return newList;
};

export const updateList = (id, updates) => {
  const index = listsData.findIndex(list => list.id === parseInt(id));
  if (index !== -1) {
    listsData[index] = { ...listsData[index], ...updates };
    // Update memberCount
    if (updates.members) {
      listsData[index].memberCount = updates.members.length;
    }
    return listsData[index];
  }
  return null;
};

export const deleteList = (id) => {
  listsData = listsData.filter(list => list.id !== parseInt(id));
};

export const getListsForUser = (username) => {
  return listsData.filter(list => {
    if (list.archived) return false;
    const isOwner = list.owner === username;
    const isMember = list.members.some(m => m.name === username);
    return isOwner || isMember;
  });
};

export const getArchivedListsForUser = (username) => {
  return listsData.filter(list => {
    if (!list.archived) return false;
    const isOwner = list.owner === username;
    const isMember = list.members.some(m => m.name === username);
    return isOwner || isMember;
  });
};

export const archiveList = (id) => {
  return updateList(id, { archived: true });
};

export const unarchiveList = (id) => {
  return updateList(id, { archived: false });
};

export const leaveList = (listId, username) => {
  const list = getListById(listId);
  if (!list) return null;
  
  const updatedMembers = list.members.filter(m => m.name !== username);
  return updateList(listId, { members: updatedMembers });
};

