const { validateDtoIn } = require('../../../middleware/validation');
const ShoppingList = require('../../../models/ShoppingList');

const unarchiveSchema = {
  required: ['id', 'awid'],
  fields: {
    id: { type: 'string', required: true },
    awid: { type: 'string', required: true }
  }
};

async function unarchive(req, res) {
  try {
    const dtoIn = req.body;
    const session = req.session;
    let uuAppErrorMap = {};

    const validation = validateDtoIn(dtoIn, unarchiveSchema);
    if (!validation.valid) {
      return res.status(400).json({
        status: 400,
        error: validation.errors[0],
        uuAppErrorMap: {
          'shoppingList/unarchive/validationError': {
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
          'shoppingList/unarchive/authenticationError': {
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
          'shoppingList/unarchive/authorizationError': {
            message: 'User not authorized',
            paramMap: {}
          }
        }
      });
    }

    const list = await ShoppingList.findById(dtoIn.id);

    if (!list) {
      return res.status(404).json({
        status: 404,
        error: 'List not found',
        uuAppErrorMap: {
          'shoppingList/unarchive/listNotFound': {
            message: 'List not found',
            paramMap: {}
          }
        }
      });
    }

    if (list.ownerUuIdentity !== session.uuIdentity) {
      return res.status(403).json({
        status: 403,
        error: 'Only owner can unarchive list',
        uuAppErrorMap: {
          'shoppingList/unarchive/accessDenied': {
            message: 'Only owner can unarchive list',
            paramMap: {}
          }
        }
      });
    }

    list.state = 'active';
    list.updated = new Date();
    const unarchivedList = await list.save();

    const dtoOut = {
      awid: unarchivedList.awid,
      id: unarchivedList._id.toString(),
      state: unarchivedList.state,
      uuAppErrorMap
    };

    res.status(200).json(dtoOut);
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
      uuAppErrorMap: {
        'shoppingList/unarchive/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = unarchive;



