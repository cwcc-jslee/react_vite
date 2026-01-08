// src/features/project/components/registration/ProjectRegistrationDrawer.jsx
/**
 * PROJECT 추가 전용 Drawer 컴포넌트 (Sub-Header 통합 버전)
 * - Header: 기존 Drawer 타이틀 유지
 * - Sub-Header: 단계 표시(Stepper) 및 이동 버튼 통합
 */

import React, { useState, useEffect } from 'react';
import { Drawer } from '@shared/components/drawer';
import { Button, Spinner } from '@shared/components/ui';
import { FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { notification } from '@shared/services/notification';

// Hooks
import useProjectTask from '../../hooks/useProjectTask';
import { useProjectForm } from '../../hooks/useProjectForm';
import { useProjectSubmit } from '../../hooks/useProjectSubmit';

// Utils
import { validateProjectTaskForm } from '../../utils/validateProjectForm';

// 단계별 콘텐츠
import ProjectBasicInfoForm from './ProjectBasicInfoForm';
import TaskPlanningBoard from './TaskPlanningBoard';
import TaskVerificationStep from './TaskVerificationStep';

const ProjectRegistrationDrawer = ({ visible, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Hooks
  const { resetKanbanBoard, buckets } = useProjectTask();
  const { isRequiredFieldsFilled, formData, resetForm } = useProjectForm();
  const { handleFormSubmit, isSubmitting, progress, processingStep } = useProjectSubmit();

  // 초기화 및 리셋 관리
  useEffect(() => {
    if (visible) {
      // Drawer가 열릴 때: 항상 1단계로 시작하고 데이터를 초기화
      setCurrentStep(1);
      resetForm();        // 기본정보 폼 리셋
      resetKanbanBoard(); // 칸반 보드 리셋
    } else {
      // Drawer가 닫힐 때: 정리 (선택사항이나 안전을 위해 추가)
      // resetForm(); 
      // resetKanbanBoard();
    }
  }, [visible, resetForm, resetKanbanBoard]); // 의존성 배열에 reset 함수들 추가

  // ==================== Navigation Logic ====================

  const handleNext = () => {
    // 1단계 유효성 검사
    if (currentStep === 1) {
      if (!isRequiredFieldsFilled) {
        notification.warning({ message: '필수 입력 항목을 확인해주세요.' });
        return;
      }
    }
    
    // 2단계 유효성 검사
    if (currentStep === 2) {
      // 2-1. 프로젝트 일정 체크
      if (!formData.planStartDate || !formData.planEndDate) {
        notification.warning({ message: '프로젝트 전체 일정(시작일/종료일)을 설정해주세요.' });
        return;
      }
      
      // 2-2. 태스크 존재 여부 체크
      const hasTasks = buckets.some(b => b.tasks.length > 0);
      if (!hasTasks) {
        notification.warning({ message: '최소 하나 이상의 작업을 등록해주세요.' });
        return;
      }

      // 2-3. 태스크 상세 유효성 검사
      const { isValid, errors } = validateProjectTaskForm(buckets);
      if (!isValid) {
        const errorMessage = errors[0] || '작업 계획에 문제가 있습니다.';
        notification.error({ 
          message: '유효성 검사 실패', 
          description: errorMessage 
        });
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async () => {
    const result = await handleFormSubmit(null, buckets);

    if (result.success) {
      notification.success({
        message: '프로젝트 등록 완료',
        description: `성공적으로 등록되었습니다.`,
      });
      // 성공 시에는 확실하게 리셋하고 닫음
      resetForm();
      resetKanbanBoard();
      onClose();
    } else {
      notification.error({
        message: '등록 실패',
        description: result.error.message,
      });
    }
  };

  return (
    <Drawer
      visible={visible}
      title="새 프로젝트 등록"
      onClose={onClose}
      width="XL"
      level="primary"
      enableOverlayClick={false}
      mode="add"
      animationEnabled={true}
      className="registration-drawer"
    >
      <div className="flex flex-col h-full relative">
        
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 z-50 bg-white/80 flex flex-col items-center justify-center backdrop-blur-sm">
            <Spinner size="large" />
            <p className="mt-4 font-bold text-indigo-600 animate-pulse text-lg">{processingStep || '처리 중...'}</p>
            <div className="w-80 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-indigo-600 transition-all duration-300" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* ================= Sub-Header (Toolbar) ================= */}
        <div className="flex-shrink-0 bg-gray-100 border-b border-gray-200 px-8 py-4 flex items-center justify-between shadow-sm">
          
          {/* Left: Stepper Indicator */}
          <div className="flex items-center gap-3">
            {['기본정보', '작업계획', '최종검증'].map((label, idx) => {
              const stepNum = idx + 1;
              const isActive = currentStep === stepNum;
              const isCompleted = currentStep > stepNum;
              
              return (
                <div key={stepNum} className="flex items-center">
                  <div 
                    className={`
                      flex items-center gap-3 px-4 py-2 rounded-full text-sm font-bold transition-all
                      ${isActive ? 'bg-white text-indigo-700 shadow-md ring-1 ring-indigo-200 scale-105' : 
                        isCompleted ? 'text-green-600' : 'text-gray-400'}
                    `}
                  >
                    <div className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs
                      ${isActive ? 'bg-indigo-600 text-white shadow-inner' : 
                        isCompleted ? 'bg-green-600 text-white' : 'bg-gray-300 text-white'}
                    `}>
                      {isCompleted ? <FiCheck size={12} /> : stepNum}
                    </div>
                    {label}
                  </div>
                  {idx < 2 && (
                    <div className={`w-8 h-px mx-1 ${isCompleted ? 'bg-green-400' : 'bg-gray-300'}`}></div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Navigation Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {currentStep > 1 && (
              <Button 
                variant="outline" 
                size="md" 
                onClick={handleBack} 
                disabled={isSubmitting}
                className="bg-white border-gray-300 font-bold whitespace-nowrap"
              >
                이전 단계
              </Button>
            )}
            
            {currentStep < 3 ? (
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleNext} 
                disabled={currentStep === 1 && !isRequiredFieldsFilled}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md font-bold px-6 min-w-[120px]"
              >
                <div className="flex items-center justify-center whitespace-nowrap">
                  <span>다음 단계</span> <FiArrowRight className="ml-2" />
                </div>
              </Button>
            ) : (
              <Button 
                variant="primary" 
                size="md" 
                onClick={handleFinalSubmit} 
                loading={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white shadow-md font-bold px-8 whitespace-nowrap"
              >
                <FiCheck className="mr-2" /> 최종 승인 등록
              </Button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-hidden flex flex-col pt-4">
          {currentStep === 1 && (
            <div className="h-full overflow-y-auto animate-in fade-in slide-in-from-right-2 duration-200 px-2">
              <ProjectBasicInfoForm />
            </div>
          )}
          
          {currentStep === 2 && (
            <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-2 duration-200">
              <TaskPlanningBoard />
            </div>
          )}

          {currentStep === 3 && (
            <div className="h-full overflow-y-auto animate-in fade-in slide-in-from-right-2 duration-200">
              <TaskVerificationStep />
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

export default ProjectRegistrationDrawer;
