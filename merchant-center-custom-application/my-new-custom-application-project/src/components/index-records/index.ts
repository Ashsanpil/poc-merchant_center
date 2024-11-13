import { lazy } from 'react';

const IndexRecords = lazy(
  () => import('./index-records' /* webpackChunkName: "index-records" */)
);

export default IndexRecords;