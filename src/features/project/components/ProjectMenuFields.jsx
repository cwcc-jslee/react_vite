/**
 * 프로젝트 메뉴별 추가 필드 컴포넌트
 * - 메뉴에 따른 특정 필드 구현
 * - ProjectMenu에서 분리된 컴포넌트
 *
 * @date 25.03.24
 * @version 1.0.0
 * @filename src/features/project/components/ProjectMenuFields.jsx
 */
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, Input, Select } from '../../../shared/components/ui/index';
import { updateMenuState } from '../../../store/slices/uiSlice';
import { apiCommon } from '../../../shared/api/apiCommon';
import { projectApiService } from '../services/projectApiService';
import useSelectData from '../../../shared/hooks/useSelectData';
import CustomerSearchInput from '../../../shared/components/customer/CustomerSearchInput';

// 폼 필드 컴포넌트 - 일관된 폼 레이아웃을 위해
const FormField = ({ label, children, required = false, error = null }) => (
  <div className="flex items-center mb-4">
    <span className="text-sm font-medium w-16 text-right mr-3 flex-shrink-0">
      {label}
      {required && <span className="text-red-500 ml-0.5">*</span>}
    </span>
    <div className="w-full max-w-xs">{children}</div>
    {error && <span className="text-xs text-red-500 ml-2">{error}</span>}
  </div>
);

/**
 * 프로젝트 메뉴별 추가 필드 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {string} props.activeMenu - 현재 활성화된 메뉴 ID
 * @returns {JSX.Element} 메뉴별 추가 필드 컴포넌트
 */
const ProjectMenuFields = ({ activeMenu }) => {
  const dispatch = useDispatch();

  // Redux에서 메뉴 상태 가져오기
  const menuState = useSelector(
    (state) => state.ui.menuState.project[activeMenu] || {},
  );

  // API 데이터 조회
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const { data: sfaData, isLoading: isSfaLoading } = useSelectData(
    apiCommon.getSfasByCustomer,
    selectedCustomerId,
  );
  const { data: taskTempleteData, isLoading: isTaskTempleteLoading } =
    useSelectData(projectApiService.getTaskTemplate);

  // 폼 유효성 검사 상태
  const [formErrors, setFormErrors] = useState({});

  // 제출 상태 관리
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // 고객사 선택 핸들러
  const handleCustomerSelect = (customer) => {
    if (customer?.id) {
      setSelectedCustomerId(customer.id);

      // Redux 메뉴 상태 업데이트
      dispatch(
        updateMenuState({
          page: 'project',
          menuId: activeMenu,
          updates: { customer: customer },
        }),
      );

      // 고객사가 선택되면 해당 필드의 에러 제거
      if (formErrors.customer) {
        setFormErrors({
          ...formErrors,
          customer: null,
        });
      }
    }
  };

  // 메뉴 상태 필드 업데이트 함수
  const handleMenuStateChange = (field, value) => {
    dispatch(
      updateMenuState({
        page: 'project',
        menuId: activeMenu,
        updates: { [field]: value },
      }),
    );

    // 필드 값이 변경되면 해당 필드의 에러 제거
    if (formErrors[field]) {
      setFormErrors({
        ...formErrors,
        [field]: null,
      });
    }
  };

  // 폼 제출 처리
  const handleSubmit = () => {
    // 필수 필드 유효성 검사
    const errors = {};

    if (!menuState.customer) {
      errors.customer = '고객사를 선택해주세요';
    }

    if (!menuState.sfa) {
      errors.sfa = 'SFA를 선택해주세요';
    }

    if (!menuState.template) {
      errors.template = '템플릿을 선택해주세요';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // 제출 상태 설정
    setIsSubmitting(true);

    // 실제 API 호출을 시뮬레이션 (실제로는 API 서비스를 호출)
    setTimeout(() => {
      // 여기에 실제 저장 로직 구현
      console.log('저장 데이터:', menuState);

      // 제출 완료 상태 설정
      setIsSubmitting(false);
      setSubmitSuccess(true);

      // 3초 후 성공 메시지 숨기기
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 3000);
    }, 1000);
  };

  // 폼 초기화
  const handleReset = () => {
    dispatch(
      updateMenuState({
        page: 'project',
        menuId: activeMenu,
        updates: {
          sfa: null,
          template: null,
          customer: null,
        },
      }),
    );
    setFormErrors({});
    setSubmitSuccess(false);
  };

  // 등록 메뉴 필드 렌더링
  const renderAddProjectFields = () => {
    // SFA 옵션 목록 생성
    const sfaOptions = [
      { value: '', label: '선택하세요' },
      ...(sfaData?.data || []).map((sfa) => ({
        value: sfa?.id?.toString() || '',
        label: sfa?.name || '이름 없음',
      })),
    ];

    // task templete 옵션 목록
    const templeteOptions = [
      { value: '', label: '선택하세요' },
      ...(taskTempleteData?.data || []).map((item) => ({
        value: item?.id?.toString() || '',
        label: item?.name || '이름 없음',
      })),
    ];

    return (
      <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          프로젝트 등록
        </h3>

        {/* 성공 메시지 */}
        {submitSuccess && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            프로젝트가 성공적으로 등록되었습니다.
          </div>
        )}

        <div className="grid grid-cols-2 gap-6">
          <div>
            {/* 고객사 필드 */}
            <FormField label="고객사" required error={formErrors.customer}>
              <CustomerSearchInput
                placeholder="고객사 입력"
                className={`w-full h-9 ${
                  formErrors.customer ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                value={menuState.customer}
                onSelect={handleCustomerSelect}
                size="small"
              />
            </FormField>

            {/* SFA 필드 */}
            <FormField label="SFA" required error={formErrors.sfa}>
              <Select
                name="sfa"
                value={menuState.sfa || ''}
                className={`w-full h-9 ${
                  formErrors.sfa ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                onChange={(e) => handleMenuStateChange('sfa', e.target.value)}
              >
                {sfaOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {isSfaLoading && option.value === ''
                      ? '로딩 중...'
                      : option.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          <div>
            {/* 템플릿 필드 */}
            <FormField label="템플릿" required error={formErrors.template}>
              <Select
                name="template"
                value={menuState.template || ''}
                className={`w-full h-9 ${
                  formErrors.template ? 'border-red-500 focus:ring-red-500' : ''
                }`}
                onChange={(e) =>
                  handleMenuStateChange('template', e.target.value)
                }
              >
                {templeteOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {isTaskTempleteLoading && option.value === ''
                      ? '로딩 중...'
                      : option.label}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex justify-end space-x-3 mt-6">
          <Button
            variant="outline"
            onClick={handleReset}
            className="px-4 py-2"
            disabled={isSubmitting}
          >
            초기화
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            className="px-4 py-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                저장 중...
              </span>
            ) : (
              '저장'
            )}
          </Button>
        </div>
      </div>
    );
  };

  // 검색 필터 필드 렌더링
  const renderSearchFilterFields = () => (
    <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">상태:</span>
          <Select
            className="w-32 h-9"
            onChange={(e) => console.log('상태 필터:', e.target.value)}
            defaultValue="all"
          >
            <option value="all">전체</option>
            <option value="active">진행중</option>
            <option value="completed">완료</option>
            <option value="pending">대기</option>
          </Select>
        </div>

        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">기간:</span>
          <Select
            className="w-32 h-9"
            onChange={(e) => console.log('기간 필터:', e.target.value)}
            defaultValue="1month"
          >
            <option value="1month">1개월</option>
            <option value="3months">3개월</option>
            <option value="6months">6개월</option>
            <option value="1year">1년</option>
            <option value="all">전체</option>
          </Select>
        </div>

        <div className="flex items-center">
          <span className="text-sm font-medium mr-2">검색:</span>
          <div className="relative">
            <Input
              type="text"
              placeholder="프로젝트명 검색"
              className="pl-10 w-56 h-9"
              onChange={(e) => console.log('검색어:', e.target.value)}
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        <Button
          variant="outline"
          className="ml-auto"
          onClick={() => console.log('필터 초기화')}
        >
          필터 초기화
        </Button>
      </div>
    </div>
  );

  // 활성 메뉴에 따라 다른 필드 렌더링
  if (activeMenu === 'addProject') {
    return renderAddProjectFields();
  } else if (activeMenu === 'default') {
    return renderSearchFilterFields();
  }

  return null;
};

export default ProjectMenuFields;
