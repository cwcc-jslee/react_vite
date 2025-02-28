// src/features/customer/components/forms/CustomerAddForm/index.jsx
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
import { useCustomerForm } from '../../hooks/useCustomerForm';
import { useFormValidation } from '../../hooks/useFormValidation';
import {
  normalizeBusinessNumber,
  displayBusinessNumber,
  formatBusinessNumber,
} from '../../../../shared/services/businessNumberUtils';
import { notification } from '../../../../shared/services/notification';

const CustomerAddForm = () => {
  const { formData, errors, updateFormField, processSubmit } =
    useCustomerForm();
  const { validationErrors, validateForm, clearErrors } = useFormValidation();
  const {
    data: codebooks,
    isLoading: isLoadingCodebook,
    error,
  } = useCodebook([
    'co_classification',
    'business_scale',
    'co_funnel',
    'employee',
    'business_type',
    'region',
  ]);

  const showErrorNotification = (errors) => {
    const firstError = Object.values(errors)[0];
    notification.error({
      message: '고객객등록오류',
      description: firstError,
      duration: 0,
      style: { width: 500 },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 유효성 검사 수행
    const validation = validateForm(formData);
    console.log(
      `cuatomer 폼 데이터 유효성 검증[${validation.isValid}]`,
      validation.errors,
    );

    if (validation.isValid) {
      // Submit 로직 구현 예정
      console.log(`cuatomer 폼 데이터 제출`, formData);
      // api 호출 로직 구현
      await processSubmit();
    } else {
      // 에러 출력
      showErrorNotification(validation.errors);
    }
  };

  // 지원사업 옵션
  const supportPrograms = [
    { id: 1, name: '수출바우처' },
    { id: 2, name: '중진공혁신바우처' },
    { id: 3, name: '경남TP' },
  ];

  // 입력 변경 핸들러
  const handleBusinessNumberChange = (e) => {
    const formattedValue = formatBusinessNumber(e.target.value);

    // 화면에는 형식이 적용된 값을 표시
    e.target.value = formattedValue;

    // 저장을 위해 정규화된 값을 form 데이터에 업데이트
    const normalizedValue = normalizeBusinessNumber(formattedValue);
    updateFormField({
      target: {
        name: 'businessNumber',
        value: normalizedValue,
      },
    });
  };

  // 다중 선택 필드 변경 처리 (체크박스)
  const handleMultiSelectChange = (fieldName, item, isChecked) => {
    // 현재 선택된 항목 배열 가져오기 (없으면 빈 배열)
    const currentItems = formData[fieldName] || [];

    let updatedItems;
    if (isChecked) {
      // 체크된 경우: 이미 있는지 확인 후 추가
      const exists = currentItems.some(
        (existingItem) => existingItem.id === item.id,
      );
      updatedItems = exists
        ? currentItems
        : [...currentItems, { id: item.id, name: item.name }];
    } else {
      // 체크 해제된 경우: 배열에서 제거
      updatedItems = currentItems.filter(
        (existingItem) => existingItem.id !== item.id,
      );
    }

    // formData 업데이트
    updateFormField({
      target: {
        name: fieldName,
        value: updatedItems,
      },
    });
  };

  // 공통으로 사용될 Stack 스타일 클래스
  const stackClass = 'flex-1'; // flex-1로 동일한 너비 보장

  console.log(`>> formData`, formData);

  return (
    <>
      <FormItem className="w-1/2">
        <Label>고객등록 확인</Label>
        <CustomerSearchInput size="small" />
      </FormItem>
      <Form
        onSubmit={handleSubmit}
        className="space-y-8"
        method="POST"
        action="#"
      >
        {/* 첫번째 행: 고객명, 기업분류, 기업규모 */}
        <Group direction="horizontal" spacing="lg">
          {/* 고객명 */}
          <FormItem direction="vertical" className="flex-1">
            <Label required className="text-left">
              고객명
            </Label>
            <Input
              type="text"
              name="name"
              placeholder="고객명을 입력하세요"
              onChange={updateFormField}
              value={formData?.name}
            />
          </FormItem>

          {/* 기업분류 */}
          <FormItem direction="vertical" className="flex-1">
            <Label required className="text-left">
              기업분류
            </Label>
            <Select
              name="coClassification"
              value={formData.coClassification}
              onChange={updateFormField}
            >
              <option value="">선택하세요</option>
              {codebooks?.co_classification?.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>

          {/* 기업규모 */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">기업규모</Label>
            <Select
              name="businessScale"
              value={formData.businessScale}
              onChange={updateFormField}
            >
              <option value="">선택하세요</option>
              {codebooks?.business_scale?.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
        </Group>

        {/* 두번째 행: 사업자번호, 유입경로, 홈페이지 */}
        <Group direction="horizontal" spacing="lg">
          {/* 사업자번호 */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">사업자번호</Label>
            <Input
              type="text"
              name="businessNumber"
              placeholder="000-00-00000"
              value={displayBusinessNumber(formData.businessNumber)}
              onChange={handleBusinessNumberChange}
              maxLength={12} // 하이픈 포함 최대 길이
            />
          </FormItem>

          {/* 유입경로 */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">유입경로</Label>
            <Select
              name="coFunnel"
              value={formData.coFunnel}
              onChange={updateFormField}
            >
              <option value="">선택하세요</option>
              {codebooks?.co_funnel?.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">유입경로suffix</Label>
          </FormItem>
        </Group>

        {/* 3열: 업태, 종업원 */}
        <Group direction="horizontal" spacing="lg">
          {/* 업태 (다중선택) */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">업태 (다중선택)</Label>
            <div className="flex flex-wrap items-center gap-4">
              {codebooks?.business_type?.data?.map((type) => (
                <div key={type.id} className="flex items-center space-x-2">
                  <Checkbox
                    name={`businessType_${type.id}`}
                    checked={formData.businessType?.some(
                      (item) => item.id === type.id,
                    )}
                    onChange={(e) =>
                      handleMultiSelectChange(
                        'businessType',
                        { id: type.id, name: type.name },
                        e.target.checked,
                      )
                    }
                  />
                  <span className="text-sm">{type.name}</span>
                </div>
              ))}
            </div>
          </FormItem>

          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">종업원</Label>
            <Select
              name="employee"
              value={formData.employee}
              onChange={updateFormField}
            >
              <option value="">선택하세요</option>
              {codebooks?.employee?.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
        </Group>

        {/* 4열: 설립일, 대표자 */}
        <Group direction="horizontal" spacing="lg">
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">설립일</Label>
            <Input
              type="date"
              name="commencementDate"
              value={formData.commencementDate}
              onChange={updateFormField}
            />
          </FormItem>

          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">대표자</Label>
            <Input
              type="text"
              name="representativeName"
              placeholder="대표자명"
              value={formData.representativeName}
              onChange={updateFormField}
            />
          </FormItem>

          {/* 홈페이지 */}
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">홈페이지</Label>
            <Input
              type="url"
              name="homepage"
              placeholder="https://example.com"
              value={formData.homepage}
              onChange={updateFormField}
            />
          </FormItem>
        </Group>

        {/* 5열: 지역, 시/군/구, 상세주소 */}
        <Group direction="horizontal" spacing="lg">
          <FormItem direction="vertical" className="w-1/6">
            <Label className="text-left">지역</Label>
            <Select
              name="region"
              value={formData.region}
              onChange={updateFormField}
            >
              <option value="">선택하세요</option>
              {codebooks?.region?.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>

          <FormItem direction="vertical" className="w-1/6">
            <Label className="text-left">시/군/구</Label>
            <Input
              type="text"
              name="city"
              placeholder="시/군/구"
              value={formData.city}
              onChange={updateFormField}
            />
          </FormItem>

          <FormItem direction="vertical" className="w-2/3">
            <Label className="text-left">상세주소</Label>
            <Input
              type="text"
              name="address"
              placeholder="상세주소를 입력하세요"
              value={formData.address}
              onChange={updateFormField}
            />
          </FormItem>
        </Group>

        {/* 6열: 지원사업 */}
        <Group direction="horizontal" spacing="lg">
          <FormItem direction="vertical" className="flex-1">
            <Label className="text-left">지원사업 (다중선택)</Label>
            <div className="flex items-center space-x-4">
              {supportPrograms.map((program) => (
                <div key={program.id} className="flex items-center space-x-2">
                  <Checkbox name={`supportProgram_${program.id}`} />
                  <span className="text-sm">{program.name}</span>
                </div>
              ))}
            </div>
          </FormItem>
        </Group>

        {/* 7열: description */}
        <Group>
          <FormItem direction="vertical" className="w-full">
            <Label className="text-left">비고</Label>
            <TextArea
              name="description"
              placeholder="비고 사항을 입력하세요"
              value={formData.description}
              onChange={updateFormField}
            />
          </FormItem>
        </Group>

        {/* 저장 버튼 */}
        <Group>
          <Button
            type="submit"
            variant="primary"
            //   disabled={isSubmitting}
            className="w-full"
            onClick={(e) => {
              // 버튼 클릭 시에도 이벤트 전파 방지
              e.preventDefault();
              handleSubmit(e);
            }}
          >
            {/* {isSubmitting ? '처리중...' : '저장'} */}
            저장
          </Button>
        </Group>
      </Form>
    </>
  );
};

export default CustomerAddForm;
