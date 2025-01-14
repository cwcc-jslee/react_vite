// src/features/sfa/hooks/useSfaData.js
import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { sfaApi } from '../api/sfaApi';
import { setFilter } from '../store/sfaSlice';

export const useSfaData = () => {
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const fetchData = useCallback(
    async (params) => {
      setLoading(true);
      try {
        const data = await sfaApi.fetchSfaList(params);
        dispatch(setFilter(params));
        return data;
      } finally {
        setLoading(false);
      }
    },
    [dispatch],
  );

  return { fetchData, loading };
};
