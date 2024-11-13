import { lazy } from 'react';

const Analytics = lazy(
  () => import('./analytics' /* webpackChunkName: "analytics" */)
);

export default Analytics;