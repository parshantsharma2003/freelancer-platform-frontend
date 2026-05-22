const rawApiUrl =
  import.meta.env.VITE_API_URL ||
  'https://freelancerpro-e7cbdnb6bkayc2f8.eastasia-01.azurewebsites.net/api';

const rawSocketUrl =
  import.meta.env.VITE_SOCKET_URL ||
  'https://freelancerpro-e7cbdnb6bkayc2f8.eastasia-01.azurewebsites.net';

const normalizedApiUrl = rawApiUrl.replace(/\/+$/, '');

const apiBaseUrl = normalizedApiUrl.endsWith('/api')
  ? normalizedApiUrl
  : `${normalizedApiUrl}/api`;

const apiOrigin = apiBaseUrl.replace(/\/api$/i, '');

export const ENV = {
  API_BASE_URL: apiBaseUrl,
  API_ORIGIN: apiOrigin,
  SOCKET_URL: rawSocketUrl.replace(/\/+$/, ''),
  OAUTH_BASE_URL: `${apiOrigin}/api`,
};
