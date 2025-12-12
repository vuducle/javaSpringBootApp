// Default environment file. This may be overwritten by `scripts/generate-env.js`.
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8088',
  authLoginPath: '/api/auth/login',
  tokenStorageKey: 'jwt_token',
};
