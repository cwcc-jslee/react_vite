// src/features/sfa/components/forms/SfaAddForm/index.jsx
import React, { useState } from 'react';
import { CustomerSearchInput } from '../../../../../shared/components/customer/CustomerSearchInput';
import { formatDisplayNumber } from '../../../../../shared/utils/format/number';
import SalesByItem from '../../elements/SalesByItem.jsx';
import SalesByPayment from '../../elements/SalesByPayment.jsx';
import { useSfaForm } from '../../../hooks/useSfaForm.js';
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
  Modal,
} from '../../../../../shared/components/ui';

const SfaAddForm = ({
  // formData,
  // errors,
  // isSubmitting,
  sfaSalesTypeData,
  sfaClassificationData,
  itemsData,
  isItemsLoading,
  paymentMethodData,
  percentageData,
  isPaymentDataLoading,
  handleCustomerSelect,
  // updateFormField,
  // handleSalesItemChange,
  // handleRemoveSalesItem,
  // handleSalesPaymentChange,
  // handleAddPayment,
  // handleRemovePayment,
  processSubmit,
  validateForm,
  checkAmounts,
  // actions,
  // data,
}) => {
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
  } = useSfaForm();
  const [hasPartner, setHasPartner] = useState(false);
  const [isProject, setIsProject] = useState(false);
  const [showAmountConfirm, setShowAmountConfirm] = useState(false);
  // const { handleAddSalesItem } = actions();
  console.log(`>>> form data :`, formData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 유효성 검사 수행
    const isValid = validateForm(hasPartner);
    if (!isValid) return;

    // 금액 일치 여부 확인
    if (!checkAmounts()) {
      setShowAmountConfirm(true);
    } else {
      await processSubmit(hasPartner, isProject);
    }
  };

  // 금액 확인 모달 내용 컴포넌트
  const AmountConfirmContent = () => (
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

  return (
    <>
      <Form
        onSubmit={handleSubmit}
        className="space-y-6"
        // 추가: method와 action 속성 명시적 지정
        method="POST"
        action="#"
      >
        {/* <Form onSubmit={handleFormSubmit} className="space-y-6"> */}
        {/* Sales Type and Classification */}
        <Group direction="horizontal" className="gap-6">
          <FormItem className="flex-1">
            {/* flex-1 추가로 균등한 너비 */}
            <Label required>매출유형</Label>
            <Select
              name="sfaSalesType"
              value={formData.sfaSalesType}
              onChange={updateFormField}
              disabled={isSubmitting}
              error={errors.sfaSalesType}
            >
              <option value="">선택하세요</option>
              {sfaSalesTypeData?.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>

          <FormItem className="flex-1">
            <Label required>매출구분</Label>
            <Select
              name="sfaClassification"
              value={formData.sfaClassification}
              onChange={updateFormField}
              disabled={isSubmitting}
              error={errors.sfaClassification}
            >
              <option value="">선택하세요</option>
              {sfaClassificationData?.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
        </Group>

        {/* Customer and Partner */}
        <Group direction="horizontal" className="gap-6">
          <FormItem className="flex-1">
            <Label required>고객사</Label>
            <CustomerSearchInput
              onSelect={handleCustomerSelect}
              value={formData.customer}
              error={errors.customer}
              disabled={isSubmitting}
              size="small"
            />
          </FormItem>

          <FormItem className="flex-1">
            <Label>매출파트너</Label>
            <Group direction="horizontal">
              <Checkbox
                id="hasPartner"
                checked={hasPartner}
                onChange={(e) => setHasPartner(e.target.checked)}
                disabled={isSubmitting}
              />
              {hasPartner && (
                <CustomerSearchInput
                  name="sellingPartner"
                  onSelect={(partner) =>
                    updateFormField({
                      target: {
                        name: 'sellingPartner',
                        value: partner.id,
                      },
                    })
                  }
                  value={formData.SellingPrtner}
                  disabled={isSubmitting}
                  size="small"
                />
              )}
            </Group>
          </FormItem>
        </Group>

        {/* Project Name and Toggle */}
        <Group direction="horizontal" className="gap-6">
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
            {/* {errors.name && <Message type="error">{errors.name}</Message>} */}
          </FormItem>

          <FormItem className="flex-1">
            <Label>프로젝트</Label>
            <Switch
              checked={isProject}
              onChange={() => setIsProject(!isProject)}
              disabled={isSubmitting}
            />
          </FormItem>
        </Group>

        {/* Sales Registration Buttons */}
        <Group direction="horizontal" className="gap-6">
          <FormItem className="flex-1">
            <Label>사업부 매출</Label>
            <Stack>
              <Button
                type="button"
                variant="primary"
                onClick={handleAddSalesItem}
                disabled={isSubmitting || formData.salesByItems.length >= 3}
                className={`w-full ${
                  formData.salesByItems.length >= 3
                    ? 'bg-gray-200 hover:bg-gray-200 text-gray-500 border-gray-200'
                    : ''
                }`}
              >
                사업부매출등록
              </Button>
              <Input
                type="text"
                name="itemAmount"
                value={formatDisplayNumber(formData.itemAmount)}
                disabled={true}
                className="text-right"
              />
            </Stack>
            {errors.itemAmount && (
              <Message type="error">{errors.itemAmount}</Message>
            )}
          </FormItem>

          <FormItem className="flex-1">
            <Label>결제 매출</Label>
            <Stack>
              <Button
                type="button"
                variant="primary"
                onClick={handleAddPayment}
                disabled={isSubmitting || formData.salesByPayments.length >= 3}
                className={`w-full ${
                  formData.salesByPayments.length >= 3
                    ? 'bg-gray-200 hover:bg-gray-200 text-gray-500 border-gray-200'
                    : ''
                }`}
              >
                결제매출등록
              </Button>
              <Input
                type="text"
                name="paymentAmount"
                value={formatDisplayNumber(formData.paymentAmount)}
                disabled={true}
                className="text-right"
              />
            </Stack>
            {errors.paymentAmount && (
              <Message type="error">{errors.paymentAmount}</Message>
            )}
          </FormItem>
        </Group>

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 my-6" />

        {/* Sales Items List */}
        <SalesByItem
          items={formData.salesByItems}
          onChange={handleSalesItemChange}
          onRemove={handleRemoveSalesItem}
          isSubmitting={isSubmitting}
          errors={errors}
          itemsData={itemsData}
          isItemsLoading={isItemsLoading}
        />

        {/* Divider */}
        <div className="w-full h-px bg-gray-200 my-6" />

        {/* Sales Payments List */}
        <SalesByPayment
          payments={formData.salesByPayments}
          onChange={handlePaymentChange}
          onAdd={handleAddPayment}
          onRemove={handleRemovePayment}
          isSubmitting={isSubmitting}
          errors={errors}
          paymentMethodData={paymentMethodData}
          percentageData={percentageData}
          isPaymentDataLoading={isPaymentDataLoading}
        />

        {/* Description */}
        <Group>
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
        </Group>

        {/* Error Message */}
        {/* {errors.submit && (
        <Message type="error" className="text-center mb-4">
          {errors.submit}
        </Message>
      )} */}

        {/* Submit Button */}
        <Group>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full"
            onClick={(e) => {
              // 버튼 클릭 시에도 이벤트 전파 방지
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            {isSubmitting ? '처리중...' : '저장'}
          </Button>
        </Group>
      </Form>

      {/* 금액 비교 확인 모달 */}
      <Modal
        isOpen={showAmountConfirm}
        onClose={() => setShowAmountConfirm(false)}
        title="금액 불일치 확인"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => setShowAmountConfirm(false)}
            >
              아니오
            </Button>
            <Button
              variant="primary"
              onClick={async () => {
                setShowAmountConfirm(false);
                await processSubmit(hasPartner, isProject);
              }}
            >
              예
            </Button>
          </>
        }
      >
        <AmountConfirmContent />
      </Modal>
    </>
  );
};

export default SfaAddForm;
