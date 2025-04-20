// src/features/work/api/queries.js
import qs from 'qs';

const combineFilters = (baseFilter, userFilters = {}) => {
  // 필터 객체 기본 구조 생성
  const combinedFilters = {
    $and: [
      // 기본 필터 (항상 포함)
      baseFilter,
    ],
  };

  // 사용자 필터가 있는 경우 $and 배열에 추가
  if (Object.keys(userFilters).length > 0) {
    combinedFilters.$and.push(userFilters);
  }

  return combinedFilters;
};

/**
 * CUSTOMER 목록 조회를 위한 쿼리 파라미터 생성
 */
export const buildWorkListQuery = (params) => {
  const { pagination = { start: 0, limit: 25 }, filters = {} } = params;

  // 기본 필터 정의 (삭제되지 않은 항목만 조회)
  const baseFilter = { is_deleted: { $eq: false } };

  // 필터 결합
  const combinedFilters = combineFilters(baseFilter, filters);

  // 쿼리 구성
  const query = {
    filters: combinedFilters,
    fields: ['*'],
    populate: {
      project_task: {
        fields: ['name'],
        populate: {
          project: {
            fields: ['name'],
          },
        },
      },
      task_progress: {
        fields: ['name'],
      },
      team: {
        fields: ['name'],
      },
      // user: {
      //   fields: ['name'],
      // },
    },
    pagination: {
      start: pagination.current
        ? (pagination.current - 1) * pagination.pageSize
        : pagination.start,
      limit: pagination.pageSize || pagination.limit,
    },
    sort: ['id:desc'],
  };

  return qs.stringify(query, { encodeValuesOnly: true });
};
