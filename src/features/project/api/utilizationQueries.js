// src/features/project/api/utilizationQueries.js
import qs from 'qs';

/**
 * 투입률 조회를 위한 쿼리 파라미터 생성
 * Work 테이블 기반으로 특정 기간의 작업 데이터 조회
 */
export const buildUtilizationQuery = (params) => {
  const {
    startDate,
    endDate,
    teamId = null,
    userId = null,
    pagination = { start: 0, limit: 1000 }, // 투입률은 전체 데이터 필요
  } = params;

  // 기본 필터: 삭제되지 않은 항목 + 기간 필터
  const baseFilters = {
    is_deleted: { $eq: false },
  };

  // 날짜 범위 필터 추가
  if (startDate && endDate) {
    baseFilters.work_date = {
      $gte: startDate,
      $lte: endDate,
    };
  }

  // 팀 필터 추가
  if (teamId) {
    baseFilters.team = { id: { $eq: teamId } };
  }

  // 사용자 필터 추가
  if (userId) {
    baseFilters.user = { id: { $eq: userId } };
  }

  // 최종 쿼리 구성
  const query = {
    filters: baseFilters,
    fields: ['*'],
    populate: {
      user: {
        fields: ['username', 'email'],
        populate: {
          team: {
            fields: ['name', 'code'],
          },
        },
      },
      team: {
        fields: ['name', 'code'],
      },
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
    },
    pagination: {
      start: pagination.start,
      limit: pagination.limit,
    },
    // sort: ['work_date:asc', 'user:asc'],
    sort: ['work_date:asc'],
  };

  return qs.stringify(query, { encodeValuesOnly: true });
};

/**
 * 사용자 목록 조회 쿼리 (팀 정보 포함)
 */
export const buildUsersQuery = (params = {}) => {
  const { teamId = null, blocked = false, includeNonTrackedTeams = false } = params;

  const filters = {
    blocked: { $eq: blocked },
  };

  if (teamId) {
    filters.team = { id: { $eq: teamId } };
  }

  // work tracking 팀만 조회 (includeNonTrackedTeams가 false인 경우)
  if (!includeNonTrackedTeams) {
    filters.team = {
      ...(filters.team || {}),
      is_work_tracked: { $eq: true },
    };
  }

  const query = {
    filters,
    // fields: ['username', 'email', 'status', 'join_date', 'leave_date'],
    fields: ['*'],
    populate: {
      team: {
        fields: ['id', 'name', 'code', 'is_work_tracked'],
      },
    },
    pagination: {
      start: 0,
      limit: 1000,
    },
    sort: ['username:asc'],
  };

  return qs.stringify(query, { encodeValuesOnly: true });
};

/**
 * 팀 목록 조회 쿼리
 */
export const buildTeamsQuery = (params = {}) => {
  const { includeNonTrackedTeams = false } = params;

  const filters = {};

  // work tracking 팀만 조회 (includeNonTrackedTeams가 false인 경우)
  if (!includeNonTrackedTeams) {
    filters.is_work_tracked = { $eq: true };
  }

  const query = {
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    fields: ['id', 'name', 'code', 'is_work_tracked'],
    pagination: {
      start: 0,
      limit: 100,
    },
    sort: ['name:asc'],
  };

  return qs.stringify(query, { encodeValuesOnly: true });
};

/**
 * 사용자 팀 이력 조회 쿼리
 * 특정 기간 내 팀 변경 이력 조회
 */
export const buildUserTeamHistoriesQuery = (params = {}) => {
  const { userId = null, teamId = null, startDate = null, endDate = null } = params;

  const filters = {};

  // 사용자 필터
  if (userId) {
    filters.user = { id: { $eq: userId } };
  }

  // 팀 필터
  if (teamId) {
    filters.team = { id: { $eq: teamId } };
  }

  // 기간 필터: 해당 기간과 겹치는 이력
  if (startDate && endDate) {
    filters.$and = [
      {
        start_date: { $lte: endDate }, // 시작일이 조회 종료일 이전
      },
      {
        $or: [
          { end_date: { $gte: startDate } }, // 종료일이 조회 시작일 이후
          { end_date: { $null: true } }, // 또는 현재 소속 (end_date가 null)
        ],
      },
    ];
  }

  const query = {
    filters: Object.keys(filters).length > 0 ? filters : undefined,
    fields: ['start_date', 'end_date'],
    populate: {
      user: {
        fields: ['id', 'username', 'email'],
      },
      team: {
        fields: ['id', 'name', 'code', 'is_work_tracked'],
      },
    },
    pagination: {
      start: 0,
      limit: 1000,
    },
    sort: ['start_date:asc'],
  };

  return qs.stringify(query, { encodeValuesOnly: true });
};
