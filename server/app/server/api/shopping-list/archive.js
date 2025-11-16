const { validateDtoIn } = require('../../../middleware/validation');
const { isOwner } = require('../../../config/profiles');

const archiveSchema = {
  required: ['id', 'awid'],
  fields: {
    id: { type: 'string', required: true },
    awid: { type: 'string', required: true }
  }
};

async function archive(req, res) {
  try {
    const dtoIn = req.body;
    const session = req.session;
    let uuAppErrorMap = {};

    const validation = validateDtoIn(dtoIn, archiveSchema);
    if (!validation.valid) {
      return res.status(400).json({
        status: 400,
        error: validation.errors[0],
        uuAppErrorMap: {
          'shoppingList/archive/validationError': {
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
          'shoppingList/archive/authenticationError': {
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
          'shoppingList/archive/authorizationError': {
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
        error: 'Only owner can archive the list',
        uuAppErrorMap: {
          'shoppingList/archive/ownerOnlyError': {
            message: 'Only owner can archive the list',
            paramMap: {}
          }
        }
      });
    }

    const dtoOut = {
      awid: dtoIn.awid,
      id: dtoIn.id,
      state: 'archived',
      uuAppErrorMap
    };

    res.status(200).json(dtoOut);
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
      uuAppErrorMap: {
        'shoppingList/archive/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = archive;

