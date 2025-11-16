const { validateDtoIn } = require('../../../middleware/validation');
const { isMember } = require('../../../config/profiles');

const leaveSchema = {
  required: ['id', 'awid'],
  fields: {
    id: { type: 'string', required: true },
    awid: { type: 'string', required: true }
  }
};

async function leave(req, res) {
  try {
    const dtoIn = req.body;
    const session = req.session;
    let uuAppErrorMap = {};

    const validation = validateDtoIn(dtoIn, leaveSchema);
    if (!validation.valid) {
      return res.status(400).json({
        status: 400,
        error: validation.errors[0],
        uuAppErrorMap: {
          'shoppingListMember/leave/validationError': {
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
          'shoppingListMember/leave/authenticationError': {
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
          'shoppingListMember/leave/authorizationError': {
            message: 'User not authorized',
            paramMap: {}
          }
        }
      });
    }

    // Проверка, что пользователь является участником (не owner)
    const mockMembers = [
      { uuIdentity: 'owner123', isOwner: true },
      { uuIdentity: session.uuIdentity, isOwner: false }
    ];
    if (!isMember(session, mockMembers) || isMember(session, mockMembers.filter(m => m.isOwner))) {
      return res.status(403).json({
        status: 403,
        error: 'Only members (not owners) can leave the list',
        uuAppErrorMap: {
          'shoppingListMember/leave/memberOnlyError': {
            message: 'Only members (not owners) can leave the list',
            paramMap: {}
          }
        }
      });
    }

    const dtoOut = {
      awid: dtoIn.awid,
      id: dtoIn.id,
      left: true,
      uuAppErrorMap
    };

    res.status(200).json(dtoOut);
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
      uuAppErrorMap: {
        'shoppingListMember/leave/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = leave;

