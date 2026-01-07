// src/features/project/components/registration/ProjectBasicInfoForm.jsx
// 프로젝트 기본정보 입력 폼 컴포넌트 (순수 뷰)

import React, { useEffect } from 'react';
import ProjectAddBaseForm from '../forms/ProjectAddBaseForm';
import { useCodebook } from '@shared/hooks/useCodebook';
import { useProjectForm } from '../../hooks/useProjectForm';
import useProjectTask from '../../hooks/useProjectTask';
import { initialState } from '../../constants/initialState';

const ProjectBasicInfoForm = () => {
  const { formData, updateField, createForm } = useProjectForm();
  const { buckets } = useProjectTask(); // buckets 유지를 위해 호출만 함
  
  // 폼 초기화 로직
  useEffect(() => {
    // 폼 데이터가 비어있을 때만 초기화 (뒤로가기 시 데이터 유지)
    if (!formData || Object.keys(formData).length === 0 || !formData.name) {
      createForm(initialState.form.data);
    }
  }, [createForm]);

  const { data: codebooks } = useCodebook(['fy', 'importanceLevel', 'pjtStatus']);

  return (
    <div className="bg-white rounded-lg p-2">
      {/* 폼 콘텐츠 */}
      <ProjectAddBaseForm
        codebooks={codebooks}
        formData={formData}
        updateField={updateField}
      />
    </div>
  );
};

export default ProjectBasicInfoForm;
