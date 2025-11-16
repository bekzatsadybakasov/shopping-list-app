const { validateDtoIn } = require('../../../middleware/validation');
const { isOwner } = require('../../../config/profiles');

const addMemberSchema = {
  required: ['id', 'awid', 'memberUuIdentity'],
  fields: {
    id: { type: 'string', required: true },
    awid: { type: 'string', required: true },
    memberUuIdentity: { type: 'string', required: true }
  }
};

async function addMember(req, res) {
  try {
    const dtoIn = req.body;
    const session = req.session;
    let uuAppErrorMap = {};

    const validation = validateDtoIn(dtoIn, addMemberSchema);
    if (!validation.valid) {
      return res.status(400).json({
        status: 400,
        error: validation.errors[0],
        uuAppErrorMap: {
          'shoppingListMember/addMember/validationError': {
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
          'shoppingListMember/addMember/authenticationError': {
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
          'shoppingListMember/addMember/authorizationError': {
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
        error: 'Only owner can add members',
        uuAppErrorMap: {
          'shoppingListMember/addMember/ownerOnlyError': {
            message: 'Only owner can add members',
            paramMap: {}
          }
        }
      });
    }

    const dtoOut = {
      awid: dtoIn.awid,
      id: dtoIn.id,
      members: [
        { uuIdentity: 'owner123', isOwner: true },
        { uuIdentity: dtoIn.memberUuIdentity, isOwner: false }
      ],
      memberCount: 2,
      uuAppErrorMap
    };

    res.status(200).json(dtoOut);
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
      uuAppErrorMap: {
        'shoppingListMember/addMember/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = addMember;

