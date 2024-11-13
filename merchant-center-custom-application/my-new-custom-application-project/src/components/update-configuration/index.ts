import { lazy } from 'react';

const UpdateConfiguration = lazy(
  () => import('./update-configuration' /* webpackChunkName: "update-configuration" */)
);

export default UpdateConfiguration;