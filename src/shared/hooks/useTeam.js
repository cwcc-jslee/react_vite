// src/shared/hooks/useTeam.js
import { useState, useEffect } from 'react';
import { apiCommon } from '../api/apiCommon';

/**
 * 팀 목록을 조회하는 Hook
 *
 * @example
 * const { data: teams, isLoading } = useTeam();
 *
 * @returns {Object} Hook 반환 객체
 * @returns {Array} data - 팀 목록 데이터
 * @returns {boolean} isLoading - 로딩 상태
 * @returns {Error} error - 에러 객체
 * @returns {Function} refetch - 데이터 재조회 함수
 */
export const useTeam = () => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCommon.getTeams();
      setData(response);
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      setError(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
