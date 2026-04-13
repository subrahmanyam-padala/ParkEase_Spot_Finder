const envBaseUrl = process.env.REACT_APP_API_BASE_URL;

const normalizedBase =
  (envBaseUrl && envBaseUrl.trim().replace(/\/+$/, '')) ||
  'https://parkease-spot-finder.onrender.com';

export const BASE_URL = normalizedBase.endsWith('/api')
  ? normalizedBase.replace(/\/api$/, '')
  : normalizedBase;

export const API_BASE_URL = `${BASE_URL}/api`;
