// src/features/dashboard/hooks/useClosureForm.js
/**
 * 프로젝트 종료 폼 관리 훅
 * - 종료 상태 여부 확인
 * - 종료 유형/일자 state 관리
 * - 유효성 검증
 */

import { useState, useMemo } from 'react';
import { useCodebook } from '../../../shared/hooks/useCodebook';
import dayjs from 'dayjs';

// 종료 상태 ID (projectStatusConstants에서 가져올 수도 있음)
export const CLOSURE_STATUS_ID = 90;

/**
 * 종료 폼 관리 훅
 * @param {number} toStatusId - 변경할 상태 ID
 * @returns {object} 종료 폼 관련 상태 및 함수
 */
export const useClosureForm = (toStatusId) => {
  const { data: codebooks } = useCodebook(['pjtClosureType']);
  const [closureDate, setClosureDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [closureTypeId, setClosureTypeId] = useState('');

  // 종료 상태 여부
  const isClosingStatus = useMemo(() => toStatusId === CLOSURE_STATUS_ID, [toStatusId]);

  // 종료 유형 목록
  const closureTypes = codebooks?.pjtClosureType || [];

  // 유효성 검증 (종료 상태가 아니면 항상 유효, 종료 상태면 종료 유형 필수)
  const isValid = !isClosingStatus || !!closureTypeId;

  // 종료 데이터 생성
  const getClosureData = (projectId) => {
    if (!isClosingStatus) return null;
    return {
      projectId,
      closureDate,
      closureType: closureTypeId ? parseInt(closureTypeId) : null,
    };
  };

  // 폼 초기화
  const resetForm = () => {
    setClosureDate(dayjs().format('YYYY-MM-DD'));
    setClosureTypeId('');
  };

  return {
    // 상태
    isClosingStatus,
    closureDate,
    closureTypeId,
    closureTypes,
    isValid,
    // 액션
    setClosureDate,
    setClosureTypeId,
    getClosureData,
    resetForm,
  };
};
