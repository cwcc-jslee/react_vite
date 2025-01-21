// src/features/sfa/components/tables/EditableSfaDetail.jsx
import React, { useState, useEffect } from 'react';
import * as Icons from 'lucide-react';
import { CustomerSearchInput } from '../../../../shared/components/customer/CustomerSearchInput';
import {
  Description,
  DescriptionRow,
  DescriptionItem,
  Input,
  Select,
  Checkbox,
  Switch,
} from '../../../../shared/components/ui';

/**
 * 수정 가능한 SFA 상세 정보 컴포넌트
 * @param {Object} props
 * @param {Object} props.data - SFA 상세 데이터
 * @param {Object} props.sfaSalesTypeData - 매출유형 데이터
 * @param {Function} props.onUpdate - 필드 업데이트 핸들러
 */
const EditableSfaDetail = ({ data, sfaSalesTypeData, onUpdate }) => {
  // 편집 상태 관리
  const [editingField, setEditingField] = useState(null);
  const [editValue, setEditValue] = useState('');

  // 매출파트너 관련 상태
  const [partnerChecked, setPartnerChecked] = useState(
    data?.has_partner || false,
  );
  const [tempPartnerChecked, setTempPartnerChecked] = useState(
    data?.has_partner || false,
  );
  const [partnerId, setPartnerId] = useState(data?.selling_partner?.id || null);

  // 프로젝트 관련 상태
  const [projectStatus, setProjectStatus] = useState(data?.is_project || false);
  const [tempProjectStatus, setTempProjectStatus] = useState(
    data?.is_project || false,
  );

  // data가 변경될 때 상태 업데이트
  useEffect(() => {
    setPartnerChecked(data?.has_partner || false);
    setTempPartnerChecked(data?.has_partner || false);
    setPartnerId(data?.selling_partner?.id || null);
    setProjectStatus(data?.is_project || false);
    setTempProjectStatus(data?.is_project || false);
  }, [data]);

  // 편집 시작
  const startEditing = (fieldName) => {
    setEditingField(fieldName);
    if (fieldName === 'selling_partner') {
      setTempPartnerChecked(partnerChecked);
    } else if (fieldName === 'is_project') {
      setTempProjectStatus(projectStatus);
    } else {
      const field = editableFields[fieldName];
      setEditValue(field?.getValue(data) || '');
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
      if (fieldName === 'selling_partner') {
        await onUpdate('has_partner', tempPartnerChecked);
        if (!tempPartnerChecked) {
          await onUpdate('selling_partner', null);
        }
        setPartnerChecked(tempPartnerChecked);
      } else if (fieldName === 'is_project') {
        await onUpdate('is_project', tempProjectStatus);
        setProjectStatus(tempProjectStatus);
      } else {
        await onUpdate(fieldName, editValue);
      }
      setEditingField(null);
      setEditValue('');
    } catch (error) {
      console.error('Failed to save:', error);
      // 에러 발생시 원래 상태로 복구
      setTempPartnerChecked(partnerChecked);
      setTempProjectStatus(projectStatus);
    }
  };

  // 값 변경 핸들러
  const handleValueChange = (e) => {
    const newValue = e.target.value;
    setEditValue(newValue);
  };

  // 파트너 선택 핸들러
  const handlePartnerSelect = async (partner) => {
    // is_partner 체크 & update 시 해당 필드정보 업데이트 필요
    // 체크에서 unckedk 시 is_partner -> false & selling_partner -> null
    setPartnerChecked(true);
    try {
      await onUpdate('selling_partner', partner.id);
      setPartnerId(partner.id);
      setEditingField(null);
    } catch (error) {
      console.error('Failed to update partner:', error);
    }
  };

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
    },
  };

  // 편집 버튼 렌더링
  const renderEditButtons = () => (
    <div className="flex shrink-0 items-center gap-0.5">
      <button
        type="button"
        onClick={() => saveEditing(editingField)}
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
    const isEditing = editingField === fieldName;

    if (fieldName === 'selling_partner') {
      return (
        <div className="group relative flex items-center justify-between w-full h-8">
          {isEditing ? (
            <div className="flex items-center w-full gap-1">
              <div className="flex items-center gap-2 flex-grow">
                <CustomerSearchInput
                  value={partnerId}
                  onSelect={handlePartnerSelect}
                  size="small"
                />
              </div>
              {renderEditButtons()}
            </div>
          ) : (
            <div className="flex items-center w-full h-8">
              <span className="flex-grow truncate">
                {partnerChecked ? data?.selling_partner?.name || '-' : 'NO'}
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
                  checked={tempProjectStatus}
                  onChange={() => setTempProjectStatus(!tempProjectStatus)}
                />
              </div>
              {renderEditButtons()}
            </div>
          ) : (
            <div className="flex items-center w-full h-8">
              <span className="flex-grow truncate">
                {projectStatus ? 'YES' : 'NO'}
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

    // 기본 필드 렌더링...
    const field = editableFields[fieldName];
    if (!field?.editable) return content;

    return (
      <div className="group relative flex items-center justify-between w-full h-8">
        {isEditing ? (
          <div className="flex items-center w-full gap-1">
            <div className="flex-grow">
              {field.type === 'select' ? (
                <Select
                  value={editValue}
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
              ) : field.type === 'customer' ? (
                <CustomerSearchInput
                  value={editValue}
                  onSelect={(selected) => {
                    setEditValue(selected.id);
                    saveEditing(fieldName);
                  }}
                  size="small"
                />
              ) : (
                <Input
                  type="text"
                  value={editValue}
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
              onClick={() => startEditing(fieldName)}
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

  // 렌더링...
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
  );
};

export default EditableSfaDetail;
