// src/features/project/components/forms/ProjectSearchForm.jsx
import React from 'react';
import { CustomerSearchInput } from '@shared/components/customer/CustomerSearchInput';
import { useCodebook } from '@shared/hooks/useCodebook';
import { useTeam } from '@shared/hooks/useTeam';
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
import { useProjectSearch } from '../../hooks/useProjectSearch';

const ProjectSearchForm = () => {
  const {
    data: codebooks,
    isLoading,
    error,
  } = useCodebook(['fy', 'pjtStatus', 'importanceLevel', 'workType']);
  const { data: teams, isLoading: teamLoading } = useTeam();
  const {
    handleSearch,
    handleReset,
    isFetching,
    searchFormData,
    handleInputChange,
    handleCustomerSelect,
  } = useProjectSearch();

  // 검색 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
      <Form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {/* 첫 번째 줄 */}
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
              value={searchFormData.pjtStatus}
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
            <Label>중요도</Label>
            <Select
              name="importanceLevel"
              value={searchFormData.importanceLevel}
              onChange={handleInputChange}
            >
              <option value="">선택하세요</option>
              {codebooks.importanceLevel?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
        </Stack>

        {/* 두 번째 줄 */}
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
            <Label>고객사</Label>
            <CustomerSearchInput onSelect={handleCustomerSelect} size="small" />
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
        </Stack>

        {/* 세 번째 줄 */}
        <Stack direction="horizontal" spacing="lg">
          <FormItem>
            <Label>작업유형</Label>
            <Select
              name="workType"
              value={searchFormData.workType}
              onChange={handleInputChange}
            >
              <option value="">선택하세요</option>
              {codebooks.workType?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
          <FormItem>
            <Label>진행률</Label>
            <Select
              name="projectProgress"
              value={searchFormData.projectProgress}
              onChange={handleInputChange}
            >
              <option value="">선택하세요</option>
              <option value="0">0%</option>
              <option value="25">25%</option>
              <option value="50">50%</option>
              <option value="75">75%</option>
              <option value="100">100%</option>
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
                disabled={true}
              />
              <span className="text-gray-500">~</span>
              <Input
                type="date"
                name="endDate"
                value={searchFormData.dateRange.endDate}
                onChange={handleInputChange}
                disabled={true}
              />
            </div>
          </FormItem>
        </Stack>

        <Group direction="horizontal" className="justify-center">
          <Button
            type="button"
            variant="primary"
            disabled={isFetching}
            onClick={handleSubmit}
          >
            {isFetching ? '검색 중...' : '검색'}
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
