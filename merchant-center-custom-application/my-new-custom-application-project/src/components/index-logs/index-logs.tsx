import React, { useState } from 'react';
import axios from 'axios';
import Spacings from '@commercetools-uikit/spacings';
import MultilineTextInput from '@commercetools-uikit/multiline-text-input';
import Label from '@commercetools-uikit/label';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { useIntl, FormattedMessage } from 'react-intl';
import messages from './messages';
import styles from './index-logs.module.css';
import Card from '@commercetools-uikit/card';
import Text from '@commercetools-uikit/text';
import PrimaryButton from '@commercetools-uikit/primary-button';
import { Pagination } from '@commercetools-uikit/pagination';
import DataTable from '@commercetools-uikit/data-table';

interface UsageRecord {
  t: number;
  v: number;
}

interface SearchLog {
  id: string; // Add an id property
  method: string;
  url: string;
  answer_code: string;
}

const IndexLogs: React.FC = () => {
  const intl = useIntl();
  const [index, setIndex] = useState<string>('');
  const [logs, setLogs] = useState<any[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [currentPageUsage, setCurrentPageUsage] = useState(1);
  const [itemsPerPageUsage, setItemsPerPageUsage] = useState(10);
  
  const [currentPageSearch, setCurrentPageSearch] = useState(1);
  const [itemsPerPageSearch, setItemsPerPageSearch] = useState(10);

  const fetchLogs = async () => {
    try {
      if (!index) {
        setError(intl.formatMessage({ id: 'Channels.missingFields', defaultMessage: 'Index is required.' }));
        return;
      }

      const response = await axios.get(
        `https://usage.algolia.com/1/usage/records,add_record_operations,delete_record_operations,browse_operations/${index}`,
        {
          params: {
            startDate: '2024-10-20T00:00:00Z',
            endDate: new Date().toISOString(),
            granularity: 'daily',
          },
          headers: {
            'X-Algolia-Application-Id': window.app.ALGOLIA_APP_ID,
            'X-Algolia-API-Key': window.app.ALGOLIA_USAGE_API_KEY,
          },
        }
      );

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

      const formattedLogs = response.data.records.map((record: UsageRecord) => ({
        date: new Date(record.t).toISOString().split('T')[0],
        totalRecords: record.v,
        addRecordOperations: addRecordMap.get(record.t) || 0,
        deleteRecordOperations: deleteRecordMap.get(record.t) || 0,
        browseOperations: browseOperationsMap.get(record.t) || 0,
      }));

      setLogs(formattedLogs);
      setError(null);
    } catch (err) {
      setError(intl.formatMessage(messages.fetchRecordsError));
      setLogs([]);
    }
  };

  const fetchSearchLogs = async () => {
    try {
      const response = await axios.get(
        `https://c8-uk-3.algolianet.com/1/logs?indexName=${index}&length=100&offset=0&type =all&x-algolia-agent=Algolia%20for%20JavaScript%20(5.13.0)%3B%20Search%20(5.13.0)%3B%20Browser%3B%20Algolia%20Dashboard`,
        {
          headers: {
            'X-Algolia-Application-Id': window.app.ALGOLIA_APP_ID,
            'X-Algolia-API-Key': window.app.ALGOLIA_USAGE_API_KEY,
          },
        }
      );

      const formattedSearchLogs = response.data.logs.map((log: SearchLog, index: number) => ({
        id: `${log.method}-${index}`, // Generate a unique id
        method: log.method,
        url: log.url,
        answer_code: log.answer_code,
      }));

      setSearchLogs(formattedSearchLogs);
      setError(null);
    } catch (err) {
      setError(intl.formatMessage(messages.fetchRecordsError));
      setSearchLogs([]);
    }
  };

  const indexOfLastUsageLog = currentPageUsage * itemsPerPageUsage;
  const indexOfFirstUsageLog = indexOfLastUsageLog - itemsPerPageUsage;
  const currentUsageLogs = logs.slice(indexOfFirstUsageLog, indexOfLastUsageLog);

  const indexOfLastSearchLog = currentPageSearch * itemsPerPageSearch;
  const indexOfFirstSearchLog = indexOfLastSearchLog - itemsPerPageSearch;
  const currentSearchLogs = searchLogs.slice(indexOfFirstSearchLog, indexOfLastSearchLog);

  const handlePerPageChangeUsage = (newPerPage: number) => {
    setItemsPerPageUsage(newPerPage);
    setCurrentPageUsage(1);
  };

  const handlePerPageChangeSearch = (newPerPage: number) => {
    setItemsPerPageSearch(newPerPage);
    setCurrentPageSearch(1);
  };

  const usageColumns = [
    { key: 'date', label: 'Date' },
    { key: 'totalRecords', label: 'Total Records' },
    { key: 'addRecordOperations', label: 'Add Record Operations' },
    { key: 'deleteRecordOperations', label: 'Delete Record Operations' },
    { key: 'browseOperations', label: 'Browse Operations' },
  ];

  const searchColumns = [
    { key: 'method', label: 'Method' },
    { key: 'url', label: 'URL' },
    { key: 'answer_code', label: 'Answer Code' },
  ];

  return (
    <Spacings.Stack scale="l">
      <Text.Headline as="h1">{'ALGOLIA CONFIGURATOR'}</Text.Headline>
      <Card theme="dark" type="raised">
        <p>{` Here you can get Search & Usage Logs`}</p>
      </Card>
      <Spacings.Stack scale="xs">
        <Label htmlFor="index" isBold={true}>
          <FormattedMessage id="Channels.index" defaultMessage="Index" />
        </Label>
        <div className={styles.inputContainer}>
          <MultilineTextInput
            id="index"
            placeholder="Enter index name"
            value={index}
            onChange={(e) => setIndex(e.target.value)}
          />
          <PrimaryButton
            onClick={fetchLogs}
            label={intl.formatMessage({ id: 'Channels.fetchLogs', defaultMessage: 'Fetch Logs' })}
          />
          <PrimaryButton
            onClick={fetchSearchLogs}
            label={intl.formatMessage({ id: 'Channels.fetchSearchLogs', defaultMessage: 'Fetch Search Logs' })}
          />
        </div>
      </Spacings.Stack>
      {error && (
        <ContentNotification type="error">
          {error}
        </ContentNotification>
      )}
      {currentUsageLogs.length > 0 && (
        <div>
          <h3>Usage Logs</h3>
          <DataTable rows={currentUsageLogs} columns={usageColumns} />
          <Pagination
            page={currentPageUsage}
            totalItems={logs.length}
            onPageChange={setCurrentPageUsage}
            onPerPageChange={handlePerPageChangeUsage}
          />
        </div>
      )}
      {currentSearchLogs.length > 0 && (
        <div>
          <h3>Search API Logs</h3>
          <DataTable rows={currentSearchLogs} columns={searchColumns} />
          <Pagination
            page={currentPageSearch}
            totalItems={searchLogs.length}
            onPageChange={setCurrentPageSearch}
            onPerPageChange={handlePerPageChangeSearch}
          />
        </div>
      )}
    </Spacings.Stack>
  );
};

export default IndexLogs;