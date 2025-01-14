// shared/hooks/useCustomerSearch.js
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { debounce } from 'lodash';
import { apiClient } from '../api/apiClient';

export const useCustomerSearch = (initialValue = '') => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  const [isComposing, setIsComposing] = useState(false);

  const fetchCustomers = async (term) => {
    if (!term) return { data: [] };
    console.log('Fetching customers with term:', term); // 디버깅용 로그

    try {
      const response = await apiClient.get('/api/customers', {
        params: {
          populate: '*', // Strapi v4 이상에서 필요
          filters: {
            name: {
              $containsi: term,
            },
          },
          pagination: {
            pageSize: 20,
          },
          sort: ['name:asc'],
        },
      });

      console.log('API Response:', response.data); // 디버깅용 로그
      return response.data;
    } catch (error) {
      console.error('API Error:', error); // 에러 로깅
      throw error;
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ['customers', searchTerm],
    queryFn: () => fetchCustomers(searchTerm),
    enabled: searchTerm.length >= 1,
    staleTime: 1000 * 60 * 5, // 5분
    cacheTime: 1000 * 60 * 30, // 30분
  });

  const debouncedSetSearchTerm = useCallback(
    debounce((term) => {
      console.log('Debounced search term:', term); // 디버깅용 로그
      setSearchTerm(term);
    }, 300),
    [],
  );

  return {
    searchTerm,
    setSearchTerm: debouncedSetSearchTerm,
    isComposing,
    setIsComposing,
    results: data?.data || [],
    isLoading,
    error,
  };
};
