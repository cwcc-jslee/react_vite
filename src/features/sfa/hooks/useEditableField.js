// src/features/sfa/hooks/useEditableField.js
import { useState, useEffect, useCallback } from 'react';
import { sfaSubmitService } from '../services/sfaSubmitService';
import { getCurrentValue } from '../utils/fieldUtils';
import { useSfa } from '../context/SfaProvider';
import { useSfaStore } from './useSfaStore';
import { useUiStore } from '../../../shared/hooks/useUiStore';
import { convertKeysToSnakeCase } from '../../../shared/utils/transformUtils';

/**
 * 편집 가능한 필드의 상태와 동작을 관리하는 커스텀 훅
 * @param {Object} initialData - 초기 데이터
 * @returns {Object} 편집 관련 상태와 메서드들
 */
export const useEditableField = (initialData) => {
  const { actions } = useSfaStore();
  const { actions: uiActions } = useUiStore();
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
  const startEditing = (fieldName, editableFields = null) => {
    let currentValue;

    // editableFields가 제공되고 해당 필드가 존재하면 getValue 함수 사용
    if (
      editableFields &&
      editableFields[fieldName] &&
      editableFields[fieldName].getValue
    ) {
      currentValue = editableFields[fieldName].getValue(initialData);
      console.log('=== 편집 모드 시작 (editableFields 사용) ===');
      console.log('편집 필드:', fieldName);
      console.log('editableFields 정의:', editableFields[fieldName]);
    } else {
      // 기존 방식 사용 (fallback)
      currentValue = getCurrentValue(fieldName, initialData);
      console.log('=== 편집 모드 시작 (getCurrentValue 사용) ===');
      console.log('편집 필드:', fieldName);
    }

    console.log('초기 값:', currentValue);
    console.log('초기 값 타입:', typeof currentValue);
    console.log('initialData:', initialData);
    console.log('==================');

    setEditState({
      editField: fieldName,
      currentValue,
      newValue: currentValue,
    });
  };

  useEffect(() => {
    if (editState.editField) {
      console.log('=== editState 변경 감지 ===');
      console.log('편집 필드:', editState.editField);
      console.log('현재 값:', editState.currentValue);
      console.log('새로운 값:', editState.newValue);
      console.log(
        '값 변경 여부:',
        editState.currentValue !== editState.newValue,
      );
      console.log('========================');
    }
  }, [editState]);

  // 편집 취소
  const cancelEditing = () => {
    console.log('=== 편집 취소 ===');
    console.log('취소된 필드:', editState.editField);
    console.log('취소된 값:', editState.newValue);
    console.log('===============');

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
    if (newValue === null || newValue === '') {
      console.log('=== 저장 취소 (값 없음) ===');
      console.log('편집 필드:', editField);
      console.log('새로운 값:', newValue);
      console.log('값 타입:', typeof newValue);
      console.log('========================');
      return;
    }
    const sfaId = initialData.documentId;
    const formData = { [editField]: newValue };

    try {
      console.log('=== SFA 편집 저장 시작 ===');
      console.log('SFA ID:', sfaId);
      console.log('편집 필드:', editField);
      console.log('이전 값:', currentValue, '(타입:', typeof currentValue, ')');
      console.log('새로운 값:', newValue, '(타입:', typeof newValue, ')');
      console.log('폼 데이터:', formData);
      console.log('===========================');

      // 일반 필드 처리
      // 유효성 검증
      // 키 정보 스네이크케이스로 변환
      const snakeCaseFormData = convertKeysToSnakeCase(formData);
      // 값이 같으면 업데이트 하지 않음
      if (currentValue !== newValue) {
        await sfaSubmitService.updateSfaBase(sfaId, snakeCaseFormData);
      } else {
        // 에러 표시 값 동일
        console.log('=== 값 동일로 업데이트 생략 ===');
        console.log('기존 값:', currentValue);
        console.log('새로운 값:', newValue);
        console.log('=============================');
        return;
      }

      // 변경내용 가져오기 & DrawerState 업데이트
      setEditState({ editField: null, currentValue: null, newValue: null });

      // fetchSfaDetail로 최신 데이터 조회
      const updateAction = await actions.data.fetchSfaDetail(initialData.id);

      if (updateAction.meta.requestStatus === 'fulfilled') {
        const updatedData = updateAction.payload;

        // useUiStore를 통한 drawer 상태 업데이트
        uiActions.drawer.update({
          mode: 'view',
          featureMode: null,
          data: updatedData,
        });

        console.log('=== 일반 필드 저장 성공 ===');
        console.log('업데이트된 데이터:', updatedData);
        console.log('=========================');
      }
    } catch (error) {
      console.log('=== SFA 편집 저장 실패 ===');
      console.error('에러 내용:', error);
      console.error('에러 메시지:', error.message);
      console.log('========================');
      throw error;
    }
  }, [editState, partnerState, actions, uiActions]);

  // 값 변경 핸들러
  const handleValueChange = (e) => {
    const fieldName = editState.editField;
    const oldValue = editState.newValue;

    console.log('=== 값 변경 시작 ===');
    console.log('필드명:', fieldName);
    console.log('이전 값:', oldValue);

    // 만약 e가 직접 boolean 값이라면 (Switch에서 직접 호출된 경우)
    if (typeof e === 'boolean') {
      console.log('boolean 값 전달됨:', e);
      setEditState((prev) => ({
        ...prev,
        newValue: e,
      }));
      return;
    }

    const rawValue = e.target?.value;
    console.log('입력 값:', rawValue);
    console.log('입력 타입:', e.target?.type);

    const value =
      e.target?.type === 'select-one'
        ? e.target.value === ''
          ? null
          : Number(e.target.value)
        : e.target?.type === 'customer-search' //CustomerSearchInput
        ? e.target.value
        : e.target?.type === 'boolean'
        ? e.target.value // 이미 boolean 값이므로 그대로 사용
        : e.target.value;

    //단어 앞 공백 제거
    const trimmedValue =
      value === null
        ? null
        : typeof value === 'string'
        ? value.replace(/^\s+/, '')
        : value;

    console.log('처리된 값:', trimmedValue);
    console.log('값 타입:', typeof trimmedValue);
    console.log('=== 값 변경 완료 ===');

    setEditState((prev) => ({
      ...prev,
      newValue: trimmedValue,
    }));
  };

  // 매출 파트너 체크 박스 핸들러
  const handlePartnerStateChange = (e) => {
    const value = e.target.checked;

    console.log('=== 파트너 상태 변경 ===');
    console.log('이전 상태:', partnerState.pendingState);
    console.log('새로운 상태:', value);
    console.log('현재 활성화 여부:', partnerState.isEnabled);
    console.log('=====================');

    setPartnerState((prev) => ({ ...prev, pendingState: value }));
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
