// src/features/sfa/components/forms/SfaAddForm/index.jsx
import React, { useState } from 'react';
import { CustomerSearchInput } from '@shared/components/customer/CustomerSearchInput';
import { formatDisplayNumber } from '@shared/utils/format/number';
import SalesByItem from '../elements/SalesByItem.jsx';
import SalesByPayment from '../elements/SalesByPayment.jsx';
import SalesAddByPayment from '../elements/SalesAddByPayment.jsx';
import RevenueSource from '../elements/RevenueSource.jsx';
import { useSfaForm } from '../../hooks/useSfaForm.js';
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
import { validateForm, checkAmounts } from '../../utils/formValidation';
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

const SfaAddForm = ({ codebooks }) => {
  const {
    formData,
    errors,
    isSubmitting,
    updateFormField,
    handleAddSalesItem,
    handleRemoveSalesItem,
    handleSalesItemChange,
    handleAddPayment,
    handleRemovePayment,
    handlePaymentChange,
    handleCustomerSelect,
    isItemsLoading,
    itemsData,
    paymentData,
    percentageData,
    isPaymentDataLoading,
    processSubmit,
    handleProjectToggle,
    toggleIsSameBilling,
    resetForm,
    handleCustomerTypeChange,
    handleRevenueSourceSelect,
  } = useSfaForm();

  // useModal 훅 사용
  const { modalState, openModal, closeModal, handleConfirm } = useModal();

  // 결제구분, 매출확률 codebook
  const {
    data: paymentCodebooks,
    isLoading: isLoadingCodebook,
    error: codebookError,
  } = useCodebook(['rePaymentMethod', 'sfaPercentage']);

  // revenueSource 데이터 중복 제거 및 정렬
  const uniqueRevenueSources = React.useMemo(
    () => getUniqueRevenueSources(formData.salesByPayments),
    [formData.salesByPayments],
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 유효성 검사 수행
    const { isValid } = validateForm(formData);
    if (!isValid) return;

    // 금액 일치 여부 확인
    if (!checkAmounts(formData)) {
      // 금액 불일치 모달 열기
      openAmountConfirmModal();
    } else {
      await processSubmit(formData.isProject);
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
          <p>• 사업부매출금액: {formatDisplayNumber(formData.itemAmount)}원</p>
          <p>• 결제매출금액: {formatDisplayNumber(formData.paymentAmount)}원</p>
        </div>
        <p className="text-gray-600">금액이 다르더라도 진행하시겠습니까?</p>
      </div>
    );

    openModal(
      'confirm',
      '금액 불일치 확인',
      message,
      { isProject: formData.isProject },
      async (data) => {
        await processSubmit();
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

              <FormItem className="flex-1"></FormItem>
            </Group>

            <Group direction="horizontal" className="gap-6">
              <FormItem className="flex-1">
                <Label required>매출유형</Label>
                <Select
                  name="sfaSalesType"
                  value={formData.sfaSalesType}
                  onChange={updateFormField}
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
                  value={formData.sfaClassification}
                  onChange={updateFormField}
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
                    value={formData.name}
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
                    checked={formData.isProject}
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
                    checked={formData.isSameBilling}
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
                    checked={!formData.isSameBilling}
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

        {/* 매출처 관리 */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">매출 정보</h3>
            <button
              type="button"
              onClick={handleAddPayment}
              className="flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={!formData?.customer?.id || isSubmitting}
            >
              <Plus className="mr-1 h-4 w-4" />
              {formData.isSameBilling ? '결제매출 추가' : '매출처 추가'}
            </button>
          </div>

          {!formData.customer?.id ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                먼저 고객사를 선택해주세요
              </p>
            </div>
          ) : formData.salesByPayments.length < 1 ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <Users className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                {formData.isSameBilling
                  ? '결제매출을 추가해주세요'
                  : '매출처를 추가해주세요'}
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {formData.salesByPayments.map((payment, index) => (
                <SalesAddByPayment
                  key={`payment-${payment.id || index}`}
                  payment={payment}
                  index={index}
                  formData={formData}
                  onChange={handlePaymentChange}
                  onRemove={handleRemovePayment}
                  isSubmitting={isSubmitting}
                  handleRevenueSourceSelect={handleRevenueSourceSelect}
                  savedRevenueSources={uniqueRevenueSources}
                  codebooks={paymentCodebooks}
                  isLoadingCodebook={isLoadingCodebook}
                />
              ))}
            </div>
          )}

          {formData.salesByPayments.length > 0 && (
            <div className="mt-3 rounded-lg bg-blue-50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-blue-700">
                  {`총 결제구분 : ${formData.salesByPayments.length}건`}
                </span>
                {formData.salesByPayments && (
                  <span className="text-blue-700">
                    총 금액:{' '}
                    {formData.salesByPayments
                      .reduce((sum, customer) => {
                        const amount = parseFloat(
                          customer.amount?.replace(/,/g, '') || 0,
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

        {/* {사업부 매출} */}
        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">사업부 매출 정보</h3>
            <button
              type="button"
              onClick={handleAddSalesItem}
              className="flex items-center rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
            >
              <Plus className="mr-1 h-4 w-4" />
              사업부매출 추가
            </button>
          </div>

          {!formData?.salesByItems?.length ? (
            <div className="rounded-lg bg-gray-50 p-4 text-center">
              <Briefcase className="mx-auto mb-2 h-8 w-8 text-gray-400" />
              <p className="text-sm text-gray-600">
                사업부 매출을 추가해주세요
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <SalesByItem
                items={formData.salesByItems}
                onChange={handleSalesItemChange}
                onRemove={handleRemoveSalesItem}
                isSubmitting={isSubmitting}
                errors={errors}
                itemsData={itemsData}
                isItemsLoading={isItemsLoading}
              />
            </div>
          )}

          {/* 사업부 매출 요약 */}
          {formData.salesByItems.length > 0 && (
            <div className="mt-3 rounded-lg bg-blue-50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-green-700">
                  {`총 사업부매출 : ${formData.salesByItems.length}건`}
                </span>
                {formData.salesByItems && (
                  <span className="text-blue-700">
                    총 금액:{' '}
                    {formData.salesByItems
                      .reduce((sum, customer) => {
                        const amount = parseFloat(
                          customer.amount?.replace(/,/g, '') || 0,
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
              value={formData.description}
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
