const { validateDtoIn } = require('../../../middleware/validation');
const ShoppingList = require('../../../models/ShoppingList');

const updateSchema = {
  required: ['id', 'awid'],
  fields: {
    id: {
      type: 'string',
      required: true
    },
    awid: {
      type: 'string',
      required: true
    },
    name: {
      type: 'string',
      min: 1,
      max: 100
    }
  }
};

async function update(req, res) {
  try {
    const dtoIn = req.body;
    const session = req.session;
    let uuAppErrorMap = {};

    // Валидация dtoIn
    const validation = validateDtoIn(dtoIn, updateSchema);
    if (!validation.valid) {
      return res.status(400).json({
        status: 400,
        error: validation.errors[0],
        uuAppErrorMap: {
          'shoppingList/update/validationError': {
            message: validation.errors[0],
            paramMap: { errors: validation.errors }
          }
        }
      });
    }

    // Проверка авторизации
    if (!session || !session.uuIdentity) {
      return res.status(401).json({
        status: 401,
        error: 'User not authenticated',
        uuAppErrorMap: {
          'shoppingList/update/authenticationError': {
            message: 'User not authenticated',
            paramMap: {}
          }
        }
      });
    }

    // Проверка профиля
    const authorizedProfiles = ['Operatives', 'Authorities'];
    if (!session.authorizedProfiles.some(p => authorizedProfiles.includes(p))) {
      return res.status(403).json({
        status: 403,
        error: 'User not authorized',
        uuAppErrorMap: {
          'shoppingList/update/authorizationError': {
            message: 'User not authorized',
            paramMap: {}
          }
        }
      });
    }

    // Получение списка
    const list = await ShoppingList.findById(dtoIn.id);

    if (!list) {
      return res.status(404).json({
        status: 404,
        error: 'List not found',
        uuAppErrorMap: {
          'shoppingList/update/listNotFound': {
            message: 'List not found',
            paramMap: {}
          }
        }
      });
    }

    // Проверка прав (только владелец)
    if (list.ownerUuIdentity !== session.uuIdentity) {
      return res.status(403).json({
        status: 403,
        error: 'Only owner can update list',
        uuAppErrorMap: {
          'shoppingList/update/accessDenied': {
            message: 'Only owner can update list',
            paramMap: {}
          }
        }
      });
    }

    // Обновление полей
    if (dtoIn.name !== undefined) {
      list.name = dtoIn.name.trim();
    }
    if (dtoIn.members !== undefined) {
      list.members = dtoIn.members;
    }
    if (dtoIn.items !== undefined) {
      list.items = dtoIn.items;
      list.updateProgress();
    }

    list.updated = new Date();
    const updatedList = await list.save();

    const dtoOut = {
      awid: updatedList.awid,
      id: updatedList._id.toString(),
      name: updatedList.name,
      state: updatedList.state,
      ownerUuIdentity: updatedList.ownerUuIdentity,
      members: updatedList.members,
      items: updatedList.items,
      progress: updatedList.progress,
      memberCount: updatedList.memberCount,
      updated: updatedList.updated.toISOString(),
      uuAppErrorMap
    };

    res.status(200).json(dtoOut);
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
      uuAppErrorMap: {
        'shoppingList/update/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = update;



