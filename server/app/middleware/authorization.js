const { checkAuthorization, PROFILES } = require('../config/profiles');

// Middleware для проверки авторизации
function requireAuth(requiredProfiles = [PROFILES.OPERATIVES, PROFILES.AUTHORITIES]) {
  return (req, res, next) => {
    if (!req.session || !req.session.uuIdentity) {
      return res.status(401).json({
        status: 401,
        error: 'User not authenticated',
        uuAppErrorMap: {
          'shoppingList/authenticationError': {
            message: 'User not authenticated',
            paramMap: {}
          }
        }
      });
    }
    
    if (!checkAuthorization(req.session, requiredProfiles)) {
      return res.status(403).json({
        status: 403,
        error: 'User not authorized',
        uuAppErrorMap: {
          'shoppingList/authorizationError': {
            message: 'User not authorized',
            paramMap: {}
          }
        }
      });
    }
    
    next();
  };
}

module.exports = {
  requireAuth
};

