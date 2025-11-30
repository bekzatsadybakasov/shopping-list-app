const { validateDtoIn } = require('../../../middleware/validation');
const ShoppingList = require('../../../models/ShoppingList');

const updateSchema = {
  required: ['id', 'shoppingListId', 'awid'],
  fields: {
    id: { type: 'string', required: true },
    shoppingListId: { type: 'string', required: true },
    awid: { type: 'string', required: true },
    name: { type: 'string', min: 1, max: 200 },
    quantity: { type: 'number', min: 1 },
    measure: { type: 'string', min: 1, max: 50 }
  }
};

async function update(req, res) {
  try {
    const dtoIn = req.body;
    const session = req.session;
    let uuAppErrorMap = {};

    const validation = validateDtoIn(dtoIn, updateSchema);
    if (!validation.valid) {
      return res.status(400).json({
        status: 400,
        error: validation.errors[0],
        uuAppErrorMap: {
          'shoppingListItem/update/validationError': {
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
          'shoppingListItem/update/authenticationError': {
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
          'shoppingListItem/update/authorizationError': {
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
          'shoppingListItem/update/listNotFound': {
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
          'shoppingListItem/update/accessDenied': {
            message: 'Access denied',
            paramMap: {}
          }
        }
      });
    }

    const item = list.items.find(i => i.id === dtoIn.id);
    if (!item) {
      return res.status(404).json({
        status: 404,
        error: 'Item not found',
        uuAppErrorMap: {
          'shoppingListItem/update/itemNotFound': {
            message: 'Item not found',
            paramMap: {}
          }
        }
      });
    }

    if (dtoIn.name !== undefined) item.name = dtoIn.name.trim();
    if (dtoIn.quantity !== undefined) item.quantity = dtoIn.quantity;
    if (dtoIn.measure !== undefined) item.measure = dtoIn.measure.trim();

    list.updateProgress();
    const updatedList = await list.save();

    const dtoOut = {
      awid: updatedList.awid,
      id: item.id,
      shoppingListId: updatedList._id.toString(),
      name: item.name,
      quantity: item.quantity,
      measure: item.measure,
      resolved: item.resolved,
      uuAppErrorMap
    };

    res.status(200).json(dtoOut);
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
      uuAppErrorMap: {
        'shoppingListItem/update/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = update;



