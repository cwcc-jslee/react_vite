// src/features/customer/components/tables/EditableCustomerDetail.jsx
import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { useCodebook } from '../../../../shared/hooks/useCodebook';
import { useCustomerForm } from '../../hooks/useCustomerForm';
import CustomerDetailTable from './CustomerDetailTable';
import CustomerSectionEditor from './CustomerSectionEditor';

/**
 * 편집 가능한 고객사 상세 정보 컴포넌트
 * 섹션별 인라인 편집 기능 제공
 * @param {Object} props
 * @param {Object} props.data - 고객사 상세 데이터
 * @param {Object} props.codebooks - 코드북 데이터
 * @param {Function} props.onUpdate - 업데이트 처리 함수
 * @param {boolean} props.editable - 편집 가능 여부
 */
const EditableCustomerDetail = ({ data, onUpdate, editable = true }) => {
  // 현재 편집 중인 섹션
  const [editingSection, setEditingSection] = useState(null);

  const {
    data: codebooks,
    isLoading: isLoadingCodebook,
    error,
  } = useCodebook([
    'coClassification',
    'businessScale',
    'coFunnel',
    'employee',
    'businessType',
    'region',
  ]);

  // 고객 폼 관련 상태 및 함수 훅
  const {
    formData,
    originalData,
    updateFormField,
    updateMultipleFields,
    getChangedFields,
    isSubmitting,
    errors,
  } = useCustomerForm(data, (updatedData) => {
    // 업데이트 성공 시 콜백
    onUpdate(updatedData);
    setEditingSection(null);
  });

  if (!data) return null;

  // 편집 모드 시작
  const startEditing = (section) => {
    setEditingSection(section);
  };

  // 편집 취소
  const cancelEditing = () => {
    setEditingSection(null);
  };

  // 편집 저장
  const saveEditing = () => {
    // 변경된 필드만 추출하여 업데이트
    const changedFields = getChangedFields();

    if (Object.keys(changedFields).length === 0) {
      // 변경된 필드가 없으면 편집 모드만 종료
      setEditingSection(null);
      return;
    }

    // ID 포함하여 업데이트 요청
    onUpdate({
      id: data.id,
      ...changedFields,
    });

    // 편집 모드 종료
    setEditingSection(null);
  };

  // 섹션 편집 버튼 렌더링
  const renderSectionEditButton = (section) => {
    if (!editable) return null;

    if (editingSection === section) {
      return (
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={saveEditing}
            disabled={isSubmitting}
            className="flex items-center justify-center h-7 w-7 rounded-sm hover:bg-green-100"
            title="저장"
          >
            <Icons.Check className="h-4 w-4 text-green-600" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={cancelEditing}
            disabled={isSubmitting}
            className="flex items-center justify-center h-7 w-7 rounded-sm hover:bg-red-100"
            title="취소"
          >
            <Icons.X className="h-4 w-4 text-red-600" strokeWidth={2.5} />
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => startEditing(section)}
        className="invisible group-hover:visible flex items-center justify-center h-7 w-7 rounded-sm hover:bg-blue-100"
        title="편집"
      >
        <Icons.Edit className="h-4 w-4 text-blue-600" strokeWidth={2.5} />
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* 기본 정보 섹션 */}
      <div className="group">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium">기본 정보</h3>
          {renderSectionEditButton('basic')}
        </div>

        {editingSection === 'basic' ? (
          <CustomerSectionEditor
            section="basic"
            data={formData}
            codebooks={codebooks}
            onChange={updateFormField}
            onMultiChange={updateMultipleFields}
            errors={errors}
          />
        ) : (
          <CustomerDetailTable data={data} section="basic" />
        )}
      </div>

      {/* 유입경로 섹션 */}
      <div className="group">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium">유입경로</h3>
          {renderSectionEditButton('funnel')}
        </div>

        {editingSection === 'funnel' ? (
          <CustomerSectionEditor
            section="funnel"
            data={formData}
            codebooks={codebooks}
            onChange={updateFormField}
            onMultiChange={updateMultipleFields}
            errors={errors}
          />
        ) : (
          <CustomerDetailTable data={data} section="funnel" />
        )}
      </div>

      {/* 업체 정보 섹션 */}
      <div className="group">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium">업체 정보</h3>
          {renderSectionEditButton('company')}
        </div>

        {editingSection === 'company' ? (
          <CustomerSectionEditor
            section="company"
            data={formData}
            codebooks={codebooks}
            onChange={updateFormField}
            onMultiChange={updateMultipleFields}
            errors={errors}
          />
        ) : (
          <CustomerDetailTable data={data} section="company" />
        )}
      </div>

      {/* 연락처 섹션 */}
      <div className="group">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium">연락처</h3>
          {renderSectionEditButton('contact')}
        </div>

        {editingSection === 'contact' ? (
          <CustomerSectionEditor
            section="contact"
            data={formData}
            codebooks={codebooks}
            onChange={updateFormField}
            onMultiChange={updateMultipleFields}
            errors={errors}
          />
        ) : (
          <CustomerDetailTable data={data} section="contact" />
        )}
      </div>

      {/* 지원사업 섹션 */}
      <div className="group">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium">지원사업</h3>
          {renderSectionEditButton('support')}
        </div>

        {editingSection === 'support' ? (
          <CustomerSectionEditor
            section="support"
            data={formData}
            codebooks={codebooks}
            onChange={updateFormField}
            onMultiChange={updateMultipleFields}
            errors={errors}
          />
        ) : (
          <CustomerDetailTable data={data} section="support" />
        )}
      </div>

      {/* 비고 섹션 */}
      <div className="group">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium">비고</h3>
          {renderSectionEditButton('note')}
        </div>

        {editingSection === 'note' ? (
          <CustomerSectionEditor
            section="note"
            data={formData}
            codebooks={codebooks}
            onChange={updateFormField}
            onMultiChange={updateMultipleFields}
            errors={errors}
          />
        ) : (
          <CustomerDetailTable data={data} section="note" />
        )}
      </div>
    </div>
  );
};

export default EditableCustomerDetail;
