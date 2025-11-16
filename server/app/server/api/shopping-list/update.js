const { validateDtoIn } = require('../../../middleware/validation');
const { isOwner } = require('../../../config/profiles');

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

    // Проверка прав (только owner может обновлять)
    // В реальном приложении здесь будет проверка из БД
    const mockOwnerUuIdentity = 'owner123';
    if (!isOwner(session, mockOwnerUuIdentity) && !session.authorizedProfiles.includes('Authorities')) {
      return res.status(403).json({
        status: 403,
        error: 'Only owner can update the list',
        uuAppErrorMap: {
          'shoppingList/update/ownerOnlyError': {
            message: 'Only owner can update the list',
            paramMap: {}
          }
        }
      });
    }

    // Возврат dtoOut
    const dtoOut = {
      awid: dtoIn.awid,
      id: dtoIn.id,
      name: dtoIn.name || 'Updated List Name',
      state: 'active',
      ownerUuIdentity: mockOwnerUuIdentity,
      members: [],
      items: [],
      progress: { completed: 0, total: 0 },
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
        'shoppingList/update/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = update;

