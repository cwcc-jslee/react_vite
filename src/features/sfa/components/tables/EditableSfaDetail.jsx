// src/features/sfa/components/tables/EditableSfaDetail.jsx
import React, { useState } from 'react';
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
import { useSfaStore } from '../../hooks/useSfaStore';
import { useUiStore } from '../../../../shared/hooks/useUiStore';
import { transformToDBFields } from '../../utils/transformUtils';
import { sfaSubmitService } from '../../services/sfaSubmitService';
import SfaEditItemForm from '../forms/SfaEditItemForm';

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

  const { data: codebooks, isLoading: isLoadingCodebook } = useCodebook([
    'sfaSalesType',
    'sfaClassification',
    'sfaItemType', // 매출품목 타입 추가
  ]);

  // SFA Store actions 가져오기
  const { form, actions } = useSfaStore();

  // UI Store actions 가져오기
  const { actions: uiActions } = useUiStore();

  const { editField } = editState;

  // 사업부 매출 편집 상태 관리
  const [isSfaByItemsEditing, setIsSfaByItemsEditing] = useState(false);

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
    sfaByItems: {
      type: 'sfaByItems',
      label: '사업부 매출',
      value: data?.sfaByItems,
      getValue: (data) => {
        const value = data?.sfaByItems || [];
        console.log('sfaByItems getValue:', value);
        return value;
      },
      getDisplayValue: (data) => formatSfaByItems(data?.sfaByItems),
      editable: true,
    },
  };

  // 고객유형 변경 핸들러
  const handleCustomerTypeChange = (isSameBilling) => {
    handleValueChange(isSameBilling);
  };

  // 사업부 매출 편집 시작
  const startEditingSfaByItems = () => {
    // 기존 sfaByItems 데이터를 sfaDraftItems로 복사
    const draftItems = (data?.sfaByItems || []).map((item) => ({
      id: item.id,
      itemId: item.itemId,
      itemName: item.itemName,
      teamId: item.teamId,
      teamName: item.teamName,
      amount: item.amount ?? item.itemPrice ?? '',
    }));

    // sfaDraftItems에 데이터 설정
    actions.form.updateField('sfaDraftItems', draftItems);
    setIsSfaByItemsEditing(true);
  };

  // 사업부 매출 편집 저장
  const saveSfaByItems = async (updatedItems) => {
    console.log('>>>>> saveSfaByItems: ', updatedItems);

    try {
      const sfaId = data.documentId;
      const sfaByItemsField = editableFields.sfaByItems;
      const currentValue = sfaByItemsField.getValue(data);

      console.log('=== 사업부 매출 저장 시작 ===');
      console.log('SFA ID:', sfaId);
      console.log('현재 값:', currentValue);
      console.log('새로운 값:', updatedItems);

      // 값이 같은지 비교 (JSON 문자열로 비교)
      const valuesEqual =
        JSON.stringify(currentValue) === JSON.stringify(updatedItems);

      if (!valuesEqual) {
        // 사업부 매출 데이터를 DB 형식으로 변환
        const transformedItems =
          transformToDBFields.transformSalesByItems(updatedItems);
        const formData = {
          sfa_by_items: transformedItems,
        };

        console.log('변환된 데이터:', transformedItems);
        console.log('폼 데이터:', formData);

        // 서버 업데이트
        await sfaSubmitService.updateSfaBase(sfaId, formData);

        // 최신 데이터 조회 및 UI 업데이트
        const updateAction = await actions.data.fetchSfaDetail(data.id);

        if (updateAction.meta.requestStatus === 'fulfilled') {
          const updatedData = updateAction.payload;

          uiActions.drawer.update({
            mode: 'view',
            featureMode: null,
            data: updatedData,
          });

          console.log('=== 사업부 매출 저장 성공 ===');
        }
      } else {
        console.log('=== 값 동일로 업데이트 생략 ===');
      }

      // 저장 후 sfaDraftItems 초기화 및 편집 모드 종료
      actions.form.updateField('sfaDraftItems', []);
      setIsSfaByItemsEditing(false);
    } catch (error) {
      console.error('사업부 매출 저장 실패:', error);
      // 에러 발생 시 편집 상태 초기화
      actions.form.updateField('sfaDraftItems', []);
      setIsSfaByItemsEditing(false);
    }
  };

  // 사업부 매출 편집 취소
  const cancelSfaByItems = () => {
    // 취소 시 sfaDraftItems 초기화
    actions.form.updateField('sfaDraftItems', []);
    setIsSfaByItemsEditing(false);
    // useEditableField의 편집 상태도 초기화
    cancelEditing();
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

    // 사업부 매출 필드 처리
    if (fieldName === 'sfaByItems') {
      return (
        <div className="group relative flex items-center justify-between w-full min-h-8">
          {isEditing ? (
            <SfaEditItemForm
              data={form.data.sfaDraftItems} // sfaDraftItems 사용
              onSave={saveSfaByItems}
              onCancel={cancelSfaByItems}
              codebooks={codebooks}
              isLoadingCodebook={isLoadingCodebook}
              isEditing={isSfaByItemsEditing}
              sfaClassificationId={data?.sfaClassification?.id}
            />
          ) : (
            <div className="flex items-center w-full min-h-8">
              <span className="flex-grow">{content}</span>
              <button
                type="button"
                onClick={() => {
                  startEditingSfaByItems();
                  startEditing(fieldName, editableFields);
                }}
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

      {/* 5행: 사업부 매출 */}
      <DescriptionRow>
        <DescriptionItem label width="w-[140px]">
          사업부 매출
        </DescriptionItem>
        <DescriptionItem className="px-0.5">
          {featureMode !== 'editBase'
            ? renderSfaByItems(data.sfaByItems)
            : renderEditableField(
                'sfaByItems',
                renderSfaByItems(data.sfaByItems),
              )}
        </DescriptionItem>
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
