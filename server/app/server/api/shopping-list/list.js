const { validateDtoIn } = require('../../../middleware/validation');
const ShoppingList = require('../../../models/ShoppingList');

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

    // Построение запроса
    const query = { awid: dtoIn.awid };
    const filter = dtoIn.filter || 'all';
    
    if (filter === 'archived') {
      query.state = 'archived';
    } else if (filter === 'active') {
      query.state = 'active';
    }

    // Фильтрация по пользователю
    query.$or = [
      { ownerUuIdentity: session.uuIdentity },
      { 'members.uuIdentity': session.uuIdentity }
    ];

    // Пагинация
    const pageIndex = parseInt(dtoIn.pageInfo?.pageIndex) || 0;
    const pageSize = parseInt(dtoIn.pageInfo?.pageSize) || 20;
    const skip = pageIndex * pageSize;

    // Получение списков
    const lists = await ShoppingList.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort({ updated: -1 });

    const total = await ShoppingList.countDocuments(query);

    const itemList = lists.map(list => ({
      id: list._id.toString(),
      name: list.name,
      state: list.state,
      ownerUuIdentity: list.ownerUuIdentity,
      progress: list.progress,
      memberCount: list.memberCount,
      updated: list.updated.toISOString()
    }));

    const dtoOut = {
      awid: dtoIn.awid,
      itemList,
      pageInfo: {
        pageIndex,
        pageSize,
        total
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



