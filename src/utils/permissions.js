export const ROLE_PERMISSIONS = {
  // --- SUPER ADMIN ---
  admin: [
    'VIEW_DASHBOARD',
    'MANAGE_MATCHES',
    'MANAGE_FOLDERS',
    'MANAGE_MAPS',
    'MANAGE_USERS',
    'MANAGE_ADMINS',
    'FINISH_MATCH',
    'MANAGE_WALLET',
    'MANAGE_SETTINGS',
    'DELETE_ACCESS'
  ],
  // --- SUB ADMIN ---
  sub_admin: [
    'VIEW_DASHBOARD',
    'MANAGE_MATCHES',
    'MANAGE_FOLDERS',
    'MANAGE_MAPS',
    'MANAGE_USERS'
  ],
  // --- USER ---
  user: []
};

export const hasPermission = (role, action) => {
  if (!role) return false;
  const allowedActions = ROLE_PERMISSIONS[role];
  return allowedActions ? allowedActions.includes(action) : false;
};

export const isRestricted = (role) => {
  return role === 'sub_admin';
};