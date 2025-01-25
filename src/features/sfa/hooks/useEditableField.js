// src/features/sfa/hooks/useEditableField.js
import { useState, useEffect } from 'react';
import { updateSfaField } from '../services/sfaSubmitService';

/**
 * 편집 가능한 필드의 상태와 동작을 관리하는 커스텀 훅
 * @param {Object} initialData - 초기 데이터
 * @param {Function} onUpdate - 필드 업데이트 핸들러
 * @returns {Object} 편집 관련 상태와 메서드들
 */
export const useEditableField = (initialData, onUpdate) => {
  // 편집 상태 관리
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  // 매출파트너 관련 상태
  const [partnerChecked, setPartnerChecked] = useState(
    initialData?.has_partner || false,
  );
  const [tempPartnerChecked, setTempPartnerChecked] = useState(
    initialData?.has_partner || false,
  );
  const [partnerId, setPartnerId] = useState(
    initialData?.selling_partner?.id || null,
  );

  // 프로젝트 관련 상태
  const [projectStatus, setProjectStatus] = useState(
    initialData?.is_project || false,
  );
  const [tempProjectStatus, setTempProjectStatus] = useState(
    initialData?.is_project || false,
  );

  // 초기 데이터가 변경될 때 상태 업데이트
  useEffect(() => {
    setPartnerChecked(initialData?.has_partner || false);
    setTempPartnerChecked(initialData?.has_partner || false);
    setPartnerId(initialData?.selling_partner?.id || null);
    setProjectStatus(initialData?.is_project || false);
    setTempProjectStatus(initialData?.is_project || false);
  }, [initialData]);

  // 편집 시작
  const startEditing = (fieldName, editableFields) => {
    setEditingField(fieldName);
    if (fieldName === 'selling_partner') {
      setTempPartnerChecked(partnerChecked);
    } else if (fieldName === 'is_project') {
      setTempProjectStatus(projectStatus);
    } else {
      const field = editableFields[fieldName];
      setEditValue(field?.getValue(initialData) || '');
    }
  };

  // 편집 취소
  const cancelEditing = () => {
    setEditingField(null);
    setEditValue('');
    setTempPartnerChecked(partnerChecked);
    setTempProjectStatus(projectStatus);
  };

  // 편집 저장
  const saveEditing = async (fieldName) => {
    try {
      const sfaId = initialData.documentId;

      if (fieldName === 'selling_partner') {
        // 매출파트너 관련 처리
        await updateSfaField(sfaId, 'has_partner', tempPartnerChecked);
        if (!tempPartnerChecked) {
          await updateSfaField(sfaId, 'selling_partner', null);
        }
        setPartnerChecked(tempPartnerChecked);
      } else if (fieldName === 'is_project') {
        // 프로젝트 여부 처리
        await updateSfaField(sfaId, 'is_project', tempProjectStatus);
        setProjectStatus(tempProjectStatus);
      } else {
        // 일반 필드 처리
        await updateSfaField(sfaId, fieldName, editValue);
      }

      // API 업데이트 성공 후 상태 초기화
      setEditingField(null);
      setEditValue('');

      // 부모 컴포넌트 콜백 실행
      if (onUpdate) {
        await onUpdate(fieldName, editValue);
      }
    } catch (error) {
      console.error('Failed to save:', error);
      setTempPartnerChecked(partnerChecked);
      setTempProjectStatus(projectStatus);
      // 에러 처리를 위해 에러를 다시 던짐
      throw error;
    }
  };

  // 값 변경 핸들러
  const handleValueChange = (e) => {
    setEditValue(e.target.value);
  };

  // 파트너 선택 핸들러
  const handlePartnerSelect = async (partner) => {
    setPartnerChecked(true);
    try {
      await onUpdate('selling_partner', partner.id);
      setPartnerId(partner.id);
      setEditingField(null);
    } catch (error) {
      console.error('Failed to update partner:', error);
    }
  };

  return {
    editingField,
    editValue,
    partnerChecked,
    tempPartnerChecked,
    partnerId,
    projectStatus,
    tempProjectStatus,
    startEditing,
    cancelEditing,
    saveEditing,
    handleValueChange,
    handlePartnerSelect,
    setTempProjectStatus,
  };
};
