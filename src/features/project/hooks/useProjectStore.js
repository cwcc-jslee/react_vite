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
  fetchProjectStatus,
  fetchProjectDashboardData,
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

  // 대시보드 데이터만 선택적으로 추출
  const dashboardData = {
    projectStatus: dashboard.projectStatus?.data || null,
    projectProgress: dashboard.projectProgress?.data || null,
    projectAnalytics: dashboard.projectAnalytics?.data || null,
    progressDistribution: dashboard.projectAnalytics?.data?.progressDistribution || null,
  };

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
      // 프로젝트 상태 조회
      fetchStatus: () => {
        dispatch(fetchProjectStatus());
      },
      // 프로젝트 대시보드 데이터 조회
      fetchDashboardData: () => {
        dispatch(fetchProjectDashboardData());
      },
      // 대시보드 데이터 새로고침
      refresh: () => {
        dispatch(fetchProjectStatus());
        dispatch(fetchProjectDashboardData());
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
