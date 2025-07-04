// src/features/sfa/components/SfaSearchForm/index.jsx
import React, { useState, useEffect } from 'react';
// import { useSfa } from '../../../context/SfaProvider';
import dayjs from 'dayjs';
import { useSfaSearchFilter } from '../../../hooks/useSfaSearchFilter';
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

  const INITFORMDATA = {
    name: '',
    customer: '',
    sfaSalesType: '',
    fy: '',
    sfaClassification: '',
    salesItem: '',
    team: '',
    billingType: '',
    probability: '',
    dateRange: {
      startDate: '',
      endDate: '',
    },
  };

  const [searchFormData, setSearchFormData] = useState(INITFORMDATA);

  const { data: teams, isLoading: teamLoading } = useTeam();
  const { data: items, refetch } = useSfaItem();

  useEffect(() => {
    if (searchFormData.sfaClassification) {
      refetch(searchFormData.sfaClassification);
    }
  }, [searchFormData.sfaClassification]);

  const handleInputChange = (e) => {
    console.log(`>> handleInputChange : `, e.target.value);
    const { name, value } = e.target;
    if (name === 'startDate' || name === 'endDate') {
      setSearchFormData((prev) => ({
        ...prev,
        dateRange: {
          ...prev.dateRange,
          [name]: value,
        },
      }));
    } else if (name === 'sfaClassification') {
      setSearchFormData((prev) => ({
        ...prev,
        salesItem: '',
        [name]: value,
      }));
    } else {
      setSearchFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log(`search form : `, searchFormData);
    // executeSearch(searchFormData);
    console.log(`>> handleSubmit : `, searchFormData);
    updateDetailFilter(searchFormData);
  };

  const handleReset = () => {
    setSearchFormData(INITFORMDATA);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Stack 컴포넌트를 사용하여 3개의 항목을 한 줄에 표시 */}
        <Stack direction="horizontal" spacing="lg">
          <FormItem>
            <Label>고객사/매출처</Label>
            <CustomerSearchInput
              value={searchFormData.customer}
              onSelect={handleCustomerSelect}
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
              value={searchFormData.dateRange.startDate}
              onChange={handleInputChange}
            />
          </FormItem>
          <FormItem>
            <Label>기준일(종료)</Label>
            <Input
              type="date"
              name="endDate"
              value={searchFormData.dateRange.endDate}
              onChange={handleInputChange}
            />
          </FormItem>
        </Stack>

        {/* 두 번째 줄도 Stack으로 변경 */}
        <Stack direction="horizontal" spacing="lg">
          <FormItem>
            <Label>매출유형</Label>
            <Select
              name="sfaSalesType"
              value={searchFormData.sfaSalesType}
              onChange={handleInputChange}
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
              value={searchFormData.sfaClassification}
              onChange={handleInputChange}
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
              value={searchFormData.salesItem}
              onChange={handleInputChange}
            >
              <option value="">선택하세요</option>
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
              name="salesItem"
              value={searchFormData.salesItem}
              onChange={handleInputChange}
            >
              {/* <option value="">선택하세요</option>
              {items?.data?.map((item) => (
                <option key={item.id} value={item.name}>
                  {item.name}
                </option>
              ))} */}
            </Select>
          </FormItem>
        </Stack>

        {/* 세 번째 줄도 Stack으로 변경 */}
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
            <Label>사업부</Label>
            <Select
              name="team"
              value={searchFormData.team}
              onChange={handleInputChange}
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
              value={searchFormData.billingType}
              onChange={handleInputChange}
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
              value={searchFormData.probability}
              onChange={handleInputChange}
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
