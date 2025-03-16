// src/shared/hooks/useSelectData.js
// API 함수를 직접 전달받는 재사용 가능한 데이터 조회 훅
// 다양한 API 엔드포인트에서 데이터를 가져와 상태를 관리합니다

import { useState, useEffect, useCallback } from 'react';

/**
 * API 함수를 전달받아 데이터를 조회하고 상태를 관리하는 훅
 */
export const useSelectData = (apiFn, params = null) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // API 호출 함수
  const fetchData = useCallback(async () => {
    // 파라미터가 필요한 API인데 파라미터가 없으면 빈 데이터 반환
    if (params === null && apiFn.length > 0) {
      setData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiFn(params);
      setData(response);
    } catch (err) {
      console.error('API 데이터 조회 실패:', err);
      setError(err);
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, [apiFn, params]);

  // 초기 데이터 로드 및 의존성 변경 시 재로드
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // 데이터 재조회 함수
  const refetch = useCallback(() => {
    return fetchData();
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch,
  };
};

export default useSelectData;
