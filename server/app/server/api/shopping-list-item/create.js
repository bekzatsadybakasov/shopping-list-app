const { validateDtoIn } = require('../../../middleware/validation');

const createSchema = {
  required: ['shoppingListId', 'awid', 'name', 'quantity', 'measure'],
  fields: {
    shoppingListId: { type: 'string', required: true },
    awid: { type: 'string', required: true },
    name: { type: 'string', min: 1, max: 200 },
    quantity: { type: 'number', min: 1 },
    measure: { type: 'string', min: 1, max: 50 }
  }
};

async function create(req, res) {
  try {
    const dtoIn = req.body;
    const session = req.session;
    let uuAppErrorMap = {};

    const validation = validateDtoIn(dtoIn, createSchema);
    if (!validation.valid) {
      return res.status(400).json({
        status: 400,
        error: validation.errors[0],
        uuAppErrorMap: {
          'shoppingListItem/create/validationError': {
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
          'shoppingListItem/create/authenticationError': {
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
          'shoppingListItem/create/authorizationError': {
            message: 'User not authorized',
            paramMap: {}
          }
        }
      });
    }

    const dtoOut = {
      awid: dtoIn.awid,
      id: `item-${Date.now()}`,
      shoppingListId: dtoIn.shoppingListId,
      name: dtoIn.name.trim(),
      quantity: dtoIn.quantity,
      measure: dtoIn.measure.trim(),
      resolved: false,
      uuAppErrorMap
    };

    res.status(200).json(dtoOut);
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
      uuAppErrorMap: {
        'shoppingListItem/create/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = create;

