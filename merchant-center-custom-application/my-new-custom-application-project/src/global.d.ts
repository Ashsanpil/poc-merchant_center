export {};

declare global {
  interface Window {
    app: {
      ALGOLIA_APP_ID?: string;
      ALGOLIA_WRITE_API_KEY?: string;
      ALGOLIA_SEARCH_API_KEY?: string;
      ALGOLIA_USAGE_API_KEY?: string;
    };
  }
}