// src/features/project/components/ui/ProjectBaseForm.jsx
// 프로젝트 정보 입력을 위한 폼 컴포넌트
// 고객사, SFA, 프로젝트명, 서비스, 사업부 정보를 입력 받습니다

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Row,
  Col,
} from '../../../../shared/components/ui';

// 프로젝트 정보 입력 폼 컴포넌트
const ProjectAddBaseForm = ({
  codebooks,
  formData,
  updateField,
  isSubmitting,
  // workTypeOptions,
  templeteOptions,
  handleTemplateSelect,
}) => {
  const dispatch = useDispatch();

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

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
    { id: '', name: '선택하세요' },
    ...(teamsData?.data || []).map((team) => ({
      id: team?.id?.toString() || '',
      code: team?.code?.toString() || '',
      name: team?.name || '이름 없음',
    })),
  ];

  // 서비스 옵션 목록 생성 (코드북 아이템 특수 구조 처리)
  const serviceOptions = [
    { id: '', name: '선택하세요' },
    ...(serviceData?.data?.[0]?.structure || []).map((item) => ({
      id: item?.id?.toString() || '',
      name: item?.name || '이름 없음',
    })),
  ];

  // work_type 옵션 목록
  const workTypeOptions = [
    { value: 'project', label: '프로젝트' },
    { value: 'single', label: '단건' },
  ];

  return (
    <Row gutter={16} className="w-full">
      <Col span={24} className="space-y-4">
        {/* 1열: work_type, 고객사, SFA, 프로젝트명 */}
        <Group direction="horizontal" className="gap-6">
          <FormItem className="flex-1">
            <Label required className="text-left">
              작업유형
            </Label>
            <Select
              name="workType"
              value={formData.workType || 'project'}
              onChange={(e) => {
                const value = e.target.value;
                updateField('workType', value);
                // 작업 유형에 따른 템플릿 설정
                if (value === 'single') {
                  updateField('templateId', '3');
                  handleTemplateSelect('3');
                } else if (value === 'project') {
                  updateField('templateId', '2');
                  handleTemplateSelect('2');
                }
              }}
            >
              {workTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormItem>

          <FormItem className="flex-1">
            <Label required className="text-left">
              고객사
            </Label>
            <CustomerSearchInput
              onSelect={(e) => setSelectedCustomerId(e.id)}
              size="small"
            />
          </FormItem>

          <FormItem className="flex-1">
            <Label required className="text-left">
              SFA
            </Label>
            <Select
              name="sfa"
              value={formData.sfa || ''}
              onChange={updateField}
            >
              {sfaOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {isSfaLoading && option.value === ''
                    ? '로딩 중...'
                    : option.label}
                </option>
              ))}
            </Select>
          </FormItem>

          <FormItem className="flex-1">
            <Label required className="text-left">
              프로젝트명
            </Label>
            <Input
              name="name"
              value={formData.name || ''}
              onChange={updateField}
            />
          </FormItem>
        </Group>

        {/* 2열: 상태, 중요도, 서비스, 사업부 */}
        <Group direction="horizontal" className="gap-6">
          <FormItem className="flex-1">
            <Label className="text-left">상태</Label>
            <Select
              name="pjtStatus"
              value={formData.pjtStatus?.id}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedItem = codebooks?.pjtStatus?.find(
                  (item) =>
                    item.id === selectedId || item.id === Number(selectedId),
                );
                updateField('pjtStatus', selectedItem);
              }}
            >
              {codebooks?.pjtStatus?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>

          <FormItem className="flex-1">
            <Label className="text-left">중요도</Label>
            <Select
              name="importanceLevel"
              value={formData.importanceLevel?.id}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedItem = codebooks?.importanceLevel?.find(
                  (item) =>
                    item.id === selectedId || item.id === Number(selectedId),
                );
                updateField('importanceLevel', selectedItem);
              }}
            >
              {codebooks?.importanceLevel?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>

          <FormItem className="flex-1">
            <Label required className="text-left">
              서비스
            </Label>
            <Select
              name="service"
              value={formData.service?.id || ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedItem = serviceOptions?.find(
                  (item) =>
                    item.id === selectedId || item.id === Number(selectedId),
                );
                updateField('service', selectedItem);
              }}
            >
              {serviceOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Select>
          </FormItem>

          <FormItem className="flex-1">
            <Label required className="text-left">
              사업부
            </Label>
            <Select
              name="team"
              value={formData.team?.id || ''}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedItem = teamOptions?.find(
                  (item) =>
                    item.id === selectedId || item.id === Number(selectedId),
                );
                updateField('team', selectedItem);
              }}
            >
              {teamOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Select>
          </FormItem>
        </Group>

        {/* 3열: 사업년도, 계획시작일, 계획종료일 */}
        <Group direction="horizontal" className="gap-6">
          <FormItem className="flex-1">
            <Label required className="text-left">
              사업년도
            </Label>
            <Select
              name="fy"
              value={formData.fy?.id}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedItem = codebooks?.fy?.find(
                  (item) =>
                    item.id === selectedId || item.id === Number(selectedId),
                );
                updateField('fy', selectedItem);
              }}
            >
              <option value="">선택하세요</option>
              {codebooks?.fy?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
          <FormItem className="flex-1">
            <Label required className="text-left">
              계획 시작일
            </Label>
            <Input
              type="date"
              name="planStartDate"
              value={formData?.planStartDate}
              onChange={updateField}
            />
          </FormItem>

          <FormItem className="flex-1">
            <Label required className="text-left">
              계획 종료일
            </Label>
            <Input
              type="date"
              name="planEndDate"
              value={formData?.planEndDate || ''}
              onChange={updateField}
            />
          </FormItem>

          <FormItem className="flex-1">
            <Label className="text-left">템플릿</Label>
            <Select
              name="template"
              value={formData.templateId || ''}
              onChange={(e) => {
                const value = e.target.value;
                updateField('templateId', value);
                handleTemplateSelect(value);
              }}
              disabled={formData.workType === 'single'}
            >
              {templeteOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </FormItem>
        </Group>

        {/* 4열: 비고 */}
        <Group direction="horizontal" className="gap-6">
          <FormItem className="flex-1">
            <Label className="text-left">비고</Label>
            <Input
              name="remark"
              value={formData.remark || ''}
              onChange={updateField}
            />
          </FormItem>
          <FormItem className="flex-1"></FormItem>
          {/* <FormItem className="flex-1"></FormItem> */}
          <FormItem className="flex-2"></FormItem>
        </Group>
      </Col>
    </Row>
  );
};

export default ProjectAddBaseForm;
