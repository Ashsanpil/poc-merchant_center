import React, { useState } from 'react';
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

      const totalSearchesResponse = await axios.get(
        `${baseUrl}/searches/count?index=${indexName}&startDate=${startDate}&endDate=${endDate}&x-algolia-agent=Algolia%20Dashboard`,
        { headers }
      );

      const totalUsersResponse = await axios.get(
        `${baseUrl}/users/count?index=${indexName}&startDate=${startDate}&endDate=${endDate}&x-algolia-agent=Algolia%20Dashboard`,
        { headers }
      );

      const noResultRateResponse = await axios.get(
        `${baseUrl}/searches/noResultRate?index=${indexName}&startDate=${startDate}&endDate=${endDate}&x-algolia-agent=Algolia%20Dashboard`,
        { headers }
      );

      const topSearchesResponse = await axios.get(
        `${baseUrl}/searches?clickAnalytics=true&direction=desc&endDate=${endDate}&index=${indexName}&limit=5&orderBy=searchCount&startDate=${startDate}&x-algolia-agent=Algolia%20for%20JavaScript%20(5.13.0)%3B%20Analytics%20(5.13.0)%3B%20Browser`,
        { headers }
      );

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

  return (
    <Spacings.Stack scale="l">
      <Text.Headline as="h1">{'ALGOLIA CONFIGURATOR'}</Text.Headline>
      <Card theme="dark" type="raised">
        <p>{` Here you can get Analytics`}</p>
      </Card>
      <Spacings.Stack scale="xs">
        < Label htmlFor="analyticsIndexName" isBold={true}>
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
          <p>Total Searches: {analyticsData.totalSearches !== undefined ? analyticsData.totalSearches : 0}</p>
          <p>Total Users: {analyticsData.totalUsers !== undefined ? analyticsData.totalUsers : 0}</p>
          <p>No Results Rate: {analyticsData.noResultsRate !== undefined ? analyticsData.noResultsRate : 0}%</p>
        </div>
      )}
      {topSearches.length > 0 && (
        <div>
          <h3>Top Searches</h3>
          <ul>
            {topSearches.map((search, index) => (
              <li key={index}>
                {search.search} - {search.count} searches
              </li>
            ))}
          </ul>
        </div>
      )}
    </Spacings.Stack>
  );
};

export default Analytics;