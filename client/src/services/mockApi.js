import { 
  getAllLists, 
  getListById, 
  addList, 
  updateList as updateListData, 
  deleteList, 
  getListsForUser, 
  getArchivedListsForUser, 
  archiveList, 
  unarchiveList,
  leaveList
} from '../data/mockData';

// Имитация задержки сети
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Вспомогательная функция для обновления списка
const updateListApi = async (id, updates) => {
  await delay(100);
  return updateListData(id, updates);
};

// Shopping Lists
export const getLists = async (filter = 'all', currentUser) => {
  await delay();
  if (filter === 'archived') {
    return { 
      itemList: getArchivedListsForUser(currentUser), 
      pageInfo: { pageIndex: 0, pageSize: 20, total: 1 } 
    };
  }
  return { 
    itemList: getListsForUser(currentUser), 
    pageInfo: { pageIndex: 0, pageSize: 20, total: 1 } 
  };
};

export const getList = async (id) => {
  await delay();
  const list = getListById(id);
  if (!list) throw new Error('List not found');
  return list;
};

export const createList = async (listData) => {
  await delay();
  const newList = {
    name: listData.name,
    owner: listData.owner || 'Alex',
    members: [{ id: 1, name: listData.owner || 'Alex', isOwner: true }],
    items: [],
    progress: { completed: 0, total: 0 },
    memberCount: 1,
    updated: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
    archived: false
  };
  return addList(newList);
};

export const updateList = async (id, updates) => {
  await delay();
  const updated = updateListData(id, updates);
  if (!updated) throw new Error('List not found');
  return updated;
};

export const deleteListById = async (id) => {
  await delay();
  deleteList(id);
  return { deleted: true };
};

export const archiveListById = async (id) => {
  await delay();
  const archived = archiveList(id);
  if (!archived) throw new Error('List not found');
  return archived;
};

export const unarchiveListById = async (id) => {
  await delay();
  const unarchived = unarchiveList(id);
  if (!unarchived) throw new Error('List not found');
  return unarchived;
};

// Members
export const addMember = async (listId, memberUuIdentity) => {
  await delay();
  const list = getListById(listId);
  if (!list) throw new Error('List not found');
  const maxId = Math.max(...list.members.map(m => m.id), 0);
  const newMember = { id: maxId + 1, name: memberUuIdentity, isOwner: false };
  const updatedMembers = [...list.members, newMember];
  return updateListApi(listId, { members: updatedMembers });
};

export const removeMember = async (listId, memberUuIdentity) => {
  await delay();
  const list = getListById(listId);
  if (!list) throw new Error('List not found');
  const updatedMembers = list.members.filter(m => 
    (m.name !== memberUuIdentity && m.uuIdentity !== memberUuIdentity)
  );
  return updateListApi(listId, { members: updatedMembers });
};

export const leaveListById = async (listId, username) => {
  await delay();
  const updated = leaveList(listId, username);
  if (!updated) throw new Error('List not found');
  return updated;
};

// Items
export const createItem = async (listId, item) => {
  await delay();
  const list = getListById(listId);
  if (!list) throw new Error('List not found');
  const maxItemId = Math.max(...list.items.map(i => i.id), 0);
  const newItem = { 
    ...item, 
    id: maxItemId + 1, 
    resolved: false 
  };
  const updatedItems = [...list.items, newItem];
  const completed = updatedItems.filter(i => i.resolved).length;
  return updateListApi(listId, { 
    items: updatedItems, 
    progress: { completed, total: updatedItems.length } 
  });
};

export const updateItem = async (listId, itemId, itemData) => {
  await delay();
  const list = getListById(listId);
  if (!list) throw new Error('List not found');
  const updatedItems = list.items.map(item => 
    item.id === parseInt(itemId) ? { ...item, ...itemData } : item
  );
  const completed = updatedItems.filter(i => i.resolved).length;
  return updateListApi(listId, { 
    items: updatedItems, 
    progress: { completed, total: updatedItems.length } 
  });
};

export const deleteItem = async (listId, itemId) => {
  await delay();
  const list = getListById(listId);
  if (!list) throw new Error('List not found');
  const updatedItems = list.items.filter(item => item.id !== parseInt(itemId));
  const completed = updatedItems.filter(i => i.resolved).length;
  await updateListApi(listId, { 
    items: updatedItems, 
    progress: { completed, total: updatedItems.length } 
  });
  return { deleted: true };
};

export const toggleResolved = async (listId, itemId) => {
  await delay();
  const list = getListById(listId);
  if (!list) throw new Error('List not found');
  const updatedItems = list.items.map(item => 
    item.id === parseInt(itemId) ? { ...item, resolved: !item.resolved } : item
  );
  const completed = updatedItems.filter(i => i.resolved).length;
  return updateListApi(listId, { 
    items: updatedItems, 
    progress: { completed, total: updatedItems.length } 
  });
};



