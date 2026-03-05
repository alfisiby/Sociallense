import { useState } from 'react';

export function useScraper() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState('');

  const scrapeProfile = async (url) => {
    setLoading(true);
    setError(null);
    setProgress('Connecting to profile...');

    try {
      setProgress('Fetching posts...');

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to scrape profile');
      }

      setProgress('Building dashboard...');
      const data = await response.json();

      setProgress('');
      setLoading(false);

      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      setProgress('');
      return null;
    }
  };

  return {
    scrapeProfile,
    loading,
    error,
    progress
  };
}
