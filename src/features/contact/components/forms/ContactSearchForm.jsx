// src/features/contact/components/ContactSearchForm/index.jsx
import React, { useState, useEffect } from 'react';
import dayjs from 'dayjs';
// import { useContactSearchFilter } from '../../../hooks/useContactSearchFilter';
import { CustomerSearchInput } from '../../../../shared/components/customer/CustomerSearchInput';
// import { useCodebook } from '../../../../../shared/hooks/useCodebook';
// import { useContactItem } from '../../../../../shared/hooks/useContactItem';
import {
  Form,
  FormItem,
  Group,
  Label,
  Input,
  Select,
  Button,
  Stack,
} from '../../../../shared/components/ui/index';

const ContactSearchForm = () => {
  // const { executeSearch, resetSearch } = useContact();
  // const { updateDetailFilter } = useContactSearchFilter();

  // const {
  //   data: codebook,
  //   isLoading,
  //   error,
  // } = useCodebook([
  //   're_payment_method',
  //   'sfa_percentage',
  //   'sfa_sales_type',
  //   'sfa_classification',
  // ]);

  const INITFORMDATA = {
    name: '',
    customer: '',
    sfaSalesType: '',
    sfaClassification: '',
    salesItem: '',
    team: '',
    billingType: '',
    probability: '',
  };

  const [searchFormData, setSearchFormData] = useState({
    ...INITFORMDATA,
  });

  const handleInputChange = (e) => {
    console.log(`>> handleInputChange : `, e.target.value);
    const { name, value } = e.target;
    if (name === 'sfaClassification') {
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
    updateDetailFilter(searchFormData);
  };

  const handleReset = () => {
    setSearchFormData({
      dateRange: {
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
      },
      ...INITFORMDATA,
    });
    // resetSearch();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
      <Form onSubmit={handleSubmit} className="space-y-4">
        {/* Stack 컴포넌트를 사용하여 3개의 항목을 한 줄에 표시 */}
        <Stack direction="horizontal" spacing="lg">
          <FormItem>
            <Label>이름</Label>
            <Input
              type="text"
              name="name"
              value={searchFormData.name}
              onChange={handleInputChange}
              placeholder="건명 입력"
            />
          </FormItem>

          <FormItem>
            <Label>회사명</Label>
            <CustomerSearchInput
              value={searchFormData.customer}
              onSelect={handleCustomerSelect}
              // error={errors.customer}
              // disabled={isSubmitting}
              size="small"
            />
          </FormItem>

          <FormItem>
            <Label>유형</Label>
            <Select
              name="contactType"
              // value={searchFormData.contactType}
              // onChange={handleInputChange}
            >
              <option value="">선택하세요</option>
              {/* {codebook?.contact_type?.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))} */}
            </Select>
          </FormItem>
        </Stack>

        {/* 두 번째 줄도 Stack으로 변경 */}
        <Stack direction="horizontal" spacing="lg">
          <FormItem>
            <Label>메모</Label>
            <CustomerSearchInput
              // value={searchFormData.customer}
              // onSelect={handleCustomerSelect}
              // error={errors.customer}
              // disabled={isSubmitting}
              size="small"
            />
          </FormItem>

          <FormItem>
            <Label>Tag</Label>
            {/* <Select
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
            </Select> */}
          </FormItem>

          <FormItem>
            <Label></Label>
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

export default ContactSearchForm;
