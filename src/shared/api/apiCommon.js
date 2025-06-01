// src/shared/api/apiCommon.js
import { apiClient } from './apiClient';
import qs from 'qs';

export const apiCommon = {
  /**
   * 코드북 데이터를 조회합니다
   * @param {string} type - 코드북 타입
   */
  getCodebook: async (type) => {
    const queryObj = {
      fields: ['code', 'name', 'sort'],
      populate: {
        codetype: {
          fields: ['type', 'name'],
        },
      },
      filters: {
        $and: [{ used: { $eq: true } }, { codetype: { type: { $eq: type } } }],
      },
      sort: ['sort:asc'],
      pagination: { start: 0, limit: 50 },
    };

    const query = qs.stringify(queryObj, { encodeValuesOnly: true });
    return apiClient.get(`/codebooks?${query}`);
  },

  /**
   * 매출품목 목록을 조회하는 함수 --> 변경예정 getCodebookItems
   * @param {number} classificationId - 매출구분 ID
   * @returns {Promise} 매출품목 데이터 배열
   */
  getSfaItems: async (classificationId) => {
    const query = qs.stringify(
      {
        filters: {
          sfa_classification: {
            id: {
              $eq: classificationId,
            },
          },
        },
        sort: ['sort:asc'],
      },
      {
        encodeValuesOnly: true,
      },
    );

    const response = await apiClient.get(`/sfa-items?${query}`);
    return response.data;
  },

  /**
   * 매출품목 목록을 조회하는 함수 --> 변경예정 getCodebookItems
   * @param {number} classificationId - 매출구분 ID
   * @returns {Promise} 매출품목 데이터 배열
   */
  getCodebookItems: async (itemtype) => {
    const query = qs.stringify(
      {
        filters: {
          name: {
            $eq: itemtype,
          },
        },
        sort: ['sort:asc'],
      },
      {
        encodeValuesOnly: true,
      },
    );

    const response = await apiClient.get(`/codebook-items?${query}`);
    return response.data;
  },

  /**
   * 고객사별 SFA 목록을 조회하는 함수
   * @param {number} customerId - 고객사 ID
   * @returns {Promise} SFA 데이터 배열
   */
  getSfasByCustomer: async (customerId) => {
    const query = qs.stringify(
      {
        filters: {
          customer: {
            id: {
              $eq: customerId,
            },
          },
          is_project: {
            $eq: true,
          },
        },
        fields: ['name'],
        populate: {
          fy: {
            fields: ['code', 'name'],
          },
        },
        sort: ['id:asc'],
      },
      {
        encodeValuesOnly: true,
      },
    );

    const response = await apiClient.get(`/sfas?${query}`);
    return response.data;
  },

  /**
   * 팀 목록을 조회하는 함수
   * @returns {Promise} 팀 데이터 배열
   */
  getTeams: async () => {
    const query = qs.stringify(
      {
        filters: {
          is_deleted: {
            $eq: false,
          },
        },
        sort: ['sort:asc'],
      },
      {
        encodeValuesOnly: true,
      },
    );

    const response = await apiClient.get(`/teams?${query}`);
    return response.data;
  },

  /**
   * 프로텍트 테스트 템플릿릿 조회하는 함수
   * @param {string} type - 서비스 이름(ex.홈페이지, 영상상)
   * @returns {Promise} 프로젝트 테스크 데이터 배열
   */
  getTaskTemplete: async (type) => {
    const query = qs.stringify(
      {
        filters: {
          name: {
            $eq: type,
          },
        },
        sort: ['sort:asc'],
      },
      {
        encodeValuesOnly: true,
      },
    );

    const response = await apiClient.get(`/codebook-project-tasks?${query}`);
    return response.data;
  },

  /**
   * 등록된 사용자 전체 조회회 함수
   * @param {string} type - 서비스 이름(ex.홈페이지, 영상상)
   * @returns {Promise} 프로젝트 테스크 데이터 배열
   */
  getUsers: async () => {
    const query = qs.stringify(
      {
        filters: {
          $and: [
            {
              blocked: {
                $eq: false,
              },
            },
            {
              confirmed: {
                $eq: true,
              },
            },
          ],
        },
        sort: ['username:asc'],
      },
      {
        encodeValuesOnly: true,
      },
    );

    const response = await apiClient.get(`/users?${query}`);
    return response.data;
  },
};
