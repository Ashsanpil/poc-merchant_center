// my-new-custom-application-project/src/components/channels/Channels.tsx
import { useIntl } from 'react-intl';
import { Link as RouterLink, Switch, useRouteMatch } from 'react-router-dom';
import { BackIcon } from '@commercetools-uikit/icons';
import Constraints from '@commercetools-uikit/constraints';
import FlatButton from '@commercetools-uikit/flat-button';
import { ContentNotification } from '@commercetools-uikit/notifications';
import Spacings from '@commercetools-uikit/spacings';
import Text from '@commercetools-uikit/text';
import { SuspendedRoute } from '@commercetools-frontend/application-shell';
import messages from './messages';
import ChannelDetails from '../channel-details';
import UpdateConfiguration from './update-configuration';
import IndexRecords from './index-records';
import IndexLogs from './index-logs'; 
import Analytics from './analytics';

type TChannelsProps = {
  linkToWelcome: string;
};

const Channels = (props: TChannelsProps) => {
  const intl = useIntl();
  const match = useRouteMatch();

  return (
    <Spacings.Stack scale="xl">
      <Spacings.Stack scale="xs">
        <FlatButton
          as={RouterLink}
          to={props.linkToWelcome}
          label={intl.formatMessage(messages.backToWelcome)}
          icon={<BackIcon />}
        />
        <Text.Headline as="h2" intlMessage={messages.title} />
      </Spacings.Stack>

      <Constraints.Horizontal max={13}>
        <ContentNotification type="info">
          <Text.Body intlMessage={messages.demoHint} />
        </ContentNotification>
      </Constraints.Horizontal>

      <Spacings.Stack scale="l">
        <Switch>
          <SuspendedRoute path={`${match.url}/:id`}>
            <ChannelDetails onClose={() => {}} />
          </SuspendedRoute>
        </Switch>
      </Spacings.Stack>

      <UpdateConfiguration />
      <IndexRecords />

      {/* Integrate IndexLogs directly into Channels */}
      <IndexLogs />
      <Analytics /> {/* This will render the fields directly on the Channels page */}

    </Spacings.Stack>
  );
};

Channels.displayName = 'Channels';

export default Channels;