// src/features/project/sections/ProjectAddFormSection.jsx

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import ProjectAddBaseForm from '../components/forms/ProjectAddBaseForm';
import {
  Button,
  Row,
  Col,
  Group,
  Select,
  Label,
  FormItem,
} from '@shared/components/ui';

// 커스텀훅
import useProjectTask from '../hooks/useProjectTask';
import { useSelectData } from '@shared/hooks/useSelectData';
import { projectApiService } from '../services/projectApiService';

/**
 * 프로젝트 기본정보 입력 폼 섹션 컴포넌트
 * 프로젝트의 기본 정보를 입력받는 폼 컴포넌트를 포함
 */
const ProjectAddFormSection = ({
  codebooks,
  // handleTemplateSelect,
  updateField: parentUpdateField,
  handleFormSubmit,
  handleReset,
  // isSubmitting,
}) => {
  // 리덕스 상태 가져오기
  // Redux 상태 가져오기
  const {
    data: formData = {},
    errors = {},
    isSubmitting = false,
  } = useSelector((state) => state.pageForm);

  // 폼 입력 유효성 상태
  const [formValidity, setFormValidity] = useState({
    hasMandatoryFields: false,
    isTemplateSelected: false,
  });

  // 폼 진행 상태 추적
  const [formProgress, setFormProgress] = useState(0);

  // 칸반 보드 훅 사용
  const { buckets, loadTemplate, resetKanbanBoard } = useProjectTask();

  // 템플릿 데이터 가져오기
  const { data: taskTempleteData, isLoading: isTaskTempleteLoading } =
    useSelectData(projectApiService.getTaskTemplate);

  /**
   * 필수 입력 필드 검증
   * @param {Object} formData - 폼 데이터
   * @returns {boolean} 유효성 여부
   */
  const validateMandatoryFields = (formData) => {
    // 예시: 실제 구현에서는 실제 폼 데이터를 기반으로 검증
    // 실제 데이터 접근이 필요하다면 여기서 구현하거나 Container에서 전달 받아야 함
    const mandatoryFields = ['name', 'customer', 'service'];
    const hasAllMandatory = mandatoryFields.every(
      (field) => formData && formData[field] && formData[field].trim !== '',
    );

    return hasAllMandatory;
  };

  /**
   * 템플릿 선택 처리 확장 핸들러
   * 섹션 내에서 추가 로직 처리 후 상위 핸들러 호출
   */
  const handleTemplateSelect = async (templateId) => {
    if (!templateId) return;

    try {
      await loadTemplate(templateId);
    } catch (error) {
      console.error('템플릿 로드 오류:', error);
    }
  };

  /**
   * 폼 필드 변경 핸들러
   * 상위 컴포넌트의 핸들러만 호출 (리덕스에 직접 업데이트)
   */
  const updateField = (nameOrEvent, valueOrNothing) => {
    // 상위 컴포넌트의 핸들러 호출하여 리덕스에 업데이트
    parentUpdateField(nameOrEvent, valueOrNothing);

    // 필드 변경 시 폼 진행률 업데이트 로직
    // 실제 구현에서는 더 정교한 로직이 필요
    setFormProgress((prev) => {
      const increment = prev < 40 ? 5 : prev < 70 ? 3 : 2;
      return Math.min(prev + increment, 90); // 제출하기 전까지 최대 90%
    });
  };

  // 가상의 진행 상태 표시 (실제로는 더 정교한 검증 필요)
  const progressColor =
    formProgress < 30
      ? 'bg-red-500'
      : formProgress < 70
      ? 'bg-amber-500'
      : 'bg-green-500';

  // task template 옵션 목록
  const templeteOptions = [
    { value: '', label: '선택하세요' },
    ...(taskTempleteData?.data || []).map((item) => ({
      value: item?.id?.toString() || '',
      label: item?.name || '이름 없음',
    })),
  ];

  // work_type 옵션 목록 (예시)
  const workTypeOptions = [
    { value: '', label: '선택하세요' },
    { value: 'project', label: '프로젝트' },
    { value: 'single', label: '단건' },
  ];

  return (
    <div className="bg-white rounded-md shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <Row gutter={16}>
          <Col span={16}>
            <h2 className="text-lg font-medium text-gray-800">
              프로젝트 기본정보
            </h2>
            {/* 진행 상태 표시 바 */}
            <div className="w-full h-1 bg-gray-200 mt-2 rounded-full overflow-hidden">
              <div
                className={`h-full ${progressColor} transition-all duration-300 ease-in-out`}
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
          </Col>
          <Col span={4}>
            <Group direction="horizontal" className="gap-4">
              {/* work_type 선택 필드 */}
              <FormItem className="flex-1 ">
                <Select
                  name="workType"
                  value={formData.workType || ''}
                  onChange={(e) => updateField('workType', e.target.value)}
                  size="sm"
                >
                  {workTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </FormItem>

              {/* 템플릿 선택 필드 */}
              <FormItem className="flex-1">
                <Select
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  size="sm"
                >
                  {templeteOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {isTaskTempleteLoading && option.value === ''
                        ? '로딩 중...'
                        : option.label}
                    </option>
                  ))}
                </Select>
              </FormItem>
            </Group>
          </Col>

          <Col span={4}>
            <Group direction="horizontal" className="gap-4">
              <Button
                onClick={handleReset}
                variant="outline"
                size="md"
                disabled={isSubmitting}
              >
                초기화
              </Button>
              <Button
                onClick={(e) => {
                  // 버튼 클릭 시에도 이벤트 전파 방지
                  e.preventDefault();
                  handleFormSubmit(e);
                }}
                variant="primary"
                size="md"
                disabled={isSubmitting || formProgress < 50}
                className={
                  formProgress < 50 ? 'opacity-50 cursor-not-allowed' : ''
                }
              >
                {isSubmitting ? '저장 중...' : '저장하기'}
              </Button>
            </Group>
          </Col>
        </Row>
      </div>

      <div className="p-4">
        <ProjectAddBaseForm
          codebooks={codebooks}
          formData={formData}
          updateField={updateField}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default ProjectAddFormSection;
