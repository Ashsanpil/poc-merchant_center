import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spacings from '@commercetools-uikit/spacings';
import PrimaryButton from '@commercetools-uikit/primary-button'; // Import PrimaryButton
import Text from '@commercetools-uikit/text';
import MultilineTextInput from '@commercetools-uikit/multiline-text-input';
import SearchTextInput from '@commercetools-uikit/search-text-input';
import Label from '@commercetools-uikit/label';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { useIntl, FormattedMessage } from 'react-intl';
import messages from './messages';
import Collapsible from '@commercetools-uikit/collapsible';
import { Link as RouterLink, useRouteMatch } from 'react-router-dom';
import styles from './index-records.module.css';
import Card from '@commercetools-uikit/card';
import { ArrowDownIcon,ScreenUserIcon,ScreenGearIcon, BrainIcon,InformationIcon } from '@commercetools-uikit/icons'; // Import InformationIcon

interface Category {
  en: string;
}

interface Record {
  name: {
    en: string;
  };
  productType: string;
  categories: Category[];
  objectID: string;
}

const IndexRecords: React.FC = () => {
  const intl = useIntl();
  const match = useRouteMatch();
  console.log('Current URL:', match.url);  // Log the current match URL for debugging

  // Strip the "/index-records" part from the URL to get the base path
  const basePath = `${match.url.split('/index-records')[0]}`;
  console.log('Base URL:', basePath);  // Log the base URL for debugging

  const [indexName, setIndexName] = useState<string>('');
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchRecords = async () => {
    try {
      const response = await axios.get(
        `https://${window.app.ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${indexName}/browse`,
        {
          headers: {
            'X-Algolia-Application-Id': window.app.ALGOLIA_APP_ID,
            'X-Algolia-API-Key': window.app.ALGOLIA_WRITE_API_KEY,
          },
        }
      );
      setRecords(response.data.hits);
      setFilteredRecords(response.data.hits);
      setError(null);
    } catch (err) {
      setError(intl.formatMessage(messages.fetchRecordsError));
      setRecords([]);
      setFilteredRecords([]);
    }
  };

  useEffect(() => {
    const filtered = records.filter((record) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        record.name.en.toLowerCase().includes(searchTermLower) ||
        record.objectID.toLowerCase().includes(searchTermLower) ||
        record.productType.toLowerCase().includes(searchTermLower) ||
        record.categories.some((cat) => cat.en.toLowerCase().includes(searchTermLower))
      );
    });
    setFilteredRecords(filtered);
  }, [searchTerm, records]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchReset = () => {
    setSearchTerm('');
  };

  const handleDeleteRecord = async (objectID: string) => {
    try {
      await axios.delete(
        `https://${window.app.ALGOLIA_APP_ID}-dsn.algolia.net/1/indexes/${indexName}/${objectID}`,
        {
          headers: {
            'X-Algolia-Application-Id': window.app.ALGOLIA_APP_ID,
            'X-Algolia-API-Key': window.app.ALGOLIA_WRITE_API_KEY,
          },
        }
      );
      await fetchRecords();
    } catch (err) {
      setError(intl.formatMessage(messages.deleteRecordError));
    }
  };

  return (
    <Spacings.Stack scale="l">
      {/* New container for index name input and fetch button */}
      <Spacings.Stack>
        <div className={styles.recordBtnContainer}>
          <PrimaryButton
            as={RouterLink}
            to={`${basePath}/analytics`}
            iconLeft={<ScreenUserIcon />}
            label={intl.formatMessage({ id: 'Channels.goToAnalytics', defaultMessage: 'Analytics' })}
          />
          <PrimaryButton
            as={RouterLink}
            to={`${basePath}/index-logs`}
            iconLeft={<BrainIcon />}
            label={intl.formatMessage({ id: 'Channels.goToIndexLogs', defaultMessage: 'Index Logs' })}
          />
          <PrimaryButton
            as={RouterLink}
            to={`${basePath}/update-configuration`}
            iconLeft={<ScreenGearIcon />}
            label={intl.formatMessage({ id: 'Channels.goToUpdateConfiguration', defaultMessage: 'Update Index Configuration' })}
          />
        </div>
      </Spacings.Stack>
      <Text.Headline as="h1">{'ALGOLIA CONFIGURATOR'}</Text.Headline>
      <Card theme="dark" type="raised">
      <p>{` Welcome to Configurator, here you can get analytics, logs, index records from Algolia. 
            Also, you can update the settings of an index by providing the new settings in a JSON format. `}</p>
      </Card>
      <Text.Headline as="h3">
      Here you get the records of an index.
      </Text.Headline>
      <Spacings.Stack>
        <Label htmlFor="indexName" isBold={true}>
          <FormattedMessage {...messages.indexNameLabel} />
        </Label>
        <div className={styles.inputContainer}>
          <MultilineTextInput
            id="indexName"
            placeholder={intl.formatMessage(messages.indexNamePlaceholder)}
            value={indexName}
            onChange={(e) => setIndexName(e.target.value)}
          />
          <PrimaryButton
            iconLeft={<ArrowDownIcon />}
            label={intl.formatMessage(messages.fetchRecords)}
            onClick={fetchRecords}
            isDisabled={!indexName} // Disable if indexName is empty
          />
        </div>
      </Spacings.Stack>

      {error && (
        <ContentNotification type="error">
          {error}
        </ContentNotification>
      )}
      {!error && records.length === 0 && (
        <ContentNotification type="info">
          {intl.formatMessage(messages.noRecordsFound)}
        </ContentNotification>
      )}


      {records.length > 0 && (
        <div className={styles.recordContainer}>
          <Text.Headline as="h3" intlMessage={messages.indexRecordsTitle} />
          <SearchTextInput
            placeholder={intl.formatMessage(messages.searchPlaceholder)}
            value={searchTerm}
            onChange={handleSearchChange}
            onReset={handleSearchReset}
            onSubmit={fetchRecords}
          />
          <div className={styles.scrollableContainer}>
            <Spacings.Stack scale="m">
              {filteredRecords.map((record, index) => (
                <Collapsible key={index} isDefaultClosed>
                  {({ isOpen, toggle }) => (
                    <div className={styles.recordCard}>
                      <div className={styles.recordHeader}>
                        <div className={styles.recordInfo} onClick={() => toggle && toggle()}>
                          <Text.Headline as="h2">
                            Record {index + 1}: {record.name.en}
                          </Text.Headline>
                          <Text.Body>Product Type: {record.productType}</Text.Body>
                          <Text.Body>Categories: {record.categories.map((cat: Category) => cat.en).join(', ')}</Text.Body>
                          <Text.Body>Object ID: {record.objectID}</Text.Body>
                        </div>
                        <div className={styles.recordActions}>
                          <PrimaryButton
                            iconLeft={<InformationIcon />}
                            label={intl.formatMessage(messages.deleteRecord)}
                            onClick={() => handleDeleteRecord(record.objectID)}
                            tone="critical"
                          />
                          <span className={styles.toggleIcon} onClick={() => toggle && toggle()}>
                            {isOpen ? '▼' : '▲'}
                          </span>
                        </div>
                      </div>
                      {isOpen && (
                        <div className={styles.recordDetails}>
                          <Text.Body>
                            <pre>{JSON.stringify(record, null, 2)}</pre>
                          </Text.Body>
                        </div>
                      )}
                    </div>
                  )}
                </Collapsible>
              ))}
            </Spacings.Stack>
          </div>
        </div>
      )}
    </Spacings.Stack>
  );
};

export default IndexRecords;