// src/features/project/components/forms/ProjectSearchForm.jsx
import { CustomerSearchInput } from '@shared/components/customer/CustomerSearchInput';
import { useCodebook } from '@shared/hooks/useCodebook';
import { useTeam } from '@shared/hooks/useTeam';
import {
  Form,
  FormItem,
  Label,
  Input,
  Select,
  Button,
  Stack,
} from '@shared/components/ui/index';
import { useProjectSearch } from '../../hooks/useProjectSearch';
import { X } from 'lucide-react';

const ProjectSearchForm = () => {
  const {
    data: codebooks,
    isLoading,
    error,
  } = useCodebook(['fy', 'pjtStatus', 'importanceLevel', 'service']);
  const { data: teams, isLoading: teamLoading } = useTeam();
  const {
    handleSearch,
    handleReset,
    isFetching,
    searchFormData,
    handleInputChange,
    handleCustomerSelect,
    getActiveFilters,
    removeFilter,
    applyQuickFilter,
  } = useProjectSearch();

  const activeFilters = getActiveFilters();

  // 검색 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
      <Form className="space-y-4" onSubmit={handleSubmit} noValidate>
        {/* 빠른 필터 버튼 */}
        <div className="pb-4 border-b">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-gray-700">
              빠른 필터:
            </span>
            <button
              type="button"
              onClick={() => applyQuickFilter('inProgress')}
              className="px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
            >
              진행중인 프로젝트
            </button>
            <button
              type="button"
              onClick={() => applyQuickFilter('thisMonth')}
              className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
            >
              이번달 시작
            </button>
            <button
              type="button"
              onClick={() => applyQuickFilter('revenue')}
              className="px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
            >
              매출 프로젝트
            </button>
            <button
              type="button"
              onClick={() => applyQuickFilter('investment')}
              className="px-3 py-1.5 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-md hover:bg-orange-100 transition-colors"
            >
              투자 프로젝트
            </button>
          </div>

          {/* 활성 필터 태그 */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs font-medium text-gray-600">
                활성 필터:
              </span>
              {activeFilters.map((filter) => (
                <span
                  key={filter.key}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full"
                >
                  <span className="font-semibold">{filter.label}:</span>
                  <span>{filter.value}</span>
                  <button
                    type="button"
                    onClick={() => removeFilter(filter.key)}
                    className="ml-0.5 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                    title="필터 제거"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-gray-500 hover:text-red-600 underline ml-2"
              >
                전체 초기화
              </button>
            </div>
          )}
        </div>

        {/* 1열: 프로젝트 타입, FY, 종료여부, 프로젝트 상태 */}
        <Stack direction="horizontal" spacing="lg">
          <FormItem>
            <Label>프로젝트 타입</Label>
            <Select
              name="projectType"
              value={searchFormData.projectType}
              onChange={handleInputChange}
            >
              <option value="">선택하세요</option>
              <option value="revenue">매출</option>
              <option value="investment">투자</option>
            </Select>
          </FormItem>
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
            <Label>종료여부</Label>
            <Select
              name="isClosed"
              value={searchFormData.isClosed}
              onChange={handleInputChange}
            >
              <option value="">전체</option>
              <option value="false">진행중</option>
              <option value="true">종료</option>
            </Select>
          </FormItem>
          <FormItem>
            <Label>프로젝트 상태</Label>
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
        </Stack>

        {/* 2열: 고객사, 건명, 기준일(시작), 기준일(종료) */}
        <Stack direction="horizontal" spacing="lg">
          <FormItem>
            <Label>고객사</Label>
            <CustomerSearchInput onSelect={handleCustomerSelect} size="small" />
          </FormItem>
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
            <Label>기준일(시작)</Label>
            <Input
              type="date"
              name="startDate"
              value={searchFormData.startDate || ''}
              onChange={handleInputChange}
            />
          </FormItem>
          <FormItem>
            <Label>기준일(종료)</Label>
            <Input
              type="date"
              name="endDate"
              value={searchFormData.endDate || ''}
              onChange={handleInputChange}
            />
          </FormItem>
        </Stack>

        {/* 3열: 사업부, 서비스, SFA, 중요도 */}
        <Stack direction="horizontal" spacing="lg">
          <FormItem>
            <Label>SFA</Label>
            <Input
              type="text"
              name="sfa"
              value={searchFormData.sfa}
              onChange={handleInputChange}
              placeholder="SFA 건명 입력"
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
              name="service"
              value={searchFormData.service}
              onChange={handleInputChange}
            >
              <option value="">선택하세요</option>
              {codebooks.service?.map((item) => (
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

        {/* 버튼 그룹 - 오른쪽 정렬 */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button type="button" variant="outline" onClick={handleReset}>
            초기화
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={isFetching}
            onClick={handleSubmit}
          >
            {isFetching ? '검색 중...' : '검색'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default ProjectSearchForm;
