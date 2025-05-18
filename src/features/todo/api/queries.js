// src/features/project/api/queries.js
import qs from 'qs';
import {
  ensureBaseFilter,
  normalizeFilters,
} from '@shared/utils/queryFilterUtils';

export const buildProjectTaskListQuery = (params) => {
  const { pagination = { start: 0, limit: 25 }, filters = {} } = params;

  // 1. 기본 필터 확인
  const filteredData = ensureBaseFilter(filters);

  // 2. 필터 정규화 (중첩된 $and 평탄화)
  // strapi 에서 중복 and 지원하여 제거 가능
  const normalizedFilters = normalizeFilters(filteredData);

  // 쿼리 구성
  const query = {
    filters: normalizedFilters,
    fields: ['*'],
    populate: {
      project: {
        fields: ['name', 'work_type'],
        populate: {
          sfa: {
            fields: ['name'],
            populate: {
              customer: {
                fields: ['name'],
              },
            },
          },
        },
      },
      project_task_bucket: {
        fields: ['name'],
      },
      task_progress: {
        fields: ['name'],
      },
      priority_level: {
        fields: ['name', 'code'],
      },
      project_task_checklists: {
        fields: ['*'],
        sort: ['id:asc'],
      },
      users: {
        fields: ['username', 'email'],
      },
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

/**
 * Work 목록 조회를 위한 쿼리 파라미터 생성
 */
export const buildWorkListQuery = (params) => {
  const { pagination = { start: 0, limit: 25 }, filters = {} } = params;

  // 1. 기본 필터 확인
  const filteredData = ensureBaseFilter(filters);

  // 2. 필터 정규화 (중첩된 $and 평탄화)
  // strapi 에서 중복 and 지원하여 제거 가능
  const normalizedFilters = normalizeFilters(filteredData);

  // 기본 필터 정의 (삭제되지 않은 항목만 조회)
  const baseFilter = { is_deleted: { $eq: false } };

  // 쿼리 구성
  const query = {
    filters: normalizedFilters,
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
      user: {
        fields: ['username', 'email'],
      },
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
