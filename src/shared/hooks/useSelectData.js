// src/shared/hooks/useSelectData.js
import { useQuery } from '@tanstack/react-query';
import { selectDataApi } from '../api/selectDataApi';
import { QUERY_KEYS } from '../utils/queryKeys';

/**
 * 선택 데이터를 관리하는 커스텀 훅
 * @param {string} type - 데이터 타입 (teams, fiscalYears 등)
 * @param {Object} options - React Query 옵션
 * @returns {Object} 쿼리 결과 객체
 */
export const useSelectData = (type, options = {}) => {
  // API 함수 선택
  const getApiFunction = () => {
    switch (type) {
      case QUERY_KEYS.TEAMS:
        return selectDataApi.getTeams;
      case QUERY_KEYS.FISCAL_YEARS:
        return selectDataApi.getFiscalYears;
      case QUERY_KEYS.STATUS:
        return selectDataApi.getStatus;
      case QUERY_KEYS.REGIONS:
        return selectDataApi.getRegions;
      default:
        throw new Error(`Unknown data type: ${type}`);
    }
  };

  return useQuery({
    queryKey: [type],
    queryFn: getApiFunction(),
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 30 * 60 * 1000, // 30분
    ...options,
  });
};
