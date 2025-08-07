export const API_CONFIG = {
  development: {
    baseUrl: 'https://juneh2633.ddns.net',
  },
  production: {
    baseUrl: 'http://localhost:3000',
  },
};

export const getApiBaseUrl = () => {
  const environment = process.env.NODE_ENV || 'development';
  return API_CONFIG[environment as keyof typeof API_CONFIG]?.baseUrl || API_CONFIG.development.baseUrl;
}; 