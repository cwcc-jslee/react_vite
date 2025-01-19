// src/features/sfa/components/SfaSearchForm/index.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { useSfa } from '../../../context/SfaContext';
import dayjs from 'dayjs';

const SearchFormContainer = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
`;

const FormItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Label = styled.label`
  min-width: 100px;
  font-size: 13px;
  color: #374151;
`;

const Input = styled.input`
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 13px;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb;
  }
`;

const Select = styled.select`
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 13px;
  background: white;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &.search {
    background: #2563eb;
    color: white;
    border: none;

    &:hover {
      background: #1d4ed8;
    }
  }

  &.reset {
    background: white;
    color: #374151;
    border: 1px solid #e5e7eb;

    &:hover {
      background: #f9fafb;
    }
  }
`;

const SfaSearchForm = () => {
  const { executeSearch, resetSearch } = useSfa();

  const [searchCriteria, setSearchCriteria] = useState({
    dateRange: {
      startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    },
    salesType: '',
    probability: '',
    confirmed: '',
    customer: '',
    salesItem: '',
    salesCategory: '',
    title: '',
    team: '',
    paymentType: '',
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
      salesType: '',
      probability: '',
      confirmed: '',
      customer: '',
      salesItem: '',
      salesCategory: '',
      title: '',
      team: '',
      paymentType: '',
    });
    resetSearch();
  };

  return (
    <SearchFormContainer>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <FormItem>
            <Label>기준일자</Label>
            <Input
              type="date"
              name="startDate"
              value={searchCriteria.dateRange.startDate}
              onChange={handleInputChange}
            />
            <span>~</span>
            <Input
              type="date"
              name="endDate"
              value={searchCriteria.dateRange.endDate}
              onChange={handleInputChange}
            />
          </FormItem>
          <FormItem>
            <Label>매출구분</Label>
            <Select
              name="salesType"
              value={searchCriteria.salesType}
              onChange={handleInputChange}
            >
              <option value="">전체</option>
              <option value="product">제품</option>
              <option value="service">서비스</option>
            </Select>
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
        </FormGroup>

        <FormGroup>
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
        </FormGroup>

        <FormGroup>
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
            <Label>결제구분</Label>
            <Select
              name="paymentType"
              value={searchCriteria.paymentType}
              onChange={handleInputChange}
            >
              <option value="">전체</option>
              <option value="card">카드</option>
              <option value="bank">계좌이체</option>
            </Select>
          </FormItem>
        </FormGroup>

        <ButtonContainer>
          <Button type="submit" className="search">
            검색
          </Button>
          <Button type="button" className="reset" onClick={handleReset}>
            초기화
          </Button>
        </ButtonContainer>
      </form>
    </SearchFormContainer>
  );
};

export default SfaSearchForm;
