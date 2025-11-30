const { validateDtoIn } = require('../../../middleware/validation');
const ShoppingList = require('../../../models/ShoppingList');

const getSchema = {
  required: ['id', 'awid'],
  fields: {
    id: {
      type: 'string',
      required: true
    },
    awid: {
      type: 'string',
      required: true
    }
  }
};

async function get(req, res) {
  try {
    const dtoIn = req.query; // GET запрос использует query параметры
    const session = req.session;
    let uuAppErrorMap = {};

    // Валидация dtoIn
    const validation = validateDtoIn(dtoIn, getSchema);
    if (!validation.valid) {
      return res.status(400).json({
        status: 400,
        error: validation.errors[0],
        uuAppErrorMap: {
          'shoppingList/get/validationError': {
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
          'shoppingList/get/authenticationError': {
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
          'shoppingList/get/authorizationError': {
            message: 'User not authorized',
            paramMap: {}
          }
        }
      });
    }

    // Получение из MongoDB
    const list = await ShoppingList.findById(dtoIn.id);
    
    if (!list) {
      return res.status(404).json({
        status: 404,
        error: 'List not found',
        uuAppErrorMap: {
          'shoppingList/get/listNotFound': {
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
          'shoppingList/get/accessDenied': {
            message: 'Access denied',
            paramMap: {}
          }
        }
      });
    }

    const dtoOut = {
      awid: list.awid,
      id: list._id.toString(),
      name: list.name,
      state: list.state,
      ownerUuIdentity: list.ownerUuIdentity,
      members: list.members,
      items: list.items,
      progress: list.progress,
      memberCount: list.memberCount,
      updated: list.updated.toISOString(),
      uuAppErrorMap
    };

    res.status(200).json(dtoOut);
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
      uuAppErrorMap: {
        'shoppingList/get/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = get;



