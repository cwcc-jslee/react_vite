// src/features/shared/hooks/useCodebook.js
/**
 * 코드북 데이터 관리를 위한 커스텀 훅 모음
 *
 * 로직 분리 구조:
 * 1. useCodebookLoader
 *    - 코드북 데이터 로드 상태 관리
 *    - API 호출 및 에러 처리
 *    - 로딩 상태 및 데이터 완료 상태 관리
 *
 * 2. useCodebookData
 *    - 리덕스 스토어에서 코드북 데이터 조회
 *    - 데이터 변환 및 메모이제이션
 *
 * 3. useCodebook (메인 훅)
 *    - useCodebookLoader와 useCodebookData 조합
 *    - 데이터 로드 필요 여부 판단
 *    - 최종 데이터 및 상태 반환
 *
 * 사용 예시:
 * const { data, isLoading, error, refetch } = useCodebook(['codeType1', 'codeType2']);
 */

import React, { useState, useMemo, useCallback } from 'react';
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

// 메모이제이션된 selector 생성 함수
const createMemoizedSelector = (type) => {
  let lastResult = null;
  let lastState = null;

  return (state) => {
    if (lastState === state) {
      return lastResult;
    }

    const codebookData = selectCodebookByType(type)(state)?.data || [];
    lastResult = convertKeysToCamelCase(codebookData);
    lastState = state;
    return lastResult;
  };
};

/**
 * 코드북 데이터 로드 상태를 관리하는 Hook
 */
const useCodebookLoader = (codeTypes) => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  const loadedTypes = useSelector(selectLoadedTypes);
  const pendingTypes = useSelector(selectPendingTypes);
  const status = useSelector(selectCodebookStatus);
  const reduxError = useSelector(selectCodebookError);

  const isLoading = useMemo(() => {
    if (status !== 'loading') return false;
    return codeTypes.some((type) => {
      const isPending = pendingTypes.includes(type);
      const isNotLoaded = !loadedTypes.includes(type);
      return isPending || isNotLoaded;
    });
  }, [status, codeTypes, loadedTypes, pendingTypes]);

  const fetchData = useCallback(async () => {
    try {
      const typesToFetch = codeTypes.filter(
        (type) => !loadedTypes.includes(type) && !pendingTypes.includes(type),
      );

      if (typesToFetch.length > 0) {
        await dispatch(fetchCodebooksByTypes(typesToFetch)).unwrap();
      }
      setError(null);
    } catch (err) {
      console.error('Failed to fetch codebook data:', err);
      setError(err || reduxError);
    }
  }, [dispatch, codeTypes, loadedTypes, pendingTypes, reduxError]);

  const isDataComplete = useMemo(() => {
    return codeTypes.every((type) => loadedTypes.includes(type));
  }, [codeTypes, loadedTypes]);

  return {
    isLoading,
    error,
    fetchData,
    isDataComplete,
    loadedTypes,
  };
};

/**
 * 코드북 데이터를 조회하는 Hook
 */
const useCodebookData = (codeTypes) => {
  // 메모이제이션된 selector 생성
  const selectors = useMemo(
    () => codeTypes.map((type) => createMemoizedSelector(type)),
    [codeTypes],
  );

  // 각 타입별 데이터를 개별적으로 선택
  const typeDataResults = selectors.map((selector) => useSelector(selector));

  // 최종 데이터 객체 생성
  return useMemo(() => {
    return codeTypes.reduce((acc, type, index) => {
      acc[type] = typeDataResults[index];
      return acc;
    }, {});
  }, [codeTypes, typeDataResults]);
};

/**
 * 여러 코드북 데이터를 효율적으로 조회하는 Hook
 * @param {string[]} codeTypes - 조회할 코드북 타입 배열
 * @returns {Object} 데이터 상태와 관리 함수들
 */
export const useCodebook = (codeTypes) => {
  const { isLoading, error, fetchData, isDataComplete } =
    useCodebookLoader(codeTypes);
  const typesData = useCodebookData(codeTypes);

  // 렌더링 횟수 추적
  const renderCount = React.useRef(0);
  renderCount.current += 1;
  console.log(
    `🔥 [useCodebook] 렌더링 횟수: ${renderCount.current}, codeTypes:`,
    codeTypes,
  );

  // 데이터가 없을 때 자동으로 API 호출 - useEffect로 감싸서 렌더링 중 상태 업데이트 방지
  React.useEffect(() => {
    if (!isLoading && !isDataComplete) {
      console.log(
        '🔥 [useCodebook] fetchData 호출됨 - isLoading:',
        isLoading,
        'isDataComplete:',
        isDataComplete,
      );
      fetchData();
    }
  }, [isLoading, isDataComplete, fetchData]);

  // 상태 변경 추적
  React.useEffect(() => {
    console.log('🔥 [useCodebook] typesData 변경됨:', typesData);
  }, [typesData]);

  React.useEffect(() => {
    console.log('🔥 [useCodebook] isLoading 변경됨:', isLoading);
  }, [isLoading]);

  return {
    data: typesData,
    isLoading,
    error,
    refetch: fetchData,
    isComplete: isDataComplete,
  };
};
