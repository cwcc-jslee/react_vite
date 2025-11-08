// src/features/sfa/api/salesInformationApi.js
import { apiClient } from '../../../shared/api/apiClient';
import {
  buildSalesInformationQuery,
  buildSalesInformationSummaryQuery,
  buildRecentSalesQuery,
  buildTopCustomersQuery,
} from './queries';
import qs from 'qs';

export const salesInformationApi = {
  /**
   * 매출정보 페이지 데이터 조회
   * @param {Object} params - { fiscalYear, keyword, divisionIds, itemIds, typeIds, sortBy, sortOrder, page, pageSize }
   * @returns {Promise} 매출정보 목록 및 통계
   */
  getSalesInformation: async (params) => {
    try {
      const {
        fiscalYear = 114, // 기본값: 25년 (id: 114)
        keyword = '',
        divisionIds = [],
        itemIds = [],
        typeIds = [],
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        pageSize = 20,
      } = params;

      // 필터 조건 구성
      const filters = {
        $and: [{ is_deleted: { $eq: false } }, { is_failed: { $eq: false } }],
      };

      // FY 필터 (fiscalYear가 있을 때만 추가)
      if (fiscalYear) {
        filters.$and.push({
          fy: { id: { $eq: fiscalYear } },
        });
      }

      // 키워드 검색 (고객명 또는 매출건명)
      if (keyword) {
        filters.$and.push({
          $or: [
            { project_name: { $containsi: keyword } },
            { customer: { name: { $containsi: keyword } } },
          ],
        });
      }

      // 사업부 필터
      if (divisionIds.length > 0) {
        filters.$and.push({
          division: { id: { $in: divisionIds } },
        });
      }

      // 매출품목 필터
      if (itemIds.length > 0) {
        filters.$and.push({
          sfa_item: { id: { $in: itemIds } },
        });
      }

      // 매출유형 필터
      if (typeIds.length > 0) {
        filters.$and.push({
          sfa_type: { id: { $in: typeIds } },
        });
      }

      const query = qs.stringify(
        {
          filters,
          fields: ['project_name', 'total_amount', 'created_at'],
          populate: {
            customer: { fields: ['name'] },
            division: { fields: ['name'] },
            sfa_item: { fields: ['name'] },
            sfa_type: { fields: ['name'] },
            sfa_by_payments: {
              fields: [
                'payment_date',
                'expected_date',
                'amount',
                'payment_method',
                'note',
              ],
            },
          },
          sort: [`${sortBy}:${sortOrder}`],
          pagination: {
            page,
            pageSize,
          },
        },
        { encodeValuesOnly: true },
      );

      const response = await apiClient.get(`/sfas?${query}`);

      return {
        data: response.data.data,
        meta: response.data.meta,
      };
    } catch (error) {
      console.error('Failed to fetch sales information:', error);
      throw new Error('Failed to fetch sales information');
    }
  },

  /**
   * 매출정보 요약 통계 조회 (전체 데이터 포함)
   * @param {string} fiscalYear - FY24, FY25, FY26
   * @returns {Promise} 요약 통계 및 전체 매출 데이터
   */
  getSalesInformationSummary: async (fiscalYear = 114) => {
    try {
      // 총 매출건수, 총 매출액 - FY 필터 구성
      const totalFilters = [
        { is_deleted: { $eq: false } },
        { is_failed: { $eq: false } },
      ];

      // FY가 있을 때만 필터 추가
      if (fiscalYear) {
        totalFilters.push({
          fy: { id: { $eq: fiscalYear } },
        });
      }

      const totalQuery = qs.stringify(
        {
          filters: {
            $and: totalFilters,
          },
          fields: ['name', 'total_price', 'sfa_by_items', 'createdAt'],
          populate: {
            customer: { fields: ['name'] },
            sfa_classification: { fields: ['name'] },
            sfa_sales_type: { fields: ['name'] },
            sfa_by_payments: {
              fields: ['is_confirmed', 'probability', 'amount', 'team_allocations'],
              filters: {
                $or: [
                  { is_confirmed: { $eq: true } }, // 확정매출
                  {
                    $and: [
                      { is_confirmed: { $eq: false } },
                      { probability: { $eq: 100 } }, // 예정매출
                    ],
                  },
                ],
              },
            },
          },
          pagination: {
            start: 0,
            limit: 10000,
          },
        },
        { encodeValuesOnly: true },
      );

      const totalResponse = await apiClient.get(`/sfas?${totalQuery}`);

      const sfaData = totalResponse.data.data;
      const totalSfaCount = sfaData.length;

      // 확정결제건수, 예정결제건수, 확정매출액, 예정매출액 계산
      let confirmedPaymentCount = 0;
      let scheduledPaymentCount = 0;
      let confirmedAmount = 0;
      let scheduledAmount = 0;

      sfaData.forEach((sfa) => {
        if (sfa.sfa_by_payments) {
          sfa.sfa_by_payments.forEach((payment) => {
            // 확정매출: is_confirmed가 true
            if (payment.is_confirmed === true) {
              confirmedPaymentCount++;
              confirmedAmount += payment.amount || 0;
            }
            // 예정매출: is_confirmed가 false이고 probability가 100
            else if (payment.is_confirmed === false && payment.probability === 100) {
              scheduledPaymentCount++;
              scheduledAmount += payment.amount || 0;
            }
          });
        }
      });

      const totalPaymentCount = confirmedPaymentCount + scheduledPaymentCount;
      const totalAmount = confirmedAmount + scheduledAmount;

      return {
        summary: {
          totalSfaCount,
          totalPaymentCount,
          confirmedPaymentCount, // 확정결제건수
          scheduledPaymentCount, // 예정결제건수
          totalAmount,
          confirmedAmount, // 확정매출액
          scheduledAmount, // 예정매출액
          newSfaCountLast30Days: 0, // 기능 비활성화 - 항상 0 반환
        },
        allSalesData: sfaData, // 전체 매출 데이터 반환
      };
    } catch (error) {
      console.error('Failed to fetch sales information summary:', error);
      throw new Error('Failed to fetch sales information summary');
    }
  },

  /**
   * 상위 N개 고객사별 매출액 조회
   * @param {string} fiscalYear - FY24, FY25, FY26
   * @param {number} topN - 상위 N개 (기본값: 10)
   * @returns {Promise} 상위 고객사 목록
   */
  getTopCustomersBySales: async (fiscalYear = 114, topN = 10) => {
    try {
      // FY 필터 구성
      const filters = [
        { is_deleted: { $eq: false } },
        { is_failed: { $eq: false } },
      ];

      // FY가 있을 때만 필터 추가
      if (fiscalYear) {
        filters.push({
          fy: { id: { $eq: fiscalYear } },
        });
      }

      const query = qs.stringify(
        {
          filters: {
            $and: filters,
          },
          fields: ['total_amount'],
          populate: {
            customer: { fields: ['name'] },
          },
          pagination: {
            start: 0,
            limit: 10000,
          },
        },
        { encodeValuesOnly: true },
      );

      const response = await apiClient.get(`/sfas?${query}`);
      const sfaData = response.data.data;

      // 고객사별 집계
      const customerMap = {};
      sfaData.forEach((sfa) => {
        const customerId = sfa.customer?.id;
        const customerName = sfa.customer?.name || '미분류';
        const amount = sfa.total_amount || 0;

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
        .slice(0, topN);

      // 전체 매출액 계산
      const totalAmount = customers.reduce((sum, c) => sum + c.totalAmount, 0);

      // 비율 계산
      return customers.map((customer) => ({
        ...customer,
        percentage:
          totalAmount > 0 ? (customer.totalAmount / totalAmount) * 100 : 0,
      }));
    } catch (error) {
      console.error('Failed to fetch top customers by sales:', error);
      throw new Error('Failed to fetch top customers by sales');
    }
  },
};
