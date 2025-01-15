// src/features/sfa/components/drawer/SfaAddForm.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCodebookByType } from '../../../codebook/store/codebookSlice';
import { CustomerSearchInput } from '../../../../shared/components/customer/CustomerSearchInput';
import { notification } from '../../../../shared/services/notification';
import { submitSfaForm } from '../../services/sfaSubmitService';
import { useDrawerFormData } from '../../hooks/useDrawerFormData';
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
    validateForm,
  } = useDrawerFormData();

  const sfaSalesTypeData = useSelector(selectCodebookByType('sfa_sales_type'));
  const sfaClassificationData = useSelector(
    selectCodebookByType('sfa_classification'),
  );

  const handleSubmit = async (e) => {
    console.log('=========================================');
    e.preventDefault();

    console.log('========== Form Submit Data ==========');
    console.log('기본 정보:', {
      sfaSalesType: formData.sfaSalesType,
      sfaClassification: formData.sfaClassification,
      customer: formData.customer,
      hasPartner: hasPartner,
      partner: formData.partner,
      name: formData.name,
      isProject: isProject,
      itemAmount: formData.itemAmount,
      description: formData.description,
    });
    console.log('매출 아이템:', formData.salesItems);
    console.log('매출 항목:', formData.salesPayments);
    console.log('====================================');

    // 유효성 검사 수행
    const isValid = validateForm();

    if (!isValid) {
      notification.error({
        message: '입력 오류',
        description: '필수 항목을 모두 입력해주세요.',
      });
      return; // 여기서 함수 종료
    }

    try {
      setIsSubmitting(true);
      const result = await submitSfaForm(formData);

      // 서버 응답 검증
      if (!response || !response.success) {
        throw new Error(response?.message || '저장에 실패했습니다.');
      }

      // 성공적으로 저장된 경우에만 실행
      notification.success('성공적으로 저장되었습니다.');
      if (onClose) onClose();
    } catch (error) {
      console.error('Form submission error:', error);

      // 에러 상태 설정
      setErrors((prev) => ({
        ...prev,
        submit: error.message || '저장 중 오류가 발생했습니다.',
      }));

      // 에러 메시지 표시
      notification.error({
        message: '저장 실패',
        description: error.message || '저장 중 오류가 발생했습니다.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 숫자 포맷팅
  const formatNumber = (value) => {
    if (!value) return '';
    return Number(value).toLocaleString();
  };

  return (
    <Form onSubmit={handleSubmit} className="space-y-6">
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
          >
            <option value="">선택하세요</option>
            {sfaSalesTypeData?.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
          {errors.sfaSalesType && (
            <Message type="error">{errors.sfaSalesType}</Message>
          )}
        </FormItem>

        <FormItem className="flex-1">
          <Label required>매출구분</Label>
          <Select
            name="sfaClassification"
            value={formData.sfaClassification}
            onChange={handleChange}
            disabled={isSubmitting}
          >
            <option value="">선택하세요</option>
            {sfaClassificationData?.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
          {errors.sfaClassification && (
            <Message type="error">{errors.sfaClassification}</Message>
          )}
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
                name="partner"
                onSelect={(partner) =>
                  handleChange({
                    target: { name: 'partner', value: partner },
                  })
                }
                value={formData.partner}
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
          {errors.name && <Message type="error">{errors.name}</Message>}
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
              사업부매출등록 ({formData.salesByItems.length}/3)
            </Button>
            <Input
              type="text"
              name="itemAmount"
              value={formatNumber(formData.itemAmount)}
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
              결제매출등록 ({formData.salesByPayments.length}/3)
            </Button>
            <Input
              type="text"
              name="paymentAmount"
              value={formatNumber(formData.paymentAmount)}
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
      {errors.submit && (
        <Message type="error" className="text-center mb-4">
          {errors.submit}
        </Message>
      )}

      {/* Submit Button */}
      <Group>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full"
        >
          {isSubmitting ? '처리중...' : '저장'}
        </Button>
      </Group>
    </Form>
  );
};

export default SfaAddForm;
