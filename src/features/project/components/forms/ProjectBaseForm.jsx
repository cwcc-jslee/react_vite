// src/features/project/components/ui/ProjectBaseForm.jsx
// 프로젝트 정보 입력을 위한 폼 컴포넌트
// 고객사, SFA, 프로젝트명, 서비스, 사업부 정보를 입력 받습니다

import React, { useState } from 'react';
import { CustomerSearchInput } from '../../../../shared/components/customer/CustomerSearchInput';
import { useSfa } from '../../../../shared/hooks/useSfa';

// 프로젝트 정보 입력 폼 컴포넌트
const ProjectBaseForm = ({ projectInfo, onInfoChange }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const { data: sfaList, isLoading: isSfaLoading } = useSfa(selectedCustomerId);

  // SFA 옵션 목록
  const sfaOptions = [
    { value: '', label: '선택하세요' },
    ...(sfaList?.data || []).map((sfa) => ({
      value: sfa?.id.toString(),
      label: sfa?.name || '이름 없음',
    })),
  ];

  // 서비스 옵션 목록
  const serviceOptions = [
    { value: '', label: '선택하세요' },
    { value: 'web', label: '웹사이트' },
    { value: 'app', label: '모바일앱' },
    { value: 'design', label: '디자인' },
    { value: 'marketing', label: '마케팅' },
    { value: 'maintenance', label: '유지보수' },
  ];

  // 사업부 옵션 목록
  const departmentOptions = [
    { value: '', label: '선택하세요' },
    { value: 'dev1', label: '개발1팀' },
    { value: 'dev2', label: '개발2팀' },
    { value: 'design', label: '디자인팀' },
    { value: 'marketing', label: '마케팅팀' },
    { value: 'planning', label: '기획팀' },
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
      handleChange('customer', customer);
      // SFA 선택값 초기화
      handleChange('sfa', '');
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
            value={projectInfo.service || ''}
            onChange={(e) => handleChange('service', e.target.value)}
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
            value={projectInfo.department || ''}
            onChange={(e) => handleChange('department', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {departmentOptions.map((option) => (
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
            value={projectInfo.department || ''}
            onChange={(e) => handleChange('department', e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {departmentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProjectBaseForm;
