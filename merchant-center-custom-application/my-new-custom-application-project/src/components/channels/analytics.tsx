import React, { useState } from 'react';
import axios from 'axios';
import Spacings from '@commercetools-uikit/spacings';
import FlatButton from '@commercetools-uikit/flat-button';
import MultilineTextInput from '@commercetools-uikit/multiline-text-input';
import Label from '@commercetools-uikit/label';
import { ContentNotification } from '@commercetools-uikit/notifications';
import { useIntl, FormattedMessage } from 'react-intl';
import messages from './messages';

const Analytics: React.FC = () => {
  const intl = useIntl();
  const [indexName, setIndexName] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [topSearches, setTopSearches] = useState<any[]>([]); // Initialize as an empty array
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      const startDate = '2024-10-20'; // Fixed start date
      const endDate = new Date().toISOString().split('T')[0]; // Current date in YYYY-MM-DD format
      const baseUrl = `https://analytics.de.algolia.com/2`;

      // Set headers for the requests
      const headers = {
        'X-Algolia-Application-Id': window.app.ALGOLIA_APP_ID, 
        'X-Algolia-API-Key': window.app.ALGOLIA_WRITE_API_KEY, 
      };

      // Fetch total searches
      const totalSearchesResponse = await axios.get(
        `${baseUrl}/searches/count?index=${indexName}&startDate=${startDate}&endDate=${endDate}&x-algolia-agent=Algolia%20Dashboard`,
        { headers }
      );

      // Fetch total users
      const totalUsersResponse = await axios.get(
        `${baseUrl}/users/count?index=${indexName}&startDate=${startDate}&endDate=${endDate}&x-algolia-agent=Algolia%20Dashboard`,
        { headers }
      );

      // Fetch no result rate
      const noResultRateResponse = await axios.get(
        `${baseUrl}/searches/noResultRate?index=${indexName}&startDate=${startDate}&endDate=${endDate}&x-algolia-agent=Algolia%20Dashboard`,
        { headers }
      );

      // Fetch top searches
      const topSearchesResponse = await axios.get(
        `${baseUrl}/searches?clickAnalytics=true&direction=desc&endDate=${endDate}&index=${indexName}&limit=5&orderBy=searchCount&startDate=${startDate}&x-algolia-agent=Algolia%20for%20JavaScript%20(5.13.0)%3B%20Analytics%20(5.13.0)%3B%20Browser`,
        { headers }
      );

      // Combine the results
      setAnalyticsData({
        totalSearches: totalSearchesResponse.data.count,
        totalUsers: totalUsersResponse.data.count,
        noResultsRate: noResultRateResponse.data.noResultRate,
      });

      // Check if searches exist and is an array
      if (Array.isArray(topSearchesResponse.data.searches)) {
        setTopSearches(topSearchesResponse.data.searches);
      } else {
        setTopSearches([]); // Reset to empty array if not valid
      }

      setError(null);
    } catch (err) {
      setError(intl.formatMessage(messages.fetchRecordsError));
      setAnalyticsData(null);
      setTopSearches([]); // Reset top searches on error
    }
  };

  return (
    <Spacings.Stack scale="l">
      <Spacings.Stack scale="xs">
        <Label htmlFor="analyticsIndexName" isBold={true}>
          <FormattedMessage {...messages.indexNameLabel} />
        </Label>
        <MultilineTextInput
          id="analyticsIndexName"
          placeholder={intl.formatMessage(messages.indexNamePlaceholder)}
          value={indexName}
          onChange={(e) => setIndexName(e.target.value)}
        />
      </Spacings.Stack>
      <Spacings.Stack scale="xs">
        <FlatButton onClick={fetchAnalyticsData} label={intl.formatMessage({ id: 'Channels.fetchAnalyticsData', defaultMessage: 'Fetch Analytics Data' })} />
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