// src/features/sfa/components/forms/SfaAddForm/index.jsx
import React, { useState } from 'react';
import { CustomerSearchInput } from '@shared/components/customer/CustomerSearchInput';
import { formatDisplayNumber } from '@shared/utils/format/number';
import SalesByItem from '../elements/SalesByItem.jsx';
import SalesAddByPayment from '../elements/SalesAddByPayment.jsx';
import RevenueSource from '../elements/RevenueSource.jsx';
import SalesItemSection from '../sections/SalesItemSection.jsx';
import { useSfaForm1 } from '../../hooks/useSfaForm1.js';
import { useSfaStore } from '../../hooks/useSfaStore.js';
import { useSfaOperations } from '../../hooks/useSfaSubmit.js';
import useModal from '@shared/hooks/useModal.js';
import ModalRenderer from '@shared/components/ui/modal/ModalRenderer.jsx';
import {
  Form,
  FormItem,
  Group,
  Stack,
  Label,
  Input,
  Select,
  TextArea,
  Button,
  Checkbox,
  Switch,
  Message,
  Col,
} from '@shared/components/ui';
import { FORM_LIMITS } from '../../constants/formInitialState';
import {
  X,
  Plus,
  Trash2,
  Building2,
  Users,
  CheckCircle,
  Briefcase,
} from 'lucide-react';
import { useCodebook } from '../../../../shared/hooks/useCodebook';
import { getUniqueRevenueSources } from '../../utils/transformUtils';

const SfaAddForm = () => {
  // useSfaStore에서 form과 actions 직접 가져오기
  const { form, actions } = useSfaStore();
  const errors = form.errors || {};
  const isSubmitting = form.isSubmitting;

  // useSfaForm1에서 모든 핸들러 가져오기
  const {
    updateFormField,
    handleAddSalesItem,
    handleRemoveSalesItem,
    handleSalesItemChange,
    handleAddPayment,
    handleAddPaymentWithAllocation,
    handleRemovePayment,
    handlePaymentChange,
    handleCustomerSelect,
    isItemsLoading,
    itemsData,
    handleProjectToggle,
    handleCustomerTypeChange,
    handleRevenueSourceSelect,
    handleTeamModeToggle,
    handlePaymentAmountChange,
    handleAllocationChange,
    handleAutoAllocateByRatio,
    handleEqualDistribute,
    validateForm,
    checkAmounts,
  } = useSfaForm1();

  // useSfaOperations에서 제출 로직 가져오기
  const { createSfa } = useSfaOperations();

  // useModal 훅 사용
  const { modalState, openModal, closeModal, handleConfirm } = useModal();

  // SfaAddForm에서 필요한 모든 codebook 직접 조회
  const {
    data: codebooks,
    isLoading: isLoadingCodebook,
    error: codebookError,
  } = useCodebook([
    'sfaSalesType',
    'sfaClassification',
    'rePaymentMethod',
    'sfaPercentage',
    'fy', // 회계년도
  ]);

  // revenueSource 데이터 중복 제거 및 정렬
  const uniqueRevenueSources = getUniqueRevenueSources(form.data.sfaByPayments);

  // 조건부 렌더링 값들
  const hasCustomer = !!form.data.customer?.id;
  const hasPayments = form.data.sfaByPayments?.length > 0;
  const hasItems = form.data.sfaByItems?.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 유효성 검사 수행
    const { isValid } = validateForm(form.data);
    if (!isValid) return;

    // 금액 일치 여부 확인
    if (!checkAmounts(form.data)) {
      // 금액 불일치 모달 열기
      openAmountConfirmModal();
    } else {
      await createSfa(form.data);
    }
  };

  // 금액 불일치 확인 모달 열기
  const openAmountConfirmModal = () => {
    const message = (
      <div className="space-y-4">
        <p className="text-base">
          사업부매출금액과 결제매출금액이 일치하지 않습니다.
        </p>
        <div className="space-y-2">
          <p>• 사업부매출금액: {formatDisplayNumber(form.data.itemAmount)}원</p>
          <p>
            • 결제매출금액: {formatDisplayNumber(form.data.paymentAmount)}원
          </p>
        </div>
        <p className="text-gray-600">금액이 다르더라도 진행하시겠습니까?</p>
      </div>
    );

    openModal(
      'confirm',
      '금액 불일치 확인',
      message,
      { isProject: form.data.isProject },
      async (data) => {
        await createSfa(form.data);
      },
    );
  };

  return (
    <>
      <Form
        onSubmit={handleSubmit}
        className="space-y-6"
        // 추가: method와 action 속성 명시적 지정
        method="POST"
        action="#"
      >
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-4 font-medium text-gray-900">기본 정보</h3>
          <div className="space-y-4">
            <Group direction="horizontal" className="gap-6">
              <FormItem className="flex-1">
                <Label>거래유형</Label>
                <Select name="" disabled={true}>
                  <option value="">계약/투자</option>
                </Select>
              </FormItem>

              <FormItem className="flex-1">
                <Label required>FY</Label>
                <Select
                  name="fy"
                  value={form.data.fy?.id || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;

                    if (selectedId) {
                      const selectedItem = codebooks?.fy?.find(
                        (item) =>
                          item.id === selectedId ||
                          item.id === Number(selectedId),
                      );

                      if (selectedItem) {
                        updateFormField('fy', {
                          id: selectedItem.id,
                          name: selectedItem.name,
                        });
                      }
                    } else {
                      updateFormField('fy', null);
                    }
                  }}
                  disabled={isSubmitting}
                  error={errors.fy}
                >
                  <option value="">선택하세요</option>
                  {codebooks?.fy?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </FormItem>
            </Group>

            <Group direction="horizontal" className="gap-6">
              <FormItem className="flex-1">
                <Label required>매출유형</Label>
                <Select
                  name="sfaSalesType"
                  value={form.data.sfaSalesType?.id || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;

                    if (selectedId) {
                      // 타입 안전한 비교를 위해 문자열과 숫자 모두 확인
                      const selectedItem = codebooks.sfaSalesType?.find(
                        (item) =>
                          item.id === selectedId ||
                          item.id === parseInt(selectedId) ||
                          item.id.toString() === selectedId,
                      );

                      if (selectedItem) {
                        const valueToUpdate = {
                          id: selectedItem.id,
                          name: selectedItem.name,
                        };
                        updateFormField('sfaSalesType', valueToUpdate);
                      }
                    } else {
                      updateFormField('sfaSalesType', null);
                    }
                  }}
                  disabled={isSubmitting}
                  error={errors.sfaSalesType}
                >
                  <option value="">선택하세요</option>
                  {codebooks.sfaSalesType?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </FormItem>

              <FormItem className="flex-1">
                <Label required>품목유형</Label>
                <Select
                  name="sfaClassification"
                  value={form.data.sfaClassification?.id || ''}
                  onChange={(e) => {
                    const selectedId = e.target.value;

                    if (selectedId) {
                      // 타입 안전한 비교를 위해 문자열과 숫자 모두 확인
                      const selectedItem = codebooks.sfaClassification?.find(
                        (item) =>
                          item.id === selectedId ||
                          item.id === parseInt(selectedId) ||
                          item.id.toString() === selectedId,
                      );

                      if (selectedItem) {
                        const valueToUpdate = {
                          id: selectedItem.id,
                          name: selectedItem.name,
                        };
                        // updateFormField 사용하여 loadItems 로직 실행
                        updateFormField('sfaClassification', valueToUpdate);
                      }
                    } else {
                      updateFormField('sfaClassification', null);
                    }
                  }}
                  disabled={isSubmitting}
                  error={errors.sfaClassification}
                >
                  <option value="">선택하세요</option>
                  {codebooks.sfaClassification?.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </Select>
              </FormItem>
            </Group>

            <Group direction="horizontal" className="gap-6">
              <Col>
                <FormItem className="flex-1">
                  <Label required>건명</Label>
                  <Input
                    type="text"
                    name="name"
                    value={form.data.name || ''}
                    onChange={updateFormField}
                    placeholder="건명을 입력하세요"
                    disabled={isSubmitting}
                  />
                </FormItem>
              </Col>
              <Col>
                <div>
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={!!form.data.isProject}
                    onChange={handleProjectToggle}
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    프로젝트와 연동
                  </span>
                </div>
              </Col>
            </Group>
          </div>
        </div>
        <div className="rounded-lg border border-gray-200 p-4">
          <h3 className="mb-2 font-medium text-gray-900">고객 정보</h3>
          {/* Customer and Partner */}
          <Group direction="horizontal" className="gap-6">
            <FormItem className="flex-1">
              <Label required>고객사</Label>
              <CustomerSearchInput
                onSelect={handleCustomerSelect}
                disabled={isSubmitting}
                error={errors.customer}
              />
            </FormItem>
            <FormItem className="flex-1">
              <Label></Label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="customerType"
                    className="text-blue-600 focus:ring-blue-500"
                    checked={Boolean(form.data.isSameBilling)}
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
                    checked={!Boolean(form.data.isSameBilling)}
                    onChange={() => handleCustomerTypeChange(false)}
                  />
                  <Building2 className="ml-2 h-4 w-4 text-blue-500" />
                  <span className="ml-1 text-sm text-gray-700">
                    별도 매출처
                  </span>
                </label>
              </div>
            </FormItem>
          </Group>
        </div>

        {/* 사업부 매출 정보 */}
        <SalesItemSection
          isMultiTeam={form.data.isMultiTeam || false}
          onTeamModeToggle={handleTeamModeToggle}
          sfaByItems={form.data.sfaByItems || []}
          onAddSalesItem={handleAddSalesItem}
          onRemoveSalesItem={handleRemoveSalesItem}
          onSalesItemChange={handleSalesItemChange}
          isSubmitting={isSubmitting}
          errors={errors}
          itemsData={itemsData}
          isItemsLoading={isItemsLoading}
          hasPayments={hasPayments}
        />

        {/* 매출 정보 (결제 구분) */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">매출 정보</h3>
            <button
              type="button"
              onClick={() =>
                handleAddPaymentWithAllocation(form.data.isSameBilling, form.data.customer)
              }
              className="flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!hasCustomer || !hasItems || isSubmitting}
              title={!hasItems ? '사업부 매출 정보를 먼저 입력해주세요' : ''}
            >
              <Plus className="mr-1 h-4 w-4" />
              {form.data.isSameBilling ? '결제매출 추가' : '매출처 추가'}
            </button>
          </div>

          {!hasCustomer ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                먼저 고객사를 선택해주세요
              </p>
            </div>
          ) : !hasItems ? (
            <div className="rounded-lg bg-yellow-50 p-4 text-center border border-yellow-200">
              <Briefcase className="mx-auto mb-2 h-8 w-8 text-yellow-500" />
              <p className="text-sm text-yellow-700 font-medium">
                사업부 매출 정보를 먼저 입력해주세요
              </p>
              <p className="text-xs text-yellow-600 mt-1">
                결제 매출을 추가하려면 사업부 매출 정보가 필요합니다
              </p>
            </div>
          ) : !hasPayments ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                {form.data.isSameBilling
                  ? '결제매출을 추가해주세요'
                  : '매출처를 추가해주세요'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(form.data.sfaByPayments || []).map((payment, index) => (
                <SalesAddByPayment
                  key={`payment-${payment.id || index}`}
                  payment={payment}
                  index={index}
                  isSameBilling={form.data.isSameBilling}
                  onChange={handlePaymentChange}
                  onRemove={handleRemovePayment}
                  isSubmitting={isSubmitting}
                  handleRevenueSourceSelect={handleRevenueSourceSelect}
                  savedRevenueSources={uniqueRevenueSources}
                  codebooks={codebooks}
                  isLoadingCodebook={isLoadingCodebook}
                  isMultiTeam={form.data.isMultiTeam || false}
                  sfaByItems={form.data.sfaByItems || []}
                  onPaymentAmountChange={handlePaymentAmountChange}
                  onAllocationChange={handleAllocationChange}
                  onAutoAllocateByRatio={handleAutoAllocateByRatio}
                  onEqualDistribute={handleEqualDistribute}
                />
              ))}
            </div>
          )}

          {hasPayments && (
            <div className="mt-3 rounded-lg bg-blue-50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">
                  {`총 결제구분 : ${form.data.sfaByPayments?.length || 0}건`}
                </span>
                {form.data.sfaByPayments &&
                  Array.isArray(form.data.sfaByPayments) && (
                    <span className="text-blue-700">
                      총 금액:{' '}
                      {form.data.sfaByPayments
                        .reduce((sum, payment) => {
                          const amount = parseFloat(
                            String(payment.amount || 0).replace(/,/g, ''),
                          );
                          return sum + amount;
                        }, 0)
                        .toLocaleString()}
                      원
                    </span>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="rounded-lg border border-gray-200 p-4">
          <FormItem fullWidth>
            <Label>비고</Label>
            <TextArea
              name="description"
              value={form.data.description || ''}
              onChange={updateFormField}
              placeholder="비고 사항을 입력하세요"
              disabled={isSubmitting}
            />
          </FormItem>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <Message type="error" className="text-center mb-4">
            {errors.submit}
          </Message>
        )}

        {/* Submit Button */}
        <Group>
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              // onClick={() => {

              // }}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              onClick={(e) => {
                // 버튼 클릭 시에도 이벤트 전파 방지
                e.preventDefault();
                handleSubmit(e);
              }}
            >
              {isSubmitting ? '처리중...' : '등록'}
            </Button>
          </div>
        </Group>
      </Form>

      {/* 금액 비교 확인 모달 */}
      <ModalRenderer
        modalState={modalState}
        closeModal={closeModal}
        handleConfirm={handleConfirm}
      />
    </>
  );
};

export default SfaAddForm;
