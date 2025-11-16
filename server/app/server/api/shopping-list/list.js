const { validateDtoIn } = require('../../../middleware/validation');

const listSchema = {
  required: ['awid'],
  fields: {
    awid: {
      type: 'string',
      required: true
    },
    filter: {
      type: 'string'
    },
    pageInfo: {
      type: 'object'
    }
  }
};

async function list(req, res) {
  try {
    const dtoIn = req.query;
    const session = req.session;
    let uuAppErrorMap = {};

    // Валидация dtoIn
    const validation = validateDtoIn(dtoIn, listSchema);
    if (!validation.valid) {
      return res.status(400).json({
        status: 400,
        error: validation.errors[0],
        uuAppErrorMap: {
          'shoppingList/list/validationError': {
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
          'shoppingList/list/authenticationError': {
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
          'shoppingList/list/authorizationError': {
            message: 'User not authorized',
            paramMap: {}
          }
        }
      });
    }

    // Возврат dtoOut
    const pageInfo = dtoIn.pageInfo || { pageIndex: 0, pageSize: 20 };
    const dtoOut = {
      awid: dtoIn.awid,
      itemList: [
        {
          id: 'list1',
          name: 'Example List 1',
          state: 'active',
          ownerUuIdentity: session.uuIdentity,
          progress: { completed: 2, total: 5 },
          memberCount: 3,
          updated: new Date().toISOString()
        }
      ],
      pageInfo: {
        pageIndex: pageInfo.pageIndex || 0,
        pageSize: pageInfo.pageSize || 20,
        total: 1
      },
      uuAppErrorMap
    };

    res.status(200).json(dtoOut);
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
      uuAppErrorMap: {
        'shoppingList/list/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = list;

