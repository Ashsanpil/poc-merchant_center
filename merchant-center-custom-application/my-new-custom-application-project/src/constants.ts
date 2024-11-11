import { entryPointUriPathToPermissionKeys } from '@commercetools-frontend/application-shell/ssr';

export const entryPointUriPath = 'algolia-configurator';

export const PERMISSIONS = entryPointUriPathToPermissionKeys(entryPointUriPath);

export const CONSTANTS = {
  API_PATH: '/poc-algolia-integration/algolia-configurator/api',
};

