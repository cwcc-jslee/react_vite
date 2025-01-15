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
  Label,
  Input,
  Select,
  TextArea,
  Button,
  Checkbox,
  Switch,
  Message,
} from '../../../../shared/components/ui';

const SfaAddForm = ({ onClose }) => {
  // State management for partner and project
  const [hasPartner, setHasPartner] = useState(false);
  const [isProject, setIsProject] = useState(false);

  const {
    formData,
    errors,
    isSubmitting,
    setIsSubmitting,
    setErrors,
    handleChange,
    handleCustomerSelect,
    handleSalesItemChange,
    handleAddSalesItem,
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
      totalItemAmount: formData.totalItemAmount,
      itemAmount: formData.itemAmount,
      description: formData.description,
    });
    console.log('매출 아이템:', formData.salesItems);
    console.log('매출 항목:', formData.salesPayments);
    console.log('====================================');

    if (!validateForm()) {
      notification.error('필수 항목을 모두 입력해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await submitSfaForm(formData);
      notification.success('성공적으로 저장되었습니다.');
      onClose?.();
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        submit: error.message,
      }));
      notification.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format number with commas
  const formatNumber = (value) => {
    if (!value) return '';
    return Number(value).toLocaleString();
  };

  return (
    <Form onSubmit={handleSubmit}>
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

      {/* Amount Information */}
      <Group direction="horizontal" className="gap-6">
        <FormItem className="flex-1">
          <Label required>사업부 매출액</Label>
          <Input
            type="text"
            name="itemAmount"
            value={formatNumber(formData.itemAmount)}
            disabled={true}
            className="text-right"
          />
          {errors.totalItemAmount && (
            <Message type="error">{errors.itemAmount}</Message>
          )}
        </FormItem>

        <FormItem className="flex-1">
          <Label required>결제 매출액</Label>
          <Input
            type="text"
            name="totalPaymentAmount"
            value={formatNumber(formData.totalPaymentAmount)}
            disabled={true}
            className="text-right"
          />
        </FormItem>
      </Group>

      {/* Sales Registration Buttons */}
      <Group direction="horizontal" className="gap-6">
        <FormItem className="flex-1">
          <Label>사업부별 매출등록</Label>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddSalesItem}
            disabled={isSubmitting}
          >
            사업부 매출 등록
          </Button>
        </FormItem>

        <FormItem className="flex-1">
          <Label>결제 매출 등록</Label>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddSalesPayment}
            disabled={isSubmitting}
          >
            결제 매출 등록
          </Button>
        </FormItem>
      </Group>

      {/* Divider */}
      <div className="w-full h-px bg-gray-200 my-6" />

      {/* Sales Items List */}
      <SalesByItem
        items={formData.salesByItems}
        onChange={handleSalesItemChange}
        onAdd={handleAddSalesItem}
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
