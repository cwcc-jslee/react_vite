// src/features/shared/hooks/useCodebook.js
// 코드북 데이터를 효율적으로 관리하는 커스텀 훅입니다.
// 리덕스 스토어에 캐싱된 데이터를 우선 사용하고, 필요한 경우에만 API 호출을 수행합니다.

import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { convertKeysToCamelCase } from '../utils/transformUtils';
import {
  fetchCodebooksByTypes,
  selectCodebookByType,
  selectLoadedTypes,
  selectPendingTypes,
  selectCodebookStatus,
  selectCodebookError,
} from '../../store/slices/codebookSlice';

/**
 * 여러 코드북 데이터를 효율적으로 조회하는 Hook
 * @param {string[]} codeTypes - 조회할 코드북 타입 배열
 * @returns {Object} 데이터 상태와 관리 함수들
 */
export const useCodebook = (codeTypes) => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  // 리덕스 상태에서 필요한 정보 선택
  const loadedTypes = useSelector(selectLoadedTypes);
  const pendingTypes = useSelector(selectPendingTypes);
  const status = useSelector(selectCodebookStatus);
  const reduxError = useSelector(selectCodebookError);

  // 각 코드북 타입별 데이터를 선택
  const typeSpecificData = useSelector((state) => {
    // 여기서는 useSelector 내부이므로 훅이 아님
    return codeTypes.reduce((acc, type) => {
      const data = selectCodebookByType(type)(state)?.data || [];
      // 스네이크 케이스를 카멜 케이스로 변환
      acc[type] = convertKeysToCamelCase(data);
      return acc;
    }, {});
  });

  const typesData = useMemo(() => {
    return typeSpecificData;
  }, [typeSpecificData]);

  // 로딩 상태 계산: 요청한 타입 중 하나라도 아직 로드 중이면 로딩 상태
  const isLoading = useMemo(() => {
    return (
      status === 'loading' &&
      codeTypes.some(
        (type) =>
          pendingTypes.includes(type) ||
          (!loadedTypes.includes(type) && !pendingTypes.includes(type)),
      )
    );
  }, [status, codeTypes, loadedTypes, pendingTypes]);

  // 데이터 가져오기 함수
  const fetchData = async () => {
    try {
      // 이미 로드된 타입 제외하고 필요한 타입만 요청
      const typesToFetch = codeTypes.filter(
        (type) => !loadedTypes.includes(type) && !pendingTypes.includes(type),
      );

      if (typesToFetch.length > 0) {
        // 필요한 코드북 타입만 가져오기
        await dispatch(fetchCodebooksByTypes(typesToFetch)).unwrap();
      }

      setError(null);
    } catch (err) {
      console.error('Failed to fetch codebook data:', err);
      setError(err || reduxError);
    }
  };

  // 데이터가 모두 로드되었는지 확인
  const isDataComplete = useMemo(() => {
    return codeTypes.every((type) => loadedTypes.includes(type));
  }, [codeTypes, loadedTypes]);

  // 컴포넌트 마운트 또는 요청 코드북 타입 변경 시 데이터 로드
  useEffect(() => {
    if (!isDataComplete) {
      fetchData();
    }
  }, [JSON.stringify(codeTypes), isDataComplete]);

  // 리덕스 에러 상태 변경 시 로컬 에러 상태 업데이트
  useEffect(() => {
    if (reduxError) {
      setError(reduxError);
    }
  }, [reduxError]);

  return {
    data: typesData,
    isLoading,
    error,
    refetch: fetchData,
    isComplete: isDataComplete,
  };
};
