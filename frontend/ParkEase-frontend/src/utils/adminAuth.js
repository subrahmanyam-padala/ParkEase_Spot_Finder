const ADMIN_SESSION_KEY = 'parkease_admin_session';

export const setAdminSession = (adminPayload) => {
  const session = {
    token: adminPayload.token,
    id: adminPayload.id,
    name: adminPayload.name,
    email: adminPayload.email,
    mobile: adminPayload.mobile,
    adminId: adminPayload.adminId,
    status: adminPayload.status,
    createdAt: adminPayload.createdAt,
    loggedInAt: new Date().toISOString(),
  };

  localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  return session;
};

export const getAdminSession = () => {
  try {
    return JSON.parse(localStorage.getItem(ADMIN_SESSION_KEY));
  } catch {
    return null;
  }
};

export const clearAdminSession = () => {
  localStorage.removeItem(ADMIN_SESSION_KEY);
};

export const isAdminLoggedIn = () => Boolean(getAdminSession()?.token);
