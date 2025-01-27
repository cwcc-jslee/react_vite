// src/features/sfa/hooks/useEditableField.js
import { useState, useEffect, useCallback } from 'react';
import { updateSfaField } from '../services/sfaSubmitService';
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
  const [hasPartner, setHasPartner] = useState({
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
  const saveEditing = useCallback(async () => {
    const { editField, currentValue, newValue } = editState;
    if (!editField) return;
    const sfaId = initialData.documentId;
    const formData = { [editField]: newValue };

    try {
      console.log('[SFA Edit]', {
        editField,
        before: currentValue,
        after: newValue,
      });

      if (editField === 'selling_partner') {
        console.log(`>> hasParter status : `, hasPartner);

        // false -> true
        if (!hasPartner.isEnabled && hasPartner.pendingState && newValue) {
          Object.assign(formData, { has_partner: true });
          console.log(`>>> false-true : `, formData);
          await updateSfaField(initialData.documentId, formData);
          // 모달 업데이트 성공..

          // 변경내용 가져오기 & DrawerState 업데이트
          setEditState({ editField: null, currentValue: null, newValue: null });
          const updateData = await sfaApi.getSfaDetail(initialData.id);
          setDrawer({ controlMode: 'view', data: updateData.data[0] });
        }

        // true -> true, 값 변경
        else if (
          hasPartner.isEnabled &&
          hasPartner.pendingState &&
          currentValue !== newValue
        ) {
          console.log(`>>> true-true & partner-change : `, formData);
          await updateSfaField(initialData.documentId, formData);
          // 모달 업데이트 성공..

          // 변경내용 가져오기 & DrawerState 업데이트
          setEditState({ editField: null, currentValue: null, newValue: null });
          const updateData = await sfaApi.getSfaDetail(initialData.id);
          setDrawer({ controlMode: 'view', data: updateData.data[0] });
        }

        // true -> false
        else if (hasPartner.isEnabled && !hasPartner.pendingState) {
          formData.has_partner = false;
          formData['selling_partner'] = null;
          console.log(`>>> true-false : `, formData);
          await updateSfaField(initialData.documentId, formData);
          // 모달 업데이트 성공..

          // 변경내용 가져오기 & DrawerState 업데이트
          setEditState({ editField: null, currentValue: null, newValue: null });
          const updateData = await sfaApi.getSfaDetail(initialData.id);
          setDrawer({ controlMode: 'view', data: updateData.data[0] });
        } else {
          // 모달 유효성 검증 오류
          console.log(`***********해당없음**************`);
          console.log(`>> [hasPartner]`, hasPartner);
          console.log(`>> [editState]`, editState);
          console.log(`>> [fromData]`, formData);
          console.log(`***********해당없음**************`);
        }
      } else {
        // 유효성 검증
        // 기존 값과 비교, 건명 등 null 이나 공백 확인

        // 일반 필드 처리
        await updateSfaField(sfaId, formData);
        setEditState({ editField: null, currentValue: null, newValue: null });

        // 변경내용 가져오기 & DrawerState 업데이트
        const updateData = await sfaApi.getSfaDetail(initialData.id);
        setDrawer({ controlMode: 'view', data: updateData.data[0] });
      }
    } catch (error) {
      console.error('[SFA Edit] Save Error:', error);
      throw error;
    }
  }, [editState, hasPartner]);

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
  const handleHasPartnerChange = (e) => {
    const value = e.target.checked;

    setHasPartner((prev) => ({ ...prev, pendingState: value }));
    console.log(`>>> handleHasPartnerChange >>> : ${value}`);
  };

  return {
    editState,
    hasPartner,
    startEditing,
    saveEditing,
    cancelEditing,
    handleValueChange,
    handleHasPartnerChange,
  };
};
