const { validateDtoIn } = require('../../../middleware/validation');

const toggleResolvedSchema = {
  required: ['id', 'shoppingListId', 'awid'],
  fields: {
    id: { type: 'string', required: true },
    shoppingListId: { type: 'string', required: true },
    awid: { type: 'string', required: true }
  }
};

async function toggleResolved(req, res) {
  try {
    const dtoIn = req.body;
    const session = req.session;
    let uuAppErrorMap = {};

    const validation = validateDtoIn(dtoIn, toggleResolvedSchema);
    if (!validation.valid) {
      return res.status(400).json({
        status: 400,
        error: validation.errors[0],
        uuAppErrorMap: {
          'shoppingListItem/toggleResolved/validationError': {
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
          'shoppingListItem/toggleResolved/authenticationError': {
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
          'shoppingListItem/toggleResolved/authorizationError': {
            message: 'User not authorized',
            paramMap: {}
          }
        }
      });
    }

    const dtoOut = {
      awid: dtoIn.awid,
      id: dtoIn.id,
      shoppingListId: dtoIn.shoppingListId,
      resolved: true, // В реальном приложении будет переключение состояния
      uuAppErrorMap
    };

    res.status(200).json(dtoOut);
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
      uuAppErrorMap: {
        'shoppingListItem/toggleResolved/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = toggleResolved;

