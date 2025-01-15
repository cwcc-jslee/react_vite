// src/features/sfa/api/sfaApi.js
import { apiClient } from '../../../shared/api/apiClient';
import dayjs from 'dayjs';
import {
  buildSfaListQuery,
  buildSfaDetailQuery,
  buildSfaStatsQuery,
} from './queries';

export const sfaApi = {
  // 리스트 조회
  getSfaList: async ({
    start = 0,
    limit = 20,
    dateRange,
    probability = null,
  }) => {
    try {
      // 날짜 범위가 없으면 현재 월을 기본값으로 사용
      const defaultDateRange = {
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
      };

      const actualDateRange = dateRange || defaultDateRange;
      console.log('Date Range:', actualDateRange);

      // 쿼리 빌드 시 probability 필터 추가
      const query = buildSfaListQuery({
        start,
        limit,
        dateRange: actualDateRange,
        probability,
      });

      const response = await apiClient.get(`/api/sfa-by-payments?${query}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch SFA data:', error);
      throw new Error('Failed to fetch SFA data');
    }
  },

  // 상세 조회
  getSfaDetail: async (id) => {
    try {
      const query = buildSfaDetailQuery(id);
      const response = await apiClient.get(`/api/sfas?${query}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch SFA detail:', error);
      throw new Error('Failed to fetch SFA detail');
    }
  },

  // 단일 월 통계 데이터 조회
  getSfaMonthStats: async (startDate, endDate) => {
    try {
      // 날짜 범위 계산
      // const date = dayjs().year(year).month(month);
      // const startDate = date.startOf('month').format('YYYY-MM-DD');
      // const endDate = date.endOf('month').format('YYYY-MM-DD');

      console.log('>>>Fetching data for:', { startDate, endDate });

      // API 호출
      const response = await apiClient.get(
        '/api/sfa-monthly-sales-stats/forecast',
        {
          params: {
            startDate,
            endDate,
          },
        },
      );

      // 응답 데이터 로깅
      console.log('API Response:', response.data);

      // 응답 데이터 체크
      if (
        !response.data ||
        !response.data.data ||
        !Array.isArray(response.data.data)
      ) {
        console.log('No data returned from API');
        return {};
      }

      // 데이터 변환 - group_name을 키로 사용
      const processedData = response.data.data.reduce((acc, item) => {
        acc[item.group_name] = {
          revenue: Number(item.total_amount) || 0,
          profit: Number(item.total_profit_amount) || 0,
        };
        return acc;
      }, {});

      // 확정 데이터가 없는 경우 빈 객체 추가
      if (!processedData.confirmed) {
        processedData.confirmed = { revenue: 0, profit: 0 };
      }

      console.log(
        `>> ${startDate}/${endDate} >>Processed data:`,
        processedData,
      );
      return processedData;
    } catch (error) {
      console.error(`Failed to fetch SFA stats for ${year}-${month}:`, error);
      throw new Error(`Failed to fetch monthly sales stats: ${error.message}`);
    }
  },
};
