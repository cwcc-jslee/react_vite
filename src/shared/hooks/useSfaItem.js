// src/shared/hooks/useSfaItem.js
import { useState, useEffect } from 'react';
import { apiCommon } from '../api/apiCommon';

/**
 * 매출품목 목록을 조회하는 Hook
 *
 * @example
 * // 기본 사용
 * const { data: items, isLoading } = useSfaItem(classificationId);
 *
 * // 수동 조회
 * const { data: items, refetch } = useSfaItem();
 *
 * useEffect(() => {
 *   if (classification?.id) {
 *     refetch(classification.id);
 *   }
 * }, [classification]);
 *
 * @param {number} initialClassificationId - 초기 매출구분 ID
 * @returns {Object} Hook 반환 객체
 * @returns {Array} data - 매출품목 목록 데이터
 * @returns {boolean} isLoading - 로딩 상태
 * @returns {Error} error - 에러 객체
 * @returns {Function} refetch - 데이터 재조회 함수
 */
export const useSfaItem = (initialClassificationId) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (classificationId) => {
    if (!classificationId) {
      setData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiCommon.getSfaItems(classificationId);
      setData(response);
    } catch (err) {
      console.error('Failed to fetch SFA items:', err);
      setError(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(initialClassificationId);
  }, [initialClassificationId]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
