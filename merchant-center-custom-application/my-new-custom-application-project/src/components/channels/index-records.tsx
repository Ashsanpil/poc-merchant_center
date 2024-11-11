import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spacings from '@commercetools-uikit/spacings';
import FlatButton from '@commercetools-uikit/flat-button';
import Text from '@commercetools-uikit/text';
import MultilineTextInput from '@commercetools-uikit/multiline-text-input';
import SearchTextInput from '@commercetools-uikit/search-text-input';
import Label from '@commercetools-uikit/label';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { useIntl, FormattedMessage } from 'react-intl';
import messages from './messages';
import Collapsible from '@commercetools-uikit/collapsible';
import styles from './index-records.module.css';



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
      console.log('Algolia App ID:', window.app.ALGOLIA_APP_ID);
      console.log('Algolia Write API Key:', window.app.ALGOLIA_WRITE_API_KEY);
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

  const handleSearchSubmit = () => {
    setFilteredRecords(records.filter((record) => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        record.name.en.toLowerCase().includes(searchTermLower) ||
        record.objectID.toLowerCase().includes(searchTermLower) ||
        record.productType.toLowerCase().includes(searchTermLower) ||
        record.categories.some((cat) => cat.en.toLowerCase().includes(searchTermLower))
      );
    }));
  };

  return (
    <Spacings.Stack scale="l">
      <Spacings.Stack scale="xs">
        <Label htmlFor="indexName" isBold={true}>
          <FormattedMessage {...messages.indexNameLabel} />
        </Label>
        <MultilineTextInput
          id="indexName"
          placeholder={intl.formatMessage(messages.indexNamePlaceholder)}
          value={indexName}
          onChange={(e) => setIndexName(e.target.value)}
        />
      </Spacings.Stack>
      <FlatButton
        onClick={fetchRecords}
        label={intl.formatMessage(messages.fetchRecords)}
      />
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
            onSubmit={handleSearchSubmit} // Added onSubmit prop
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
                          <FlatButton
                            onClick={() => handleDeleteRecord(record.objectID)}
                            label={intl.formatMessage(messages.deleteRecord)}
                            tone="critical"
                          />
                          <span className={styles.toggleIcon} onClick={() => toggle && toggle()}>
                            {isOpen ? '▼' : '▶'}
                          </span>
                        </div>
                      </div>
                      {isOpen && (
                        <div className={styles.recordDetails}>
                          <pre>{JSON.stringify(record, null, 2)}</pre>
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