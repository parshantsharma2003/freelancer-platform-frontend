const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '');

const apiBaseUrl = normalizedApiUrl.endsWith('/api')
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

const apiOrigin = apiBaseUrl.replace(/\/api$/i, '');

export const ENV = {
  API_BASE_URL: apiBaseUrl,
  API_ORIGIN: apiOrigin,
  OAUTH_BASE_URL: `${apiOrigin}/api`,
};
