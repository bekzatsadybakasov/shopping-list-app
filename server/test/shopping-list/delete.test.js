const deleteList = require('../../app/server/api/shopping-list/delete');
const ShoppingList = require('../../app/models/ShoppingList');

jest.mock('../../app/models/ShoppingList');
jest.mock('../../app/middleware/validation', () => ({
  validateDtoIn: jest.fn()
}));

const { validateDtoIn } = require('../../app/middleware/validation');

describe('shoppingList/delete', () => {
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
    test('should delete shopping list when user is owner', async () => {
      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Test List',
        ownerUuIdentity: 'user123'
      };

      req.body = { id: 'list123', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);
      ShoppingList.findByIdAndDelete = jest.fn().mockResolvedValue(mockList);

      await deleteList(req, res);

      expect(validateDtoIn).toHaveBeenCalledWith(req.body, expect.any(Object));
      expect(ShoppingList.findById).toHaveBeenCalledWith('list123');
      expect(ShoppingList.findByIdAndDelete).toHaveBeenCalledWith('list123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          awid: 'awid123',
          id: 'list123',
          deleted: true
        })
      );
    });
  });

  describe('Alternative scenarios', () => {
    test('should return 400 when validation fails - missing id', async () => {
      req.body = { awid: 'awid123' };
      validateDtoIn.mockReturnValue({ 
        valid: false, 
        errors: ['id is required'] 
      });

      await deleteList(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          error: 'id is required',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/delete/validationError': expect.any(Object)
          })
        })
      );
    });

    test('should return 400 when validation fails - missing awid', async () => {
      req.body = { id: 'list123' };
      validateDtoIn.mockReturnValue({ 
        valid: false, 
        errors: ['awid is required'] 
      });

      await deleteList(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 400,
          error: 'awid is required'
        })
      );
    });

    test('should return 401 when user is not authenticated', async () => {
      req.body = { id: 'list123', awid: 'awid123' };
      req.session = null;
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });

      await deleteList(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          error: 'User not authenticated',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/delete/authenticationError': expect.any(Object)
          })
        })
      );
    });

    test('should return 401 when session.uuIdentity is missing', async () => {
      req.body = { id: 'list123', awid: 'awid123' };
      req.session = { authorizedProfiles: ['Operatives'] };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });

      await deleteList(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 401,
          error: 'User not authenticated'
        })
      );
    });

    test('should return 403 when user is not authorized (wrong profile)', async () => {
      req.body = { id: 'list123', awid: 'awid123' };
      req.session = {
        uuIdentity: 'user123',
        authorizedProfiles: ['Public']
      };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });

      await deleteList(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          error: 'User not authorized',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/delete/authorizationError': expect.any(Object)
          })
        })
      );
    });

    test('should return 404 when list is not found', async () => {
      req.body = { id: 'nonexistent', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(null);

      await deleteList(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 404,
          error: 'List not found',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/delete/listNotFound': expect.any(Object)
          })
        })
      );
      expect(ShoppingList.findByIdAndDelete).not.toHaveBeenCalled();
    });

    test('should return 403 when user is not the owner', async () => {
      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Test List',
        ownerUuIdentity: 'owner123' // Different owner
      };

      req.body = { id: 'list123', awid: 'awid123' };
      req.session.uuIdentity = 'user123'; // Not the owner
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);

      await deleteList(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          error: 'Only owner can delete list',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/delete/accessDenied': expect.any(Object)
          })
        })
      );
      expect(ShoppingList.findByIdAndDelete).not.toHaveBeenCalled();
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

      req.body = { id: 'list123', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);

      await deleteList(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 403,
          error: 'Only owner can delete list'
        })
      );
    });

    test('should return 500 when database findById fails', async () => {
      req.body = { id: 'list123', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockRejectedValue(new Error('Database error'));

      await deleteList(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
          error: 'Database error',
          uuAppErrorMap: expect.objectContaining({
            'shoppingList/delete/unexpectedError': expect.any(Object)
          })
        })
      );
    });

    test('should return 500 when database findByIdAndDelete fails', async () => {
      const mockList = {
        _id: 'list123',
        awid: 'awid123',
        name: 'Test List',
        ownerUuIdentity: 'user123'
      };

      req.body = { id: 'list123', awid: 'awid123' };
      validateDtoIn.mockReturnValue({ valid: true, errors: [] });
      ShoppingList.findById = jest.fn().mockResolvedValue(mockList);
      ShoppingList.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Delete failed'));

      await deleteList(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 500,
          error: 'Delete failed'
        })
      );
    });
  });
});

