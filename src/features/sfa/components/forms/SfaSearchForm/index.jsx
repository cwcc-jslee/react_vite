// src/features/sfa/components/SfaSearchForm/index.jsx
import React, { useState } from 'react';
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
import { useSfa } from '../../../context/SfaProvider';
import dayjs from 'dayjs';

/**
 * SFA 검색 폼 컴포넌트
 * @component
 * @description 매출 정보 검색을 위한 필터링 폼을 제공합니다.
 * - 날짜 범위, 매출구분, 매출유형, 매출처, 매출품목 등 검색 조건을 설정할 수 있습니다.
 * - 검색 조건은 실시간으로 상태에 저장되며, 검색 버튼 클릭시 실제 검색이 수행됩니다.
 * - 초기화 버튼으로 모든 검색 조건을 기본값으로 되돌릴 수 있습니다.
 */
const SfaSearchForm = () => {
  const { executeSearch, resetSearch } = useSfa();

  const [searchCriteria, setSearchCriteria] = useState({
    dateRange: {
      startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    },
    name: '',
    customer: '',
    sfaSalesType: '',
    sfaClassification: '',
    salesItem: '',
    team: '',
    billingType: '',
    isConfirmed: '',
    probability: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'startDate' || name === 'endDate') {
      setSearchCriteria((prev) => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          [name]: value,
        },
      }));
    } else {
      setSearchCriteria((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSearch(searchCriteria);
  };

  const handleReset = () => {
    setSearchCriteria({
      dateRange: {
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
      },
      name: '',
      customer: '',
      sfaSalesType: '',
      sfaClassification: '',
      item: '',
      team: '',
      billingType: '',
      isConfirmed: '',
      probability: '',
    });
    resetSearch();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Stack 컴포넌트를 사용하여 3개의 항목을 한 줄에 표시 */}
        <Stack direction="horizontal" spacing="lg">
          <FormItem>
            <Label>기준일자</Label>
            <div className="flex items-center gap-2">
              <Input
                type="date"
                name="startDate"
                value={searchCriteria.dateRange.startDate}
                onChange={handleInputChange}
              />
              <span className="text-gray-500">~</span>
              <Input
                type="date"
                name="endDate"
                value={searchCriteria.dateRange.endDate}
                onChange={handleInputChange}
              />
            </div>
          </FormItem>

          <FormItem>
            <Label>매출구분</Label>
            <Select
              name="sfaClassification"
              value={searchCriteria.sfaClassification}
              onChange={handleInputChange}
            >
              <option value="">전체</option>
              <option value="product">제품</option>
              <option value="service">서비스</option>
            </Select>
          </FormItem>

          <FormItem>
            <Label>매출유형</Label>
            <Select
              name="salesCategory"
              value={searchCriteria.salesCategory}
              onChange={handleInputChange}
            >
              <option value="">전체</option>
              <option value="direct">직접</option>
              <option value="partner">파트너</option>
            </Select>
          </FormItem>
        </Stack>

        {/* 두 번째 줄도 Stack으로 변경 */}
        <Stack direction="horizontal" spacing="lg">
          <FormItem>
            <Label>매출처</Label>
            <Input
              type="text"
              name="customer"
              value={searchCriteria.customer}
              onChange={handleInputChange}
              placeholder="매출처명 입력"
            />
          </FormItem>

          <FormItem>
            <Label>매출품목</Label>
            <Input
              type="text"
              name="salesItem"
              value={searchCriteria.salesItem}
              onChange={handleInputChange}
              placeholder="매출품목 입력"
            />
          </FormItem>

          <FormItem>
            <Label>확률</Label>
            <Select
              name="probability"
              value={searchCriteria.probability}
              onChange={handleInputChange}
            >
              <option value="">전체</option>
              <option value="confirmed">확정</option>
              <option value="100">100%</option>
              <option value="90">90%</option>
              <option value="70">70%</option>
              <option value="50">50%</option>
            </Select>
          </FormItem>
        </Stack>

        {/* 세 번째 줄도 Stack으로 변경 */}
        <Stack direction="horizontal" spacing="lg">
          <FormItem>
            <Label>건명</Label>
            <Input
              type="text"
              name="title"
              value={searchCriteria.title}
              onChange={handleInputChange}
              placeholder="건명 입력"
            />
          </FormItem>

          <FormItem>
            <Label>사업부</Label>
            <Select
              name="team"
              value={searchCriteria.team}
              onChange={handleInputChange}
            >
              <option value="">전체</option>
              <option value="solution">솔루션사업부</option>
              <option value="consulting">컨설팅사업부</option>
            </Select>
          </FormItem>

          <FormItem>
            <Label>결제유형</Label>
            <Select
              name="billingType"
              value={searchCriteria.billingType}
              onChange={handleInputChange}
            >
              <option value="">전체</option>
              <option value="card">카드</option>
              <option value="bank">계좌이체</option>
            </Select>
          </FormItem>
        </Stack>

        <Group direction="horizontal" className="justify-center">
          <Button type="submit" variant="primary">
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
