// src/features/project/components/ui/ProjectBaseForm.jsx
// 프로젝트 정보 입력을 위한 폼 컴포넌트
// 고객사, SFA, 프로젝트명, 서비스, 사업부 정보를 입력 받습니다

import React, { useState, useEffect } from 'react';
import { apiCommon } from '../../../../shared/api/apiCommon';
import { projectApiService } from '../../services/projectApiService';
import { CustomerSearchInput } from '../../../../shared/components/customer/CustomerSearchInput';
import { useSelectData } from '../../../../shared/hooks/useSelectData';
import {
  Form,
  FormItem,
  Group,
  Stack,
  Label,
  Input,
  Select,
  Button,
  Checkbox,
  TextArea,
} from '../../../../shared/components/ui';

// 프로젝트 정보 입력 폼 컴포넌트
const ProjectAddBaseForm = ({
  formData,
  codebooks,
  updateFormField,
  handleTemplateSelect,
  onTemplateSelect,
}) => {
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

  // 고객사 선택 핸들러
  const handleCustomerSelect = (customer) => {
    if (customer?.id) {
      setSelectedCustomerId(customer.id);
      // handleChange('customer', customer);
      // handleChange('sfa', '');
    }
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-sm h-full">
      <div className="flex flex-col space-y-4">
        {/* 고객사 입력 필드 */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            고객사
          </label>
          <CustomerSearchInput onSelect={handleCustomerSelect} size="small" />
        </div>

        {/* SFA 선택 필드 */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            SFA
          </label>
          <select
            name="sfa"
            value={formData.sfa || ''}
            onChange={updateFormField}
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
        <FormItem direction="vertical" className="flex-1">
          <Label required className="text-left">
            프로젝트명
          </Label>
          <TextArea
            name="name"
            value={formData.name || ''}
            onChange={updateFormField}
            rows={2}
            // disabled={isSubmitting}
          />
        </FormItem>
        <FormItem direction="vertical" className="flex-1">
          <Label required className="text-left">
            사업년도
          </Label>
          <Select
            name="fy"
            value={formData.fy}
            onChange={updateFormField}
            // disabled={isSubmitting}
          >
            <option value="">선택하세요</option>
            {codebooks?.fy?.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </FormItem>

        {/* 중요도, 프로젝트 상태 */}
        <FormItem direction="vertical" className="flex-1">
          <Label required className="text-left">
            상태
          </Label>
          <Select
            name="pjtStatus"
            value={formData.pjtStatus}
            onChange={updateFormField}
            // disabled={isSubmitting}
          >
            <option value="">선택하세요</option>
            {codebooks?.pjt_status?.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </FormItem>
        <FormItem direction="vertical" className="flex-1">
          <Label required className="text-left">
            중요도
          </Label>
          <Select
            name="importanceLevel"
            value={formData.importanceLevel}
            onChange={updateFormField}
            // disabled={isSubmitting}
          >
            <option value="">선택하세요</option>
            {codebooks?.importance_level?.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </FormItem>

        {/* 서비스 선택 필드 */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            서비스
          </label>
          <select
            name="service"
            value={formData.service || ''}
            onChange={updateFormField}
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
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            사업부
          </label>
          <select
            name="team"
            value={formData.team || ''}
            onChange={updateFormField}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            {teamOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* 계획 시작일 / 계획 종료일 */}

        <FormItem direction="vertical" className="flex-1">
          <Label required className="text-left">
            계획 시작일
          </Label>
          <Input
            type="date"
            name="planStartDate"
            value={formData?.planStartDate}
            onChange={updateFormField}
          />
        </FormItem>
        <FormItem direction="vertical" className="flex-1">
          <Label required className="text-left">
            계획 종료일
          </Label>
          <Input
            type="date"
            name="planEndDate"
            value={formData?.planEndDate || ''}
            onChange={updateFormField}
          />
        </FormItem>

        {/* 템플릿 선택 필드 */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            템플릿
          </label>
          <select
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

export default ProjectAddBaseForm;
