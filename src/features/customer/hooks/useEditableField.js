// src/features/customer/hooks/useEditableField.js
import React, { useState, useEffect, useCallback } from 'react';
// import { sfaSubmitService } from '../services/sfaSubmitService';
// import { getCurrentValue } from '../utils/fieldUtils';
// import { sfaApi } from '../api/sfaApi';
import { useCustomer } from '../context/CustomerProvider';
import {
  formatBusinessNumber,
  normalizeBusinessNumber,
} from '../../../shared/services/businessNumberUtils';
import { isEqual } from '../../../shared/utils/objectUtils';
import useFormValidation from './useFormValidation';
import { customerSubmitService } from '../services/customerSubmitService';

/**
 * 편집 가능한 필드의 상태와 동작을 관리하는 커스텀 훅
 * @param {Object} initialData - 초기 데이터
 * @returns {Object} 편집 관련 상태와 메서드들
 */
export const useEditableField = (initialData) => {
  // 수정 중인 섹션 상태 관리
  const [editingSection, setEditingSection] = useState(null);
  // 수정 중인 필드 데이터 관리
  const [editedData, setEditedData] = useState({});
  // 초기 데이터 백업 (변경점 비교용)
  const [originalSectionData, setOriginalSectionData] = useState({});
  // 유입경로 입력을 위한 상태
  const [selectedFunnel, setSelectedFunnel] = useState('');
  const [suffixInput, setSuffixInput] = useState('');

  const { validateSectionFields } = useFormValidation();
  const { setDrawerClose, fetchCustomerDetail, fetchCustomerList } =
    useCustomer();

  // 변경된 필드만 추출하는 함수
  const getChangedFields = () => {
    const changes = {};

    // 필드 매핑 (프론트엔드 필드명 -> 백엔드 필드명)
    const fieldMapping = {
      coClassification: 'co_classification',
      businessScale: 'business_scale',
      businessNumber: 'business_number',
      businessType: 'business_type',
      commencementDate: 'commencement_date',
      representativeName: 'representative_name',
      funnel: 'funnel',
      supportPrograms: 'support_program',
    };

    // 각 필드 비교
    Object.keys(editedData).forEach((key) => {
      const originalKey = fieldMapping[key] || key;
      const originalValue =
        key === 'coClassification' || key === 'businessScale'
          ? originalSectionData[key]
          : originalSectionData[originalKey];

      if (!isEqual(editedData[key], originalValue)) {
        // 변경된 필드만 추가
        if (key === 'coClassification' || key === 'businessScale') {
          // ID 형태로 저장된 필드는 객체 형태로 변환
          changes[originalKey] = { id: editedData[key] };
        } else {
          changes[originalKey] = editedData[key];
        }
      }
    });

    return changes;
  };

  // 섹션 편집 시작
  const startEditing = (section) => {
    // 초기 편집 데이터 설정 - 데이터 구조 맞추기
    const initialEditData = {
      // 기본 필드 추가
      name: initialData.name,
      email: initialData.email,
      phone: initialData.phone,
      address: initialData.address,
      city: initialData.city,
      homepage: initialData.homepage,
      description: initialData.description,

      // 필드명 일관성 유지 (API 형식과 폼 필드명 매칭)
      coClassification: initialData.co_classification?.id,
      businessScale: initialData.business_scale?.id,
      businessNumber: initialData.business_number,
      businessType: initialData.business_type || [],
      commencementDate: initialData.commencement_date,
      representativeName: initialData.representative_name,
      funnel: initialData.funnel || [],
      supportPrograms: initialData.support_program || [],
      employee: initialData.employee?.id,
      region: initialData.region?.id,
    };

    // 초기 데이터 백업 (변경점 비교용)
    const originalData = {
      name: initialData.name,
      email: initialData.email,
      phone: initialData.phone,
      address: initialData.address,
      city: initialData.city,
      homepage: initialData.homepage,
      description: initialData.description,

      coClassification: initialData.co_classification?.id,
      businessScale: initialData.business_scale?.id,
      business_number: initialData.business_number,
      business_type: initialData.business_type || [],
      commencement_date: initialData.commencement_date,
      representative_name: initialData.representative_name,
      funnel: initialData.funnel || [],
      support_program: initialData.support_program || [],
      employee: initialData.employee?.id,
      region: initialData.region?.id,
    };

    console.log('편집 시작 - 초기 데이터:', initialEditData);
    console.log('전달 받은 data', initialData);

    setEditedData(initialEditData);
    setOriginalSectionData(originalData);
    setEditingSection(section);

    // 입력 필드 초기화
    setSelectedFunnel('');
    setSuffixInput('');
  };

  // 편집 취소
  const cancelEditing = () => {
    setEditingSection(null);
    setEditedData({});
    setOriginalSectionData({});

    // 입력 필드 초기화
    setSelectedFunnel('');
    setSuffixInput('');
  };

  // 편집 저장
  const saveEditing = async () => {
    try {
      // 변경된 필드만 추출
      const changedFields = getChangedFields();
      // 현재 편집 중인 섹션의 필드 검증
      const validation = validateSectionFields(editedData, editingSection);
      console.log(`폼검증 결과 : `, validation);
      if (!validation.isValid) {
        // 검증 실패 처리
        console.log('폼 검증 실패:', validation.errors);
        // setValidationErrors(validation.errors);
        notification.error({
          message: '입력 오류',
          description: '입력한 내용을 확인해주세요.',
        });
        return;
      }

      // 변경된 필드가 있는 경우에만 업데이트
      if (Object.keys(changedFields).length > 0) {
        // 업데이트할 데이터 생성
        // const updateData = {
        //   id: data.id, // 항상 ID는 포함
        //   documentId: data.documentId,
        //   ...changedFields,
        // };
        // 업데이트트
        console.log('변경된 필드만 업데이트:', changedFields);
        // onUpdate(updateData);
        await customerSubmitService.updateCustomerBase(
          initialData.documentId,
          changedFields,
        );

        // 상태 초기화
        setEditingSection(null);
        setEditedData({});
        setOriginalSectionData({});
        const updateData = await fetchCustomerDetail(initialData.id);
        setDrawer({ controlMode: 'view', data: updateData.data[0] });
      } else {
        console.log('변경된 필드가 없습니다.');
      }
    } catch (error) {
      // 에러처리리
    }
  };

  // 필드 값 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 사업자번호 입력 처리
  const handleBusinessNumberChange = (e) => {
    const formattedValue = formatBusinessNumber(e.target.value);
    // 화면에는 형식이 적용된 값을 표시
    e.target.value = formattedValue;
    // 저장을 위해 정규화된 값을 form 데이터에 업데이트
    const normalizedValue = normalizeBusinessNumber(formattedValue);
    setEditedData((prev) => ({
      ...prev,
      businessNumber: normalizedValue,
    }));
  };

  // 다중 선택 필드 변경 처리 (체크박스)
  const handleMultiSelectChange = (fieldName, item, isChecked) => {
    // 현재 선택된 항목 배열 가져오기 (없으면 빈 배열)
    const currentItems = editedData[fieldName] || [];

    let updatedItems;
    if (isChecked) {
      // 체크된 경우: 이미 있는지 확인 후 추가
      const exists = currentItems.some(
        (existingItem) => existingItem.id === item.id,
      );
      updatedItems = exists
        ? currentItems
        : [...currentItems, { id: item.id, name: item.name }];
    } else {
      // 체크 해제된 경우: 배열에서 제거
      updatedItems = currentItems.filter(
        (existingItem) => existingItem.id !== item.id,
      );
    }

    // 상태 업데이트
    setEditedData((prev) => ({
      ...prev,
      [fieldName]: updatedItems,
    }));
  };

  // 유입경로 추가
  const handleAddFunnel = (codebooks) => {
    if (!selectedFunnel) return;

    // 선택된 유입경로 정보 가져오기
    const funnelItem = codebooks?.co_funnel?.data?.find(
      (item) => String(item.id) === String(selectedFunnel),
    );

    if (!funnelItem) return;

    // 추가할 유입경로 객체 생성
    const newFunnel = {
      // id: funnelItem.id,
      name: funnelItem.name,
      suffix: suffixInput.trim(), // 입력된 suffix 추가
    };

    // 현재 유입경로 배열 가져오기
    const currentFunnels = [...(editedData.funnel || [])];

    // 업데이트된 배열로 상태 갱신
    setEditedData((prev) => ({
      ...prev,
      funnel: [...currentFunnels, newFunnel],
    }));

    // 입력 필드 초기화
    setSelectedFunnel('');
    setSuffixInput('');
  };

  // 유입경로 제거
  const handleRemoveFunnel = (index) => {
    const currentFunnels = [...(editedData.funnel || [])];
    currentFunnels.splice(index, 1);

    setEditedData((prev) => ({
      ...prev,
      funnel: currentFunnels,
    }));
  };

  // 결제 매출 정보 삭제
  const handleDeleteCustomer = async (customerInfo) => {
    console.log(`>> handlepayment delete : `, customerInfo.id);
    // notification 실행

    try {
      await customerSubmitService.deleteCustomer(customerInfo.documentId);
      // 성공 알림 표시
      //   openSuccessModal('삭제 완료', '고객 정보가 성공적으로 삭제되었습니다.');
      // 고객사 정보 & Drawer close
      fetchCustomerList();
      setDrawerClose();
    } catch (error) {
      // 실패 알림 표시
      //   openErrorModal(
      //     '삭제 실패',
      //     `고객 정보 삭제 중 오류가 발생했습니다: ${
      //       error.message || '알 수 없는 오류'
      //     }`,
      //   );
    }
  };

  return {
    //상태
    editingSection,
    editedData,
    //
    startEditing,
    cancelEditing,
    saveEditing,
    handleChange,
    handleBusinessNumberChange,
    handleAddFunnel,
    handleRemoveFunnel,
    handleMultiSelectChange,
    handleDeleteCustomer,
    selectedFunnel,
    setSelectedFunnel,
    suffixInput,
    setSuffixInput,
  };
};
