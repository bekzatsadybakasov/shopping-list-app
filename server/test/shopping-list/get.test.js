const get = require('../../app/server/api/shopping-list/get');
const ShoppingList = require('../../app/models/ShoppingList');
const User = require('../../app/models/User');

jest.mock('../../app/models/ShoppingList');
jest.mock('../../app/models/User');
jest.mock('../../app/middleware/validation', () => ({
  validateDtoIn: jest.fn()
}));

const { validateDtoIn } = require('../../app/middleware/validation');

describe('shoppingList/get', () => {
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
    test('should return shopping list when user is owner', async () => {
      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Test List',
        state: 'active',
        ownerUuIdentity: 'user123',
        members: [
          { 
            uuIdentity: 'user123', 
            isOwner: true,
            toObject: function() { return this; }
          }
        ],
        items: [],
        progress: { completed: 0, total: 0 },
        updated: new Date('2024-01-01')
      };

      req.query = { id: 'list123', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);
      User.findById = jest.fn().mockResolvedValue({
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com'
      });

      await get(req, res);

      expect(validateDtoIn).toHaveBeenCalledWith(req.query, expect.any(Object));
      expect(ShoppingList.findById).toHaveBeenCalledWith('list123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'list123',
          awid: 'awid123',
          name: 'Test List',
          state: 'active',
          ownerUuIdentity: 'user123'
        })
      );
    });

    test('should return shopping list when user is member', async () => {
      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Test List',
        state: 'active',
        ownerUuIdentity: 'owner123',
        members: [
          { 
            uuIdentity: 'owner123', 
            isOwner: true,
            toObject: function() { return this; }
          },
          { 
            uuIdentity: 'user123', 
            isOwner: false,
            toObject: function() { return this; }
          }
        ],
        items: [],
        progress: { completed: 0, total: 0 },
        updated: new Date('2024-01-01')
      };

      req.query = { id: 'list123', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);
      User.findById = jest.fn().mockResolvedValue(null);

      await get(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'list123',
          name: 'Test List'
        })
      );
    });

    test('should enrich members with user information', async () => {
      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Test List',
        state: 'active',
        ownerUuIdentity: 'user123',
        members: [
          { 
            uuIdentity: 'user123', 
            isOwner: true,
            toObject: function() { return this; }
          },
          { 
            uuIdentity: 'member456', 
            isOwner: false,
            toObject: function() { return this; }
          }
        ],
        items: [],
        progress: { completed: 0, total: 0 },
        updated: new Date('2024-01-01')
      };

      req.query = { id: 'list123', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);
      User.findById = jest.fn()
        .mockResolvedValueOnce({
          _id: 'user123',
          name: 'Owner User',
          email: 'owner@example.com'
        })
        .mockResolvedValueOnce({
          _id: 'member456',
          name: 'Member User',
          email: 'member@example.com'
        });

      await get(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      const response = res.json.mock.calls[0][0];
      expect(response.members).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            uuIdentity: 'user123',
            name: 'Owner User',
            email: 'owner@example.com'
          })
        ])
      );
    });
  });

  describe('Alternative scenarios', () => {
    test('should return 400 when validation fails', async () => {
      req.query = {}; // Missing id and awid
      validateDtoIn.mockReturnValue({ 
        valid: false, 
        errors: ['id is required', 'awid is required'] 
      });

      await get(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          error: 'id is required',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/get/validationError': expect.any(Object)
          })
        })
      );
    });

    test('should return 401 when user is not authenticated', async () => {
      req.query = { id: 'list123', awid: 'awid123' };
      req.session = null;
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });

      await get(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          error: 'User not authenticated',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/get/authenticationError': expect.any(Object)
          })
        })
      );
    });

    test('should return 401 when session.uuIdentity is missing', async () => {
      req.query = { id: 'list123', awid: 'awid123' };
      req.session = { authorizedProfiles: ['Operatives'] };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });

      await get(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          error: 'User not authenticated'
        })
      );
    });

    test('should return 403 when user is not authorized (wrong profile)', async () => {
      req.query = { id: 'list123', awid: 'awid123' };
      req.session = {
        uuIdentity: 'user123',
        authorizedProfiles: ['Public']
      };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });

      await get(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          error: 'User not authorized',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/get/authorizationError': expect.any(Object)
          })
        })
      );
    });

    test('should return 404 when list is not found', async () => {
      req.query = { id: 'nonexistent', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(null);

      await get(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 404,
          error: 'List not found',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/get/listNotFound': expect.any(Object)
          })
        })
      );
    });

    test('should return 403 when user is neither owner nor member', async () => {
      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Test List',
        state: 'active',
        ownerUuIdentity: 'owner123',
        members: [
          { 
            uuIdentity: 'owner123', 
            isOwner: true,
            toObject: function() { return this; }
          }
        ],
        items: [],
        progress: { completed: 0, total: 0 },
        updated: new Date('2024-01-01')
      };

      req.query = { id: 'list123', awid: 'awid123' };
      req.session.uuIdentity = 'unauthorized123';
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);

      await get(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          error: 'Access denied',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/get/accessDenied': expect.any(Object)
          })
        })
      );
    });

    test('should return 500 when database error occurs', async () => {
      req.query = { id: 'list123', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await get(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
          error: 'Database error',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/get/unexpectedError': expect.any(Object)
          })
        })
      );
    });

    test('should handle missing user information gracefully', async () => {
      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Test List',
        state: 'active',
        ownerUuIdentity: 'user123',
        members: [
          { 
            uuIdentity: 'user123', 
            isOwner: true,
            toObject: function() { return this; }
          }
        ],
        items: [],
        progress: { completed: 0, total: 0 },
        updated: new Date('2024-01-01')
      };

      req.query = { id: 'list123', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);
      User.findById = jest.fn().mockResolvedValue(null);

      await get(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      // Should still return the list even if user info is not found
      expect(res.json).toHaveBeenCalled();
    });
  });
});

