const { validateDtoIn } = require('../../../middleware/validation');
const ShoppingList = require('../../../models/ShoppingList');

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

    const list = await ShoppingList.findById(dtoIn.id);

    if (!list) {
      return res.status(404).json({
        status: 404,
        error: 'List not found',
        uuAppErrorMap: {
          'shoppingListMember/leave/listNotFound': {
            message: 'List not found',
            paramMap: {}
          }
        }
      });
    }

    // Проверка, что пользователь является участником (не owner)
    const member = list.members.find(m => m.uuIdentity === session.uuIdentity);
    if (!member) {
      return res.status(403).json({
        status: 403,
        error: 'User is not a member of this list',
        uuAppErrorMap: {
          'shoppingListMember/leave/notMember': {
            message: 'User is not a member of this list',
            paramMap: {}
          }
        }
      });
    }

    if (member.isOwner || list.ownerUuIdentity === session.uuIdentity) {
      return res.status(403).json({
        status: 403,
        error: 'Owner cannot leave the list',
        uuAppErrorMap: {
          'shoppingListMember/leave/ownerCannotLeave': {
            message: 'Owner cannot leave the list',
            paramMap: {}
          }
        }
      });
    }

    list.members = list.members.filter(m => m.uuIdentity !== session.uuIdentity);
    list.updated = new Date();
    await list.save();

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



