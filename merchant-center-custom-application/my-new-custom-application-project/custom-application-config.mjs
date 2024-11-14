import { PERMISSIONS, entryPointUriPath } from './src/constants';

const config = {
  name: 'Algolia Configurator',
  entryPointUriPath,
  cloudIdentifier: 'gcp-eu',
  env: {
    development: {
      initialProjectKey: 'poc-algolia-integration',
      
    },
    production: {
      applicationId: 'TODO',
      url: 'https://mc-app-alg.vercel.app',
    },
  },
  additionalEnv: {
    ALGOLIA_APP_ID: "ash",
    ALGOLIA_WRITE_API_KEY: "ash",
    ALGOLIA_SEARCH_API_KEY: "ash",
    ALGOLIA_USAGE_API_KEY: "ash",
  },
  headers: {
        csp: {
          'connect-src': ["https://ash-dsn.algolia.net","https://analytics.de.algolia.com","https://usage.algolia.com","https://c8-uk-3.algolianet.com"],
        }
      },
  
  oAuthScopes: {
    view: ['view_products'],
    manage: ['manage_products'],
  },
  icon: '${path:@commercetools-frontend/assets/application-icons/rocket.svg}',
  mainMenuLink: {
    defaultLabel: 'Algolia Configurator',
    labelAllLocales: [],
    permissions: [PERMISSIONS.View],
  },
  submenuLinks: [
    {
      uriPath: 'update-configuration',
      defaultLabel: 'Algolia Settings',
      labelAllLocales: [],
      permissions: [PERMISSIONS.View],
    },
  ],
};

export default config;
