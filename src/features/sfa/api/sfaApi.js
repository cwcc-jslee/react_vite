// src/features/sfa/api/sfaApi.js
import { apiClient } from '../../../shared/api/apiClient';
import qs from 'qs';
import dayjs from 'dayjs';
import {
  buildSfaListQuery,
  buildSfaDetailQuery,
  buildSfaStatsQuery,
} from './queries';

export const sfaApi = {
  /**
   * SFA 목록 조회
   * @param {Object} params - 조회 파라미터
   * @returns {Promise} API 응답
   */
  getSfaList: async (params) => {
    try {
      const defaultDateRange = {
        startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
        endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
      };

      const queryParams = {
        pagination: params.pagination,
        filters: params.filters,
        dateRange: params.dateRange || defaultDateRange,
        probability: params.probability,
      };

      const query = buildSfaListQuery(queryParams);
      const response = await apiClient.get(`/sfa-by-payments?${query}`);

      return {
        data: response.data.data,
        meta: response.data.meta,
      };
    } catch (error) {
      console.error('Failed to fetch SFA list:', error);
      throw new Error('Failed to fetch SFA list');
    }
  },

  /**
   * SFA 상세 조회
   * @param {string|number} id - SFA ID
   * @returns {Promise} API 응답
   */
  getSfaDetail: async (id) => {
    try {
      const query = buildSfaDetailQuery(id);
      console.log(`getSfaDetail query : ${query}`);
      const response = await apiClient.get(`/sfas?${query}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch SFA detail:', error);
      throw new Error('Failed to fetch SFA detail');
    }
  },

  /**
   * SFA 월별 통계 조회
   * @param {string} startDate - 시작일
   * @param {string} endDate - 종료일
   * @returns {Promise} API 응답
   */
  getSfaMonthStats: async (startDate, endDate) => {
    try {
      // 날짜 범위 계산
      // const date = dayjs().year(year).month(month);
      // const startDate = date.startOf('month').format('YYYY-MM-DD');
      // const endDate = date.endOf('month').format('YYYY-MM-DD');

      console.log('>>>Fetching data for:', { startDate, endDate });

      // API 호출
      const response = await apiClient.get(
        '/sfa-monthly-sales-stats/forecast',
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

  /**
   * 월간 매출 통계 조회 (신규 API)
   * @param {number} year - 조회 년도
   * @param {number} month - 조회 월 (1-12)
   * @param {Object} options - 옵션 { groupBy, confirmStatus, teamIds }
   * @returns {Promise} 월간 통계 데이터
   */
  getMonthlyStats: async (year, month, options = {}) => {
    try {
      const { groupBy = 'team', confirmStatus = 'confirmed', teamIds } = options;

      const params = {
        year,
        month,
        groupBy,
        confirmStatus,
      };

      if (teamIds) {
        params.teamIds = teamIds;
      }

      console.log('>>>Fetching monthly stats:', params);

      const response = await apiClient.get('/sfa-api/monthly-stats', { params });

      if (!response.data || !response.data.data) {
        console.log('No monthly stats data returned from API');
        return null;
      }

      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch monthly stats for ${year}-${month}:`, error);
      throw new Error(`Failed to fetch monthly stats: ${error.message}`);
    }
  },

  /**
   * 년간 매출 통계 조회 (신규 API)
   * @param {number} year - 조회 년도
   * @param {Object} options - 옵션 { groupBy, confirmStatus, includeMonthly, teamIds }
   * @returns {Promise} 년간 통계 데이터
   */
  getYearlyStats: async (year, options = {}) => {
    try {
      const {
        groupBy = 'team',
        confirmStatus = 'confirmed',
        includeMonthly = true,
        teamIds,
      } = options;

      const params = {
        year,
        groupBy,
        confirmStatus,
        includeMonthly,
      };

      if (teamIds) {
        params.teamIds = teamIds;
      }

      console.log('>>>Fetching yearly stats:', params);

      const response = await apiClient.get('/sfa-api/yearly-stats', { params });

      if (!response.data || !response.data.data) {
        console.log('No yearly stats data returned from API');
        return null;
      }

      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch yearly stats for ${year}:`, error);
      throw new Error(`Failed to fetch yearly stats: ${error.message}`);
    }
  },

  /**
   * 팀별 년간 통계 조회 (매출 분석용) - DEPRECATED
   * @deprecated getYearlyStats 사용 권장
   * @param {number} year - 조회 년도
   * @returns {Promise} 팀별 매출 데이터
   */
  getTeamYearlyStats: async (year) => {
    try {
      const currentMonth = dayjs().format('YYYY-MM');
      const startDate = dayjs(`${year}-01-01`).format('YYYY-MM-DD');
      const endDate = dayjs(`${year}-12-31`).format('YYYY-MM-DD');

      console.log('>>>Fetching team yearly stats:', { year, startDate, endDate });

      // SFA 목록 조회 (팀 정보 포함)
      const query = qs.stringify({
        filters: {
          $and: [
            { is_deleted: { $eq: false } },
            { sfa: { is_deleted: { $eq: false } } },
            { sfa: { is_failed: { $eq: false } } },
            {
              recognition_date: {
                $gte: startDate,
                $lte: endDate,
              },
            },
          ],
        },
        fields: [
          'billing_type',
          'is_confirmed',
          'probability',
          'amount',
          'profit_amount',
          'recognition_date',
        ],
        populate: {
          sfa: {
            fields: ['sfa_by_items'],
          },
        },
        pagination: {
          start: 0,
          limit: 10000, // 충분히 큰 값
        },
      }, { encodeValuesOnly: true });

      const response = await apiClient.get(`/sfa-by-payments?${query}`);

      if (!response.data || !response.data.data) {
        console.log('No team data returned from API');
        return [];
      }

      // 팀별로 데이터 집계
      const teamData = {};

      response.data.data.forEach((payment) => {
        const teamName = payment.sfa?.sfa_by_items || '기타';
        const amount = Number(payment.amount) || 0;
        const recognitionDate = payment.recognition_date;
        const isConfirmed = payment.is_confirmed;
        const probability = payment.probability;

        // 팀 데이터 초기화
        if (!teamData[teamName]) {
          teamData[teamName] = {
            confirmedRevenue: 0,
            probableRevenue: 0,
            totalRevenue: 0,
          };
        }

        // 현재 월 이전: confirmed만 합계
        // 현재 월 이후: confirmed + 100%
        const isPastMonth = dayjs(recognitionDate).isBefore(currentMonth, 'month');

        if (isConfirmed) {
          teamData[teamName].confirmedRevenue += amount;
          teamData[teamName].totalRevenue += amount;
        } else if (probability === 100) {
          teamData[teamName].probableRevenue += amount;
          if (!isPastMonth) {
            teamData[teamName].totalRevenue += amount;
          }
        }
      });

      console.log('Processed team data:', teamData);
      return teamData;
    } catch (error) {
      console.error(`Failed to fetch team yearly stats for ${year}:`, error);
      throw new Error(`Failed to fetch team yearly stats: ${error.message}`);
    }
  },

  /**
   * 아이템 목록을 조회합니다
   * @param {string} classificationId - 분류 ID
   */
  fetchItems: async (classificationId) => {
    const query = qs.stringify(
      {
        filters: {
          sfa_classification: { id: { $eq: classificationId } },
        },
        sort: ['sort:asc'],
      },
      { encodeValuesOnly: true },
    );

    return apiClient.get(`/sfa-items?${query}`);
  },

  /**
   * 코드북 데이터를 조회합니다
   * @param {string} type - 코드북 타입
   */
  // fetchCodebook: async (type) => {
  //   const queryObj = {
  //     fields: ['code', 'name', 'sort'],
  //     populate: {
  //       codetype: {
  //         fields: ['type', 'name'],
  //       },
  //     },
  //     filters: {
  //       $and: [{ used: { $eq: true } }, { codetype: { type: { $eq: type } } }],
  //     },
  //     sort: ['sort:asc'],
  //     pagination: { start: 0, limit: 50 },
  //   };

  //   const query = qs.stringify(queryObj, { encodeValuesOnly: true });
  //   return apiClient.get(`/api/codebooks?${query}`);
  // },
};
