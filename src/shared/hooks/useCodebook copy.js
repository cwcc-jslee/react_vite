// src/features/shared/hooks/useCodebook.js
import { useState, useEffect } from 'react';
import { apiCommon } from '../api/apiCommon';
// import { api } from '../api/api';
/**
 * 여러 코드북 데이터를 동시에 조회하는 Hook
 * @param {string[]} codeTypes - 조회할 코드북 타입 배열
 * @returns {Object} 데이터 상태와 관리 함수들
 */
export const useCodebook = (codeTypes) => {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * 코드북 데이터를 가져오는 함수
   * @returns {Promise<void>}
   */
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 모든 코드북 요청을 병렬로 처리
      const responses = await Promise.all(
        codeTypes.map((codeType) => apiCommon.getCodebook(codeType)),
      );

      // 응답 데이터를 코드 타입을 키로 하는 객체로 변환
      const newData = responses.reduce((acc, response, index) => {
        acc[codeTypes[index]] = response.data;
        return acc;
      }, {});

      setData(newData);
    } catch (err) {
      console.error('Failed to fetch codebook data:', err);
      setError(err);

      // 에러 발생 시 빈 배열로 초기화
      const emptyData = codeTypes.reduce((acc, codeType) => {
        acc[codeType] = [];
        return acc;
      }, {});
      setData(emptyData);
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetchData();
  }, [JSON.stringify(codeTypes)]); // codeTypes 배열이 변경될 때마다 재실행

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
};
