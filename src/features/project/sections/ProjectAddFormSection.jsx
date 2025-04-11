// src/features/project/sections/ProjectAddFormSection.jsx

import React, { useState, useEffect } from 'react';
import ProjectAddBaseForm from '../components/forms/ProjectAddBaseForm';
import { Button } from '../../../shared/components/ui';

/**
 * 프로젝트 기본정보 입력 폼 섹션 컴포넌트
 * 프로젝트의 기본 정보를 입력받는 폼 컴포넌트를 포함
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.codebooks - 코드북 데이터
 * @param {Function} props.handleTemplateSelect - 템플릿 선택 핸들러
 * @param {Function} props.updateField - 필드 업데이트 핸들러
 * @param {Function} props.handleFormSubmit - 폼 제출 핸들러
 * @param {Function} props.handleReset - 폼 초기화 핸들러
 * @param {boolean} props.isSubmitting - 제출 중 상태
 * @returns {JSX.Element} 프로젝트 폼 섹션
 */
const ProjectAddFormSection = ({
  codebooks,
  handleTemplateSelect,
  updateField,
  handleFormSubmit,
  handleReset,
  isSubmitting,
}) => {
  // 폼 입력 유효성 상태
  const [formValidity, setFormValidity] = useState({
    hasMandatoryFields: false,
    isTemplateSelected: false,
  });

  // 폼 진행 상태 추적
  const [formProgress, setFormProgress] = useState(0);

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
  const handleTemplateSelectExtended = (templateId) => {
    if (templateId) {
      setFormValidity((prev) => ({
        ...prev,
        isTemplateSelected: true,
      }));
      // 템플릿 선택 시 폼 진행률 업데이트
      setFormProgress((prev) => Math.min(prev + 20, 100));
    }

    // 상위 컴포넌트의 핸들러 호출
    handleTemplateSelect(templateId);
  };

  /**
   * 폼 필드 변경 확장 핸들러
   */
  const handleFieldChangeExtended = (nameOrEvent, valueOrNothing) => {
    // 상위 컴포넌트의 핸들러 호출
    updateField(nameOrEvent, valueOrNothing);

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

  return (
    <div className="bg-white rounded-md shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-800">프로젝트 기본정보</h2>
        {/* 진행 상태 표시 바 */}
        <div className="w-full h-1 bg-gray-200 mt-2 rounded-full overflow-hidden">
          <div
            className={`h-full ${progressColor} transition-all duration-300 ease-in-out`}
            style={{ width: `${formProgress}%` }}
          ></div>
        </div>
      </div>

      <div className="p-4">
        <ProjectAddBaseForm
          codebooks={codebooks}
          handleTemplateSelect={handleTemplateSelectExtended}
          updateField={handleFieldChangeExtended}
          handleFormSubmit={handleFormSubmit}
          handleReset={handleReset}
          isSubmitting={isSubmitting}
        />
      </div>

      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
        <Button
          onClick={handleReset}
          variant="outline"
          size="md"
          disabled={isSubmitting}
        >
          모두 지우기
        </Button>

        <Button
          onClick={handleFormSubmit}
          variant="primary"
          size="md"
          disabled={isSubmitting || formProgress < 50}
          className={formProgress < 50 ? 'opacity-50 cursor-not-allowed' : ''}
        >
          {isSubmitting ? '저장 중...' : '저장하기'}
        </Button>
      </div>
    </div>
  );
};

export default ProjectAddFormSection;
