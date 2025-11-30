const { validateDtoIn } = require('../../../middleware/validation');
const ShoppingList = require('../../../models/ShoppingList');

const createSchema = {
  required: ['shoppingListId', 'awid', 'name', 'quantity', 'measure'],
  fields: {
    shoppingListId: { type: 'string', required: true },
    awid: { type: 'string', required: true },
    name: { type: 'string', min: 1, max: 200 },
    quantity: { type: 'number', min: 1 },
    measure: { type: 'string', min: 1, max: 50 }
  }
};

async function create(req, res) {
  try {
    const dtoIn = req.body;
    const session = req.session;
    let uuAppErrorMap = {};

    const validation = validateDtoIn(dtoIn, createSchema);
    if (!validation.valid) {
      return res.status(400).json({
        status: 400,
        error: validation.errors[0],
        uuAppErrorMap: {
          'shoppingListItem/create/validationError': {
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
          'shoppingListItem/create/authenticationError': {
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
          'shoppingListItem/create/authorizationError': {
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
          'shoppingListItem/create/listNotFound': {
            message: 'List not found',
            paramMap: {}
          }
        }
      });
    }

    // Проверка доступа (владелец или участник)
    const isOwner = list.ownerUuIdentity === session.uuIdentity;
    const isMember = list.members.some(m => m.uuIdentity === session.uuIdentity);
    
    if (!isOwner && !isMember) {
      return res.status(403).json({
        status: 403,
        error: 'Access denied',
        uuAppErrorMap: {
          'shoppingListItem/create/accessDenied': {
            message: 'Access denied',
            paramMap: {}
          }
        }
      });
    }

    const newItem = {
      id: `item-${Date.now()}`,
      name: dtoIn.name.trim(),
      quantity: dtoIn.quantity,
      measure: dtoIn.measure.trim(),
      resolved: false
    };

    list.items.push(newItem);
    list.updateProgress();
    const updatedList = await list.save();

    const dtoOut = {
      awid: updatedList.awid,
      id: newItem.id,
      shoppingListId: updatedList._id.toString(),
      name: newItem.name,
      quantity: newItem.quantity,
      measure: newItem.measure,
      resolved: newItem.resolved,
      uuAppErrorMap
    };

    res.status(200).json(dtoOut);
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
      uuAppErrorMap: {
        'shoppingListItem/create/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = create;



