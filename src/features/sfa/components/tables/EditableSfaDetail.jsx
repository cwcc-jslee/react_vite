// src/features/sfa/components/tables/EditableSfaDetail.jsx
import React from 'react';
import * as Icons from 'lucide-react';
import { CustomerSearchInput } from '../../../../shared/components/customer/CustomerSearchInput';
import {
  Description,
  DescriptionRow,
  DescriptionItem,
  Input,
  Select,
  Switch,
  Stack,
  Checkbox,
} from '../../../../shared/components/ui';
import { useEditableField } from '../../hooks/useEditableField';

/**
 * 수정 가능한 SFA 상세 정보 컴포넌트
 * @param {Object} props
 * @param {Object} props.data - SFA 상세 데이터
 * @param {Object} props.sfaSalesTypeData - 매출유형 데이터
 */
const EditableSfaDetail = ({
  data,
  sfaSalesTypeData,
  sfaClassificationData,
}) => {
  const {
    editState,
    partnerState,
    startEditing,
    saveEditing,
    cancelEditing,
    handleValueChange,
    handlePartnerStateChange,
  } = useEditableField(data);

  const { editField } = editState;

  console.log(`**** EditableSfaDetail's Data : ${data.documentId}`);

  // 편집 가능한 필드 정의
  const editableFields = {
    name: {
      type: 'text',
      label: '건명',
      value: data?.name,
      getValue: (data) => data?.name || '',
      editable: true,
    },
    sfa_sales_type: {
      type: 'select',
      label: '매출유형',
      value: data?.sfa_sales_type?.id,
      getValue: (data) => data?.sfa_sales_type?.id || '',
      getDisplayValue: (data) => data?.sfa_sales_type?.name || '-',
      editable: true,
    },
    sfa_classification: {
      type: 'select',
      label: '매출구분',
      value: data?.sfa_classification?.id,
      getValue: (data) => data?.sfa_classification?.id || '',
      getDisplayValue: (data) => data?.sfa_classification?.name || '-',
      editable: true,
    },
    customer: {
      type: 'customer',
      label: '고객사',
      value: data?.customer?.id,
      getValue: (data) => data?.customer?.id || '',
      getDisplayValue: (data) => data?.customer?.name || '-',
      editable: true,
    },
    is_project: {
      type: 'switch',
      label: '프로젝트여부',
      value: data?.is_project,
      getValue: (data) => data?.is_project || false,
      getDisplayValue: (data) => (data?.is_project ? 'YES' : 'NO'),
      editable: true,
    },
    description: {
      type: 'text',
      label: '비고',
      value: data?.description,
      getValue: (data) => data?.description || '',
      editable: true,
    },
  };

  // 편집 버튼 렌더링
  const renderEditButtons = () => (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        onClick={() => saveEditing()}
        className="flex items-center justify-center h-7 w-7 rounded-sm hover:bg-green-100"
      >
        <Icons.Check className="h-4 w-4 text-green-600" strokeWidth={2.5} />
      </button>
      <button
        type="button"
        onClick={cancelEditing}
        className="flex items-center justify-center h-7 w-7 rounded-sm hover:bg-red-100"
      >
        <Icons.X className="h-4 w-4 text-red-600" strokeWidth={2.5} />
      </button>
    </div>
  );

  // 편집 가능한 필드 렌더링
  const renderEditableField = (fieldName, content) => {
    const isEditing = editField === fieldName;

    // 특수 필드 처리 (매출파트너, 프로젝트여부)
    if (fieldName === 'selling_partner') {
      return (
        <div className="group relative flex items-center justify-between w-full h-8">
          {isEditing ? (
            <div className="flex items-center w-full gap-1">
              <div className="flex items-center gap-2 flex-grow">
                <Checkbox
                  id="has_partner"
                  checked={partnerState.pendingState}
                  onChange={(e) => handlePartnerStateChange(e)}
                  // disabled={isSubmitting}
                />
                <CustomerSearchInput
                  value={editState.newValue}
                  onSelect={(selected) => {
                    handleValueChange({
                      target: {
                        value: selected.id,
                        type: 'customer-search', // 커스텀 타입 지정
                        name: selected.name,
                      },
                    });
                  }}
                  disabled={!partnerState.pendingState}
                  size="small"
                />
              </div>
              {renderEditButtons()}
            </div>
          ) : (
            <div className="flex items-center w-full h-8">
              <span className="flex-grow truncate">
                {partnerState.isEnabled
                  ? data?.selling_partner?.name || '-'
                  : 'NO'}
              </span>
              <button
                type="button"
                onClick={() => startEditing(fieldName)}
                className="invisible group-hover:visible flex items-center justify-center 
                         h-7 w-7 rounded-sm hover:bg-blue-100"
              >
                <Icons.Edit
                  className="h-4 w-4 text-blue-600"
                  strokeWidth={2.5}
                />
              </button>
            </div>
          )}
        </div>
      );
    }

    if (fieldName === 'is_project') {
      return (
        <div className="group relative flex items-center justify-between w-full h-8">
          {isEditing ? (
            <div className="flex items-center w-full gap-1">
              <div className="flex-grow">
                <Switch
                  checked={editState.newValue}
                  onChange={() =>
                    handleValueChange({
                      target: {
                        value: !editState.newValue,
                        type: 'switch',
                      },
                    })
                  }
                />
              </div>
              {renderEditButtons()}
            </div>
          ) : (
            <div className="flex items-center w-full h-8">
              <span className="flex-grow truncate">
                {data?.is_project ? 'YES' : 'NO'}
              </span>
              <button
                type="button"
                onClick={() => startEditing(fieldName)}
                className="invisible group-hover:visible flex items-center justify-center 
                           h-7 w-7 rounded-sm hover:bg-blue-100"
              >
                <Icons.Edit
                  className="h-4 w-4 text-blue-600"
                  strokeWidth={2.5}
                />
              </button>
            </div>
          )}
        </div>
      );
    }

    // 기본 필드 렌더링
    const field = editableFields[fieldName];
    if (!field?.editable) return content;

    return (
      <div className="group relative flex items-center justify-between w-full h-8">
        {isEditing ? (
          <div className="flex items-center w-full gap-1">
            <div className="flex-grow">
              {field.type === 'select' && field.label === '매출유형' ? (
                <Select
                  value={editState.newValue}
                  onChange={handleValueChange}
                  className="w-full h-8 text-sm"
                >
                  <option value="">선택하세요</option>
                  {sfaSalesTypeData?.data?.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </Select>
              ) : field.type === 'select' && field.label === '매출구분' ? (
                <Select
                  value={editState.newValue}
                  onChange={handleValueChange}
                  className="w-full h-8 text-sm"
                >
                  <option value="">선택하세요</option>
                  {sfaClassificationData?.data?.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </Select>
              ) : field.type === 'customer' ? (
                <CustomerSearchInput
                  value={editState.newValue}
                  onSelect={(selected) => {
                    handleValueChange({
                      target: {
                        value: selected.id,
                        type: 'customer-search', // 커스텀 타입 지정
                        name: selected.name,
                      },
                    });
                  }}
                  size="small"
                />
              ) : (
                <Input
                  type="text"
                  value={editState.newValue}
                  onChange={handleValueChange}
                  className="w-full h-8 text-sm"
                />
              )}
            </div>
            {renderEditButtons()}
          </div>
        ) : (
          <div className="flex items-center w-full h-8">
            <span className="flex-grow truncate">{content}</span>
            <button
              type="button"
              onClick={() => startEditing(fieldName, editableFields)}
              className="invisible group-hover:visible flex items-center justify-center 
                          h-7 w-7 rounded-sm hover:bg-blue-100"
            >
              <Icons.Edit className="h-4 w-4 text-blue-600" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    );
  };

  // 컴포넌트 렌더링
  return (
    <Description className="text-sm">
      {/* 기존 렌더링 코드와 동일 */}
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
        <DescriptionItem className="px-0.5">
          {renderEditableField(
            'sfa_sales_type',
            editableFields.sfa_sales_type.getDisplayValue(data),
          )}
        </DescriptionItem>
      </DescriptionRow>

      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          고객사
        </DescriptionItem>
        <DescriptionItem className="px-0.5">
          {renderEditableField(
            'customer',
            editableFields.customer.getDisplayValue(data),
          )}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          매출파트너
        </DescriptionItem>
        <DescriptionItem className="px-0.5">
          {renderEditableField('selling_partner', null)}
        </DescriptionItem>
      </DescriptionRow>

      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          프로젝트여부
        </DescriptionItem>
        <DescriptionItem className="px-0.5">
          {renderEditableField('is_project', null)}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          매출구분
        </DescriptionItem>
        <DescriptionItem>
          {/* {renderEditableField(
            'sfa_classification',
            editableFields.sfa_classification.getDisplayValue(data),
          )} */}
          {data.sfa_classification?.name || '-'}
        </DescriptionItem>
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
          {/* {typeof data.sales_profit === 'number'
            ? data.sales_profit.toLocaleString()
            : '-'} */}
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
  );
};

export default EditableSfaDetail;
