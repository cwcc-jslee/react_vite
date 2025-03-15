import { useState, useEffect } from 'react';
import { apiCommon } from '../api/apiCommon';

/**
 * 고객사별 SFA 목록을 조회하는 Hook
 *
 * @example
 * // 기본 사용
 * const { data: sfas, isLoading } = useSfa(customerId);
 *
 * // 수동 조회
 * const { data: sfas, refetch } = useSfa();
 *
 * useEffect(() => {
 *   if (customer?.id) {
 *     refetch(customer.id);
 *   }
 * }, [customer]);
 *
 * @param {number} initialCustomerId - 초기 고객사 ID
 * @returns {Object} Hook 반환 객체
 * @returns {Array} data - SFA 목록 데이터
 * @returns {boolean} isLoading - 로딩 상태
 * @returns {Error} error - 에러 객체
 * @returns {Function} refetch - 데이터 재조회 함수
 */
export const useSfa = (initialCustomerId) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (customerId) => {
    if (!customerId) {
      setData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCommon.getSfas(customerId);
      setData(response);
    } catch (err) {
      console.error('Failed to fetch SFAs:', err);
      setError(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(initialCustomerId);
  }, [initialCustomerId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
