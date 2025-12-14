const update = require('../../app/server/api/shopping-list/update');
const ShoppingList = require('../../app/models/ShoppingList');

jest.mock('../../app/models/ShoppingList');
jest.mock('../../app/middleware/validation', () => ({
  validateDtoIn: jest.fn()
}));

const { validateDtoIn } = require('../../app/middleware/validation');

describe('shoppingList/update', () => {
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
    test('should update shopping list name when user is owner', async () => {
      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Old Name',
        state: 'active',
        ownerUuIdentity: 'user123',
        members: [{ uuIdentity: 'user123', isOwner: true }],
        items: [],
        progress: { completed: 0, total: 0 },
        updated: new Date('2024-01-01'),
        save: jest.fn().mockResolvedValue({
          _id: 'list123',
          awid: 'awid123',
          name: 'New Name',
          state: 'active',
          ownerUuIdentity: 'user123',
          members: [{ uuIdentity: 'user123', isOwner: true }],
          items: [],
          progress: { completed: 0, total: 0 },
          updated: new Date('2024-01-02')
        })
      };

      req.body = { id: 'list123', awid: 'awid123', name: 'New Name' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);

      await update(req, res);

      expect(validateDtoIn).toHaveBeenCalledWith(req.body, expect.any(Object));
      expect(ShoppingList.findById).toHaveBeenCalledWith('list123');
      expect(mockList.name).toBe('New Name');
      expect(mockList.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'list123',
          awid: 'awid123',
          name: 'New Name',
          state: 'active'
        })
      );
    });

    test('should trim whitespace from updated name', async () => {
      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Old Name',
        state: 'active',
        ownerUuIdentity: 'user123',
        members: [],
        items: [],
        progress: { completed: 0, total: 0 },
        updated: new Date('2024-01-01'),
        save: jest.fn().mockResolvedValue({
          _id: 'list123',
          awid: 'awid123',
          name: 'Trimmed Name',
          state: 'active',
          ownerUuIdentity: 'user123',
          members: [],
          items: [],
          progress: { completed: 0, total: 0 },
          updated: new Date('2024-01-02')
        })
      };

      req.body = { id: 'list123', awid: 'awid123', name: '  Trimmed Name  ' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);

      await update(req, res);

      expect(mockList.name).toBe('Trimmed Name');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should update members when provided', async () => {
      const newMembers = [
        { uuIdentity: 'user123', isOwner: true },
        { uuIdentity: 'member456', isOwner: false }
      ];

      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Test List',
        state: 'active',
        ownerUuIdentity: 'user123',
        members: [{ uuIdentity: 'user123', isOwner: true }],
        items: [],
        progress: { completed: 0, total: 0 },
        updated: new Date('2024-01-01'),
        save: jest.fn().mockResolvedValue({
          _id: 'list123',
          awid: 'awid123',
          name: 'Test List',
          state: 'active',
          ownerUuIdentity: 'user123',
          members: newMembers,
          items: [],
          progress: { completed: 0, total: 0 },
          updated: new Date('2024-01-02')
        })
      };

      req.body = { id: 'list123', awid: 'awid123', members: newMembers };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);

      await update(req, res);

      expect(mockList.members).toEqual(newMembers);
      expect(mockList.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should update items and recalculate progress', async () => {
      const newItems = [
        { id: 'item1', name: 'Item 1', quantity: 1, measure: 'pcs', resolved: true },
        { id: 'item2', name: 'Item 2', quantity: 2, measure: 'pcs', resolved: false }
      ];

      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Test List',
        state: 'active',
        ownerUuIdentity: 'user123',
        members: [],
        items: [],
        progress: { completed: 0, total: 0 },
        updated: new Date('2024-01-01'),
        updateProgress: jest.fn(),
        save: jest.fn().mockResolvedValue({
          _id: 'list123',
          awid: 'awid123',
          name: 'Test List',
          state: 'active',
          ownerUuIdentity: 'user123',
          members: [],
          items: newItems,
          progress: { completed: 1, total: 2 },
          updated: new Date('2024-01-02')
        })
      };

      req.body = { id: 'list123', awid: 'awid123', items: newItems };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);

      await update(req, res);

      expect(mockList.items).toEqual(newItems);
      expect(mockList.updateProgress).toHaveBeenCalled();
      expect(mockList.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should update updated timestamp', async () => {
      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Test List',
        state: 'active',
        ownerUuIdentity: 'user123',
        members: [],
        items: [],
        progress: { completed: 0, total: 0 },
        updated: new Date('2024-01-01'),
        save: jest.fn().mockResolvedValue({
          _id: 'list123',
          awid: 'awid123',
          name: 'Updated Name',
          state: 'active',
          ownerUuIdentity: 'user123',
          members: [],
          items: [],
          progress: { completed: 0, total: 0 },
          updated: new Date('2024-01-02')
        })
      };

      req.body = { id: 'list123', awid: 'awid123', name: 'Updated Name' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);

      await update(req, res);

      expect(mockList.updated).toBeInstanceOf(Date);
      expect(mockList.save).toHaveBeenCalled();
    });
  });

  describe('Alternative scenarios', () => {
    test('should return 400 when validation fails - missing id', async () => {
      req.body = { awid: 'awid123', name: 'New Name' };
      validateDtoIn.mockReturnValue({ 
        valid: false, 
        errors: ['id is required'] 
      });

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          error: 'id is required',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/update/validationError': expect.any(Object)
          })
        })
      );
    });

    test('should return 400 when validation fails - missing awid', async () => {
      req.body = { id: 'list123', name: 'New Name' };
      validateDtoIn.mockReturnValue({ 
        valid: false, 
        errors: ['awid is required'] 
      });

      await update(req, res);

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
        id: 'list123', 
        awid: 'awid123',
        name: 'a'.repeat(101) // Exceeds max length of 100
      };
      validateDtoIn.mockReturnValue({ 
        valid: false, 
        errors: ['name must be at most 100 characters'] 
      });

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should return 401 when user is not authenticated', async () => {
      req.body = { id: 'list123', awid: 'awid123', name: 'New Name' };
      req.session = null;
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          error: 'User not authenticated',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/update/authenticationError': expect.any(Object)
          })
        })
      );
    });

    test('should return 401 when session.uuIdentity is missing', async () => {
      req.body = { id: 'list123', awid: 'awid123', name: 'New Name' };
      req.session = { authorizedProfiles: ['Operatives'] };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          error: 'User not authenticated'
        })
      );
    });

    test('should return 403 when user is not authorized (wrong profile)', async () => {
      req.body = { id: 'list123', awid: 'awid123', name: 'New Name' };
      req.session = {
        uuIdentity: 'user123',
        authorizedProfiles: ['Public']
      };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          error: 'User not authorized',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/update/authorizationError': expect.any(Object)
          })
        })
      );
    });

    test('should return 404 when list is not found', async () => {
      req.body = { id: 'nonexistent', awid: 'awid123', name: 'New Name' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(null);

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 404,
          error: 'List not found',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/update/listNotFound': expect.any(Object)
          })
        })
      );
    });

    test('should return 403 when user is not the owner', async () => {
      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Test List',
        ownerUuIdentity: 'owner123', // Different owner
        save: jest.fn()
      };

      req.body = { id: 'list123', awid: 'awid123', name: 'New Name' };
      req.session.uuIdentity = 'user123'; // Not the owner
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          error: 'Only owner can update list',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/update/accessDenied': expect.any(Object)
          })
        })
      );
      expect(mockList.save).not.toHaveBeenCalled();
    });

    test('should return 403 when user is member but not owner', async () => {
      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Test List',
        ownerUuIdentity: 'owner123',
        members: [
          { uuIdentity: 'owner123', isOwner: true },
          { uuIdentity: 'user123', isOwner: false }
        ]
      };

      req.body = { id: 'list123', awid: 'awid123', name: 'New Name' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          error: 'Only owner can update list'
        })
      );
    });

    test('should not update fields that are undefined', async () => {
      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Original Name',
        state: 'active',
        ownerUuIdentity: 'user123',
        members: [],
        items: [],
        progress: { completed: 0, total: 0 },
        updated: new Date('2024-01-01'),
        save: jest.fn().mockResolvedValue({
          _id: 'list123',
          awid: 'awid123',
          name: 'Original Name',
          state: 'active',
          ownerUuIdentity: 'user123',
          members: [],
          items: [],
          progress: { completed: 0, total: 0 },
          updated: new Date('2024-01-02')
        })
      };

      req.body = { id: 'list123', awid: 'awid123' }; // No name provided
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);

      await update(req, res);

      expect(mockList.name).toBe('Original Name'); // Should remain unchanged
      expect(mockList.save).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should return 500 when database findById fails', async () => {
      req.body = { id: 'list123', awid: 'awid123', name: 'New Name' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
          error: 'Database error',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/update/unexpectedError': expect.any(Object)
          })
        })
      );
    });

    test('should return 500 when database save fails', async () => {
      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Test List',
        ownerUuIdentity: 'user123',
        members: [],
        items: [],
        progress: { completed: 0, total: 0 },
        updated: new Date('2024-01-01'),
        save: jest.fn().mockRejectedValue(new Error('Save failed'))
      };

      req.body = { id: 'list123', awid: 'awid123', name: 'New Name' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);

      await update(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
          error: 'Save failed'
        })
      );
    });
  });
});

