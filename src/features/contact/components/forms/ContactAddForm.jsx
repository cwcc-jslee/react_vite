// src/features/contact/components/forms/ContactAddForm/index.jsx
/**
 * 신규 고객사 등록을 위한 폼 컴포넌트
 * 고객사 기본 정보를 입력받아 등록하는 폼을 제공
 */

import React from 'react';
import CustomerSearchInput from '../../../../shared/components/customer/CustomerSearchInput';
import { useCodebook } from '../../../../shared/hooks/useCodebook';
import {
  Form,
  FormItem,
  Group,
  Stack,
  Label,
  Input,
  Select,
  Button,
  Checkbox,
  TextArea,
} from '../../../../shared/components/ui';
import { useContact } from '../../context/ContactProvider';
import { useContactForm } from '../../hooks/useContactForm';
// import { useFormValidation } from '../../hooks/useFormValidation';
import {
  normalizeBusinessNumber,
  displayBusinessNumber,
  formatBusinessNumber,
} from '../../../../shared/services/businessNumberUtils';
import { notification } from '../../../../shared/services/notification';

const ContactAddForm = () => {
  const { resetFilters } = useContact();
  const {
    formData,
    errors,
    isSubmitting,
    setErrors,
    updateFormField,
    processSubmit,
    validateForm,
    handleCustomerSelect,
  } = useContactForm();

  // const {
  //   data: codebooks,
  //   isLoading: isLoadingCodebook,
  //   error,
  // } = useCodebook([
  //   'co_classification',
  //   'business_scale',
  //   'co_funnel',
  //   'employee',
  //   'business_type',
  //   'region',
  // ]);

  const showErrorNotification = (errors) => {
    const firstError = Object.values(errors)[0];
    notification.error({
      message: '고객객등록오류',
      description: firstError,
      duration: 0,
      style: { width: 500 },
    });
  };

  /**
   * 폼 제출 이벤트 핸들러
   * 유효성 검사 후 제출 프로세스 시작
   */
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // 1. 폼 유효성 검사
    const { isValid, errors: validationErrors } = validateForm();

    // 유효성 검사 실패 시 오류 표시
    if (!isValid) {
      setErrors(validationErrors);

      // 첫 번째 오류 메시지로 알림 표시
      const firstError = Object.values(validationErrors)[0];
      notification.error({
        message: '담당자 등록 오류',
        description: firstError,
        duration: 3,
      });

      return;
    }

    // 2. 폼 제출 진행
    try {
      await processSubmit();

      // 3. 제출 후 폼 초기화 및 필터 리셋
      resetFilters();
    } catch (error) {
      // processSubmit에서 이미 오류 알림을 표시하므로 여기서는 추가 처리 필요 없음
      console.error('제출 과정에서 오류 발생:', error);
    }
  };

  // 로딩 상태 표시
  // if (isLoadingCodebook) {
  //   return <div className="text-center py-8">코드북 데이터 로딩 중...</div>;
  // }

  // 에러 상태 표시
  // if (error) {
  //   return (
  //     <div className="text-center py-8 text-red-500">
  //       코드북 데이터 로딩 오류: {error.message}
  //     </div>
  //   );
  // }

  return (
    <>
      <Form
        onSubmit={handleFormSubmit}
        className="space-y-8"
        method="POST"
        action="#"
      >
        {/* 첫번째 행: 이름 */}
        <Group direction="horizontal" spacing="lg">
          {/* 성 */}
          <FormItem direction="vertical" className="flex-1">
            <Label required className="text-left">
              성
            </Label>
            <Input
              type="text"
              name="lastName"
              placeholder="성을 입력하세요"
              onChange={updateFormField}
              value={formData?.lastName}
              disabled={isSubmitting}
            />
          </FormItem>

          {/* 이름 */}
          <FormItem direction="vertical" className="flex-1">
            <Label required className="text-left">
              이름
            </Label>
            <Input
              type="text"
              name="firstName"
              placeholder="이름을 입력하세요"
              onChange={updateFormField}
              value={formData?.firstName}
              disabled={isSubmitting}
            />
          </FormItem>

          {/* 전체이름 */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">Full name</Label>
            <Input
              type="text"
              name="fullName"
              onChange={updateFormField}
              value={formData?.fullName}
              disabled={true}
            />
          </FormItem>
        </Group>

        {/* 두번째 행: 사업자번호, 유입경로, 홈페이지 */}
        <Group direction="horizontal" spacing="lg">
          {/* 회사명 */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">회사명</Label>
            <CustomerSearchInput
              onSelect={handleCustomerSelect}
              value={formData.customer}
              error={errors.customer}
              disabled={isSubmitting}
              size="small"
            />
          </FormItem>

          {/* 직위 */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">직위</Label>
            <Input
              type="text"
              name="position"
              onChange={updateFormField}
              value={formData?.position}
              disabled={isSubmitting}
            />
          </FormItem>

          {/* 부서 */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">부서</Label>
            <Input
              type="text"
              name="department"
              onChange={updateFormField}
              value={formData?.department}
              disabled={isSubmitting}
            />
          </FormItem>
        </Group>

        {/* 3열: 이메일, 전화번호 */}
        <Group direction="horizontal" spacing="lg">
          {/* 이메일 */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">email</Label>
            <Input
              type="text"
              name="email"
              onChange={updateFormField}
              value={formData?.email}
              disabled={isSubmitting}
            />
          </FormItem>

          {/* 전화번호 */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">phone</Label>
            <Input
              type="text"
              name="phone"
              onChange={updateFormField}
              value={formData?.phone}
              disabled={isSubmitting}
            />
          </FormItem>

          {/* 휴대폰번호 */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">mobile</Label>
            <Input
              type="text"
              name="mobile"
              onChange={updateFormField}
              value={formData?.mobile}
              disabled={isSubmitting}
            />
          </FormItem>
        </Group>

        {/* 4열: 관계정보 */}
        <Group direction="horizontal" spacing="lg">
          {/* 관계유형 */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">관계유형</Label>
            <Select
              name="contactType"
              value={formData.contactType}
              onChange={updateFormField}
              disabled={isSubmitting}
            >
              <option value="">선택하세요</option>
              {/* {codebooks?.contact_type?.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))} */}
            </Select>
          </FormItem>

          {/* 관계상태 */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">관계상태</Label>
            <Select
              name="relationshipStatus"
              value={formData.relationshipStatus}
              onChange={updateFormField}
              disabled={isSubmitting}
            >
              <option value="">선택하세요</option>
              {/* {codebooks?.relationship_status?.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))} */}
            </Select>
          </FormItem>

          {/* 주요담당자 여부 */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">회사의 주요 담당자 여부</Label>
            <Select
              name="primaryForCompany"
              value={formData.primaryForCompany}
              onChange={updateFormField}
              disabled={isSubmitting}
            >
              <option value="">선택하세요</option>
            </Select>
          </FormItem>

          {/* email_alternative: 대체 이메일 */}
        </Group>

        {/* 5열: 추가정보 */}
        {/* tags */}
        <Group>
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">tags (다중선택)</Label>
            <div className="flex flex-wrap items-center gap-4">
              {/* {codebooks?.tags?.data?.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    name={`tags${type.id}`}
                    checked={formData.tags?.some((item) => item.id === type.id)}
                    onChange={(e) =>
                      handleMultiSelectChange(
                        'tags',
                        { id: type.id, name: type.name },
                        e.target.checked,
                      )
                    }
                    disabled={isSubmitting}
                  />
                  <span className="text-sm">{type.name}</span>
                </div>
              ))} */}
            </div>
          </FormItem>
        </Group>

        {/* 6열: notes */}
        <Group>
          <FormItem direction="vertical" className="w-full">
            <Label className="text-left">note</Label>
            <TextArea
              name="note"
              placeholder="특이 사항 메모"
              value={formData.note}
              onChange={updateFormField}
              disabled={isSubmitting}
            />
          </FormItem>
        </Group>

        {/* 저장 버튼 */}
        <Group>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
            className="w-full"
            onClick={(e) => {
              // 버튼 클릭 시에도 이벤트 전파 방지
              e.preventDefault();
              handleFormSubmit(e);
            }}
          >
            {isSubmitting ? '처리중...' : '저장'}
          </Button>
        </Group>
      </Form>
    </>
  );
};

export default ContactAddForm;
