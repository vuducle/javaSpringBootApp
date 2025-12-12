// Default production environment file. This may be overwritten by `scripts/generate-env.js`.
export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:8088',
  authLoginPath: '/api/auth/login',
  tokenStorageKey: 'jwt_token',
};
