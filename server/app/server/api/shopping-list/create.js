const { validateDtoIn } = require('../../../middleware/validation');
const { requireAuth } = require('../../../middleware/authorization');

// Схема валидации
const createSchema = {
  required: ['name', 'awid'],
  fields: {
    name: {
      type: 'string',
      min: 1,
      max: 100
    },
    awid: {
      type: 'string',
      required: true
    }
  }
};

async function create(req, res) {
  try {
    const dtoIn = req.body;
    const session = req.session;
    let uuAppErrorMap = {};

    // Валидация dtoIn
    const validation = validateDtoIn(dtoIn, createSchema);
    if (!validation.valid) {
      return res.status(400).json({
        status: 400,
        error: validation.errors[0],
        uuAppErrorMap: {
          'shoppingList/create/validationError': {
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
          'shoppingList/create/authenticationError': {
            message: 'User not authenticated',
            paramMap: {}
          }
        }
      });
    }

    // Проверка профиля (Operatives или Authorities)
    const authorizedProfiles = ['Operatives', 'Authorities'];
    if (!session.authorizedProfiles.some(p => authorizedProfiles.includes(p))) {
      return res.status(403).json({
        status: 403,
        error: 'User not authorized',
        uuAppErrorMap: {
          'shoppingList/create/authorizationError': {
            message: 'User not authorized',
            paramMap: {}
          }
        }
      });
    }

    // Возврат dtoOut (пока без бизнес-логики)
    const dtoOut = {
      awid: dtoIn.awid,
      id: `list-${Date.now()}`,
      name: dtoIn.name.trim(),
      state: 'active',
      ownerUuIdentity: session.uuIdentity,
      members: [
        {
          uuIdentity: session.uuIdentity,
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
        'shoppingList/create/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = create;

