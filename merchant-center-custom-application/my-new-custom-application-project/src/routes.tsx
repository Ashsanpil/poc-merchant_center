import type { ReactNode } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import Spacings from '@commercetools-uikit/spacings';
import Channels from './components/channels';
import Analytics from './components/analytics';
import IndexLogs from './components/index-logs';
import IndexRecords from './components/index-records';
import UpdateConfiguration from './components/update-configuration';

type ApplicationRoutesProps = {
  children?: ReactNode;
};

const ApplicationRoutes = (_props: ApplicationRoutesProps) => {
  const match = useRouteMatch();

  // Ensure the base path is taken from `match.url`, which is the root URL
  const basePath = `${match.url.split('/index-records')[0]}`; 

  return (
    <Spacings.Inset scale="l">
      <Switch>
        <Route path={`${basePath}/channels`}>
          <Channels linkToWelcome={basePath} />
        </Route>
        <Route path={`${basePath}/analytics`} component={Analytics} />
        <Route path={`${basePath}/index-logs`} component={IndexLogs} />
        <Route path={`${basePath}/index-records`} component={IndexRecords} />
        <Route path={`${basePath}/update-configuration`} component={UpdateConfiguration} />
        <Route>
          <IndexRecords/>
        </Route>
      </Switch>
    </Spacings.Inset>
  );
};

ApplicationRoutes.displayName = 'ApplicationRoutes';

export default ApplicationRoutes;
