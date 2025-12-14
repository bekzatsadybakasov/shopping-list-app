const create = require('../../app/server/api/shopping-list/create');
const ShoppingList = require('../../app/models/ShoppingList');

jest.mock('../../app/models/ShoppingList');
jest.mock('../../app/middleware/validation', () => ({
  validateDtoIn: jest.fn()
}));

const { validateDtoIn } = require('../../app/middleware/validation');

describe('shoppingList/create', () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
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
    test('should create a new shopping list successfully', async () => {
      const mockSavedList = {
        _id: 'newlist123',
        awid: 'awid123',
        name: 'New Shopping List',
        state: 'active',
        ownerUuIdentity: 'user123',
        members: [{ uuIdentity: 'user123', isOwner: true }],
        items: [],
        progress: { completed: 0, total: 0 },
        updated: new Date('2024-01-01')
      };

      req.body = { name: 'New Shopping List', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      
      const mockListInstance = {
        save: jest.fn().mockResolvedValue(mockSavedList)
      };
      ShoppingList.mockImplementation(() => mockListInstance);

      await create(req, res);

      expect(validateDtoIn).toHaveBeenCalledWith(req.body, expect.any(Object));
      expect(ShoppingList).toHaveBeenCalledWith({
        awid: 'awid123',
        name: 'New Shopping List',
        state: 'active',
        ownerUuIdentity: 'user123',
        members: [{ uuIdentity: 'user123', isOwner: true }],
        items: [],
        progress: { completed: 0, total: 0 }
      });
      expect(mockListInstance.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'newlist123',
          awid: 'awid123',
          name: 'New Shopping List',
          state: 'active',
          ownerUuIdentity: 'user123',
          members: expect.arrayContaining([
            expect.objectContaining({
              uuIdentity: 'user123',
              isOwner: true
            })
          ])
        })
      );
    });

    test('should trim whitespace from list name', async () => {
      const mockSavedList = {
        _id: 'newlist123',
        awid: 'awid123',
        name: 'Trimmed List',
        state: 'active',
        ownerUuIdentity: 'user123',
        members: [{ uuIdentity: 'user123', isOwner: true }],
        items: [],
        progress: { completed: 0, total: 0 },
        updated: new Date('2024-01-01')
      };

      req.body = { name: '  Trimmed List  ', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      
      const mockListInstance = {
        save: jest.fn().mockResolvedValue(mockSavedList)
      };
      ShoppingList.mockImplementation(() => mockListInstance);

      await create(req, res);

      expect(ShoppingList).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Trimmed List'
        })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should set owner as first member with isOwner=true', async () => {
      const mockSavedList = {
        _id: 'newlist123',
        awid: 'awid123',
        name: 'Test List',
        state: 'active',
        ownerUuIdentity: 'user123',
        members: [{ uuIdentity: 'user123', isOwner: true }],
        items: [],
        progress: { completed: 0, total: 0 },
        updated: new Date('2024-01-01')
      };

      req.body = { name: 'Test List', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      
      const mockListInstance = {
        save: jest.fn().mockResolvedValue(mockSavedList)
      };
      ShoppingList.mockImplementation(() => mockListInstance);

      await create(req, res);

      expect(ShoppingList).toHaveBeenCalledWith(
        expect.objectContaining({
          ownerUuIdentity: 'user123',
          members: [
            expect.objectContaining({
              uuIdentity: 'user123',
              isOwner: true
            })
          ]
        })
      );
    });
  });

  describe('Alternative scenarios', () => {
    test('should return 400 when validation fails - missing name', async () => {
      req.body = { awid: 'awid123' };
      validateDtoIn.mockReturnValue({ 
        valid: false, 
        errors: ['name is required'] 
      });

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          error: 'name is required',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/create/validationError': expect.any(Object)
          })
        })
      );
    });

    test('should return 400 when validation fails - missing awid', async () => {
      req.body = { name: 'Test List' };
      validateDtoIn.mockReturnValue({ 
        valid: false, 
        errors: ['awid is required'] 
      });

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          error: 'awid is required'
        })
      );
    });

    test('should return 400 when name is too long', async () => {
      req.body = { 
        name: 'a'.repeat(101), // Exceeds max length of 100
        awid: 'awid123' 
      };
      validateDtoIn.mockReturnValue({ 
        valid: false, 
        errors: ['name must be at most 100 characters'] 
      });

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          error: 'name must be at most 100 characters'
        })
      );
    });

    test('should return 400 when name is empty string', async () => {
      req.body = { name: '', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ 
        valid: false, 
        errors: ['name is required'] 
      });

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return 401 when user is not authenticated', async () => {
      req.body = { name: 'Test List', awid: 'awid123' };
      req.session = null;
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          error: 'User not authenticated',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/create/authenticationError': expect.any(Object)
          })
        })
      );
    });

    test('should return 401 when session.uuIdentity is missing', async () => {
      req.body = { name: 'Test List', awid: 'awid123' };
      req.session = { authorizedProfiles: ['Operatives'] };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          error: 'User not authenticated'
        })
      );
    });

    test('should return 403 when user is not authorized (wrong profile)', async () => {
      req.body = { name: 'Test List', awid: 'awid123' };
      req.session = {
        uuIdentity: 'user123',
        authorizedProfiles: ['Public']
      };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          error: 'User not authorized',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/create/authorizationError': expect.any(Object)
          })
        })
      );
    });

    test('should return 500 when database save fails', async () => {
      req.body = { name: 'Test List', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      
      const mockListInstance = {
        save: jest.fn().mockRejectedValue(new Error('Database save failed'))
      };
      ShoppingList.mockImplementation(() => mockListInstance);

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
          error: 'Database save failed',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/create/unexpectedError': expect.any(Object)
          })
        })
      );
    });

    test('should handle empty name after trimming', async () => {
      req.body = { name: '   ', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ 
        valid: false, 
        errors: ['name is required'] 
      });

      await create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

