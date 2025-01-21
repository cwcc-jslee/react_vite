// src/features/sfa/components/tables/EditableSfaDetail.jsx
import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import {
  Description,
  DescriptionRow,
  DescriptionItem,
  Button,
  Input,
  Select,
} from '../../../../shared/components/ui';

/**
 * 수정 가능한 SFA 상세 정보 컴포넌트
 * @param {Object} props
 * @param {Object} props.data - SFA 상세 데이터
 * @param {Object} props.sfaSalesTypeData - 매출유형 데이터
 * @param {Function} props.onUpdate - 필드 업데이트 핸들러
 */
const EditableSfaDetail = ({ data, sfaSalesTypeData, onUpdate }) => {
  // 수정 중인 필드와 값 상태 관리
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  // 편집 가능한 필드 정의
  const editableFields = {
    name: {
      type: 'text',
      label: '건명',
      value: data?.name,
      getValue: (data) => data?.name || '',
    },
    sfa_sales_type: {
      type: 'select',
      label: '매출유형',
      value: data?.sfa_sales_type?.id,
      getValue: (data) => data?.sfa_sales_type?.id || '',
      getDisplayValue: (data) => data?.sfa_sales_type?.name || '-',
    },
    customer: {
      type: 'select',
      label: '고객사사',
      value: data?.customer?.id,
      getValue: (data) => data?.customer?.id || '',
      getDisplayValue: (data) => data?.customer?.name || '-',
    },
    description: {
      type: 'text',
      label: '비고',
      value: data?.description,
      getValue: (data) => data?.description || '',
    },
  };

  // 편집 시작
  const startEditing = (fieldName) => {
    console.log('Start editing:', fieldName);
    const field = editableFields[fieldName];
    setEditingField(fieldName);
    setEditValue(field.getValue(data));
  };

  // 편집 취소
  const cancelEditing = () => {
    console.log('Cancel editing');
    setEditingField(null);
    setEditValue('');
  };

  // 편집 저장
  const saveEditing = async (fieldName) => {
    console.log('Save editing:', fieldName, editValue);
    try {
      await onUpdate(fieldName, editValue);
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  // 값 변경 핸들러
  const handleValueChange = (e) => {
    const newValue = e.target.value;
    console.log('Value changed:', newValue);
    setEditValue(newValue);
  };

  // 편집 가능한 필드 렌더링
  const renderEditableField = (fieldName, content) => {
    const isEditing = editingField === fieldName;
    const field = editableFields[fieldName];

    if (!field) return content;

    return (
      <div className="group relative flex items-center justify-between w-full min-h-[32px]">
        {isEditing ? (
          <div className="flex items-center w-full gap-1 p-1 bg-blue-50 rounded">
            <div className="flex-grow">
              {field.type === 'select' ? (
                <Select
                  value={editValue}
                  onChange={handleValueChange}
                  className="w-full"
                >
                  <option value="">선택하세요</option>
                  {sfaSalesTypeData?.data?.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </Select>
              ) : (
                <Input
                  type="text"
                  value={editValue}
                  onChange={handleValueChange}
                  className="w-full"
                />
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => saveEditing(fieldName)}
                className="flex items-center justify-center h-7 w-7 rounded hover:bg-green-100"
              >
                <Icons.Check
                  className="h-4 w-4 text-green-600"
                  strokeWidth={2.5}
                />
              </button>
              <button
                type="button"
                onClick={cancelEditing}
                className="flex items-center justify-center h-7 w-7 rounded hover:bg-red-100"
              >
                <Icons.X className="h-4 w-4 text-red-600" strokeWidth={2.5} />
              </button>
            </div>
          </div>
        ) : (
          <div
            className="flex items-center w-full p-1 rounded transition-colors duration-150 
                           hover:bg-blue-50/80 group-hover:shadow-sm"
          >
            <span className="flex-grow">{content}</span>
            <button
              type="button"
              onClick={() => startEditing(fieldName)}
              className="invisible group-hover:visible flex items-center justify-center h-7 w-7 
                           rounded bg-white/80 hover:bg-blue-100 transition-colors duration-150"
            >
              <Icons.Edit className="h-4 w-4 text-blue-600" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    );
  };

  if (!data) return null;

  return (
    <>
      <Description>
        <DescriptionRow equalItems>
          <DescriptionItem label width="w-[140px]">
            건명
          </DescriptionItem>
          <DescriptionItem className="px-0.5">
            {renderEditableField('name', data.name || '-')}
          </DescriptionItem>
          <DescriptionItem label width="w-[140px]">
            매출유형
          </DescriptionItem>
          <DescriptionItem className="px-0">
            {renderEditableField(
              'sfa_sales_type',
              editableFields.sfa_sales_type.getDisplayValue(data),
            )}
          </DescriptionItem>
        </DescriptionRow>

        <DescriptionRow equalItems>
          <DescriptionItem label width="w-[140px]">
            고객사/매출처
          </DescriptionItem>
          <DescriptionItem>
            {renderEditableField(
              'customer',
              editableFields.customer.getDisplayValue(data),
            )}
          </DescriptionItem>
          <DescriptionItem label width="w-[140px]">
            매출처
          </DescriptionItem>
          <DescriptionItem>{data.selling_partner?.name || '-'}</DescriptionItem>
        </DescriptionRow>

        {/* 3행: 매출구분, 매출품목/사업부 */}
        <DescriptionRow equalItems>
          <DescriptionItem label width="w-[140px]">
            매출구분
          </DescriptionItem>
          <DescriptionItem>
            {data.sfa_classification?.name || '-'}
          </DescriptionItem>
          <DescriptionItem label width="w-[140px]">
            프로젝트여부
          </DescriptionItem>
          <DescriptionItem>{data.isProject ? 'YES' : 'NO'}</DescriptionItem>
        </DescriptionRow>

        {/* 4행: 매출, 매출이익 */}
        <DescriptionRow equalItems>
          <DescriptionItem label width="w-[140px]">
            결제 매출/이익
          </DescriptionItem>
          <DescriptionItem>
            {typeof data.total_price === 'number'
              ? data.total_price.toLocaleString()
              : '-'}
          </DescriptionItem>
          <DescriptionItem label width="w-[140px]">
            사업부 매출
          </DescriptionItem>
          <DescriptionItem>
            {typeof data.sales_profit === 'number'
              ? data.sales_profit.toLocaleString()
              : '-'}
          </DescriptionItem>
        </DescriptionRow>

        {/* 5행: 건명, 프로젝트여부 */}
        <DescriptionRow equalItems>
          <DescriptionItem label width="w-[140px]">
            매출확정여부
          </DescriptionItem>
          <DescriptionItem>{data.confirmed ? 'YES' : 'NO'}</DescriptionItem>
          <DescriptionItem label width="w-[140px]">
            지원프로그램
          </DescriptionItem>
          <DescriptionItem grow>{data.proposal?.name || '-'}</DescriptionItem>
        </DescriptionRow>

        {/* 6행: 비고 */}
        <DescriptionRow>
          <DescriptionItem label width="w-[140px]">
            매출품목
          </DescriptionItem>
          <DescriptionItem>{'-'}</DescriptionItem>
          {/* <DescriptionItem>{itemsAndTeams}</DescriptionItem> */}
        </DescriptionRow>

        {/* 6행: 비고 */}
        <DescriptionRow>
          <DescriptionItem label width="w-[140px]">
            비고
          </DescriptionItem>
          <DescriptionItem className="flex-1 px-0.5">
            {renderEditableField('description', data.description || '-')}
          </DescriptionItem>
        </DescriptionRow>
      </Description>
    </>
  );
};

export default EditableSfaDetail;
