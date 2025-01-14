// src/features/sfa/components/drawer/SfaAddForm.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectCodebookByType } from '../../../codebook/store/codebookSlice';
import { CustomerSearchInput } from '../../../../shared/components/customer/CustomerSearchInput';
import { notification } from '../../../../shared/services/notification';
import { submitSfaForm } from '../../services/sfaSubmitService';
import {
  FormContainer,
  FormSection,
  FormRowInline,
  Label,
  Input,
  Select,
  TextArea,
  ButtonContainer,
  ActionButton,
  InputContainer,
  ErrorMessage,
  Checkbox,
  ToggleSwitch,
} from '../../../../shared/components/drawer/styles/formStyles';
import { useDrawerFormData } from '../../hooks/useDrawerFormData';
import SalesByItem from './SalesByItem';
import SalesPayments from './SalesPayments';

const SfaAddForm = ({ onClose }) => {
  // 파트너사, 프로젝트 상태 관리
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

  // 금액 입력시 폼
  const formatNumber = (value) => {
    if (!value) return '';
    return Number(value).toLocaleString();
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      {/* 1열: 매출유형, 매출구분 */}
      <FormSection>
        <FormRowInline>
          <Label className="required">매출유형</Label>
          <InputContainer>
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
              <ErrorMessage>{errors.sfaSalesType}</ErrorMessage>
            )}
          </InputContainer>
        </FormRowInline>

        <FormRowInline>
          <Label className="required">매출구분</Label>
          <InputContainer>
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
              <ErrorMessage>{errors.sfaClassification}</ErrorMessage>
            )}
          </InputContainer>
        </FormRowInline>
      </FormSection>

      {/* 2열: 고객사, 매출파트너 관련 */}
      <FormSection>
        <FormRowInline>
          <Label className="required">고객사</Label>
          <InputContainer>
            <CustomerSearchInput
              onSelect={handleCustomerSelect}
              value={formData.customer}
              error={errors.customer}
              disabled={isSubmitting}
              size="small"
            />
          </InputContainer>
        </FormRowInline>

        <FormRowInline>
          <Label>매출파트너</Label>
          <InputContainer>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
            </div>
          </InputContainer>
        </FormRowInline>
      </FormSection>

      {/* 3열: 건명, 프로젝트 */}
      <FormSection>
        <FormRowInline>
          <Label className="required">건명</Label>
          <InputContainer>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="건명을 입력하세요"
              disabled={isSubmitting}
            />
            {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
          </InputContainer>
        </FormRowInline>

        <FormRowInline>
          <Label>프로젝트</Label>
          <InputContainer>
            <ToggleSwitch
              checked={isProject}
              onChange={() => setIsProject(!isProject)}
              disabled={isSubmitting}
            />
          </InputContainer>
        </FormRowInline>
      </FormSection>

      {/* 4열: 매출액, ITEM매출액 */}
      <FormSection>
        <FormRowInline>
          <Label className="required">사업부 매출액</Label>
          <InputContainer>
            <Input
              type="text"
              name="itemAmount"
              value={formatNumber(formData.itemAmount)}
              disabled={true}
              style={{ textAlign: 'right' }}
            />
            {errors.totalItemAmount && (
              <ErrorMessage>{errors.itemAmount}</ErrorMessage>
            )}
          </InputContainer>
        </FormRowInline>

        <FormRowInline>
          <Label className="required">결제 매출액</Label>
          <InputContainer>
            <Input
              type="text"
              name="totalPaymentAmount"
              value={formatNumber(formData.totalPaymentAmount)}
              disabled={true}
              style={{ textAlign: 'right' }}
            />
          </InputContainer>
        </FormRowInline>
      </FormSection>

      {/* 5열: 매출ITEM, 매출항목 */}
      <FormSection>
        <FormRowInline>
          <Label>사업부별 매출등록</Label>
          <ButtonContainer>
            <ActionButton
              type="button"
              onClick={handleAddSalesItem}
              disabled={formData.salesItems.length >= 3 || isSubmitting}
            >
              사업부 매출 등록
            </ActionButton>
          </ButtonContainer>
        </FormRowInline>
        <FormRowInline>
          <Label>결제 매출 등록</Label>
          <ButtonContainer>
            <ActionButton
              type="button"
              onClick={handleAddSalesPayment}
              disabled={formData.salesPayments.length >= 3 || isSubmitting}
            >
              결제 매출 등록
            </ActionButton>
          </ButtonContainer>
        </FormRowInline>
      </FormSection>

      {/* 구분선 */}
      <div
        style={{
          borderBottom: '1px solid #e5e7eb',
          margin: '20px 0',
          width: '100%',
        }}
      />

      {/* 매출ITEM 목록 */}
      <SalesByItem
        items={formData.salesItems}
        onChange={handleSalesItemChange}
        onAdd={handleAddSalesItem}
        onRemove={handleRemoveSalesItem}
        isSubmitting={isSubmitting}
        errors={errors}
      />

      {/* 구분선 */}
      <div
        style={{
          borderBottom: '1px solid #e5e7eb',
          margin: '20px 0',
          width: '100%',
        }}
      />

      {/* 매출항목 목록 */}
      <SalesPayments
        entries={formData.salesPayments}
        onChange={handleSalesPaymentChange}
        onAdd={handleAddSalesPayment}
        onRemove={handleRemoveSalesPayment}
        isSubmitting={isSubmitting}
      />

      {/* 비고 */}
      <FormSection>
        <FormRowInline style={{ gridColumn: '1 / -1' }}>
          <Label>비고</Label>
          <InputContainer>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="비고 사항을 입력하세요"
              disabled={isSubmitting}
            />
          </InputContainer>
        </FormRowInline>
      </FormSection>

      {/* 에러 메시지 */}
      {errors.submit && (
        <ErrorMessage style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {errors.submit}
        </ErrorMessage>
      )}

      {/* 저장 버튼 */}
      <ButtonContainer>
        <ActionButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? '처리중...' : '저장'}
        </ActionButton>
      </ButtonContainer>
    </FormContainer>
  );
};

export default SfaAddForm;
