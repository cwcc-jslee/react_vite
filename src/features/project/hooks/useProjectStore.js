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
} from '../../../store/slices/projectSlice';
import { changePageMenu, changeSubMenu } from '../../../store/slices/uiSlice';
import { PAGE_MENUS } from '@shared/constants/navigation';

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

  // 필터링된 대시보드 데이터 계산 함수
  const getFilteredDashboardData = () => {
    // 필터가 없으면 원본 데이터 반환
    if (!chartFilters.selectedProjectType && !chartFilters.selectedTeam && 
        !chartFilters.selectedService && !chartFilters.selectedStatus) {
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

    // 다중 필터링 로직 구현
    let filteredData = {
      projectType: dashboard.projectTypeCount || {},
      team: dashboard.projectTeamCount || {},
      service: dashboard.projectServiceCount || {},
      projectStatus: dashboard.projectStatusCount || {},
      projectAnalytics: dashboard || null,
      progressDistribution: dashboard.projectProgressDistribution || null,
      projectProgress: dashboard.projectProgress || null,
    };

    // 활성화된 필터들 수집
    const activeFilters = [];
    if (chartFilters.selectedProjectType) {
      activeFilters.push({ type: 'projectType', value: chartFilters.selectedProjectType });
    }
    if (chartFilters.selectedStatus) {
      activeFilters.push({ type: 'status', value: chartFilters.selectedStatus });
    }
    if (chartFilters.selectedTeam) {
      activeFilters.push({ type: 'team', value: chartFilters.selectedTeam });
    }
    if (chartFilters.selectedService) {
      activeFilters.push({ type: 'service', value: chartFilters.selectedService });
    }

    console.log('활성화된 필터들:', activeFilters);

    // 다중 필터가 있는 경우 조합 비율 계산
    if (activeFilters.length > 0) {
      let combinedRatio = 1.0;

      // 각 필터 타입별 비율 계산 및 곱셈
      activeFilters.forEach(filter => {
        let ratio = 1.0;
        
        switch (filter.type) {
          case 'projectType':
            const totalTypeCount = (dashboard.projectTypeCount?.revenue || 0) + (dashboard.projectTypeCount?.investment || 0);
            const selectedTypeCount = dashboard.projectTypeCount?.[filter.value] || 0;
            if (totalTypeCount > 0 && selectedTypeCount > 0) {
              ratio = selectedTypeCount / totalTypeCount;
            }
            break;
            
          case 'status':
            const statusValues = Object.values(dashboard.projectStatusCount || {});
            const totalStatusCount = statusValues.reduce((sum, count) => sum + count, 0);
            const selectedStatusCount = dashboard.projectStatusCount?.[filter.value] || 0;
            if (totalStatusCount > 0 && selectedStatusCount > 0) {
              ratio = selectedStatusCount / totalStatusCount;
            }
            break;
            
          case 'team':
            const teamValues = Object.values(dashboard.projectTeamCount || {});
            const totalTeamCount = teamValues.reduce((sum, count) => sum + count, 0);
            const selectedTeamCount = dashboard.projectTeamCount?.[filter.value] || 0;
            if (totalTeamCount > 0 && selectedTeamCount > 0) {
              ratio = selectedTeamCount / totalTeamCount;
            }
            break;
            
          case 'service':
            const serviceValues = Object.values(dashboard.projectServiceCount || {});
            const totalServiceCount = serviceValues.reduce((sum, count) => sum + count, 0);
            const selectedServiceCount = dashboard.projectServiceCount?.[filter.value] || 0;
            if (totalServiceCount > 0 && selectedServiceCount > 0) {
              ratio = selectedServiceCount / totalServiceCount;
            }
            break;
        }
        
        combinedRatio *= ratio;
        console.log(`${filter.type} 필터 비율:`, ratio, `누적 비율:`, combinedRatio);
      });

      // 필터링되지 않은 데이터에 조합 비율 적용
      const applyFilterRatio = (data, excludeFilterType = null) => {
        // 해당 필터 타입의 차트는 원본 데이터 유지 (자기 자신은 필터링하지 않음)
        let adjustedRatio = combinedRatio;
        
        // 자기 자신의 필터는 제외하고 다른 필터들의 영향만 적용
        if (excludeFilterType) {
          const ownFilter = activeFilters.find(f => f.type === excludeFilterType);
          if (ownFilter) {
            let ownRatio = 1.0;
            switch (excludeFilterType) {
              case 'projectType':
                const totalTypeCount = (dashboard.projectTypeCount?.revenue || 0) + (dashboard.projectTypeCount?.investment || 0);
                const selectedTypeCount = dashboard.projectTypeCount?.[ownFilter.value] || 0;
                if (totalTypeCount > 0 && selectedTypeCount > 0) {
                  ownRatio = selectedTypeCount / totalTypeCount;
                }
                break;
              case 'status':
                const statusValues = Object.values(dashboard.projectStatusCount || {});
                const totalStatusCount = statusValues.reduce((sum, count) => sum + count, 0);
                const selectedStatusCount = dashboard.projectStatusCount?.[ownFilter.value] || 0;
                if (totalStatusCount > 0 && selectedStatusCount > 0) {
                  ownRatio = selectedStatusCount / totalStatusCount;
                }
                break;
            }
            adjustedRatio = ownRatio > 0 ? combinedRatio / ownRatio : combinedRatio;
          }
        }
        
        const result = {};
        Object.keys(data || {}).forEach(key => {
          result[key] = Math.round((data[key] || 0) * adjustedRatio);
        });
        return result;
      };

      // 계층적 필터링 적용
      // 프로젝트 타입 > 프로젝트 상태 > 팀별 현황, 서비스별 현황
      filteredData = {
        // 프로젝트 타입: 항상 원본 데이터 (최상위)
        projectType: dashboard.projectTypeCount,
        
        // 프로젝트 상태: 프로젝트 타입 필터 영향 받음 (정확한 수량 반영)
        projectStatus: chartFilters.selectedProjectType ? 
          (() => {
            // 선택된 프로젝트 타입의 총 개수를 프로젝트 상태에 비례 분배
            const selectedTypeCount = dashboard.projectTypeCount?.[chartFilters.selectedProjectType] || 0;
            const originalStatusTotal = Object.values(dashboard.projectStatusCount || {}).reduce((sum, count) => sum + count, 0);
            
            if (originalStatusTotal === 0) return dashboard.projectStatusCount;
            
            // 각 상태별로 비례 계산하되, 총합이 선택된 타입 개수와 일치하도록 조정
            const result = {};
            let adjustedTotal = 0;
            
            Object.keys(dashboard.projectStatusCount || {}).forEach(status => {
              const originalCount = dashboard.projectStatusCount[status] || 0;
              const adjustedCount = Math.round((originalCount / originalStatusTotal) * selectedTypeCount);
              result[status] = adjustedCount;
              adjustedTotal += adjustedCount;
            });
            
            // 반올림으로 인한 차이를 가장 큰 값에 보정
            if (adjustedTotal !== selectedTypeCount && selectedTypeCount > 0) {
              const maxStatus = Object.keys(result).reduce((a, b) => result[a] > result[b] ? a : b);
              result[maxStatus] += (selectedTypeCount - adjustedTotal);
            }
            
            console.log(`프로젝트 타입 '${chartFilters.selectedProjectType}' 필터 적용:`);
            console.log(`선택된 타입 총 개수: ${selectedTypeCount}`);
            console.log(`필터링된 상태 데이터:`, result);
            console.log(`필터링된 상태 총합: ${Object.values(result).reduce((sum, count) => sum + count, 0)}`);
            
            return result;
          })() : 
          dashboard.projectStatusCount,
        
        // 팀별 현황: 프로젝트 타입 + 프로젝트 상태 필터 영향 받음 (정확한 수량 반영)
        team: (() => {
          // 적용할 필터들의 총 개수 계산
          let targetTotal = 0;
          
          if (chartFilters.selectedProjectType && chartFilters.selectedStatus) {
            // 두 필터 모두 적용: 필터링된 프로젝트 상태에서 선택된 상태의 개수
            const filteredStatus = filteredData.projectStatus;
            targetTotal = filteredStatus[chartFilters.selectedStatus] || 0;
          } else if (chartFilters.selectedProjectType) {
            // 프로젝트 타입만 적용
            targetTotal = dashboard.projectTypeCount?.[chartFilters.selectedProjectType] || 0;
          } else if (chartFilters.selectedStatus) {
            // 프로젝트 상태만 적용
            targetTotal = dashboard.projectStatusCount?.[chartFilters.selectedStatus] || 0;
          } else {
            return dashboard.projectTeamCount;
          }
          
          // 비례 분배
          const originalTeamTotal = Object.values(dashboard.projectTeamCount || {}).reduce((sum, count) => sum + count, 0);
          if (originalTeamTotal === 0 || targetTotal === 0) return dashboard.projectTeamCount;
          
          const result = {};
          let adjustedTotal = 0;
          
          Object.keys(dashboard.projectTeamCount || {}).forEach(team => {
            const originalCount = dashboard.projectTeamCount[team] || 0;
            const adjustedCount = Math.round((originalCount / originalTeamTotal) * targetTotal);
            result[team] = adjustedCount;
            adjustedTotal += adjustedCount;
          });
          
          // 반올림 오차 보정
          if (adjustedTotal !== targetTotal && targetTotal > 0) {
            const maxTeam = Object.keys(result).reduce((a, b) => result[a] > result[b] ? a : b);
            result[maxTeam] += (targetTotal - adjustedTotal);
          }
          
          console.log(`팀별 현황 필터링: 목표 총합 ${targetTotal}, 실제 총합 ${Object.values(result).reduce((sum, count) => sum + count, 0)}`);
          
          return result;
        })(),
        
        // 서비스별 현황: 모든 상위 필터 영향 받음 (정확한 수량 반영)
        service: (() => {
          // 적용할 필터들의 총 개수 계산
          let targetTotal = 0;
          
          if (chartFilters.selectedProjectType && chartFilters.selectedStatus && chartFilters.selectedTeam) {
            // 3개 필터 모두 적용: 필터링된 팀에서 선택된 팀의 개수
            const filteredTeam = filteredData.team;
            targetTotal = filteredTeam[chartFilters.selectedTeam] || 0;
          } else if (chartFilters.selectedProjectType && chartFilters.selectedStatus) {
            // 프로젝트 타입 + 상태: 필터링된 프로젝트 상태에서 선택된 상태의 개수
            const filteredStatus = filteredData.projectStatus;
            targetTotal = filteredStatus[chartFilters.selectedStatus] || 0;
          } else if (chartFilters.selectedProjectType && chartFilters.selectedTeam) {
            // 프로젝트 타입 + 팀: 필터링된 팀에서 선택된 팀의 개수
            const filteredTeam = filteredData.team;
            targetTotal = filteredTeam[chartFilters.selectedTeam] || 0;
          } else if (chartFilters.selectedStatus && chartFilters.selectedTeam) {
            // 상태 + 팀: 필터링된 팀에서 선택된 팀의 개수
            const filteredTeam = filteredData.team;
            targetTotal = filteredTeam[chartFilters.selectedTeam] || 0;
          } else if (chartFilters.selectedProjectType) {
            // 프로젝트 타입만
            targetTotal = dashboard.projectTypeCount?.[chartFilters.selectedProjectType] || 0;
          } else if (chartFilters.selectedStatus) {
            // 프로젝트 상태만
            targetTotal = dashboard.projectStatusCount?.[chartFilters.selectedStatus] || 0;
          } else if (chartFilters.selectedTeam) {
            // 팀만
            targetTotal = dashboard.projectTeamCount?.[chartFilters.selectedTeam] || 0;
          } else {
            return dashboard.projectServiceCount;
          }
          
          // 비례 분배
          const originalServiceTotal = Object.values(dashboard.projectServiceCount || {}).reduce((sum, count) => sum + count, 0);
          if (originalServiceTotal === 0 || targetTotal === 0) return dashboard.projectServiceCount;
          
          const result = {};
          let adjustedTotal = 0;
          
          Object.keys(dashboard.projectServiceCount || {}).forEach(service => {
            const originalCount = dashboard.projectServiceCount[service] || 0;
            const adjustedCount = Math.round((originalCount / originalServiceTotal) * targetTotal);
            result[service] = adjustedCount;
            adjustedTotal += adjustedCount;
          });
          
          // 반올림 오차 보정
          if (adjustedTotal !== targetTotal && targetTotal > 0) {
            const maxService = Object.keys(result).reduce((a, b) => result[a] > result[b] ? a : b);
            result[maxService] += (targetTotal - adjustedTotal);
          }
          
          console.log(`서비스별 현황 필터링: 목표 총합 ${targetTotal}, 실제 총합 ${Object.values(result).reduce((sum, count) => sum + count, 0)}`);
          
          return result;
        })(),
        
        projectAnalytics: dashboard,
        progressDistribution: dashboard.projectProgressDistribution,
        projectProgress: dashboard.projectProgress,
      };
      
      // 헬퍼 함수들 정의
      function getFilterRatio(filterType, filterValue) {
        switch (filterType) {
          case 'projectType':
            const totalTypeCount = (dashboard.projectTypeCount?.revenue || 0) + (dashboard.projectTypeCount?.investment || 0);
            const selectedTypeCount = dashboard.projectTypeCount?.[filterValue] || 0;
            return totalTypeCount > 0 && selectedTypeCount > 0 ? selectedTypeCount / totalTypeCount : 1.0;
            
          case 'status':
            const statusValues = Object.values(dashboard.projectStatusCount || {});
            const totalStatusCount = statusValues.reduce((sum, count) => sum + count, 0);
            const selectedStatusCount = dashboard.projectStatusCount?.[filterValue] || 0;
            return totalStatusCount > 0 && selectedStatusCount > 0 ? selectedStatusCount / totalStatusCount : 1.0;
            
          case 'team':
            const teamValues = Object.values(dashboard.projectTeamCount || {});
            const totalTeamCount = teamValues.reduce((sum, count) => sum + count, 0);
            const selectedTeamCount = dashboard.projectTeamCount?.[filterValue] || 0;
            return totalTeamCount > 0 && selectedTeamCount > 0 ? selectedTeamCount / totalTeamCount : 1.0;
            
          default:
            return 1.0;
        }
      }
      
      function applyRatio(data, ratio) {
        const result = {};
        Object.keys(data || {}).forEach(key => {
          result[key] = Math.round((data[key] || 0) * ratio);
        });
        return result;
      }
      
      console.log('필터링 적용된 데이터:', filteredData);
    }

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
      },
      // 모든 필터 초기화
      clearAll: () => {
        dispatch(clearChartFilters());
      },
      // 특정 필터 초기화
      clear: (filterType) => {
        dispatch(clearChartFilter(filterType));
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

    // 액션
    actions,
  };
};

export default useProjectStore;
