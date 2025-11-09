// src/features/project/services/teamWeeklyUtilizationService.js
/**
 * 팀 중심 주간 실적 API 서비스
 */

import { apiService } from '@shared/api/apiService';
import { handleApiError } from '@shared/api/errorHandlers';
import { normalizeResponse } from '@shared/api/normalize';
import { convertKeysToCamelCase } from '@shared/utils/transformUtils';
import { calculateProjectProgress } from '../utils/projectProgressUtils';
import { buildTeamWeeklyProgressQuery } from '../api/queries';
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
 * 여러 프로젝트의 진행률을 한 번에 조회 (개선된 방식)
 * @param {Array<number>} projectIds - 프로젝트 ID 배열
 * @returns {Object} - 프로젝트별 진행률 맵 { projectId: { completed, total, rate, projectProgress } }
 */
const fetchProjectsProgress = async (projectIds) => {
  if (!projectIds || projectIds.length === 0) {
    return {};
  }

  try {
    // api/queries.js의 쿼리 빌더 사용
    const query = buildTeamWeeklyProgressQuery(projectIds);

    console.log('📡 /projects API 호출');
    console.log('  - 요청 프로젝트 ID 수:', projectIds.length);
    console.log('  - 요청 프로젝트 IDs:', projectIds);

    const response = await apiService.get(`/projects?${query}`);
    const normalized = normalizeResponse(response);
    const projects = convertKeysToCamelCase(normalized.data || []);

    console.log('  - 응답 프로젝트 수:', projects.length);
    console.log('  - 응답 프로젝트 IDs:', projects.map(p => p.id));
    console.log('  - 응답 프로젝트 목록:', projects.map(p => ({ id: p.id, name: p.name, taskCount: p.projectTasks?.length || 0 })));

    const progressMap = {};
    projects.forEach((project) => {
      const tasks = project.projectTasks || [];
      const total = tasks.length;
      const completed = tasks.filter(
        (t) => t.status === 'completed' || t.status === 'done'
      ).length;
      const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
      const projectProgress = calculateProjectProgress(tasks);

      progressMap[project.id] = {
        completed,
        total,
        rate: completionRate,
        projectProgress,
      };
    });

    return progressMap;
  } catch (error) {
    console.error('프로젝트 진행률 일괄 조회 실패:', error);
    console.error('에러 상세:', error.response?.data || error.message);
    return {};
  }
};

/**
 * Task 진행률 계산 (개별 프로젝트 - deprecated, fetchProjectsProgress 사용 권장)
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
                populate: {
                  customer: {
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
                },
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
                populate: {
                  customer: {
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
                },
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
            const project = work.projectTask.project;
            const customerName = project.sfa?.customer?.name || project.customer?.name || '-';

            teamMap[teamId].thisWeek.projects[projectId] = {
              projectId,
              projectName: project.name,
              customerName,
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
            const project = work.projectTask.project;
            const customerName = project.sfa?.customer?.name || project.customer?.name || '-';

            teamMap[teamId].lastWeek.projects[projectId] = {
              projectId,
              projectName: project.name,
              customerName,
              hours: 0,
              users: new Set(),
              works: [],
            };
          }
          teamMap[teamId].lastWeek.projects[projectId].hours += totalHours;
          teamMap[teamId].lastWeek.projects[projectId].users.add(work.user?.id);
        }
      });

      // 4. 모든 고유 프로젝트 ID 추출 (금주 + 전주)
      const allProjectIds = new Set();
      Object.values(teamMap).forEach((team) => {
        // 금주 프로젝트 ID 추가
        Object.keys(team.thisWeek.projects).forEach((projectId) => {
          allProjectIds.add(Number(projectId));
        });
        // 전주 프로젝트 ID 추가
        Object.keys(team.lastWeek.projects).forEach((projectId) => {
          allProjectIds.add(Number(projectId));
        });
      });

      console.log('===== 프로젝트 진행률 조회 디버깅 =====');
      console.log('추출된 고유 프로젝트 ID 수:', allProjectIds.size);
      console.log('프로젝트 ID 목록:', Array.from(allProjectIds));

      // 5. 프로젝트 진행률 일괄 조회 (1회 API 호출로 최적화)
      const progressMap = await fetchProjectsProgress(Array.from(allProjectIds));
      console.log('API 응답으로 받은 프로젝트 수:', Object.keys(progressMap).length);
      console.log('API 응답 프로젝트 ID 목록:', Object.keys(progressMap));

      // 누락된 프로젝트 확인
      const missingProjectIds = Array.from(allProjectIds).filter(
        id => !progressMap[id]
      );
      if (missingProjectIds.length > 0) {
        console.warn('⚠️ API 응답에서 누락된 프로젝트 ID:', missingProjectIds);
      }
      console.log('=====================================');

      // 6. 팀 정보 조회 (총 인원 수) - 병렬 처리
      const teamIds = Object.keys(teamMap);
      const teamUserPromises = teamIds.map(async (teamId) => {
        try {
          const userQuery = `filters[team][id][$eq]=${teamId}&filters[blocked][$eq]=false`;
          const userResponse = await apiService.get(`/users?${userQuery}`);
          const users = userResponse.data || [];
          return { teamId, userCount: users.length };
        } catch (error) {
          console.warn('팀 인원 조회 실패:', teamId, error);
          return { teamId, userCount: 0 };
        }
      });

      const teamUserResults = await Promise.all(teamUserPromises);
      teamUserResults.forEach(({ teamId, userCount }) => {
        teamMap[teamId].totalMembers = userCount;
        teamMap[teamId].availableMembers = userCount;
      });

      // 7. 프로젝트별 상세 데이터 구성 (Task/Work 진행률 포함)
      const teams = Object.values(teamMap).map((team) => {
        const thisWeekProjects = Object.values(team.thisWeek.projects);
        const lastWeekProjects = team.lastWeek.projects;

        const projects = thisWeekProjects.map((project) => {
          const lastWeekProject = lastWeekProjects[project.projectId];
          const lastWeekHours = lastWeekProject?.hours || 0;
          const lastWeekUserCount = lastWeekProject?.users.size || 0;

          // 일괄 조회한 진행률 맵에서 데이터 가져오기 (프로젝트 진행률용)
          const progressData = progressMap[project.projectId] || {
            completed: 0,
            total: 0,
            rate: 0,
            projectProgress: 0,
          };

          // 금주 기준 works에 등록된 고유 project_task 수 계산 및 상세 정보 수집
          const taskDetailsMap = new Map();
          project.works.forEach((work) => {
            if (work.projectTask?.id) {
              const taskId = work.projectTask.id;
              const taskName = work.projectTask.name || '-';
              const userName = work.user?.username || work.user?.name || '-';
              const workHours = parseFloat(work.workHours || 0);
              const planningHours = parseFloat(work.projectTask.planningTimeData || 0);

              if (!taskDetailsMap.has(taskId)) {
                taskDetailsMap.set(taskId, {
                  taskId,
                  taskName,
                  status: work.projectTask.taskProgress?.code || 'pending',
                  users: new Set(),
                  actualHours: 0,
                  planningHours,
                  progress: 0,
                });
              }

              const taskDetail = taskDetailsMap.get(taskId);
              taskDetail.users.add(userName);
              taskDetail.actualHours += workHours;
            }
          });

          // Task 상세 정보 배열로 변환 및 진행률 계산
          const taskDetails = Array.from(taskDetailsMap.values()).map((task) => ({
            ...task,
            users: Array.from(task.users),
            userCount: task.users.size,
            actualHours: Math.round(task.actualHours * 10) / 10,
            planningHours: Math.round(task.planningHours * 10) / 10,
            progress: task.planningHours > 0
              ? Math.min(100, Math.round((task.actualHours / task.planningHours) * 100))
              : 0,
          }));

          const thisWeekTaskCount = taskDetailsMap.size;

          const workProgress = calculateWorkProgress(project.works);

          return {
            projectId: project.projectId,
            projectName: project.projectName,
            customerName: project.customerName,
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
            taskProgress: {
              completed: progressData.completed,
              total: thisWeekTaskCount, // 금주 works 기준 고유 task 수
              rate: progressData.rate,
            },
            projectProgress: progressData.projectProgress,
            workProgress,
            status: progressData.rate >= 60 ? 'normal' : progressData.rate >= 30 ? 'warning' : 'critical',
            taskDetails, // 금주 작업된 Task 상세 정보
          };
        });

        // 전주에만 있고 금주에 없는 프로젝트 추가 (종료된 프로젝트)
        const endedProjects = Object.values(lastWeekProjects)
          .filter((lastProject) => !team.thisWeek.projects[lastProject.projectId])
          .map((lastProject) => {
            // 종료된 프로젝트도 실제 진행률 데이터 사용
            const progressData = progressMap[lastProject.projectId] || {
              completed: 0,
              total: 0,
              rate: 0,
              projectProgress: 0,
            };

            return {
              projectId: lastProject.projectId,
              projectName: lastProject.projectName,
              customerName: lastProject.customerName,
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
              taskProgress: {
                completed: progressData.completed,
                total: 0, // 금주 works가 없으므로 0
                rate: progressData.rate,
              },
              projectProgress: progressData.projectProgress,
              workProgress: { completed: 0, total: 0, rate: 0 },
              status: progressData.rate >= 60 ? 'normal' : progressData.rate >= 30 ? 'warning' : 'critical',
              taskDetails: [], // 종료된 프로젝트는 금주 Task 없음
            };
          });

        const allProjects = [...projects, ...endedProjects];

        const thisWeekHours = Math.round(team.thisWeek.totalHours * 10) / 10;
        const lastWeekHours = Math.round(team.lastWeek.totalHours * 10) / 10;

        // 전주 프로젝트 수 계산
        const lastWeekProjectCount = Object.keys(lastWeekProjects).length;

        return {
          teamId: team.teamId,
          teamName: team.teamName,
          totalMembers: team.totalMembers,
          availableMembers: team.availableMembers,
          weeklyStats: {
            projectCount: {
              thisWeek: thisWeekProjects.length,
              lastWeek: lastWeekProjectCount,
            },
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
      });

      // 6. 전체 요약 계산
      const thisWeekProjects = new Set();
      const lastWeekProjects = new Set();
      const totalThisWeekHours = teams.reduce((sum, team) => {
        team.projects.forEach((p) => {
          if (p.hours.thisWeek > 0) {
            thisWeekProjects.add(p.projectId);
          }
          if (p.hours.lastWeek > 0) {
            lastWeekProjects.add(p.projectId);
          }
        });
        return sum + team.weeklyStats.hours.thisWeek;
      }, 0);
      const totalLastWeekHours = teams.reduce((sum, team) => sum + team.weeklyStats.hours.lastWeek, 0);
      const totalUsers = teams.reduce((sum, team) => sum + team.weeklyStats.activeUsers, 0);

      const summary = {
        totalTeams: teams.length,
        totalProjects: {
          thisWeek: thisWeekProjects.size,
          lastWeek: lastWeekProjects.size,
        },
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
      console.log('총 프로젝트 수 (금주/전주):', thisWeekProjects.size, '/', lastWeekProjects.size);
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