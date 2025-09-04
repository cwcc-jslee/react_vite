/**
 * @file useProjectStore.js
 * @description 프로젝트 관련 Redux 상태와 액션을 관리하는 Custom Hook
 *
 * 주요 기능:
 * 1. 프로젝트 목록 조회 및 페이지네이션
 * 2. 프로젝트 상세 정보 관리
 * 3. 폼 상태 및 유효성 검사
 * 4. 대시보드 상태 관리
 *
 * @author [작성자명]
 * @since [버전]
 */

import { useSelector, useDispatch } from 'react-redux';
import {
  setPage,
  setPageSize,
  setFilters,
  resetFilters,
  clearSelectedItem,
  updateFormField,
  resetForm,
  fetchProjects,
  fetchProjectDetail,
  fetchProjectWorks,
  setWorksPage,
  setWorksPageSize,
  fetchProjectDashboardData,
  setChartFilter,
  clearChartFilters,
  clearChartFilter,
  updateChartFilteredItems,
} from '../../../store/slices/projectSlice';
import { changePageMenu, changeSubMenu } from '../../../store/slices/uiSlice';
import { PAGE_MENUS } from '@shared/constants/navigation';
import { updateProjectsWithProgress } from '../utils/projectProgressUtils';

/**
 * 프로젝트 관련 상태와 액션을 관리하는 커스텀 훅
 * 프로젝트 목록, 상세 정보, 폼 상태, 대시보드 등을 통합 관리
 */
export const useProjectStore = () => {
  const dispatch = useDispatch();

  // 상태 선택
  const items = useSelector((state) => state.project.items);
  const pagination = useSelector((state) => state.project.pagination);
  const filters = useSelector((state) => state.project.filters);
  const status = useSelector((state) => state.project.status);
  const error = useSelector((state) => state.project.error);
  const selectedItem = useSelector((state) => state.project.selectedItem);
  const form = useSelector((state) => state.project.form);

  // 대시보드 상태 선택
  const dashboard = useSelector((state) => state.project.dashboard);
  const chartFilters = useSelector((state) => state.project.chartFilters);
  const chartFilteredItems = useSelector((state) => state.project.chartFilteredItems);

  // 필터 매칭 헬퍼 함수들
  const matchesProjectType = (project, selectedType) => {
    const projectType = project.projectType || project.project_type;
    
    console.log('매칭 체크:', {
      projectId: project.id,
      projectType: projectType,
      selectedType: selectedType,
      match: (selectedType === 'revenue' && (projectType === 'revenue' || projectType === '매출')) ||
             (selectedType === 'investment' && (projectType === 'investment' || projectType === '투자'))
    });
    
    // selectedType이 'revenue' 또는 'investment'인 경우
    if (selectedType === 'revenue') {
      return projectType === 'revenue' || projectType === '매출';
    } else if (selectedType === 'investment') {
      return projectType === 'investment' || projectType === '투자';
    }
    
    return false;
  };

  const matchesProjectStatus = (project, selectedStatus) => {
    const statusMap = {
      'pending': 85,     // 보류
      'notStarted': 86,  // 시작전
      'waiting': 87,     // 대기
      'inProgress': 88,  // 진행중
      'review': 89,      // 검수
    };
    const expectedStatusId = statusMap[selectedStatus];
    const projectStatusId = project.pjtStatus?.id || project.pjt_status?.id;
    return projectStatusId === expectedStatusId;
  };

  const matchesTeam = (project, selectedTeam) => {
    const teamName = project.teamName || project.team_name || project.team?.name || project.team;
    return teamName === selectedTeam;
  };

  const matchesService = (project, selectedService) => {
    const serviceName = project.serviceName || project.service_name || project.service?.name || project.service;
    return serviceName === selectedService;
  };

  // 필터링된 대시보드 데이터 계산 함수 (하이브리드 방식)
  const getFilteredDashboardData = () => {
    const hasActiveFilters = !!(
      chartFilters.selectedProjectType ||
      chartFilters.selectedTeam ||
      chartFilters.selectedService ||
      chartFilters.selectedStatus
    );

    // 1. 필터가 없는 경우: 원본 dashboard 데이터 직접 사용
    if (!hasActiveFilters) {
      return {
        // 차트에서 사용하는 데이터
        projectType: dashboard.projectTypeCount || {},
        team: dashboard.projectTeamCount || {},
        service: dashboard.projectServiceCount || {},
        projectStatus: dashboard.projectStatusCount || {},
        projectAnalytics: dashboard || null,
        progressDistribution: dashboard.projectProgressDistribution || null,
        // 호환성을 위한 기존 키 매핑
        projectProgress: dashboard.projectProgress || null,
        // 필터 정보
        isFiltered: false,
        activeFilters: chartFilters,
      };
    }

    // 2. 필터가 있는 경우: 계층적 필터링 적용
    // 전체 프로젝트 데이터 사용 (dashboard.allProjectsList)
    const allProjectsList = dashboard.allProjectsList || [];
    

    // 계층 1: 프로젝트 타입 필터 적용 (프로젝트 상태용)
    const projectTypeFiltered = chartFilters.selectedProjectType 
      ? allProjectsList.filter(project => matchesProjectType(project, chartFilters.selectedProjectType))
      : allProjectsList;
    
    // 계층 2: 프로젝트 타입 + 상태 필터 적용 (팀별 현황용)
    const statusFiltered = chartFilters.selectedStatus
      ? projectTypeFiltered.filter(project => matchesProjectStatus(project, chartFilters.selectedStatus))
      : projectTypeFiltered;
    
    // 계층 3: 프로젝트 타입 + 상태 + 팀 필터 적용 (서비스별 현황용)
    const teamFiltered = chartFilters.selectedTeam
      ? statusFiltered.filter(project => matchesTeam(project, chartFilters.selectedTeam))
      : statusFiltered;
    
    // 계층 4: 프로젝트 타입 + 상태 + 팀 + 서비스 필터 적용 (두 번째 행 차트용)
    const serviceFiltered = chartFilters.selectedService
      ? teamFiltered.filter(project => matchesService(project, chartFilters.selectedService))
      : teamFiltered;


    // 필터링된 프로젝트들로 각각 병렬 계산
    const calculateProjectTypeCount = (projects) => {
      const typeCount = { revenue: 0, investment: 0 };
      projects.forEach(project => {
        const projectType = project.projectType || project.project_type;
        if (projectType === '매출' || projectType === 'revenue') {
          typeCount.revenue++;
        } else if (projectType === '투자' || projectType === 'investment') {
          typeCount.investment++;
        }
      });
      return typeCount;
    };

    const calculateProjectStatusCount = (projects) => {
      const statusCount = {
        pending: 0, // 85: 보류
        notStarted: 0, // 86: 시작전
        waiting: 0, // 87: 대기
        inProgress: 0, // 88: 진행중
        review: 0, // 89: 검수
      };

      if (!Array.isArray(projects)) {
        return statusCount;
      }

      projects.forEach((project) => {
        const statusId = project.pjtStatus?.id;

        switch (statusId) {
          case 85:
            statusCount.pending++;
            break;
          case 86:
            statusCount.notStarted++;
            break;
          case 87:
            statusCount.waiting++;
            break;
          case 88:
            statusCount.inProgress++;
            break;
          case 89:
            statusCount.review++;
            break;
          default:
            break;
        }
      });

      return statusCount;
    };

    const calculateTeamCount = (projects) => {
      const teamCount = {};
      projects.forEach(project => {
        const teamName = project.teamName || project.team_name || project.team?.name || project.team;
        if (teamName) {
          teamCount[teamName] = (teamCount[teamName] || 0) + 1;
        }
      });
      return teamCount;
    };

    const calculateServiceCount = (projects) => {
      const serviceCount = {};
      projects.forEach(project => {
        const serviceName = project.serviceName || project.service_name || project.service?.name || project.service;
        if (serviceName) {
          serviceCount[serviceName] = (serviceCount[serviceName] || 0) + 1;
        }
      });
      return serviceCount;
    };

    // 계층별 계산 실행
    // 1. 프로젝트 타입: 항상 원본 데이터 (필터 선택만 표시)
    const calculatedProjectType = dashboard.projectTypeCount || {};
    
    // 2. 프로젝트 상태: 프로젝트 타입 필터 적용
    const calculatedProjectStatus = calculateProjectStatusCount(projectTypeFiltered);
    
    // 3. 팀별 현황: 프로젝트 타입 + 상태 필터 적용  
    const calculatedTeam = calculateTeamCount(statusFiltered);
    
    // 4. 서비스별 현황: 프로젝트 타입 + 상태 + 팀 필터 적용
    const calculatedService = calculateServiceCount(teamFiltered);
    
    
    // 5. 두 번째 행 차트용: 모든 필터 + 진행중 상태 필터링
    const inProgressServiceFiltered = serviceFiltered.filter(
      (project) => project.pjtStatus?.id === 88,
    );

    // 필터링된 프로젝트들에 진행률 계산 적용
    const inProgressWithCalculatedProgress = updateProjectsWithProgress(inProgressServiceFiltered);

    const filteredData = {
      // 1. 프로젝트 타입: 항상 원본 데이터 (필터 선택만 표시, 35개 유지)
      projectType: calculatedProjectType,
      // 2. 프로젝트 상태: 프로젝트 타입 필터 적용 (매출 선택시 33개)
      projectStatus: calculatedProjectStatus,
      // 3. 팀별 현황: 상위 필터들 적용
      team: calculatedTeam,
      // 4. 서비스별 현황: 모든 상위 필터들 적용
      service: calculatedService,
      // 5. 두 번째 행 차트용: 서비스 필터링된 진행중 프로젝트 (진행률 포함)
      inProgressFilteredProjects: inProgressWithCalculatedProgress,
      projectAnalytics: dashboard,
      progressDistribution: dashboard.projectProgressDistribution,
      projectProgress: dashboard.projectProgress,
    };

    return {
      ...filteredData,
      // 필터 정보
      isFiltered: true,
      activeFilters: chartFilters,
    };
  };

  // 대시보드 데이터 (필터링 적용)
  const dashboardData = getFilteredDashboardData();


  // 액션 핸들러
  const actions = {
    // 페이지네이션 액션
    pagination: {
      setPage: (page) => {
        dispatch(setPage(page));
        dispatch(
          fetchProjects({
            pagination: {
              current: page,
              pageSize: pagination.pageSize,
            },
          }),
        );
      },
      setPageSize: (pageSize) => {
        dispatch(setPageSize(pageSize));
        dispatch(
          fetchProjects({
            pagination: {
              current: 1,
              pageSize,
            },
          }),
        );
      },
    },

    // 필터 액션
    filter: {
      // 기존 필터에 추가
      setFilters: (filterValues) => {
        dispatch(setFilters(filterValues));
      },
      // 필터 초기상태
      resetFilters: () => {
        dispatch(resetFilters());
      },
      // 기존 필터를 무시하고 새 필터로 완전히 대체
      replaceFilters: (newFilters) => {
        dispatch({
          type: 'project/setFilters',
          payload: newFilters,
          meta: { replace: true },
        });
      },
      setWorkType: (workType) => {
        dispatch(
          setFilters({
            ...filters,
            pjt_status: { $in: [87, 88, 89] },
            work_type: workType,
          }),
        );
      },
    },

    // 프로젝트 목록 조회
    getProjectList: (params) => {
      dispatch(fetchProjects(params));
    },

    // 프로젝트 대시보드 데이터 업데이트
    fetchProjectDashboardData: () => {
      dispatch(fetchProjectDashboardData());
    },

    // 상세 정보 조회
    detail: {
      fetchDetail: (id) => {
        dispatch(fetchProjectDetail(id));
        dispatch(fetchProjectWorks({ projectId: id }));
        dispatch(
          changePageMenu({
            page: 'project',
            menu: 'detail',
            config: PAGE_MENUS.project.items.detail.config,
            subMenu: {
              key: 'projectDetail',
              menu: 'table',
            },
          }),
        );
      },
      refreshWorks: (id, params = {}) => {
        dispatch(fetchProjectWorks({ projectId: id, ...params }));
      },
      works: {
        setPage: (page) => {
          dispatch(setWorksPage(page));
          if (selectedItem?.data?.id) {
            dispatch(
              fetchProjectWorks({
                projectId: selectedItem.data.id,
                pagination: {
                  ...selectedItem.works.pagination,
                  current: page,
                },
              }),
            );
          }
        },
        setPageSize: (pageSize) => {
          dispatch(setWorksPageSize(pageSize));
          if (selectedItem?.data?.id) {
            dispatch(
              fetchProjectWorks({
                projectId: selectedItem.data.id,
                pagination: {
                  ...selectedItem.works.pagination,
                  pageSize,
                  current: 1,
                },
              }),
            );
          }
        },
      },
      clearDetail: () => dispatch(clearSelectedItem()),
    },

    // 폼 액션
    form: {
      updateField: (name, value) => dispatch(updateFormField({ name, value })),
      resetForm: () => dispatch(resetForm()),
    },

    // 대시보드 액션
    dashboard: {
      // 프로젝트 대시보드 데이터 조회
      fetchDashboardData: () => {
        dispatch(fetchProjectDashboardData());
      },
      // 대시보드 데이터 새로고침
      refresh: () => {
        dispatch(fetchProjectDashboardData());
      },
    },

    // 차트 필터링 액션
    chartFilters: {
      // 필터 설정 (토글 방식)
      setFilter: (filterType, value) => {
        dispatch(setChartFilter({ filterType, value }));
        // 필터 변경 후 자동으로 계층적 필터링된 프로젝트 목록 업데이트
        setTimeout(() => {
          dispatch(updateChartFilteredItems());
        }, 100); // 상태 업데이트 후 필터링 실행
      },
      // 모든 필터 초기화
      clearAll: () => {
        dispatch(clearChartFilters());
        // 필터 초기화 후 전체 프로젝트로 업데이트
        setTimeout(() => {
          dispatch(updateChartFilteredItems());
        }, 100);
      },
      // 특정 필터 초기화
      clear: (filterType) => {
        dispatch(clearChartFilter(filterType));
        setTimeout(() => {
          dispatch(updateChartFilteredItems());
        }, 100);
      },
    },
    
    // 차트 필터링된 프로젝트 목록 액션
    chartFilteredItems: {
      // 계층적 필터링 실행
      update: () => {
        dispatch(updateChartFilteredItems());
      },
      // 수동 업데이트
      refresh: () => {
        dispatch(updateChartFilteredItems());
      },
    },
  };

  return {
    // 상태
    items,
    pagination,
    filters,
    status,
    error,
    selectedItem,
    form,
    dashboard,
    dashboardData, // 추가: 데이터만 추출한 대시보드 상태
    chartFilteredItems, // 차트 필터링된 프로젝트 목록
    inProgressFilteredProjects: dashboardData.inProgressFilteredProjects || [], // 두 번째 행 차트용: 진행중 프로젝트만

    // 액션
    actions,
  };
};

export default useProjectStore;
