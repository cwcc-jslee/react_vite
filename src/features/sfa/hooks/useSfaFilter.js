// src/features/sfa/hooks/useSfaFilter.js
import { useState, useCallback } from 'react';
import dayjs from 'dayjs';

export const useSfaFilter = () => {
  // 필터 상태 관리
  const [filters, setFilters] = useState({
    // 기본 날짜 필터 (당월)
    dateRange: {
      startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    },
    // 기타 필터
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

  // 단일 필터 업데이트
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // 월별 통계 테이블에서 사용할 필터 업데이트
  const updateMonthlyFilter = useCallback((yearMonth, probability = null) => {
    console.log(`>>> updateMonthlyFilter >>> : ${yearMonth}/${probability}`);
    const date = dayjs(yearMonth);
    setFilters((prev) => ({
      ...prev,
      dateRange: {
        startDate: date.startOf('month').format('YYYY-MM-DD'),
        endDate: date.endOf('month').format('YYYY-MM-DD'),
      },
      probability: probability,
      // 다른 필터 초기화
      name: '',
      customer: '',
      sfaSalesType: '', //매출유형 | 지원사업/일반매출/정기매출...
      sfaClassification: '', //매출구분 | 서비스/상품/공사사
      salesItem: '', //매출아이템 | 홈페이지/홍보영상...
      team: '', //사업부 | 디자인/영상...
      billingType: '', //결제유형 | 일시불/선금/중도금/잔금
      isConfirmed: '',
    }));
  }, []);

  // 상세 검색용 필터 업데이트
  const updateDetailFilter = useCallback((filterData) => {
    setFilters((prev) => ({
      ...prev,
      ...filterData,
    }));
  }, []);

  // 필터 초기화
  const resetFilters = useCallback(() => {
    setFilters({
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
  }, []);

  return {
    filters,
    updateFilter,
    updateMonthlyFilter,
    updateDetailFilter,
    resetFilters,
  };
};
