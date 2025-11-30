const { validateDtoIn } = require('../../../middleware/validation');
const ShoppingList = require('../../../models/ShoppingList');

const removeMemberSchema = {
  required: ['id', 'awid', 'memberUuIdentity'],
  fields: {
    id: { type: 'string', required: true },
    awid: { type: 'string', required: true },
    memberUuIdentity: { type: 'string', required: true }
  }
};

async function removeMember(req, res) {
  try {
    const dtoIn = req.body;
    const session = req.session;
    let uuAppErrorMap = {};

    const validation = validateDtoIn(dtoIn, removeMemberSchema);
    if (!validation.valid) {
      return res.status(400).json({
        status: 400,
        error: validation.errors[0],
        uuAppErrorMap: {
          'shoppingListMember/removeMember/validationError': {
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
          'shoppingListMember/removeMember/authenticationError': {
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
          'shoppingListMember/removeMember/authorizationError': {
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
          'shoppingListMember/removeMember/listNotFound': {
            message: 'List not found',
            paramMap: {}
          }
        }
      });
    }

    if (list.ownerUuIdentity !== session.uuIdentity) {
      return res.status(403).json({
        status: 403,
        error: 'Only owner can remove members',
        uuAppErrorMap: {
          'shoppingListMember/removeMember/accessDenied': {
            message: 'Only owner can remove members',
            paramMap: {}
          }
        }
      });
    }

    // Нельзя удалить владельца
    const memberToRemove = list.members.find(m => m.uuIdentity === dtoIn.memberUuIdentity);
    if (memberToRemove && memberToRemove.isOwner) {
      return res.status(400).json({
        status: 400,
        error: 'Cannot remove owner',
        uuAppErrorMap: {
          'shoppingListMember/removeMember/cannotRemoveOwner': {
            message: 'Cannot remove owner',
            paramMap: {}
          }
        }
      });
    }

    list.members = list.members.filter(m => m.uuIdentity !== dtoIn.memberUuIdentity);
    list.updated = new Date();
    const updatedList = await list.save();

    const dtoOut = {
      awid: updatedList.awid,
      id: updatedList._id.toString(),
      members: updatedList.members,
      memberCount: updatedList.memberCount,
      uuAppErrorMap
    };

    res.status(200).json(dtoOut);
  } catch (error) {
    res.status(500).json({
      status: 500,
      error: error.message,
      uuAppErrorMap: {
        'shoppingListMember/removeMember/unexpectedError': {
          message: error.message,
          paramMap: {}
        }
      }
    });
  }
}

module.exports = removeMember;



