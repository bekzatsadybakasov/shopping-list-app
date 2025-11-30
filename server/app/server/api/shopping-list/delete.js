const { validateDtoIn } = require('../../../middleware/validation');
const ShoppingList = require('../../../models/ShoppingList');

const deleteSchema = {
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

async function deleteList(req, res) {
  try {
    const dtoIn = req.body;
    const session = req.session;
    let uuAppErrorMap = {};

    // Валидация dtoIn
    const validation = validateDtoIn(dtoIn, deleteSchema);
    if (!validation.valid) {
      return res.status(400).json({
        status: 400,
        error: validation.errors[0],
        uuAppErrorMap: {
          'shoppingList/delete/validationError': {
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
          'shoppingList/delete/authenticationError': {
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
          'shoppingList/delete/authorizationError': {
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
          'shoppingList/delete/listNotFound': {
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
        error: 'Only owner can delete list',
        uuAppErrorMap: {
          'shoppingList/delete/accessDenied': {
            message: 'Only owner can delete list',
            paramMap: {}
          }
        }
      });
    }

    // Удаление
    await ShoppingList.findByIdAndDelete(dtoIn.id);

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
        'shoppingList/delete/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = deleteList;



