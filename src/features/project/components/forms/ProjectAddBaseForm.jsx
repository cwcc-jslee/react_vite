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
} from '../../../../shared/components/ui';

// 프로젝트 정보 입력 폼 컴포넌트
const ProjectAddBaseForm = ({
  // formData,
  codebooks,
  updateField,
  handleTemplateSelect,
  onTemplateSelect,
  handleFormSubmit,
}) => {
  const dispatch = useDispatch();

  // Redux 상태 가져오기
  const {
    data: formData = {},
    errors = {},
    isSubmitting = false,
  } = useSelector((state) => state.project.form);

  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  // const [selectedTemplateId, setSelectedTemplateId] = useState(null);

  // API 데이터 조회
  const {
    data: sfaData,
    isLoading: isSfaLoading,
    refetch: refetchSfa,
  } = useSelectData(apiCommon.getSfasByCustomer, selectedCustomerId);

  const { data: taskTempleteData, isLoading: isTaskTempleteLoading } =
    useSelectData(projectApiService.getTaskTemplate);

  // 템플릿 상세 정보 조회
  // const {
  //   data: templateDetailData,
  //   isLoading: isTemplateDetailLoading,
  //   refetch: refetchTemplateDetail,
  // } = useSelectData(projectApiService.getTaskTemplate, selectedTemplateId);

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

  return (
    <div>
      {/* 고객사 입력 필드 */}
      <Group direction="horizontal" className="gap-6">
        <FormItem className="flex-1">
          <Label required className="text-left">
            고객사
          </Label>
          <CustomerSearchInput
            // value={selectedCustomerId}
            onSelect={(e) => setSelectedCustomerId(e.id)}
            size="small"
          />
        </FormItem>

        {/* SFA 선택 필드 */}
        <FormItem className="flex-1">
          <Label required className="text-left">
            SFA
          </Label>
          <Select
            name="sfa"
            value={formData.sfa || ''}
            onChange={updateField}
            // disabled={isSfaLoading || !selectedCustomerId}
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

        {/* 프로젝트명 입력 필드 */}
        <FormItem className="flex-1">
          <Label required className="text-left">
            프로젝트명
          </Label>
          <Input
            name="name"
            value={formData.name || ''}
            onChange={updateField}
            // disabled={isSubmitting}
          />
        </FormItem>
        <FormItem className="flex-1">
          <Label required className="text-left">
            사업년도
          </Label>
          <Select
            name="fy"
            value={formData.fy}
            onChange={updateField}
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
      </Group>

      <Group direction="horizontal" className="gap-6">
        {/* 중요도, 프로젝트 상태 */}
        <FormItem className="flex-1">
          <Label className="text-left">상태</Label>
          <Select
            name="pjtStatus"
            value={formData.pjtStatus}
            onChange={updateField}
            // disabled={isSubmitting}
          >
            {codebooks?.pjt_status?.data?.map((item) => (
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
            value={formData.importanceLevel}
            onChange={updateField}
            // disabled={isSubmitting}
          >
            {codebooks?.importance_level?.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </FormItem>

        {/* 서비스 선택 필드 */}
        <FormItem className="flex-1">
          <Label required className="text-left">
            서비스
          </Label>
          <Select
            name="service"
            value={formData.service || ''}
            onChange={updateField}
          >
            {serviceOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormItem>

        {/* 사업부 선택 필드 */}
        <FormItem className="flex-1">
          <Label required className="text-left">
            사업부
          </Label>
          <Select
            name="team"
            value={formData.team || ''}
            onChange={updateField}
          >
            {teamOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </FormItem>
      </Group>
      {/* 계획 시작일 / 계획 종료일 */}
      <Group direction="horizontal" className="gap-6">
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
          <Label className="text-left">비고</Label>
          <Input
            name="remark"
            value={formData.remark || ''}
            onChange={updateField}
            // disabled={isSubmitting}
          />
        </FormItem>

        {/* 템플릿 선택 필드 */}
        <FormItem className="flex-1">
          <Label className="text-left">템플릿</Label>
          <Select onChange={(e) => handleTemplateSelect(e.target.value)}>
            {templeteOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {isTaskTempleteLoading && option.value === ''
                  ? '로딩 중...'
                  : option.label}
              </option>
            ))}
          </Select>
          {/* {isTemplateDetailLoading && selectedTemplateId && (
                    <p className="text-xs text-indigo-600 mt-1">
                    템플릿 작업 로딩 중...
                    </p>
                    )} */}
        </FormItem>
      </Group>
      {/* Submit Button */}
      <Group direction="horizontal" className="gap-6">
        <Button type="submit" disabled={isSubmitting} className="w-full">
          취소
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting}
          className="w-full"
          onClick={(e) => {
            // 버튼 클릭 시에도 이벤트 전파 방지
            e.preventDefault();
            handleFormSubmit(e);
          }}
        >
          {isSubmitting ? '처리중...' : '저장'}
        </Button>
      </Group>
    </div>
  );
};

export default ProjectAddBaseForm;
