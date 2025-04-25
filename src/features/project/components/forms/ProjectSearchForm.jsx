// src/features/project/components/forms/ProjectSearchForm.jsx
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { setFilters } from '../../../../store/slices/pageStateSlice';
import { CustomerSearchInput } from '@shared/components/customer/CustomerSearchInput';
import { useCodebook } from '@shared/hooks/useCodebook';
import { useTeam } from '@shared/hooks/useTeam';
import useProjectStore from '../../hooks/useProjectStore';
// import { useProjectItem } from '../../../../../shared/hooks/useProjectItem';
import {
  Form,
  FormItem,
  Group,
  Label,
  Input,
  Select,
  Button,
  Stack,
} from '@shared/components/ui/index';

const ProjectSearchForm = () => {
  // const dispatch = useDispatch();
  const {
    data: codebooks,
    isLoading,
    error,
  } = useCodebook(['fy', 'pjtStatus']);
  const { data: teams, isLoading: teamLoading } = useTeam();
  const { handleFilterChange, refreshProjects } = useProjectStore();

  const INIT_FORM_DATA = {
    name: '',
    customer: '',
    team: '',
    pjtStatus: '',
    dateRange: {
      startDate: null,
      endDate: null,
    },
  };

  const [searchFormData, setSearchFormData] = useState({
    ...INIT_FORM_DATA,
  });

  // 입력 필드 변경 처리
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'startDate' || name === 'endDate') {
      setSearchFormData((prev) => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          [name]: value,
        },
      }));
    } else {
      setSearchFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  useEffect(() => {
    console.log(`### searchFormData `, searchFormData);
  }, [searchFormData]);

  /**
   * 고객사 선택 핸들러
   * @param {Object} customer - 선택된 고객사 정보
   */
  const handleCustomerSelect = (customer) => {
    setSearchFormData((prev) => ({
      ...prev,
      customer: customer.id,
    }));
  };

  // 검색 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();

    // 검색 필터 객체 구성
    const filters = {};

    // 건명 필터 추가
    if (searchFormData.name) {
      filters.name = { $contains: searchFormData.name };
    }

    // 고객사 필터 추가
    if (searchFormData.customer) {
      filters.customer = { id: { $eq: searchFormData.customer } };
    }

    // 사업부 필터 추가
    if (searchFormData.team) {
      filters.team = { id: { $eq: searchFormData.team } };
    }

    // FY 필터 추가
    if (searchFormData.fy) {
      filters.fy = { $eq: searchFormData.fy };
    }

    // 프로젝트 상태태 필터 추가
    if (searchFormData.pjtStatus) {
      filters.pjt_status = { $eq: searchFormData.pjtStatus };
    }

    // 날짜 범위 필터 추가
    if (
      searchFormData.dateRange.startDate &&
      searchFormData.dateRange.endDate
    ) {
      filters.created_at = {
        $gte: searchFormData.dateRange.startDate,
        $lte: searchFormData.dateRange.endDate,
      };
    }
    handleFilterChange(filters);
  };

  // 검색 초기화 핸들러
  const handleReset = () => {
    // 폼 데이터 초기화
    setSearchFormData({
      ...INIT_FORM_DATA,
    });

    // 필터 초기화 및 목록 갱신
    refreshProjects({ filters: {} });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Stack 컴포넌트를 사용하여 3개의 항목을 한 줄에 표시 */}
        <Stack direction="horizontal" spacing="lg">
          <FormItem>
            <Label>FY</Label>
            <Select
              name="fy"
              value={searchFormData.fy}
              onChange={handleInputChange}
            >
              <option value="">선택하세요</option>
              {codebooks.fy?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
          <FormItem>
            <Label>프로젝트상태</Label>
            <Select
              name="pjtStatus"
              value={searchFormData.fy}
              onChange={handleInputChange}
            >
              <option value="">선택하세요</option>
              {codebooks.pjtStatus?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
          <FormItem>
            <Label>기준일자</Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                name="startDate"
                value={searchFormData.dateRange.startDate}
                onChange={handleInputChange}
              />
              <span className="text-gray-500">~</span>
              <Input
                type="date"
                name="endDate"
                value={searchFormData.dateRange.endDate}
                onChange={handleInputChange}
              />
            </div>
          </FormItem>
        </Stack>

        {/* 두 번째 줄도 Stack으로 변경 */}
        <Stack direction="horizontal" spacing="lg">
          <FormItem>
            <Label>건명</Label>
            <Input
              type="text"
              name="name"
              value={searchFormData.name}
              onChange={handleInputChange}
              placeholder="건명 입력"
            />
          </FormItem>
          <FormItem>
            <Label>사업부</Label>
            <Select
              name="team"
              value={searchFormData.team}
              onChange={handleInputChange}
            >
              <option value="">선택하세요</option>
              {teams?.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
          <FormItem>
            <Label>서비스</Label>
            <Select
              name="billingType"
              value={searchFormData.billingType}
              onChange={handleInputChange}
            >
              <option value="">선택하세요</option>
              {/* {codebooks.rePaymentMethod?.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))} */}
            </Select>
          </FormItem>
        </Stack>

        {/* 세 번째 줄도 Stack으로 변경 */}
        <Stack direction="horizontal" spacing="lg"></Stack>

        <Group direction="horizontal" className="justify-center">
          <Button type="button" variant="primary" onClick={handleSubmit}>
            검색
          </Button>
          <Button type="button" variant="outline" onClick={handleReset}>
            초기화
          </Button>
        </Group>
      </Form>
    </div>
  );
};

export default ProjectSearchForm;
