// src/features/project/services/teamWeeklyUtilizationService.js
/**
 * 팀 중심 주간 실적 API 서비스
 */

import { apiService } from '@shared/api/apiService';
import { handleApiError } from '@shared/api/errorHandlers';
import { normalizeResponse } from '@shared/api/normalize';
import { convertKeysToCamelCase } from '@shared/utils/transformUtils';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import qs from 'qs';

dayjs.extend(isoWeek);
dayjs.extend(weekOfYear);

/**
 * ISO 주차 계산 (YYYY-WNN 형식)
 */
const getISOWeek = (date) => {
  const d = dayjs(date);
  const year = d.isoWeekYear();
  const week = d.isoWeek();
  return `${year}-W${String(week).padStart(2, '0')}`;
};

/**
 * ISO 주차에서 시작일/종료일 계산
 */
const getWeekRange = (isoWeek) => {
  const [year, week] = isoWeek.split('-W').map(Number);

  // 해당 년도의 1월 4일을 기준으로 함 (ISO 8601 규칙)
  // ISO 주의 첫 번째 주는 1월 4일을 포함하는 주
  const jan4 = dayjs(`${year}-01-04`);

  // 1월 4일이 속한 주의 월요일을 찾음
  const dayOfWeek = jan4.day(); // 0(일요일) ~ 6(토요일)
  const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 월요일로부터 며칠 떨어져 있는지
  const firstMonday = jan4.subtract(daysFromMonday, 'day');

  // 원하는 주차의 월요일 계산
  const start = firstMonday.add(week - 1, 'week');
  const end = start.add(6, 'day');

  return {
    startDate: start.format('YYYY-MM-DD'),
    endDate: end.format('YYYY-MM-DD'),
    label: `${start.format('MM/DD')} ~ ${end.format('MM/DD')}`,
  };
};

/**
 * 근무일수 계산 (주말 제외)
 */
const calculateWorkingDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  let workingDays = 0;

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workingDays++;
    }
  }

  return workingDays;
};

/**
 * 증감률 계산
 */
const calculateChangeRate = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

/**
 * 트렌드 방향 결정
 */
const getTrend = (current, previous) => {
  if (previous === 0 && current > 0) return 'new';
  if (previous > 0 && current === 0) return 'end';

  const changeRate = calculateChangeRate(current, previous);
  if (changeRate > 10) return 'up';
  if (changeRate < -10) return 'down';
  return 'stable';
};

/**
 * Work 데이터를 프로젝트별로 그룹화
 */
const groupWorksByProject = (works) => {
  const projectMap = {};

  works.forEach((work) => {
    const projectId = work.projectTask?.project?.id;
    if (!projectId) return;

    const project = work.projectTask.project;

    if (!projectMap[projectId]) {
      projectMap[projectId] = {
        projectId,
        projectName: project.name,
        totalHours: 0,
        users: new Set(),
        works: [],
      };
    }

    const workHours = parseFloat(work.workHours || 0);
    const nonBillableHours = parseFloat(work.nonBillableHours || 0);
    const overtimeHours = parseFloat(work.overtimeHours || 0);
    const totalHours = workHours + nonBillableHours + overtimeHours;

    projectMap[projectId].totalHours += totalHours;
    projectMap[projectId].users.add(work.user?.id);
    projectMap[projectId].works.push(work);
  });

  return Object.values(projectMap).map((project) => ({
    ...project,
    totalHours: Math.round(project.totalHours * 10) / 10,
    userCount: project.users.size,
    users: Array.from(project.users),
  }));
};

/**
 * Task 진행률 계산
 */
const calculateTaskProgress = async (projectId) => {
  try {
    const query = `filters[project][id][$eq]=${projectId}&populate=*`;
    const response = await apiService.get(`/project-tasks?${query}`);
    const normalized = normalizeResponse(response);
    const tasks = convertKeysToCamelCase(normalized.data || []);

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed' || t.status === 'done').length;

    return {
      completed,
      total,
      rate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  } catch (error) {
    console.warn('Task 진행률 조회 실패:', projectId, error);
    return { completed: 0, total: 0, rate: 0 };
  }
};

/**
 * Work 완료율 계산
 */
const calculateWorkProgress = (works) => {
  const total = works.length;
  const completed = works.filter((w) => w.status === 'completed' || w.status === 'done').length;

  return {
    completed,
    total,
    rate: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
};

/**
 * 팀별 주간 실적 데이터 조회
 */
export const teamWeeklyUtilizationService = {
  /**
   * 특정 주의 팀별 실적 조회
   */
  getTeamWeeklyData: async (params) => {
    try {
      const { week, teamId } = params;

      console.log('=== 팀별 주간 실적 API 호출 ===');
      console.log('주차:', week);
      console.log('팀 ID:', teamId);

      // 주차 범위 계산
      const { startDate, endDate, label } = getWeekRange(week);
      const previousWeek = getISOWeek(dayjs(startDate).subtract(1, 'week'));
      const previousWeekRange = getWeekRange(previousWeek);

      console.log('금주 기간:', startDate, '~', endDate);
      console.log('전주 기간:', previousWeekRange.startDate, '~', previousWeekRange.endDate);

      // 1. 금주 Work 데이터 조회
      const thisWeekQueryObj = {
        filters: {
          work_date: {
            $gte: startDate,
            $lte: endDate,
          },
          is_deleted: {
            $eq: false,
          },
        },
        populate: {
          project_task: {
            fields: ['name'],
            populate: {
              project: {
                fields: ['name'],
              },
            },
          },
          team: {
            fields: ['name'],
          },
          user: {
            fields: ['username', 'email'],
            populate: {
              team: {
                fields: ['name'],
              },
            },
          },
        },
        pagination: {
          start: 0,
          limit: 1000,
        },
      };

      if (teamId) {
        thisWeekQueryObj.filters.team = { id: { $eq: teamId } };
      }

      const thisWeekQuery = qs.stringify(thisWeekQueryObj, { encodeValuesOnly: true });
      const thisWeekResponse = await apiService.get(`/works?${thisWeekQuery}`);
      const thisWeekNormalized = normalizeResponse(thisWeekResponse);
      const thisWeekWorks = convertKeysToCamelCase(thisWeekNormalized.data || []);

      console.log('금주 Work 데이터:', thisWeekWorks.length, '건');

      // 2. 전주 Work 데이터 조회
      const lastWeekQueryObj = {
        filters: {
          work_date: {
            $gte: previousWeekRange.startDate,
            $lte: previousWeekRange.endDate,
          },
          is_deleted: {
            $eq: false,
          },
        },
        populate: {
          project_task: {
            fields: ['name'],
            populate: {
              project: {
                fields: ['name'],
              },
            },
          },
          team: {
            fields: ['name'],
          },
          user: {
            fields: ['username', 'email'],
            populate: {
              team: {
                fields: ['name'],
              },
            },
          },
        },
        pagination: {
          start: 0,
          limit: 1000,
        },
      };

      if (teamId) {
        lastWeekQueryObj.filters.team = { id: { $eq: teamId } };
      }

      const lastWeekQuery = qs.stringify(lastWeekQueryObj, { encodeValuesOnly: true });
      const lastWeekResponse = await apiService.get(`/works?${lastWeekQuery}`);
      const lastWeekNormalized = normalizeResponse(lastWeekResponse);
      const lastWeekWorks = convertKeysToCamelCase(lastWeekNormalized.data || []);

      console.log('전주 Work 데이터:', lastWeekWorks.length, '건');

      // 3. 팀별 데이터 구성
      const teamMap = {};

      // 금주 데이터 처리
      thisWeekWorks.forEach((work) => {
        const team = work.team || work.user?.team;
        if (!team) return;

        const teamId = team.id;
        const teamName = team.name;

        if (!teamMap[teamId]) {
          teamMap[teamId] = {
            teamId,
            teamName,
            totalMembers: 0,
            availableMembers: 0,
            thisWeek: {
              totalHours: 0,
              users: new Set(),
              projects: {},
            },
            lastWeek: {
              totalHours: 0,
              users: new Set(),
              projects: {},
            },
          };
        }

        const workHours = parseFloat(work.workHours || 0);
        const nonBillableHours = parseFloat(work.nonBillableHours || 0);
        const overtimeHours = parseFloat(work.overtimeHours || 0);
        const totalHours = workHours + nonBillableHours + overtimeHours;

        teamMap[teamId].thisWeek.totalHours += totalHours;
        teamMap[teamId].thisWeek.users.add(work.user?.id);

        // 프로젝트별 그룹화
        const projectId = work.projectTask?.project?.id;
        if (projectId) {
          if (!teamMap[teamId].thisWeek.projects[projectId]) {
            teamMap[teamId].thisWeek.projects[projectId] = {
              projectId,
              projectName: work.projectTask.project.name,
              hours: 0,
              users: new Set(),
              works: [],
            };
          }
          teamMap[teamId].thisWeek.projects[projectId].hours += totalHours;
          teamMap[teamId].thisWeek.projects[projectId].users.add(work.user?.id);
          teamMap[teamId].thisWeek.projects[projectId].works.push(work);
        }
      });

      // 전주 데이터 처리
      lastWeekWorks.forEach((work) => {
        const team = work.team || work.user?.team;
        if (!team) return;

        const teamId = team.id;

        if (!teamMap[teamId]) {
          teamMap[teamId] = {
            teamId,
            teamName: team.name,
            totalMembers: 0,
            availableMembers: 0,
            thisWeek: {
              totalHours: 0,
              users: new Set(),
              projects: {},
            },
            lastWeek: {
              totalHours: 0,
              users: new Set(),
              projects: {},
            },
          };
        }

        const workHours = parseFloat(work.workHours || 0);
        const nonBillableHours = parseFloat(work.nonBillableHours || 0);
        const overtimeHours = parseFloat(work.overtimeHours || 0);
        const totalHours = workHours + nonBillableHours + overtimeHours;

        teamMap[teamId].lastWeek.totalHours += totalHours;
        teamMap[teamId].lastWeek.users.add(work.user?.id);

        // 프로젝트별 그룹화
        const projectId = work.projectTask?.project?.id;
        if (projectId) {
          if (!teamMap[teamId].lastWeek.projects[projectId]) {
            teamMap[teamId].lastWeek.projects[projectId] = {
              projectId,
              projectName: work.projectTask.project.name,
              hours: 0,
              users: new Set(),
              works: [],
            };
          }
          teamMap[teamId].lastWeek.projects[projectId].hours += totalHours;
          teamMap[teamId].lastWeek.projects[projectId].users.add(work.user?.id);
        }
      });

      // 4. 팀 정보 조회 (총 인원 수)
      for (const teamId in teamMap) {
        try {
          const userQuery = `filters[team][id][$eq]=${teamId}&filters[blocked][$eq]=false`;
          const userResponse = await apiService.get(`/users?${userQuery}`);
          const users = userResponse.data || [];
          teamMap[teamId].totalMembers = users.length;
          teamMap[teamId].availableMembers = users.length;
        } catch (error) {
          console.warn('팀 인원 조회 실패:', teamId, error);
        }
      }

      // 5. 프로젝트별 상세 데이터 구성 (Task/Work 진행률 포함)
      const teams = await Promise.all(
        Object.values(teamMap).map(async (team) => {
          const thisWeekProjects = Object.values(team.thisWeek.projects);
          const lastWeekProjects = team.lastWeek.projects;

          const projects = await Promise.all(
            thisWeekProjects.map(async (project) => {
              const lastWeekProject = lastWeekProjects[project.projectId];
              const lastWeekHours = lastWeekProject?.hours || 0;
              const lastWeekUserCount = lastWeekProject?.users.size || 0;

              const taskProgress = await calculateTaskProgress(project.projectId);
              const workProgress = calculateWorkProgress(project.works);

              return {
                projectId: project.projectId,
                projectName: project.projectName,
                hours: {
                  lastWeek: Math.round(lastWeekHours * 10) / 10,
                  thisWeek: Math.round(project.hours * 10) / 10,
                  change: Math.round((project.hours - lastWeekHours) * 10) / 10,
                  changeRate: calculateChangeRate(project.hours, lastWeekHours),
                  trend: getTrend(project.hours, lastWeekHours),
                },
                users: {
                  lastWeek: lastWeekUserCount,
                  thisWeek: project.users.size,
                  change: project.users.size - lastWeekUserCount,
                },
                averageHoursPerUser: project.users.size > 0
                  ? Math.round((project.hours / project.users.size) * 10) / 10
                  : 0,
                taskProgress,
                workProgress,
                status: taskProgress.rate >= 60 ? 'normal' : taskProgress.rate >= 30 ? 'warning' : 'critical',
              };
            })
          );

          // 전주에만 있고 금주에 없는 프로젝트 추가 (종료된 프로젝트)
          const endedProjects = Object.values(lastWeekProjects)
            .filter((lastProject) => !team.thisWeek.projects[lastProject.projectId])
            .map((lastProject) => ({
              projectId: lastProject.projectId,
              projectName: lastProject.projectName,
              hours: {
                lastWeek: Math.round(lastProject.hours * 10) / 10,
                thisWeek: 0,
                change: Math.round(-lastProject.hours * 10) / 10,
                changeRate: -100,
                trend: 'end',
              },
              users: {
                lastWeek: lastProject.users.size,
                thisWeek: 0,
                change: -lastProject.users.size,
              },
              averageHoursPerUser: 0,
              taskProgress: { completed: 0, total: 0, rate: 0 },
              workProgress: { completed: 0, total: 0, rate: 0 },
              status: 'normal',
            }));

          const allProjects = [...projects, ...endedProjects];

          const thisWeekHours = Math.round(team.thisWeek.totalHours * 10) / 10;
          const lastWeekHours = Math.round(team.lastWeek.totalHours * 10) / 10;

          return {
            teamId: team.teamId,
            teamName: team.teamName,
            totalMembers: team.totalMembers,
            availableMembers: team.availableMembers,
            weeklyStats: {
              projectCount: thisWeekProjects.length,
              hours: {
                lastWeek: lastWeekHours,
                thisWeek: thisWeekHours,
                change: Math.round((thisWeekHours - lastWeekHours) * 10) / 10,
                changeRate: calculateChangeRate(thisWeekHours, lastWeekHours),
              },
              activeUsers: team.thisWeek.users.size,
              averageHoursPerUser: team.thisWeek.users.size > 0
                ? Math.round((thisWeekHours / team.thisWeek.users.size) * 10) / 10
                : 0,
              utilizationRate: team.availableMembers > 0
                ? Math.round((thisWeekHours / (team.availableMembers * 40)) * 100)
                : 0,
            },
            projects: allProjects.sort((a, b) => b.hours.thisWeek - a.hours.thisWeek),
          };
        })
      );

      // 6. 전체 요약 계산
      const totalProjects = new Set();
      const totalThisWeekHours = teams.reduce((sum, team) => {
        team.projects.forEach((p) => totalProjects.add(p.projectId));
        return sum + team.weeklyStats.hours.thisWeek;
      }, 0);
      const totalLastWeekHours = teams.reduce((sum, team) => sum + team.weeklyStats.hours.lastWeek, 0);
      const totalUsers = teams.reduce((sum, team) => sum + team.weeklyStats.activeUsers, 0);

      const summary = {
        totalTeams: teams.length,
        totalProjects: totalProjects.size,
        totalHours: {
          lastWeek: Math.round(totalLastWeekHours * 10) / 10,
          thisWeek: Math.round(totalThisWeekHours * 10) / 10,
          change: Math.round((totalThisWeekHours - totalLastWeekHours) * 10) / 10,
          changeRate: calculateChangeRate(totalThisWeekHours, totalLastWeekHours),
        },
        totalUsers,
        averageHoursPerUser: totalUsers > 0
          ? Math.round((totalThisWeekHours / totalUsers) * 10) / 10
          : 0,
      };

      console.log('팀별 주간 실적 계산 완료');
      console.log('총 팀 수:', teams.length);
      console.log('총 프로젝트 수:', totalProjects.size);
      console.log('총 투입시간:', totalThisWeekHours, 'h');

      return {
        week,
        period: {
          start: startDate,
          end: endDate,
          label,
        },
        previousWeek,
        summary,
        teams: teams.sort((a, b) => b.weeklyStats.hours.thisWeek - a.weeklyStats.hours.thisWeek),
      };
    } catch (error) {
      handleApiError(error, '팀별 주간 실적 데이터를 불러오는 중 오류가 발생했습니다.');
      throw error;
    }
  },

  /**
   * 현재 주차 반환
   */
  getCurrentWeek: () => {
    return getISOWeek(dayjs());
  },

  /**
   * 다음 주차 계산
   */
  getNextWeek: (currentWeek) => {
    const { startDate } = getWeekRange(currentWeek);
    return getISOWeek(dayjs(startDate).add(1, 'week'));
  },

  /**
   * 이전 주차 계산
   */
  getPreviousWeek: (currentWeek) => {
    const { startDate } = getWeekRange(currentWeek);
    return getISOWeek(dayjs(startDate).subtract(1, 'week'));
  },
};