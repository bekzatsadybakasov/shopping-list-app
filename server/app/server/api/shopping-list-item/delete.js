const { validateDtoIn } = require('../../../middleware/validation');
const ShoppingList = require('../../../models/ShoppingList');

const deleteSchema = {
  required: ['id', 'shoppingListId', 'awid'],
  fields: {
    id: { type: 'string', required: true },
    shoppingListId: { type: 'string', required: true },
    awid: { type: 'string', required: true }
  }
};

async function deleteItem(req, res) {
  try {
    const dtoIn = req.body;
    const session = req.session;
    let uuAppErrorMap = {};

    const validation = validateDtoIn(dtoIn, deleteSchema);
    if (!validation.valid) {
      return res.status(400).json({
        status: 400,
        error: validation.errors[0],
        uuAppErrorMap: {
          'shoppingListItem/delete/validationError': {
            message: validation.errors[0],
            paramMap: { errors: validation.errors }
          }
        }
      });
    }

    if (!session || !session.uuIdentity) {
      return res.status(401).json({
        status: 401,
        error: 'User not authenticated',
        uuAppErrorMap: {
          'shoppingListItem/delete/authenticationError': {
            message: 'User not authenticated',
            paramMap: {}
          }
        }
      });
    }

    const authorizedProfiles = ['Operatives', 'Authorities'];
    if (!session.authorizedProfiles.some(p => authorizedProfiles.includes(p))) {
      return res.status(403).json({
        status: 403,
        error: 'User not authorized',
        uuAppErrorMap: {
          'shoppingListItem/delete/authorizationError': {
            message: 'User not authorized',
            paramMap: {}
          }
        }
      });
    }

    const list = await ShoppingList.findById(dtoIn.shoppingListId);

    if (!list) {
      return res.status(404).json({
        status: 404,
        error: 'List not found',
        uuAppErrorMap: {
          'shoppingListItem/delete/listNotFound': {
            message: 'List not found',
            paramMap: {}
          }
        }
      });
    }

    // Проверка доступа
    const isOwner = list.ownerUuIdentity === session.uuIdentity;
    const isMember = list.members.some(m => m.uuIdentity === session.uuIdentity);
    
    if (!isOwner && !isMember) {
      return res.status(403).json({
        status: 403,
        error: 'Access denied',
        uuAppErrorMap: {
          'shoppingListItem/delete/accessDenied': {
            message: 'Access denied',
            paramMap: {}
          }
        }
      });
    }

    const itemIndex = list.items.findIndex(i => i.id === dtoIn.id);
    if (itemIndex === -1) {
      return res.status(404).json({
        status: 404,
        error: 'Item not found',
        uuAppErrorMap: {
          'shoppingListItem/delete/itemNotFound': {
            message: 'Item not found',
            paramMap: {}
          }
        }
      });
    }

    list.items.splice(itemIndex, 1);
    list.updateProgress();
    await list.save();

    const dtoOut = {
      awid: dtoIn.awid,
      id: dtoIn.id,
      deleted: true,
      uuAppErrorMap
    };

    res.status(200).json(dtoOut);
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
      uuAppErrorMap: {
        'shoppingListItem/delete/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = deleteItem;



