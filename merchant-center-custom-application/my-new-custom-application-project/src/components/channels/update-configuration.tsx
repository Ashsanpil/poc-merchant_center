import React, { useState } from 'react';
import axios from 'axios';
import Spacings from '@commercetools-uikit/spacings';
import FlatButton from '@commercetools-uikit/flat-button';
import MultilineTextInput from '@commercetools-uikit/multiline-text-input';
import Label from '@commercetools-uikit/label';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { useIntl, FormattedMessage } from 'react-intl';
import messages from './messages';

const UpdateConfiguration: React.FC = () => {
  const intl = useIntl();
  const [indexName, setIndexName] = useState<string>('');
  const [indexConfig, setIndexConfig] = useState<string>('');
  const [currentSettings, setCurrentSettings] = useState<any>(null); // State to hold current index settings
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleFetchSettings = async () => {
    try {
      if (!indexName) {
        throw new Error(intl.formatMessage(messages.missingFields));
      }

      const response = await axios.get(
        `https://${window.app.ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${indexName}/settings`,
        {
          headers: {
            'X-Algolia-Application-Id': window.app.ALGOLIA_APP_ID,
            'X-Algolia-API-Key': window.app.ALGOLIA_WRITE_API_KEY,
          },
        }
      );

      setCurrentSettings(response.data);
      setError(null);
      setSuccess(intl.formatMessage(messages.settingsFetched));
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(intl.formatMessage(messages.fetchFailed));
      } else {
        setError(intl.formatMessage(messages.generalError));
      }
      setCurrentSettings(null);
      setSuccess(null);
    }
  };

  const handleUpdate = async () => {
    try {
      if (!indexName || !indexConfig) {
        throw new Error(intl.formatMessage(messages.missingFields));
      }

      const config = JSON.parse(indexConfig);

      await axios.put(
        `https://${window.app.ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${indexName}/settings`,
        config,
        {
          headers: {
            'X-Algolia-Application-Id': window.app.ALGOLIA_APP_ID,
            'X-Algolia-API-Key': window.app.ALGOLIA_WRITE_API_KEY,
            'Content-Type': 'application/json',
          },
        }
      );

      setSuccess(intl.formatMessage(messages.configUpdated));
      setIndexName('');
      setIndexConfig('');
      setError(null);
      setCurrentSettings(null); // Clear current settings after update
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError(intl.formatMessage(messages.invalidJson));
      } else if (axios.isAxiosError(err)) {
        setError(intl.formatMessage(messages.updateFailed));
      } else {
        setError(intl.formatMessage(messages.generalError));
      }
      setSuccess(null);
    }
  };

  return (
    <Spacings.Stack scale="l">
      <Spacings.Stack scale="xs">
        <Label htmlFor="updateIndexName" isBold={true}>
          <FormattedMessage {...messages.indexNameLabel} />
        </Label>
        <MultilineTextInput
          id="updateIndexName"
          placeholder={intl.formatMessage(messages.indexNamePlaceholder)}
          value={indexName}
          onChange={(e) => setIndexName(e.target.value)}
        />
      </Spacings.Stack>

      <FlatButton onClick={handleFetchSettings} label={intl.formatMessage(messages.fetchSettings)} />

      {currentSettings && (
        <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '10px' }}>
          <h4>{intl.formatMessage(messages.currentSettingsTitle)}</h4>
          <pre>{JSON.stringify(currentSettings, null, 2)}</pre> {/* Display the current settings in a formatted way */}
        </div>
      )}

      <Spacings.Stack scale="xs">
        <Label htmlFor="updateIndexConfig" isBold ={true}>
          <FormattedMessage {...messages.indexConfigLabel} />
        </Label>
        <MultilineTextInput
          id="updateIndexConfig"
          placeholder={intl.formatMessage(messages.indexConfigPlaceholder)}
          value={indexConfig}
          onChange={(e) => setIndexConfig(e.target.value)}
        />
      </Spacings.Stack>

      {error && (
        <ContentNotification type="error">
          {error}
        </ContentNotification>
      )}
      {success && (
        <ContentNotification type="success">
          {success}
        </ContentNotification>
      )}
      <FlatButton onClick={handleUpdate} label={intl.formatMessage(messages.updateConfig)} />
    </Spacings.Stack>
  );
};

export default UpdateConfiguration;