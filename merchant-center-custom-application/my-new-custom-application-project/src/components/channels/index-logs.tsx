import React, { useState } from 'react';
import axios from 'axios';
import Spacings from '@commercetools-uikit/spacings';
import FlatButton from '@commercetools-uikit/flat-button';
import MultilineTextInput from '@commercetools-uikit/multiline-text-input';
import Label from '@commercetools-uikit/label';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { useIntl, FormattedMessage } from 'react-intl';
import messages from './messages';

// Define the interface for the usage record
interface UsageRecord {
  t: number; // Timestamp
  v: number; // Total records
}

interface SearchLog {
  method: string;
  url: string;
  answer_code: string;
}

const IndexLogs: React.FC = () => {
  const intl = useIntl();
  const [index, setIndex] = useState<string>(''); // State for index
  const [logs, setLogs] = useState<any[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]); // State for search logs
  const [error, setError] = useState<string | null>(null);

  // Fixed start date in the required format
  const startDate = '2024-10-20T00:00:00Z'; 
  // Set the end date to the current date in the required format
  const endDate = new Date().toISOString(); // Current date in ISO format

  const fetchLogs = async () => {
    try {
      // Validate index
      if (!index) {
        setError(intl.formatMessage({ id: 'Channels.missingFields', defaultMessage: 'Index is required.' }));
        return;
      }

      const response = await axios.get(
        `https://usage.algolia.com/1/usage/records,add_record_operations,delete_record_operations,browse_operations/${index}`,
        {
          params: {
            startDate,
            endDate,
            granularity: 'daily',
          },
          headers: {
            'X-Algolia-Application-Id': window.app.ALGOLIA_APP_ID,
            'X-Algolia-API-Key': window.app.ALGOLIA_USAGE_API_KEY,
          },
        }
      );

      // Create a map for the additional operations
      const addRecordMap = new Map<number, number>();
      const deleteRecordMap = new Map<number, number>();
      const browseOperationsMap = new Map<number, number>();

      response.data.add_record_operations.forEach((op: UsageRecord) => {
        addRecordMap.set(op.t, op.v);
      });

      response.data.delete_record_operations.forEach((op: UsageRecord) => {
        deleteRecordMap.set(op.t, op.v);
      });

      response.data.browse_operations.forEach((op: UsageRecord) => {
        browseOperationsMap.set(op.t, op.v);
      });

      // Format the logs for better readability
      const formattedLogs = response.data.records.map((record: UsageRecord) => ({
        date: new Date(record.t).toISOString().split('T')[0], // Format as YYYY-MM-DD
        totalRecords: record.v, // Use the value from the record
        addRecordOperations: addRecordMap.get(record.t) || 0, // Get from the map
        deleteRecordOperations: deleteRecordMap.get(record.t) || 0, // Get from the map
        browseOperations: browseOperationsMap.get(record.t) || 0, // Get from the map
      }));

      setLogs(formattedLogs);
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || intl.formatMessage(messages.fetchRecordsError));
      } else {
        setError(intl.formatMessage(messages.fetchRecordsError));
      }
      setLogs([]);
    }
  };

  const fetchSearchLogs = async () => {
    try {
      const response = await axios.get(
        `https://c8-uk-3.algolianet.com/1/logs?indexName=${index}&length=11&offset=0&type=all&x-algolia-agent=Algolia%20for%20JavaScript%20(5.13.0)%3B%20Search%20(5.13.0)%3B%20Browser%3B%20Algolia%20Dashboard`,
        {
          headers: {
            'X-Algolia-Application-Id': window.app.ALGOLIA_APP_ID,
            'X-Algolia-API-Key': window.app.ALGOLIA_USAGE_API_KEY,
          },
        }
      );

      setSearchLogs(response.data.logs); // Assuming the response contains a 'logs' array
      setError(null);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data.message || intl.formatMessage(messages.fetchRecordsError));
      } else {
        setError(intl.formatMessage(messages.fetchRecordsError));
      }
      setSearchLogs([]);
    }
  };

  return (
    <Spacings.Stack scale="l">
      <Spacings.Stack scale="xs">
        <Spacings.Stack scale="xs">
          <Label htmlFor="index" isBold={true}>
            <FormattedMessage id="Channels.index" defaultMessage="Index" />
          </Label>
          <MultilineTextInput
            id="index"
            placeholder="Enter index name"
            value={index}
            onChange={(e) => setIndex(e.target.value)}
          />
        </Spacings.Stack>
      </Spacings.Stack>
      <FlatButton onClick={fetchLogs} label={intl.formatMessage({ id: 'Channels.fetchLogs', defaultMessage: 'Fetch Logs' })} />
      <FlatButton onClick={fetchSearchLogs} label={intl.formatMessage({ id: 'Channels.fetchSearchLogs', defaultMessage: 'Fetch Search Logs' })} />
      {error && (
        <ContentNotification type="error">
          {error}
        </ContentNotification>
      )}
      {logs.length > 0 && (
        <div>
          <h3>Usage Logs</h3>
          <ul>
            {logs.map((log, index) => (
              <li key={index}>
                Date: {log.date}, 
                Total Records: {log.totalRecords}, 
                Add Record Operations: {log.addRecordOperations}, 
                Delete Record Operations: {log.deleteRecordOperations}, 
                Browse Operations: {log.browseOperations}
              </li>
            ))}
          </ul>
        </div>
      )}
      {searchLogs.length > 0 && (
        <div>
          <h3>Search API Logs</h3>
          <ul>
            {searchLogs.map((log, index) => (
              <li key={index}>
                Method: {log.method}, 
                URL: {log.url}, 
                Answer Code: {log.answer_code}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Spacings.Stack>
  );
};

export default IndexLogs;