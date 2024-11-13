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
      url: 'https://your_app_hostname.com',
    },
  },
  additionalEnv: {
    ALGOLIA_APP_ID: "${env:REACT_APP_ALGOLIA_APP_ID}",
    ALGOLIA_WRITE_API_KEY: "${env:REACT_APP_ALGOLIA_WRITE_API_KEY}",
    ALGOLIA_SEARCH_API_KEY: "${env:REACT_APP_ALGOLIA_SEARCH_API_KEY}",
    ALGOLIA_USAGE_API_KEY: "${env:REACT_APP_ALGOLIA_USAGE_API_KEY}",
  },
  headers: {
        csp: {
          'connect-src': ["https://${env:REACT_APP_ALGOLIA_APP_ID}-dsn.algolia.net","https://analytics.de.algolia.com","https://usage.algolia.com","https://c8-uk-3.algolianet.com"],
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