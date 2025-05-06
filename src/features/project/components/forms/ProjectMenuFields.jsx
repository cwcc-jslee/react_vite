/**
 * 프로젝트 메뉴별 추가 필드 컴포넌트
 * - 메뉴에 따른 특정 필드 구현
 * - ProjectMenu에서 분리된 컴포넌트
 *
 * @date 25.03.24
 * @version 1.0.0
 * @filename src/features/project/components/ProjectMenuFields.jsx
 */
import React, { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Button,
  Input,
  Select,
  Label,
  FormItem,
  Group,
} from '../../../../shared/components/ui/index';
// import { updateMenuState } from '../../../store/slices/uiSlice';
import { apiCommon } from '../../../../shared/api/apiCommon';
import { projectApiService } from '../../services/projectApiService';
import useSelectData from '../../../../shared/hooks/useSelectData';
import CustomerSearchInput from '../../../../shared/components/customer/CustomerSearchInput';
// import { updateFormField } from '../../store/projectSlice';

/**
 * 프로젝트 메뉴별 추가 필드 컴포넌트
 */
const ProjectMenuFields = ({ handleTemplateSelect, updateField }) => {
  const dispatch = useDispatch();

  // Redux 상태 가져오기
  const {
    data: formData = {},
    errors = {},
    isSubmitting = false,
  } = useSelector((state) => state.project.form);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // API 데이터 조회
  const {
    data: sfaData,
    isLoading: isSfaLoading,
    refetch: refetchSfa,
  } = useSelectData(apiCommon.getSfasByCustomer, selectedCustomerId);

  const { data: taskTempleteData, isLoading: isTaskTempleteLoading } =
    useSelectData(projectApiService.getTaskTemplate);

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

  /**
   * 특정 폼 필드 업데이트 함수
   * @param {string} name - 필드 이름
   * @param {any} value - 필드 값
   */
  // const updateField = useCallback(
  //   (nameOrEvent, valueOrNothing) => {
  //     // 이벤트 객체인 경우
  //     if (nameOrEvent && nameOrEvent.target) {
  //       const { name, value } = nameOrEvent.target;
  //       dispatch(updateFormField({ name, value }));
  //     }
  //     // name, value 형태로 직접 호출한 경우
  //     else {
  //       dispatch(updateFormField({ name: nameOrEvent, value: valueOrNothing }));
  //     }
  //   },
  //   [dispatch],
  // );

  return (
    <>
      <Group direction="horizontal" className="gap-6 mb-6">
        {/* 고객사 입력 필드 */}
        <FormItem className="flex-1">
          <Label required className="text-left">
            고객사
          </Label>
          <CustomerSearchInput
            // value={selectedCustomerId}
            onSelect={(e) => setSelectedCustomerId(e.id)}
            size="small"
          />
        </FormItem>

        {/* SFA 선택 필드 */}
        <FormItem className="flex-1">
          <Label required className="text-left">
            SFA
          </Label>
          <Select
            name="sfa"
            value={formData.sfa || ''}
            onChange={updateField}
            // disabled={isSfaLoading || !selectedCustomerId}
          >
            {sfaOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {isSfaLoading && option.value === ''
                  ? '로딩 중...'
                  : option.label}
              </option>
            ))}
          </Select>
        </FormItem>

        {/* 템플릿 선택 필드 */}
        <FormItem className="flex-1">
          <Label className="text-left">템플릿</Label>
          <Select
            onChange={(e) => handleTemplateSelect(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {templeteOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {isTaskTempleteLoading && option.value === ''
                  ? '로딩 중...'
                  : option.label}
              </option>
            ))}
          </Select>
          {/* {isTemplateDetailLoading && selectedTemplateId && (
            <p className="text-xs text-indigo-600 mt-1">
            템플릿 작업 로딩 중...
            </p>
            )} */}
        </FormItem>

        {/* 버튼 그룹 */}

        <Button
          variant="outline"
          // onClick={handleReset}
          className="px-4 py-2"
          // disabled={isSubmitting}
        >
          초기화
        </Button>

        <Button
          variant="primary"
          // onClick={handleSubmit}
          className="px-4 py-2"
          // disabled={isSubmitting}
        >
          {/* {isSubmitting ? (
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
          )} */}
        </Button>
      </Group>
    </>
  );
};

export default ProjectMenuFields;
