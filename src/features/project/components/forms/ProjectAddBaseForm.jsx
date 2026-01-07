// src/features/project/components/forms/ProjectAddBaseForm.jsx
// 프로젝트 정보 입력을 위한 폼 컴포넌트 (XL 사이즈 최적화)

import React, { useState, useMemo } from 'react';
import { apiCommon } from '../../../../shared/api/apiCommon';
import { CustomerSearchInput } from '../../../../shared/components/customer/CustomerSearchInput';
import { useSelectData } from '../../../../shared/hooks/useSelectData';
import { CREATABLE_PROJECT_STATUSES } from '../../constants/projectStatusConstants';
import {
  FormItem,
  Label,
  Input,
  Select,
} from '../../../../shared/components/ui';

// 섹션 헤더 컴포넌트
const SectionTitle = ({ children }) => (
  <h3 className="col-span-12 text-lg font-bold text-indigo-800 mt-4 mb-2 border-b-2 border-indigo-50 pb-2">
    {children}
  </h3>
);

const ProjectAddBaseForm = ({ codebooks, formData, updateField }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // API 데이터 조회
  const { data: sfaData, isLoading: isSfaLoading } = useSelectData(
    apiCommon.getSfasByCustomer,
    selectedCustomerId,
  );
  const { data: teamsData } = useSelectData(apiCommon.getTeams);
  const { data: serviceData } = useSelectData(
    apiCommon.getCodebookItems,
    '서비스',
  );

  // 옵션 데이터 가공
  const sfaOptions = [
    { value: '', label: '선택하세요' },
    ...(sfaData?.data || []).map((sfa) => ({
      value: sfa?.id?.toString() || '',
      label: sfa?.fy?.name
        ? `(${sfa.fy.name})${sfa?.name || '이름 없음'}`
        : sfa?.name || '이름 없음',
    })),
  ];

  const teamOptions = [
    { id: '', name: '선택하세요' },
    ...(teamsData?.data || []).map((team) => ({
      id: team?.id?.toString() || '',
      code: team?.code?.toString() || '',
      name: team?.name || '이름 없음',
    })),
  ];

  const serviceOptions = [
    { id: '', name: '선택하세요' },
    ...(serviceData?.data?.[0]?.structure || []).map((item) => ({
      id: item?.id?.toString() || '',
      name: item?.name || '이름 없음',
    })),
  ];

  const projectTypeOptions = [
    { value: 'revenue', label: '매출' },
    { value: 'investment', label: '투자' },
  ];

  const workTypeOptions = [
    { value: '', label: '선택하세요' },
    { value: 'project', label: '프로젝트' },
    { value: 'task', label: '단순작업' },
    { value: 'maintenance', label: '유지보수' },
  ];

  const creatableStatuses = useMemo(() => {
    if (!codebooks?.pjtStatus) return [];
    return codebooks.pjtStatus.filter((status) =>
      CREATABLE_PROJECT_STATUSES.includes(status.name),
    );
  }, [codebooks?.pjtStatus]);

  return (
    <div className="w-full px-2">
      {/* 12 컬럼 그리드 레이아웃 */}
      <div className="grid grid-cols-12 gap-x-6 gap-y-6">
        {/* ================= 섹션 1: 기본 정의 ================= */}
        <SectionTitle>1. 프로젝트 정의</SectionTitle>

        <div className="col-span-3">
          <FormItem direction="vertical">
            <Label required>매출유형</Label>
            <Select
              name="projectType"
              value={formData.projectType || 'revenue'}
              onChange={(e) => {
                const value = e.target.value;
                updateField('projectType', value);
                if (value === 'investment') updateField('sfa', '');
              }}
            >
              {projectTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        <div className="col-span-3">
          <FormItem direction="vertical">
            <Label required>작업 유형</Label>
            <Select
              name="workType"
              value={formData.workType || ''}
              onChange={(e) => updateField('workType', e.target.value)}
            >
              {workTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        <div className="col-span-3">
          <FormItem direction="vertical">
            <Label required>고객사</Label>
            <CustomerSearchInput
              onSelect={(customer) => {
                setSelectedCustomerId(customer.id);
                updateField('customer', customer);
              }}
              size="small"
            />
          </FormItem>
        </div>

        <div className="col-span-3">
          <FormItem direction="vertical">
            <Label required={formData.projectType === 'revenue'}>
              SFA (매출기회)
            </Label>
            <Select
              name="sfa"
              value={formData.sfa || ''}
              onChange={updateField}
              disabled={formData.projectType === 'investment'}
            >
              {sfaOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {isSfaLoading && opt.value === '' ? '로딩 중...' : opt.label}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        {/* ================= 섹션 2: 프로젝트 상세 ================= */}
        <SectionTitle>2. 프로젝트 상세 정보</SectionTitle>

        {/* 프로젝트명: 6칸 (절반 차지) */}
        <div className="col-span-6">
          <FormItem direction="vertical">
            <Label required>프로젝트명</Label>
            <Input
              name="name"
              value={formData.name || ''}
              onChange={updateField}
              placeholder="예: 이노파이브 프로젝트 관리 시스템 구축"
              className="font-medium"
            />
          </FormItem>
        </div>

        <div className="col-span-2">
          <FormItem direction="vertical">
            <Label required>사업년도</Label>
            <Select
              name="fy"
              value={formData.fy?.id}
              onChange={(e) => {
                const val = e.target.value;
                updateField(
                  'fy',
                  codebooks?.fy?.find((i) => i.id == val),
                );
              }}
            >
              <option value="">선택</option>
              {codebooks?.fy?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        <div className="col-span-2">
          <FormItem direction="vertical">
            <Label required>사업부</Label>
            <Select
              name="team"
              value={formData.team?.id || ''}
              onChange={(e) => {
                const val = e.target.value;
                updateField(
                  'team',
                  teamOptions?.find((i) => i.id == val),
                );
              }}
            >
              {teamOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        <div className="col-span-2">
          <FormItem direction="vertical">
            <Label required>서비스</Label>
            <Select
              name="service"
              value={formData.service?.id || ''}
              onChange={(e) => {
                const val = e.target.value;
                updateField(
                  'service',
                  serviceOptions?.find((i) => i.id == val),
                );
              }}
            >
              {serviceOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        {/* ================= 섹션 3: 일정 및 관리 ================= */}
        <SectionTitle>3. 일정 및 관리</SectionTitle>

        {/* 계획 시작/종료일 제거됨 */}

        <div className="col-span-3">
          <FormItem direction="vertical">
            <Label>상태</Label>
            <Select
              name="pjtStatus"
              value={formData.pjtStatus?.id}
              onChange={(e) => {
                const val = e.target.value;
                updateField(
                  'pjtStatus',
                  creatableStatuses?.find((i) => i.id == val),
                );
              }}
            >
              {creatableStatuses?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        <div className="col-span-3">
          <FormItem direction="vertical">
            <Label>중요도</Label>
            <Select
              name="importanceLevel"
              value={formData.importanceLevel?.id}
              onChange={(e) => {
                const val = e.target.value;
                updateField(
                  'importanceLevel',
                  codebooks?.importanceLevel?.find((i) => i.id == val),
                );
              }}
            >
              {codebooks?.importanceLevel?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        <div className="col-span-6"></div>

        {/* ================= 섹션 4: 기타 설정 ================= */}
        <SectionTitle>4. 기타 설정</SectionTitle>

        <div className="col-span-12">
          <FormItem direction="vertical">
            <Label>비고</Label>
            <Input
              name="remarks"
              value={formData.remarks || ''}
              onChange={updateField}
              placeholder="프로젝트 관련 특이사항이나 메모를 입력하세요."
            />
          </FormItem>
        </div>
      </div>
    </div>
  );
};

export default ProjectAddBaseForm;
