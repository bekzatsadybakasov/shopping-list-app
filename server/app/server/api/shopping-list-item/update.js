const { validateDtoIn } = require('../../../middleware/validation');

const updateSchema = {
  required: ['id', 'shoppingListId', 'awid'],
  fields: {
    id: { type: 'string', required: true },
    shoppingListId: { type: 'string', required: true },
    awid: { type: 'string', required: true },
    name: { type: 'string', min: 1, max: 200 },
    quantity: { type: 'number', min: 1 },
    measure: { type: 'string', min: 1, max: 50 }
  }
};

async function update(req, res) {
  try {
    const dtoIn = req.body;
    const session = req.session;
    let uuAppErrorMap = {};

    const validation = validateDtoIn(dtoIn, updateSchema);
    if (!validation.valid) {
      return res.status(400).json({
        status: 400,
        error: validation.errors[0],
        uuAppErrorMap: {
          'shoppingListItem/update/validationError': {
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
          'shoppingListItem/update/authenticationError': {
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
          'shoppingListItem/update/authorizationError': {
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
      name: dtoIn.name || 'Updated Item',
      quantity: dtoIn.quantity || 1,
      measure: dtoIn.measure || 'pcs',
      resolved: false,
      uuAppErrorMap
    };

    res.status(200).json(dtoOut);
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
      uuAppErrorMap: {
        'shoppingListItem/update/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = update;

