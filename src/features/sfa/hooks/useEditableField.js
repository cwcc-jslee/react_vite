// src/features/sfa/hooks/useEditableField.js
import { useState, useEffect, useCallback } from 'react';
import { sfaSubmitService } from '../services/sfaSubmitService';
import { getCurrentValue } from '../utils/fieldUtils';
import { sfaApi } from '../api/sfaApi';
import { useSfa } from '../context/SfaProvider';

/**
 * 편집 가능한 필드의 상태와 동작을 관리하는 커스텀 훅
 * @param {Object} initialData - 초기 데이터
 * @returns {Object} 편집 관련 상태와 메서드들
 */
export const useEditableField = (initialData) => {
  const { setDrawer } = useSfa();
  // 편집 상태 관리
  const [editState, setEditState] = useState({
    editField: null, // 현재 편집 중인 필드
    currentValue: null, // 현재 값
    newValue: null, // 변경경 값
  });
  // 파트너 등록 여부
  const [partnerState, setPartnerState] = useState({
    isEnabled: initialData?.has_partner || false, // 현재 값
    pendingState: initialData?.has_partner || false, // 변경 값
  });

  // 편집 시작
  const startEditing = (fieldName) => {
    const currentValue = getCurrentValue(fieldName, initialData);
    setEditState({
      editField: fieldName,
      currentValue,
      newValue: currentValue,
    });
  };

  // 편집 취소
  const cancelEditing = () => {
    setEditState({
      editField: null,
      currentValue: null,
      newValue: null,
    });
  };

  // 편집 저장
  /**
   * 파트너 관련 필드 업데이트 처리
   * @param {string} sfaId - SFA 문서 ID
   * @param {Object} formData - 업데이트할 데이터
   */
  const processParterUpdate = async (sfaId, formData) => {
    const { currentValue, newValue } = editState;
    const { isEnabled, pendingState } = partnerState;

    // Case 1: false -> true (파트너 추가)
    if (!isEnabled && pendingState && newValue) {
      await sfaSubmitService.updateSfaBase(sfaId, {
        ...formData,
        has_partner: true,
      });
    }
    // Case 2: true -> true (파트너 변경)
    else if (isEnabled && pendingState && currentValue !== newValue) {
      await sfaSubmitService.updateSfaBase(sfaId, formData);
    }
    // Case 3: true -> false (파트너 제거)
    else if (isEnabled && !pendingState) {
      await sfaSubmitService.updateSfaBase(sfaId, {
        has_partner: false,
        selling_partner: null,
      });
    } else {
      console.warn('Invalid partner update case:', {
        partnerState,
        editState,
        formData,
      });
    }
  };

  const saveEditing = useCallback(async () => {
    const { editField, currentValue, newValue } = editState;
    if (!editField) return;
    const sfaId = initialData.documentId;
    const formData = { [editField]: newValue };

    try {
      console.log('[SFA Edit]', {
        field: editField,
        before: currentValue,
        after: newValue,
      });

      if (editField === 'selling_partner') {
        await processParterUpdate(sfaId, formData);

        // 모달 업데이트 성공..

        // 변경내용 가져오기 & DrawerState 업데이트
        setEditState({ editField: null, currentValue: null, newValue: null });
        const updateData = await sfaApi.getSfaDetail(initialData.id);
        setDrawer({ controlMode: 'view', data: updateData.data[0] });
      } else {
        // 일반 필드 처리
        // 유효성 검증
        // 기존 값과 비교, 건명 등 null 이나 공백 확인

        await sfaSubmitService.updateSfaBase(sfaId, formData);

        // 변경내용 가져오기 & DrawerState 업데이트
        setEditState({ editField: null, currentValue: null, newValue: null });
        const updateData = await sfaApi.getSfaDetail(initialData.id);
        setDrawer({ controlMode: 'view', data: updateData.data[0] });
      }
    } catch (error) {
      console.error('[SFA Edit] Save Error:', error);
      throw error;
    }
  }, [editState, partnerState]);

  // 값 변경 핸들러
  const handleValueChange = (e) => {
    console.log(`>>> handleValueChange >>> : ${e.target.type}`);
    const value =
      e.target?.type === 'select-one'
        ? Number(e.target.value)
        : e.target?.type === 'customer-search' //CustomerSearchInput
        ? e.target.value
        : e.target.value;

    setEditState((prev) => ({
      ...prev,
      newValue: value,
    }));
  };

  // 매출 파트너 체크 박스 핸들러
  const handlePartnerStateChange = (e) => {
    const value = e.target.checked;

    setPartnerState((prev) => ({ ...prev, pendingState: value }));
    console.log(`>>> handlepartnerStateChange >>> : ${value}`);
  };

  return {
    editState,
    partnerState,
    startEditing,
    saveEditing,
    cancelEditing,
    handleValueChange,
    handlePartnerStateChange,
  };
};
