// src/features/project/api/queries.js
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
export const buildProjectListQuery = (params) => {
  const { pagination = { current: 1, pageSize: 25 }, filters = {} } = params;

  // 기본 필터 정의 (삭제되지 않은 항목만 조회)
  const baseFilter = { is_deleted: { $eq: false } };

  // 필터 결합
  const combinedFilters = combineFilters(baseFilter, filters);

  // 쿼리 구성
  const query = {
    filters: combinedFilters,
    fields: [
      'name',
      'plan_start_date',
      'plan_end_date',
      'start_date',
      'end_date',
      'last_workupdate_date',
      'work_type',
      'is_completed',
      'createdAt',
    ],
    populate: {
      customer: {
        fields: ['name'],
      },
      pjt_status: {
        fields: ['name'],
      },
      fy: {
        fields: ['name'],
      },
      sfa: {
        fields: ['name'],
        populate: {
          customer: {
            fields: ['name'],
          },
        },
      },
      service: {
        fields: ['name'],
      },
      importance_level: {
        fields: ['name'],
      },
    },
    pagination: {
      start: (pagination.current - 1) * pagination.pageSize,
      limit: pagination.pageSize,
    },
    sort: ['id:desc'],
  };

  return qs.stringify(query, { encodeValuesOnly: true });
};

export const buildProjectDetailQuery = (id) => {
  return qs.stringify(
    {
      filters: {
        id: { $eq: id },
      },
      fields: [],
      populate: {
        sfa: {
          fields: ['name'],
          populate: {
            customer: {
              fields: ['name'],
            },
          },
        },
        pjt_status: {
          fields: ['name'],
        },
        team: {
          fields: ['name'],
        },
        service: {
          fields: ['name'],
        },
        fy: {
          fields: ['name'],
        },
        importance_level: {
          fields: ['name'],
        },
        project_completion: {
          fields: [],
        },
        customer: {
          fields: ['name'],
        },
        project_task_buckets: {
          fields: ['name', 'position'],
        },
        project_tasks: {
          filters: {
            is_deleted: {
              $eq: false,
            },
          },
          sort: ['id:asc'],
          fields: ['*'],
          populate: {
            project_task_bucket: {
              fields: ['name', 'position', 'remarks'],
            },
            task_progress: {
              fields: ['name'],
            },
            priority_level: {
              fields: ['name'],
            },
            project_task_checklists: {
              fields: ['*'],
              sort: ['id:asc'],
            },
            users: {
              fields: ['username', 'email'],
              // populate: {
              //   role: {
              //     fields: [],
              //   },
              // },
            },
          },
        },
      },
    },
    {
      encodeValuesOnly: true,
    },
  );
};

export const buildProjectTaskListQuery = (params) => {
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
