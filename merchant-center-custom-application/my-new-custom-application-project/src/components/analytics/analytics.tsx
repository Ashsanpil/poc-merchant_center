import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spacings from '@commercetools-uikit/spacings';
import MultilineTextInput from '@commercetools-uikit/multiline-text-input';
import Label from '@commercetools-uikit/label';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { useIntl, FormattedMessage } from 'react-intl';
import messages from './messages';
import styles from './analytics.module.css';
import Card from '@commercetools-uikit/card';
import Text from '@commercetools-uikit/text';
import PrimaryButton from '@commercetools-uikit/primary-button';
import DataTable from '@commercetools-uikit/data-table';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const Analytics: React.FC = () => {
  const intl = useIntl();
  const [indexName, setIndexName] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [topSearches, setTopSearches] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      const startDate = '2024-10-20';
      const endDate = new Date().toISOString().split('T')[0];
      const baseUrl = `https://analytics.de.algolia.com/2`;

      const headers = {
        'X-Algolia-Application-Id': window.app.ALGOLIA_APP_ID,
        'X-Algolia-API-Key': window.app.ALGOLIA_WRITE_API_KEY,
      };

      const [totalSearchesResponse, totalUsersResponse, noResultRateResponse, topSearchesResponse] = await Promise.all([
        axios.get(`${baseUrl}/searches/count?index=${indexName}&startDate=${startDate}&endDate=${endDate}&x-algolia-agent=Algolia%20Dashboard`, { headers }),
        axios.get(`${baseUrl}/users/count?index=${indexName}&startDate=${startDate}&endDate=${endDate}&x-algolia-agent=Algolia%20Dashboard`, { headers }),
        axios.get(`${baseUrl}/searches/noResultRate?index=${indexName}&startDate=${startDate}&endDate=${endDate}&x-algolia-agent=Algolia%20Dashboard`, { headers }),
        axios.get(`${baseUrl}/searches?clickAnalytics=true&direction=desc&endDate=${endDate}&index=${indexName}&limit=5&orderBy=searchCount&startDate=${startDate}&x-algolia-agent=Algolia%20for%20JavaScript%20(5.13.0)%3B%20Analytics%20(5.13.0)%3B%20Browser`, { headers })
      ]);

      setAnalyticsData({
        totalSearches: totalSearchesResponse.data.count,
        totalUsers: totalUsersResponse.data.count,
        noResultsRate: noResultRateResponse.data.noResultRate,
      });

      if (Array.isArray(topSearchesResponse.data.searches)) {
        setTopSearches(topSearchesResponse.data.searches);
      } else {
        setTopSearches([]);
      }

      setError(null);
    } catch (err) {
      setError(intl.formatMessage(messages.fetchRecordsError));
      setAnalyticsData(null);
      setTopSearches([]);
    }
  };

  useEffect(() => {
    if (indexName) {
      fetchAnalyticsData();
    }
  }, [indexName]);

  // Chart configuration for each metric
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
    },
    scales: { y: { beginAtZero: true } },
  };

  const totalSearchesData = {
    labels: ['Total Searches'],
    datasets: [{
      data: [analyticsData?.totalSearches || 0],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    }],
  };

  const totalUsersData = {
    labels: ['Total Users'],
    datasets: [{
      data: [analyticsData?.totalUsers || 0],
      borderColor: 'rgba(54, 162, 235, 1)',
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
    }],
  };

  const noResultsRateData = {
    labels: ['No Results Rate'],
    datasets: [{
      data: [analyticsData?.noResultsRate || 0],
      borderColor: 'rgba(255, 99, 132, 1)',
      backgroundColor: 'rgba(255, 99, 132, 0.2)',
    }],
  };

  // Table columns for top searches
  const columns = [
    { key: 'search', label: 'Search Term' },
    { key: 'count', label: 'Search Count' },
  ];

  // Table rows for top searches
  const rows = topSearches.map((search, index) => ({
    id: index.toString(),
    search: search.search,
    count: search.count,
  }));

  return (
    <Spacings.Stack scale="l">
      <Text.Headline as="h1">{'Algolia Configurator'}</Text.Headline>
      <Card theme="dark" type="raised">
        <p>{` Here you can get Analytics`}</p>
      </Card>
      <Spacings.Stack scale="xs">
        <Label htmlFor="analyticsIndexName" isBold={true}>
          <FormattedMessage {...messages.indexNameLabel} />
        </Label>
        <div className={styles.inputContainer}>
          <MultilineTextInput
            id="analyticsIndexName"
            placeholder={intl.formatMessage(messages.indexNamePlaceholder)}
            value={indexName}
            onChange={(e) => setIndexName(e.target.value)}
          />
          <PrimaryButton 
            onClick={fetchAnalyticsData} 
            label={intl.formatMessage({ id: 'Channels.fetchAnalyticsData', defaultMessage: 'Fetch Analytics Data' })} 
          />
        </div>
      </Spacings.Stack>
      {error && (
        <ContentNotification type="error">
          {error}
        </ContentNotification>
      )}
      {analyticsData && (
        <div>
          <h3>Analytics for Index: {indexName}</h3>
          <div className={styles.chartRow}>
            <div className={styles.smallChart}>
              <h4>Total Searches</h4>
              <Line data={totalSearchesData} options={chartOptions} />
            </div>
            <div className={styles.smallChart}>
              <h4>Total Users</h4>
              <Line data={totalUsersData} options={chartOptions} />
            </div>
            <div className={styles.smallChart}>
              <h4>No Results Rate</h4>
              <Line data={noResultsRateData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}
      {topSearches.length > 0 && (
        <div>
          <h3>Top Searches</h3>
          <DataTable rows={rows} columns={columns} />
        </div>
      )}
    </Spacings.Stack>
  );
};

export default Analytics;
