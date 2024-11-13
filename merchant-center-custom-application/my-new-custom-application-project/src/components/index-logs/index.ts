import { lazy } from 'react';

const IndexLogs = lazy(
  () => import('./index-logs' /* webpackChunkName: "index-logs" */)
);

export default IndexLogs;