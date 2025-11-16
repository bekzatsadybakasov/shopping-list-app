// Application Profiles
const PROFILES = {
  AUTHORITIES: 'Authorities',
  OPERATIVES: 'Operatives'
};

// Проверка авторизации
function checkAuthorization(session, requiredProfiles) {
  if (!session || !session.authorizedProfiles) {
    return false;
  }
  
  return session.authorizedProfiles.some(profile => 
    requiredProfiles.includes(profile)
  );
}

// Проверка, является ли пользователь владельцем
function isOwner(session, resourceOwnerUuIdentity) {
  return session.uuIdentity === resourceOwnerUuIdentity;
}

// Проверка, является ли пользователь участником
function isMember(session, members) {
  return members.some(m => m.uuIdentity === session.uuIdentity);
}

module.exports = {
  PROFILES,
  checkAuthorization,
  isOwner,
  isMember
};

