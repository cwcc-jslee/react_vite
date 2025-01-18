// src/features/sfa/components/drawer/SfaAddForm.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCodebookByType } from '../../../codebook/store/codebookSlice';
import { CustomerSearchInput } from '../../../../shared/components/customer/CustomerSearchInput';
import { useDrawerFormData } from '../../hooks/useDrawerFormData';
import { formatDisplayNumber } from '../../../../shared/utils/format/number';
import { notification } from '../../../../shared/services/notification';
import { submitSfaForm } from '../../services/sfaSubmitService';
import SalesByItem from './SalesByItem';
import SalesByPayment from './SalesByPayment';

// 새로운 UI 컴포넌트 import
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
} from '../../../../shared/components/ui';

/**
 * SFA(영업활동) 매출 등록을 위한 Drawer Form 컴포넌트
 * @param {Object} props
 * @param {Function} props.onClose - Drawer를 닫는 함수
 */
const SfaAddForm = ({ onClose }) => {
  // 파트너 및 프로젝트 상태 관리
  const [hasPartner, setHasPartner] = useState(false);
  const [isProject, setIsProject] = useState(false);
  const [showAmountConfirm, setShowAmountConfirm] = useState(false);

  // Form 데이터 및 상태 관리 훅 사용
  const {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    setErrors,
    handleChange,
    handleCustomerSelect,
    handleAddSalesItem,
    handleSalesItemChange,
    handleRemoveSalesItem,
    handleSalesPaymentChange,
    handleAddSalesPayment,
    handleRemoveSalesPayment,
    isItemsLoading,
    itemsData,
    // 결제매출 관련 데이터
    paymentMethodData,
    percentageData,
    isPaymentDataLoading,
    // 검증관련
    validateForm,
    validationErrors,
  } = useDrawerFormData();

  const sfaSalesTypeData = useSelector(selectCodebookByType('sfa_sales_type'));
  const sfaClassificationData = useSelector(
    selectCodebookByType('sfa_classification'),
  );

  /**
   * 금액이 일치하는지 확인하는 함수
   */
  const checkAmounts = () => {
    const itemAmount = parseInt(formData.itemAmount) || 0;
    const paymentAmount = parseInt(formData.paymentAmount) || 0;
    return itemAmount === paymentAmount;
  };

  // 폼 제출 처리를 위한 별도 함수
  const processSubmit = async () => {
    // hasPartner와 isProject를 formData에 추가
    const enrichedFormData = {
      ...formData,
      hasPartner,
      isProject,
    };

    try {
      setIsSubmitting(true);
      const response = await submitSfaForm(enrichedFormData);

      // 서버 응답 검증
      if (!response || !response.success) {
        throw new Error(response?.message || '저장에 실패했습니다.');
      }

      // 성공적으로 저장된 경우에만 실행
      notification.success({
        message: '저장 성공',
        description: '성공적으로 저장되었습니다.',
      });

      if (onClose) onClose();
    } catch (error) {
      console.error('Form submission error:', error);

      // 에러 메시지를 문자열로 확실하게 변환
      const errorMessage = error?.message || '저장 중 오류가 발생했습니다.';

      // 에러 상태 설정
      setErrors((prev) => ({
        ...prev,
        submit: errorMessage,
      }));

      // 에러 메시지 표시
      notification.error({
        message: '저장 실패',
        description: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('========== Form Submit Data ==========');
    console.log('formData:', formData);
    console.log('====================================');

    // 유효성 검사 수행
    const isValid = validateForm(hasPartner);
    if (!isValid) return;

    // 금액 일치 여부 확인
    if (!checkAmounts()) {
      setShowAmountConfirm(true);
    } else {
      // 금액이 일치하면 바로 제출
      await processSubmit();
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
        {/* Sales Type and Classification */}
        <Group direction="horizontal" className="gap-6">
          <FormItem className="flex-1">
            {/* flex-1 추가로 균등한 너비 */}
            <Label required>매출유형</Label>
            <Select
              name="sfaSalesType"
              value={formData.sfaSalesType}
              onChange={handleChange}
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
              onChange={handleChange}
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
                    handleChange({
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
              onChange={handleChange}
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
                onClick={handleAddSalesPayment}
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
          onChange={handleSalesPaymentChange}
          onAdd={handleAddSalesPayment}
          onRemove={handleRemoveSalesPayment}
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
              onChange={handleChange}
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
                await processSubmit();
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
