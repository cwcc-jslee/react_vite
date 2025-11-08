// src/features/sfa/layouts/SalesInformationLayout.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { salesInformationApi } from '../api/salesInformationApi';
import { useCodebook } from '../../../shared/hooks/useCodebook';
import SalesInformationFilter from '../components/forms/SalesInformationFilter';
import SummaryCard from '../components/cards/SummaryCard';
import TopCustomersChart from '../components/charts/TopCustomersChart';
import SalesInformationTable from '../components/tables/SalesInformationTable';
import { Pagination } from '../../../shared/components/ui/pagination/Pagination';

/**
 * 매출정보 레이아웃 컴포넌트
 */
const SalesInformationLayout = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    totalSfaCount: 0,
    totalPaymentCount: 0,
    confirmedPaymentCount: 0,
    scheduledPaymentCount: 0,
    totalAmount: 0,
    confirmedAmount: 0,
    scheduledAmount: 0,
    newSfaCountLast30Days: 0,
  });
  const [topCustomers, setTopCustomers] = useState([]);
  const [allSalesData, setAllSalesData] = useState([]); // 전체 데이터
  const [salesData, setSalesData] = useState([]); // 필터링/페이지네이션된 데이터
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
  });
  const [topN, setTopN] = useState(10);
  const [filters, setFilters] = useState({
    fiscalYear: 114, // 기본값: 25년 (id: 114)
    keyword: '',
    salesTypeIds: [],
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // FY 코드북 데이터 가져오기 (FY id를 name으로 변환하기 위해)
  const { data: codebooks } = useCodebook(['fy']);
  const fyList = codebooks?.fy || [];

  // FY id를 name으로 변환하는 함수
  const getFyName = useCallback(
    (fyId) => {
      const fy = fyList.find((f) => f.id === fyId);
      return fy ? fy.name : '';
    },
    [fyList],
  );

  // 요약 통계 및 전체 데이터 조회
  const fetchSummary = useCallback(async () => {
    try {
      const data = await salesInformationApi.getSalesInformationSummary(
        filters.fiscalYear,
      );
      setSummary(data.summary);
      setAllSalesData(data.allSalesData);
    } catch (error) {
      console.error('Failed to fetch summary:', error);
    }
  }, [filters.fiscalYear]);

  // 상위 고객사 계산 (클라이언트 사이드)
  const calculateTopCustomers = useCallback(
    (data, n = 10) => {
      // 고객사별 집계
      const customerMap = {};
      data.forEach((sfa) => {
        const customerId = sfa.customer?.id;
        const customerName = sfa.customer?.name || '미분류';
        const amount = sfa.total_price || 0;

        if (!customerMap[customerId]) {
          customerMap[customerId] = {
            customerId,
            customerName,
            totalAmount: 0,
            sfaCount: 0,
          };
        }

        customerMap[customerId].totalAmount += amount;
        customerMap[customerId].sfaCount += 1;
      });

      // 배열로 변환 후 정렬
      const customers = Object.values(customerMap)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, n);

      // 전체 매출액 계산
      const totalAmount = customers.reduce((sum, c) => sum + c.totalAmount, 0);

      // 비율 계산
      return customers.map((customer) => ({
        ...customer,
        percentage:
          totalAmount > 0 ? (customer.totalAmount / totalAmount) * 100 : 0,
      }));
    },
    [],
  );

  // 매출 목록 필터링 및 페이지네이션 (클라이언트 사이드)
  const filterAndPaginateSalesData = useCallback(
    (data) => {
      let filteredData = [...data];

      // 키워드 검색
      if (filters.keyword) {
        filteredData = filteredData.filter(
          (sfa) =>
            sfa.name?.toLowerCase().includes(filters.keyword.toLowerCase()) ||
            sfa.customer?.name?.toLowerCase().includes(filters.keyword.toLowerCase()),
        );
      }

      // 매출유형 필터
      if (filters.salesTypeIds.length > 0) {
        filteredData = filteredData.filter((sfa) =>
          filters.salesTypeIds.includes(sfa.sfa_sales_type?.id),
        );
      }

      // 정렬
      filteredData.sort((a, b) => {
        const aVal = a[filters.sortBy];
        const bVal = b[filters.sortBy];

        if (filters.sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });

      // 페이지네이션
      const total = filteredData.length;
      const start = (pagination.page - 1) * pagination.pageSize;
      const end = start + pagination.pageSize;
      const paginatedData = filteredData.slice(start, end);

      setPagination((prev) => ({ ...prev, total }));
      setSalesData(paginatedData);
    },
    [filters, pagination.page, pagination.pageSize],
  );

  // allSalesData가 변경되면 상위 고객사와 매출 목록 재계산
  useEffect(() => {
    if (allSalesData.length > 0) {
      // 상위 고객사 계산
      const topCustomersData = calculateTopCustomers(allSalesData, topN);
      setTopCustomers(topCustomersData);

      // 매출 목록 필터링 및 페이지네이션
      filterAndPaginateSalesData(allSalesData);
    } else {
      setTopCustomers([]);
      setSalesData([]);
      setPagination((prev) => ({ ...prev, total: 0 }));
    }
  }, [allSalesData, topN, calculateTopCustomers, filterAndPaginateSalesData]);

  // 필터, 페이지, 정렬 변경 시 매출 목록 재계산
  useEffect(() => {
    if (allSalesData.length > 0) {
      filterAndPaginateSalesData(allSalesData);
    }
  }, [
    filters.keyword,
    filters.salesTypeIds,
    filters.sortBy,
    filters.sortOrder,
    pagination.page,
    allSalesData,
    filterAndPaginateSalesData,
  ]);

  // 초기 데이터 로드 및 FY 변경 시 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await fetchSummary();
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [filters.fiscalYear, fetchSummary]);

  // 검색 핸들러
  const handleSearch = (newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // 초기화 핸들러
  const handleReset = (defaultFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...defaultFilters,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Top N 변경 핸들러
  const handleTopNChange = (n) => {
    setTopN(n);
  };

  // 정렬 핸들러
  const handleSort = (field) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  // 금액 포맷팅 (천원 단위)
  const formatAmount = (amount) => {
    return (amount / 1000).toLocaleString('ko-KR');
  };

  return (
    <div className="space-y-6">
      {/* 검색 필터 */}
      <SalesInformationFilter onSearch={handleSearch} onReset={handleReset} />

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <SummaryCard
          title="총 매출건수"
          value={`${summary.totalSfaCount}건`}
          subtitle={`(${getFyName(filters.fiscalYear)})`}
        />
        <SummaryCard
          title="확정결제건수"
          value={`${summary.confirmedPaymentCount}건`}
          subtitle={`(${getFyName(filters.fiscalYear)})`}
        />
        <SummaryCard
          title="예정결제건수"
          value={`${summary.scheduledPaymentCount}건`}
          subtitle={`(${getFyName(filters.fiscalYear)})`}
        />
        <SummaryCard
          title="확정매출액"
          value={`${formatAmount(summary.confirmedAmount)}천원`}
          subtitle={`(${getFyName(filters.fiscalYear)})`}
        />
        <SummaryCard
          title="예정매출액"
          value={`${formatAmount(summary.scheduledAmount)}천원`}
          subtitle={`(${getFyName(filters.fiscalYear)})`}
        />
        <SummaryCard
          title="1달 신규등록"
          value={`${summary.newSfaCountLast30Days}건`}
          subtitle="(최근 30일)"
          highlight
        />
      </div>

      {/* 상위 고객사 차트 */}
      <TopCustomersChart
        data={topCustomers}
        fiscalYear={getFyName(filters.fiscalYear)}
        onTopNChange={handleTopNChange}
      />

      {/* 매출 목록 테이블 */}
      <SalesInformationTable data={salesData} onSort={handleSort} />

      {/* 페이지네이션 */}
      {pagination.total > 0 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={pagination.page}
            totalPages={Math.ceil(pagination.total / pagination.pageSize)}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {/* 로딩 인디케이터 */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-700">데이터를 불러오는 중...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesInformationLayout;
