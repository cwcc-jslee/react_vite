// src/features/project/sections/ProjectAddFormSection.jsx

import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components';
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
  Spinner,
} from '@shared/components/ui';
import { notification } from '@shared/services/notification';
import { projectApiService } from '../services/projectApiService';
import { initialState } from '../constants/initialState';
import { changePageMenu } from '../../../store/slices/uiSlice';
import { PAGE_MENUS } from '@shared/constants/navigation';

// 커스텀 훅 사용
import useProjectTask from '../hooks/useProjectTask';
import { useSelectData } from '@shared/hooks/useSelectData';
import { useCodebook } from '@shared/hooks/useCodebook';
import { useProjectForm } from '../hooks/useProjectForm';
import { useProjectSubmit } from '../hooks/useProjectSubmit';

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(107, 114, 128, 0.3);
  backdrop-filter: blur(1px);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
`;

/**
 * 프로젝트 기본정보 입력 폼 섹션 컴포넌트
 * 프로젝트의 기본 정보를 입력받는 폼 컴포넌트를 포함
 */
const ProjectAddFormSection = () => {
  const dispatch = useDispatch();
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
    const result = await handleFormSubmit(e, buckets);

    if (result.success) {
      notification.success({
        message: '프로젝트 등록 성공',
        description: `프로젝트와 ${result.metadata.totalBuckets}개의 버킷, ${result.metadata.totalTasks}개의 태스크가 성공적으로 등록되었습니다.`,
      });

      // pageForm 초기화
      resetForm();

      // list 메뉴로 이동 (PAGE_MENUS 사용)
      const listMenuConfig = PAGE_MENUS.project.items.list;
      dispatch(
        changePageMenu({
          menuId: 'list',
          config: listMenuConfig.config,
        }),
      );
    } else {
      // 프로젝트는 생성되었지만 버킷/태스크 생성에 실패한 경우
      if (result.project && result.error?.code === 'STRUCTURE_CREATION_ERROR') {
        notification.warning({
          message: '구조 등록 부분 오류',
          description: result.error.message,
        });
      } else {
        // 프로젝트 생성 자체가 실패한 경우
        notification.error({
          message: '프로젝트 등록 실패',
          description: result.error.message,
        });
      }
    }
  };

  /**
   * 폼 초기화 핸들러
   */
  const handleReset = () => {
    createForm(initialState.form.data);
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
    <>
      {isSubmitting && (
        <LoadingOverlay>
          <div className="text-center">
            <Spinner size="large" />
            <p className="mt-2 text-gray-600">프로젝트 저장 중...</p>
          </div>
        </LoadingOverlay>
      )}
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
                  className={
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }
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
    </>
  );
};

export default ProjectAddFormSection;
