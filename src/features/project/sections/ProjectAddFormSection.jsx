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
  Form,
} from '@shared/components/ui';
import { notification } from '@shared/services/notification';
import { projectApiService } from '../services/projectApiService';
import { initialState } from '../constants/initialState';

// 커스텀 훅 사용
import useProjectTask from '../hooks/useProjectTask';
import { useSelectData } from '@shared/hooks/useSelectData';
import { useCodebook } from '@shared/hooks/useCodebook';
import { useProjectForm } from '../hooks/useProjectForm';
import { useProjectSubmit } from '../hooks/useProjectSubmit';

/**
 * 프로젝트 기본정보 입력 폼 섹션 컴포넌트
 * 프로젝트의 기본 정보를 입력받는 폼 컴포넌트를 포함
 */
const ProjectAddFormSection = () => {
  const {
    formData,
    // formErrors,
    // isSubmitting,
    // formMode,
    // isFormValid,
    // editingId,
    // isDirty,
    formProgress,
    updateField,
    updateFields,
    setErrors,
    clearErrors,
    validateForm,
    handleSubmit,
    getProgressColor,
    createForm,
    resetForm,
  } = useProjectForm();

  // 폼 초기화
  useEffect(() => {
    createForm(initialState.form.data);
  }, [createForm]);

  const { data: codebooks, isLoading: isLoadingCodebook } = useCodebook([
    'fy', // 회계년도
    'importanceLevel', //중요도
    'pjtStatus', // 프로젝트 상태
  ]);

  // 프로젝트 추가 관련 상태 및 훅
  const { handleFormSubmit, isSubmitting } = useProjectSubmit();

  // 칸반 보드 훅 사용
  const { buckets, loadTemplate, resetKanbanBoard } = useProjectTask();

  // 폼 입력 유효성 상태
  const [formValidity, setFormValidity] = useState({
    hasMandatoryFields: false,
    isTemplateSelected: false,
  });

  // 템플릿 데이터 가져오기
  const { data: taskTempleteData, isLoading: isTaskTempleteLoading } =
    useSelectData(projectApiService.getTaskTemplate);

  /**
   * 폼 제출 핸들러
   */
  const onFormSubmit = async (e) => {
    e.preventDefault();
    await handleFormSubmit(e, buckets);
  };

  /**
   * 폼 초기화 핸들러
   */
  const handleReset = () => {
    resetForm();
    resetKanbanBoard();
    notification.info({
      message: '폼 초기화',
      description: '모든 입력 내용이 초기화되었습니다.',
    });
  };

  /**
   * 템플릿 선택 핸들러
   */
  const handleTemplateSelect = async (templateId) => {
    if (!templateId) return;

    try {
      await loadTemplate(templateId);
    } catch (error) {
      console.error('템플릿 로드 오류:', error);
    }
  };

  // task template 옵션 목록
  const templeteOptions = [
    { value: '', label: '선택하세요' },
    ...(taskTempleteData?.data || []).map((item) => ({
      value: item?.id?.toString() || '',
      label: item?.name || '이름 없음',
    })),
  ];

  console.log(`>>> isSubmitting: ${isSubmitting}`);

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
                className={`h-full ${getProgressColor()} transition-all duration-300 ease-in-out`}
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
          </Col>

          <Col span={8}>
            <Group direction="horizontal" className="gap-4">
              <Button
                onClick={handleReset}
                variant="outline"
                size="md"
                disabled={isSubmitting}
                className={isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
              >
                초기화
              </Button>
              <Button
                onClick={onFormSubmit}
                variant="primary"
                size="md"
                disabled={isSubmitting || formProgress < 50}
                className={
                  isSubmitting || formProgress < 50
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }
                loading={isSubmitting}
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
          templeteOptions={templeteOptions}
          handleTemplateSelect={handleTemplateSelect}
        />
      </div>
    </div>
  );
};

export default ProjectAddFormSection;
