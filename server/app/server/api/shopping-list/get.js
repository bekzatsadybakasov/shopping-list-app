const { validateDtoIn } = require('../../../middleware/validation');

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

    // Возврат dtoOut (пока без бизнес-логики)
    const dtoOut = {
      awid: dtoIn.awid,
      id: dtoIn.id,
      name: 'Example Shopping List',
      state: 'active',
      ownerUuIdentity: 'owner123',
      members: [
        {
          uuIdentity: 'owner123',
          isOwner: true
        }
      ],
      items: [],
      progress: {
        completed: 0,
        total: 0
      },
      memberCount: 1,
      updated: new Date().toISOString(),
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

