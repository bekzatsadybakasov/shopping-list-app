const { validateDtoIn } = require('../../../middleware/validation');
const { isOwner } = require('../../../config/profiles');

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

    const mockOwnerUuIdentity = 'owner123';
    if (!isOwner(session, mockOwnerUuIdentity) && !session.authorizedProfiles.includes('Authorities')) {
      return res.status(403).json({
        status: 403,
        error: 'Only owner can unarchive the list',
        uuAppErrorMap: {
          'shoppingList/unarchive/ownerOnlyError': {
            message: 'Only owner can unarchive the list',
            paramMap: {}
          }
        }
      });
    }

    const dtoOut = {
      awid: dtoIn.awid,
      id: dtoIn.id,
      state: 'active',
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

