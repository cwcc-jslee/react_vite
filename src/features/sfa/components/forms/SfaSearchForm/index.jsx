// src/features/sfa/components/SfaSearchForm/index.jsx
import React, { useState, useEffect } from 'react';
// import { useSfa } from '../../../context/SfaProvider';
import dayjs from 'dayjs';
import { useSfaSearchFilter } from '../../../hooks/useSfaSearchFilter';
import { useSfaStoreFilter } from '../../../hooks/useSfaStoreFilter';
import { useSfaStore } from '../../../hooks/useSfaStore';
import { CustomerSearchInput } from '../../../../../shared/components/customer/CustomerSearchInput';
import { useCodebook } from '../../../../../shared/hooks/useCodebook';
import { useTeam } from '../../../../../shared/hooks/useTeam';
import { useSfaItem } from '../../../../../shared/hooks/useSfaItem';
import {
  Form,
  FormItem,
  Group,
  Label,
  Input,
  Select,
  Button,
  Stack,
} from '../../../../../shared/components/ui/index';

const SfaSearchForm = () => {
  // const { executeSearch, resetSearch } = useSfa();
  const { updateDetailFilter } = useSfaSearchFilter();

  // 실시간 필터 상태 관리를 위한 Redux 훅
  const { filters, handlers, resetAllFilters, getSearchParams, validation } =
    useSfaStoreFilter();

  // useSfaStore도 추가로 사용 (초기화 목적)
  const { actions } = useSfaStore();

  const {
    data: codebooks,
    isLoading,
    error,
  } = useCodebook([
    'rePaymentMethod',
    'sfaPercentage',
    'sfaSalesType',
    'sfaClassification',
    'fy',
  ]);
  console.log(`>> SFA useCodebook : `, codebooks);

  // Redux 스토어에서 필터 상태를 관리하므로 로컬 상태 제거
  // const [searchFormData, setSearchFormData] = useState(INITFORMDATA);

  const { data: teams, isLoading: teamLoading } = useTeam();
  const { data: items, refetch } = useSfaItem();

  // 컴포넌트 마운트 시 검색 폼 필터 초기화 (1회만 실행)
  // 무한루핑 방지를 위해 주석 처리
  useEffect(() => {
    console.log('SfaSearchForm - 필터 초기화 실행');
    actions.filter.resetFilters();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 매출구분 변경 시 매출품목 자동 업데이트
  useEffect(() => {
    if (filters.sfaClassification && filters.sfaClassification !== '') {
      // 매출구분이 선택된 경우 해당 매출품목 조회
      refetch(filters.sfaClassification);
    } else {
      // sfaClassification이 null, undefined, 또는 빈 문자열일 때 매출품목을 빈 배열로 초기화
      refetch(null);
    }
  }, [filters.sfaClassification]); // refetch dependency 제거

  // 기존 핸들러들을 Redux 스토어 핸들러로 대체
  // Redux 스토어에서 제공하는 핸들러 사용하므로 별도 구현 불필요

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('SfaSearchForm - handleSubmit 실행');
    // useSfaStore Redux 액션으로 직접 데이터 조회 (현재 필터 상태 기반)
    actions.data.fetchSfas();
  };

  const handleReset = () => {
    console.log('SfaSearchForm - handleReset 실행');
    actions.filter.resetFilters(); // useSfaStore Redux 액션으로 필터 초기화
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Stack 컴포넌트를 사용하여 3개의 항목을 한 줄에 표시 */}
        <Stack direction="horizontal" spacing="lg">
          <FormItem>
            <Label>고객사/매출처</Label>
            <CustomerSearchInput
              value={filters.customer}
              onSelect={handlers.handleCustomerSelect}
              // error={errors.customer}
              // disabled={isSubmitting}
              size="small"
            />
          </FormItem>

          <FormItem>
            <Label>건명</Label>
            <Input
              type="text"
              name="name"
              value={filters.name || ''}
              onChange={handlers.handleFieldChange('name')}
              placeholder="건명 입력"
            />
          </FormItem>

          <FormItem>
            <Label>기준일(시작)</Label>
            <Input
              type="date"
              name="startDate"
              value={filters.dateRange?.startDate || ''}
              onChange={handlers.handleDateChange('startDate')}
            />
          </FormItem>
          <FormItem>
            <Label>기준일(종료)</Label>
            <Input
              type="date"
              name="endDate"
              value={filters.dateRange?.endDate || ''}
              onChange={handlers.handleDateChange('endDate')}
            />
          </FormItem>
        </Stack>

        {/* 두 번째 줄도 Stack으로 변경 */}
        <Stack direction="horizontal" spacing="lg">
          <FormItem>
            <Label>매출유형</Label>
            <Select
              name="sfaSalesType"
              value={filters.sfaSalesType || ''}
              onChange={handlers.handleFieldChange('sfaSalesType')}
            >
              <option value="">선택하세요</option>
              {codebooks?.sfaSalesType?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>

          <FormItem>
            <Label>매출구분</Label>
            <Select
              name="sfaClassification"
              value={filters.sfaClassification || ''}
              onChange={(e) => {
                const value = e.target.value;
                // 매출구분 변경 시 매출품목도 함께 초기화
                actions.filter.updateFields({
                  sfaClassification: value || null,
                  salesItem: null, // 매출품목 초기화
                });
              }}
            >
              <option value="">선택하세요</option>
              {codebooks?.sfaClassification?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>

          <FormItem>
            <Label>매출품목</Label>
            <Select
              name="salesItem"
              value={filters.salesItem || ''}
              onChange={handlers.handleFieldChange('salesItem')}
              disabled={
                !filters.sfaClassification ||
                filters.sfaClassification === '' ||
                !items?.data?.length
              }
            >
              <option value="">
                {!filters.sfaClassification || filters.sfaClassification === ''
                  ? '매출구분 선택'
                  : '선택하세요'}
              </option>
              {items?.data?.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>

          <FormItem>
            <Label>프로젝트 여부</Label>
            <Select
              name="isProject"
              value={filters.isProject || ''}
              onChange={handlers.handleFieldChange('isProject')}
            >
              <option value="">선택하세요</option>
              <option value="true">프로젝트</option>
              <option value="false">일반매출</option>
            </Select>
          </FormItem>
        </Stack>

        {/* 세 번째 줄도 Stack으로 변경 */}
        <Stack direction="horizontal" spacing="lg">
          <FormItem>
            <Label>FY</Label>
            <Select
              name="fy"
              value={filters.fy || ''}
              onChange={handlers.handleFieldChange('fy')}
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
            <Label>사업부</Label>
            <Select
              name="team"
              value={filters.team || ''}
              onChange={handlers.handleFieldChange('team')}
            >
              <option value="">선택하세요</option>
              {teams?.data?.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>

          <FormItem>
            <Label>결제유형</Label>
            <Select
              name="billingType"
              value={filters.billingType || ''}
              onChange={handlers.handleFieldChange('billingType')}
            >
              <option value="">선택하세요</option>
              {codebooks.rePaymentMethod?.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
          <FormItem>
            <Label>확률</Label>
            <Select
              name="probability"
              value={filters.probability || ''}
              onChange={handlers.handleFieldChange('probability')}
            >
              <option value="">선택하세요</option>
              <option value="confirmed">확정</option>
              {codebooks.sfaPercentage?.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
        </Stack>

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

export default SfaSearchForm;
