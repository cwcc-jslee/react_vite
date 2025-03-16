// src/shared/hooks/useSfaItem.js
import { useState, useEffect } from 'react';
import { apiCommon } from '../api/apiCommon';

/**
 * 매출품목 목록을 조회하는 Hook
 */
export const useCodebookItem = (itemtype) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (type) => {
    if (!type) {
      setData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCommon.getCodebookItems(type);
      setData(response);
    } catch (err) {
      console.error('Failed to fetch codebook items:', err);
      setError(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(itemtype);
  }, [itemtype]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
