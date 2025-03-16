// src/features/project/components/ui/ProjectBaseForm.jsx
// 프로젝트 정보 입력을 위한 폼 컴포넌트
// 고객사, SFA, 프로젝트명, 서비스, 사업부 정보를 입력 받습니다

import React, { useState, useEffect } from 'react';
import { apiCommon } from '../../../../shared/api/apiCommon';
import { projectApiService } from '../../services/projectApiService';
import { CustomerSearchInput } from '../../../../shared/components/customer/CustomerSearchInput';
import { useSelectData } from '../../../../shared/hooks/useSelectData';

// 프로젝트 정보 입력 폼 컴포넌트
const ProjectBaseForm = ({ projectInfo, onInfoChange, onTemplateSelect }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  // API 데이터 조회
  const {
    data: sfaData,
    isLoading: isSfaLoading,
    refetch: refetchSfa,
  } = useSelectData(apiCommon.getSfasByCustomer, selectedCustomerId);

  const { data: teamsData, isLoading: isTeamsLoading } = useSelectData(
    apiCommon.getTeams,
  );

  const { data: serviceData, isLoading: isServiceLoading } = useSelectData(
    apiCommon.getCodebookItems,
    '서비스',
  );

  const { data: taskTempleteData, isLoading: isTaskTempleteLoading } =
    useSelectData(projectApiService.getTaskTemplate);

  // 템플릿 상세 정보 조회
  const {
    data: templateDetailData,
    isLoading: isTemplateDetailLoading,
    refetch: refetchTemplateDetail,
  } = useSelectData(projectApiService.getTaskTemplate, selectedTemplateId);

  // SFA 옵션 목록 생성
  const sfaOptions = [
    { value: '', label: '선택하세요' },
    ...(sfaData?.data || []).map((sfa) => ({
      value: sfa?.id?.toString() || '',
      label: sfa?.name || '이름 없음',
    })),
  ];

  // 팀 옵션 목록 생성
  const teamOptions = [
    { value: '', label: '선택하세요' },
    ...(teamsData?.data || []).map((team) => ({
      value: team?.id?.toString() || '',
      label: team?.name || '이름 없음',
    })),
  ];

  // 서비스 옵션 목록 생성 (코드북 아이템 특수 구조 처리)
  const serviceOptions = [
    { value: '', label: '선택하세요' },
    ...(serviceData?.data?.[0]?.structure || []).map((item) => ({
      value: item?.id?.toString() || '',
      label: item?.name || '이름 없음',
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

  // 입력 값 변경 핸들러
  const handleChange = (field, value) => {
    onInfoChange({
      ...projectInfo,
      [field]: value,
    });
  };

  // 고객사 선택 핸들러
  const handleCustomerSelect = (customer) => {
    if (customer?.id) {
      setSelectedCustomerId(customer.id);
      // handleChange('customer', customer);
      // handleChange('sfa', '');
    }
  };

  // 템플릿 선택 핸들러
  const handleTemplateSelect = (e) => {
    const templateId = e.target.value;
    handleChange('template', templateId);

    // 템플릿 ID가 있을 경우 onTemplateSelect 콜백 호출
    if (templateId && onTemplateSelect) {
      onTemplateSelect(templateId);
    }
  };

  return (
    <div className="bg-white p-4 mb-6 rounded-md shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 고객사 입력 필드 */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            고객사
          </label>
          <CustomerSearchInput onSelect={handleCustomerSelect} size="small" />
        </div>

        {/* SFA 선택 필드 */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SFA
          </label>
          <select
            value={projectInfo.sfa || ''}
            onChange={(e) => handleChange('sfa', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isSfaLoading || !selectedCustomerId}
          >
            {sfaOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {isSfaLoading && option.value === ''
                  ? '로딩 중...'
                  : option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 프로젝트명 입력 필드 */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            프로젝트명
          </label>
          <input
            type="text"
            value={projectInfo.projectName || ''}
            onChange={(e) => handleChange('projectName', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="프로젝트명을 입력하세요"
          />
        </div>

        {/* 서비스 선택 필드 */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            서비스
          </label>
          <select
            // value={projectInfo.service || ''}
            // onChange={(e) => handleChange('service', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {serviceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 사업부 선택 필드 */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            사업부
          </label>
          <select
            // value={projectInfo.department || ''}
            // onChange={(e) => handleChange('department', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {teamOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        {/* 사업부 선택 필드 */}
        <div className="col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            템플릿
          </label>
          <select
            // value={projectInfo.department || ''}
            onChange={handleTemplateSelect}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {templeteOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {isTaskTempleteLoading && option.value === ''
                  ? '로딩 중...'
                  : option.label}
              </option>
            ))}
          </select>
          {isTemplateDetailLoading && selectedTemplateId && (
            <p className="text-xs text-indigo-600 mt-1">
              템플릿 작업 로딩 중...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectBaseForm;
