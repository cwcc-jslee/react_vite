// src/features/sfa/components/tables/EditableSfaDetail.jsx
import React from 'react';
import * as Icons from 'lucide-react';
import { CheckCircle, Building2 } from 'lucide-react';
import { CustomerSearchInput } from '../../../../shared/components/customer/CustomerSearchInput';
import {
  Description,
  DescriptionRow,
  DescriptionItem,
  Input,
  Select,
  Switch,
  Badge,
} from '../../../../shared/components/ui';
import { useEditableField } from '../../hooks/useEditableField';
import {
  calculatePaymentTotals,
  formatSfaByItems,
} from '../../utils/displayUtils';
import { useCodebook } from '../../../../shared/hooks/useCodebook';

/**
 * 수정 가능한 SFA 상세 정보 컴포넌트
 */
const EditableSfaDetail = ({ data, featureMode }) => {
  const {
    editState,
    startEditing,
    saveEditing,
    cancelEditing,
    handleValueChange,
  } = useEditableField(data);

  // const {
  //   sfaSalesType: sfaSalesTypeData,
  //   sfaClassification: sfaClassificationData,
  // } = codebooks;

  const { data: codebooks, isLoading: isLoadingCodebook } = useCodebook([
    'sfaSalesType',
    'sfaClassification',
  ]);

  const { editField } = editState;

  console.log(`**** EditableSfaDetail's Data : ${data.documentId}`);
  console.log('=== EditableSfaDetail 데이터 구조 ===');
  console.log('전체 data:', data);
  console.log('codebooks:', codebooks);
  console.log('==================================');

  // 결제 매출/이익 합계 계산
  const paymentTotals = calculatePaymentTotals(data.sfaByPayments);

  // 사업부 매출 데이터를 Badge로 렌더링
  const renderSfaByItems = (itemsData) => {
    const formattedItems = formatSfaByItems(itemsData);

    if (!formattedItems) return '-';

    return (
      <div className="flex flex-wrap gap-2">
        {formattedItems.map((item) => (
          <Badge
            key={item.key}
            className="mr-1 mb-1 bg-blue-100 text-blue-800 px-2 py-1 text-xs"
          >
            {item.text}
          </Badge>
        ))}
      </div>
    );
  };

  // 편집 가능한 필드 정의
  const editableFields = {
    name: {
      type: 'text',
      label: '건명',
      value: data?.name,
      getValue: (data) => {
        const value = data?.name || '';
        console.log('name getValue:', value);
        return value;
      },
      editable: true,
    },
    sfaSalesType: {
      type: 'select',
      label: '매출유형',
      value: data?.sfaSalesType?.id,
      getValue: (data) => {
        const value = data?.sfaSalesType?.id || '';
        console.log(
          'sfaSalesType getValue:',
          value,
          'from:',
          data?.sfaSalesType,
        );
        return value;
      },
      getDisplayValue: (data) => data?.sfaSalesType?.name || '-',
      editable: true,
    },
    sfaClassification: {
      type: 'select',
      label: '매출구분',
      value: data?.sfaClassification?.id,
      getValue: (data) => {
        const value = data?.sfaClassification?.id || '';
        console.log(
          'sfaClassification getValue:',
          value,
          'from:',
          data?.sfaClassification,
        );
        return value;
      },
      getDisplayValue: (data) => data?.sfaClassification?.name || '-',
      editable: true,
    },
    customer: {
      type: 'customer',
      label: '고객사',
      value: data?.customer?.id || '',
      getValue: (data) => {
        const value = data?.customer?.id || '';
        console.log('customer getValue:', value, 'from:', data?.customer);
        return value;
      },
      getDisplayValue: (data) => data?.customer?.name || '-',
      editable: true,
    },
    isSameBilling: {
      type: 'radio',
      label: '매출처',
      value: data?.isSameBilling,
      getValue: (data) => {
        const value = data?.isSameBilling; // null, undefined, true, false 모두 그대로 유지
        console.log(
          'isSameBilling getValue:',
          value,
          'type:',
          typeof value,
          'original:',
          data?.isSameBilling,
        );
        return value;
      },
      getDisplayValue: (data) =>
        data?.isSameBilling === true
          ? '고객사와 동일'
          : data?.isSameBilling === false
          ? '별도 매출처'
          : '-',
      editable: true,
    },
    isProject: {
      type: 'switch',
      label: '프로젝트여부',
      value: data?.isProject,
      getValue: (data) => {
        const value = data?.isProject !== undefined ? data.isProject : false;
        console.log(
          'isProject getValue:',
          value,
          'type:',
          typeof value,
          'original:',
          data?.isProject,
        );
        return value;
      },
      getDisplayValue: (data) => (data?.isProject ? 'YES' : 'NO'),
      editable: true,
    },
    description: {
      type: 'text',
      label: '비고',
      value: data?.description,
      getValue: (data) => {
        const value = data?.description || '';
        console.log('description getValue:', value);
        return value;
      },
      editable: true,
    },
  };

  // 고객유형 변경 핸들러
  const handleCustomerTypeChange = (isSameBilling) => {
    handleValueChange(isSameBilling);
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
    // if (featureMode !== 'editBase') return;

    // 특수 필드 처리 (프로젝트여부, 매출처)
    if (fieldName === 'isProject') {
      return (
        <div className="group relative flex items-center justify-between w-full h-8">
          {isEditing ? (
            <div className="flex items-center w-full gap-1">
              <div className="flex items-center flex-grow">
                <Switch
                  checked={editState.newValue === true}
                  onChange={() =>
                    handleValueChange(!(editState.newValue === true))
                  }
                  size="sm"
                />
                <span className="ml-2 text-sm">
                  {editState.newValue ? 'YES' : 'NO'}
                </span>
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

    if (fieldName === 'isSameBilling') {
      return (
        <div className="group relative flex items-center justify-between w-full h-8">
          {isEditing ? (
            <div className="flex items-center w-full gap-1">
              <div className="flex space-x-4 flex-grow">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="customerType"
                    className="text-blue-600 focus:ring-blue-500"
                    checked={editState.newValue === true}
                    onChange={() => handleCustomerTypeChange(true)}
                  />
                  <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                  <span className="ml-1 text-sm text-gray-700">
                    고객사와 동일
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="customerType"
                    className="text-blue-600 focus:ring-blue-500"
                    checked={editState.newValue === false}
                    onChange={() => handleCustomerTypeChange(false)}
                  />
                  <Building2 className="ml-2 h-4 w-4 text-blue-500" />
                  <span className="ml-1 text-sm text-gray-700">
                    별도 매출처
                  </span>
                </label>
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
                  {codebooks?.sfaSalesType?.map((option) => (
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
                  {codebooks?.sfaClassification?.map((option) => (
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
          {featureMode !== 'editBase'
            ? data.name || '-'
            : renderEditableField('name', data.name || '-')}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          매출유형
        </DescriptionItem>
        <DescriptionItem className="px-0.5">
          {featureMode !== 'editBase'
            ? data.sfaSalesType?.name || '-'
            : renderEditableField(
                'sfaSalesType',
                editableFields.sfaSalesType.getDisplayValue(data),
              )}
        </DescriptionItem>
      </DescriptionRow>

      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          고객사
        </DescriptionItem>
        <DescriptionItem className="px-0.5">
          {/* {data?.customer?.name || '-'} */}
          {featureMode !== 'editBase'
            ? data?.customer?.name || '-'
            : renderEditableField(
                'customer',
                editableFields.customer.getDisplayValue(data),
              )}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          매출처
        </DescriptionItem>
        <DescriptionItem className="px-0.5">
          {featureMode !== 'editBase'
            ? data.isSameBilling === true
              ? '고객사와 동일'
              : data.isSameBilling === false
              ? '별도 매출처'
              : '-'
            : renderEditableField(
                'isSameBilling',
                editableFields.isSameBilling.getDisplayValue(data),
              )}
        </DescriptionItem>
      </DescriptionRow>

      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          매출구분
        </DescriptionItem>
        <DescriptionItem>
          {/* {renderEditableField(
            'sfaClassification',
            editableFields.sfaClassification.getDisplayValue(data),
          )} */}
          {data.sfaClassification?.name || '-'}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          프로젝트여부
        </DescriptionItem>
        <DescriptionItem className="px-0.5">
          {featureMode !== 'editBase'
            ? data.isProject
              ? 'YES'
              : 'NO'
            : renderEditableField(
                'isProject',
                editableFields.isProject.getDisplayValue(data),
              )}
        </DescriptionItem>
      </DescriptionRow>
      {/* 4행: 매출, 매출이익 */}
      <DescriptionRow equalItems>
        <DescriptionItem label width="w-[140px]">
          결제 매출/이익
        </DescriptionItem>
        <DescriptionItem>
          {paymentTotals.totalAmount > 0 || paymentTotals.totalProfit > 0
            ? `${paymentTotals.totalAmount.toLocaleString()} / ${paymentTotals.totalProfit.toLocaleString()}`
            : '-'}
        </DescriptionItem>
        <DescriptionItem label width="w-[140px]">
          _
        </DescriptionItem>
        <DescriptionItem></DescriptionItem>
      </DescriptionRow>

      {/* 5행: 비고 */}
      <DescriptionRow>
        <DescriptionItem label width="w-[140px]">
          사업부 매출
        </DescriptionItem>
        <DescriptionItem>{renderSfaByItems(data.sfaByItems)}</DescriptionItem>
      </DescriptionRow>

      {/* 6행: 비고 */}
      <DescriptionRow>
        <DescriptionItem label width="w-[140px]">
          비고
        </DescriptionItem>
        <DescriptionItem className="flex-1 px-0.5">
          {featureMode !== 'editBase'
            ? data.description || '-'
            : renderEditableField('description', data.description || '-')}
        </DescriptionItem>
      </DescriptionRow>
    </Description>
  );
};

export default EditableSfaDetail;
