const list = require('../../app/server/api/shopping-list/list');
const ShoppingList = require('../../app/models/ShoppingList');

jest.mock('../../app/models/ShoppingList');
jest.mock('../../app/middleware/validation', () => ({
  validateDtoIn: jest.fn()
}));

const { validateDtoIn } = require('../../app/middleware/validation');

describe('shoppingList/list', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      query: {},
      session: {
        uuIdentity: 'user123',
        authorizedProfiles: ['Operatives']
      }
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('Happy day scenarios', () => {
    test('should return list of shopping lists for authenticated user', async () => {
      const mockLists = [
        {
          _id: 'list1',
          awid: 'awid123',
          name: 'Test List 1',
          state: 'active',
          ownerUuIdentity: 'user123',
          members: [{ uuIdentity: 'user123', isOwner: true }],
          items: [],
          progress: { completed: 0, total: 0 },
          updated: new Date('2024-01-01'),
          toObject: function() { return this; }
        },
        {
          _id: 'list2',
          awid: 'awid123',
          name: 'Test List 2',
          state: 'active',
          ownerUuIdentity: 'user123',
          members: [{ uuIdentity: 'user123', isOwner: true }],
          items: [],
          progress: { completed: 0, total: 0 },
          updated: new Date('2024-01-02'),
          toObject: function() { return this; }
        }
      ];

      req.query = { awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      const createMockFind = (data) => {
        const chainable = {
          sort: jest.fn().mockResolvedValue(data)
        };
        chainable.then = (resolve) => Promise.resolve(data).then(resolve);
        chainable.catch = (reject) => Promise.resolve(data).catch(reject);
        return jest.fn().mockReturnValue(chainable);
      };
      ShoppingList.find = createMockFind(mockLists);

      await list(req, res);

      expect(validateDtoIn).toHaveBeenCalledWith(req.query, expect.any(Object));
      expect(ShoppingList.find).toHaveBeenCalledWith({ awid: 'awid123' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          awid: 'awid123',
          itemList: expect.arrayContaining([
            expect.objectContaining({
              id: 'list1',
              name: 'Test List 1',
              isOwner: true
            })
          ]),
          pageInfo: expect.objectContaining({
            pageIndex: 0,
            pageSize: 20,
            total: 2
          })
        })
      );
    });

    test('should filter archived lists when filter=archived', async () => {
      const mockLists = [
        {
          _id: 'list1',
          awid: 'awid123',
          name: 'Archived List',
          state: 'archived',
          ownerUuIdentity: 'user123',
          members: [{ uuIdentity: 'user123', isOwner: true }],
          items: [],
          progress: { completed: 0, total: 0 },
          updated: new Date('2024-01-01'),
          toObject: function() { return this; }
        }
      ];

      req.query = { awid: 'awid123', filter: 'archived' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      const createMockFind = (data) => {
        const chainable = {
          sort: jest.fn().mockResolvedValue(data)
        };
        chainable.then = (resolve) => Promise.resolve(data).then(resolve);
        chainable.catch = (reject) => Promise.resolve(data).catch(reject);
        return jest.fn().mockReturnValue(chainable);
      };
      ShoppingList.find = createMockFind(mockLists);

      await list(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          itemList: expect.arrayContaining([
            expect.objectContaining({
              state: 'archived'
            })
          ])
        })
      );
    });

    test('should handle pagination correctly', async () => {
      const mockLists = Array.from({ length: 25 }, (_, i) => ({
        _id: `list${i}`,
        awid: 'awid123',
        name: `List ${i}`,
        state: 'active',
        ownerUuIdentity: 'user123',
        members: [{ uuIdentity: 'user123', isOwner: true }],
        items: [],
        progress: { completed: 0, total: 0 },
        updated: new Date(),
        toObject: function() { return this; }
      }));

      req.query = { 
        awid: 'awid123', 
        pageInfo: { pageIndex: 1, pageSize: 10 } 
      };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      const createMockFind = (data) => {
        const chainable = {
          sort: jest.fn().mockResolvedValue(data)
        };
        chainable.then = (resolve) => Promise.resolve(data).then(resolve);
        chainable.catch = (reject) => Promise.resolve(data).catch(reject);
        return jest.fn().mockReturnValue(chainable);
      };
      ShoppingList.find = createMockFind(mockLists);

      await list(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.pageInfo.pageIndex).toBe(1);
      expect(response.pageInfo.pageSize).toBe(10);
      expect(response.pageInfo.total).toBe(25);
      expect(response.itemList.length).toBe(10);
    });

    test('should return lists where user is a member', async () => {
      const mockLists = [
        {
          _id: 'list1',
          awid: 'awid123',
          name: 'Member List',
          state: 'active',
          ownerUuIdentity: 'owner123',
          members: [
            { uuIdentity: 'owner123', isOwner: true },
            { uuIdentity: 'user123', isOwner: false }
          ],
          items: [],
          progress: { completed: 0, total: 0 },
          updated: new Date('2024-01-01'),
          toObject: function() { return this; }
        }
      ];

      req.query = { awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      const createMockFind = (data) => {
        const chainable = {
          sort: jest.fn().mockResolvedValue(data)
        };
        chainable.then = (resolve) => Promise.resolve(data).then(resolve);
        chainable.catch = (reject) => Promise.resolve(data).catch(reject);
        return jest.fn().mockReturnValue(chainable);
      };
      ShoppingList.find = createMockFind(mockLists);

      await list(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.itemList[0].isMember).toBe(true);
      expect(response.itemList[0].isOwner).toBe(false);
    });
  });

  describe('Alternative scenarios', () => {
    test('should return 400 when validation fails', async () => {
      req.query = {}; // Missing awid
      validateDtoIn.mockReturnValue({ 
        valid: false, 
        errors: ['awid is required'] 
      });

      await list(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          error: 'awid is required',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/list/validationError': expect.any(Object)
          })
        })
      );
    });

    test('should return 401 when user is not authenticated', async () => {
      req.query = { awid: 'awid123' };
      req.session = null;
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });

      await list(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          error: 'User not authenticated',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/list/authenticationError': expect.any(Object)
          })
        })
      );
    });

    test('should return 401 when session.uuIdentity is missing', async () => {
      req.query = { awid: 'awid123' };
      req.session = { authorizedProfiles: ['Operatives'] };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });

      await list(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          error: 'User not authenticated'
        })
      );
    });

    test('should return 403 when user is not authorized (wrong profile)', async () => {
      req.query = { awid: 'awid123' };
      req.session = {
        uuIdentity: 'user123',
        authorizedProfiles: ['Public'] // Wrong profile
      };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });

      await list(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          error: 'User not authorized',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/list/authorizationError': expect.any(Object)
          })
        })
      );
    });

    test('should return empty list when no lists found', async () => {
      req.query = { awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      const createMockFind = (data) => {
        const chainable = {
          sort: jest.fn().mockResolvedValue(data)
        };
        chainable.then = (resolve) => Promise.resolve(data).then(resolve);
        chainable.catch = (reject) => Promise.resolve(data).catch(reject);
        return jest.fn().mockReturnValue(chainable);
      };
      ShoppingList.find = createMockFind([]);

      await list(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          itemList: [],
          pageInfo: expect.objectContaining({
            total: 0
          })
        })
      );
    });

    test('should return 500 when database error occurs', async () => {
      req.query = { awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      const error = new Error('Database connection failed');
      const createMockFind = () => {
        const chainable = {
          sort: jest.fn().mockRejectedValue(error)
        };
        chainable.then = (resolve, reject) => Promise.reject(error).then(resolve, reject);
        chainable.catch = (reject) => Promise.reject(error).catch(reject);
        return jest.fn().mockRejectedValue(error).mockReturnValue(chainable);
      };
      ShoppingList.find = createMockFind();

      await list(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
          error: 'Database connection failed',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/list/unexpectedError': expect.any(Object)
          })
        })
      );
    });

    test('should filter active lists when filter=active', async () => {
      const mockLists = [
        {
          _id: 'list1',
          awid: 'awid123',
          name: 'Active List',
          state: 'active',
          ownerUuIdentity: 'user123',
          members: [{ uuIdentity: 'user123', isOwner: true }],
          items: [],
          progress: { completed: 0, total: 0 },
          updated: new Date('2024-01-01'),
          toObject: function() { return this; }
        },
        {
          _id: 'list2',
          awid: 'awid123',
          name: 'Archived List',
          state: 'archived',
          ownerUuIdentity: 'user123',
          members: [{ uuIdentity: 'user123', isOwner: true }],
          items: [],
          progress: { completed: 0, total: 0 },
          updated: new Date('2024-01-02'),
          toObject: function() { return this; }
        }
      ];

      req.query = { awid: 'awid123', filter: 'active' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      const createMockFind = (data) => {
        const chainable = {
          sort: jest.fn().mockResolvedValue(data)
        };
        chainable.then = (resolve) => Promise.resolve(data).then(resolve);
        chainable.catch = (reject) => Promise.resolve(data).catch(reject);
        return jest.fn().mockReturnValue(chainable);
      };
      ShoppingList.find = createMockFind(mockLists);

      await list(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.itemList.every(list => list.state === 'active')).toBe(true);
    });
  });
});

