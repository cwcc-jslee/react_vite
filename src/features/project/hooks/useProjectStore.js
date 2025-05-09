/**
 * @file useProjectStore.js
 * @description 프로젝트 관련 Redux 상태와 액션을 관리하는 Custom Hook
 *
 * 주요 기능:
 * 1. 프로젝트 목록 조회 및 페이지네이션
 * 2. 프로젝트 상세 정보 관리
 * 3. 폼 상태 및 유효성 검사
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
  createProject,
} from '../../../store/slices/projectSlice';
import { changePageMenu, changeSubMenu } from '../../../store/slices/uiSlice';
import { PAGE_MENUS } from '@shared/constants/navigation';

/**
 * 프로젝트 관련 상태와 액션을 관리하는 커스텀 훅
 * 프로젝트 목록, 상세 정보, 폼 상태 등을 통합 관리
 */
export const useProjectStore = () => {
  const dispatch = useDispatch();

  // 상태 선택
  const items = useSelector((state) => state.project.items);
  const pagination = useSelector((state) => state.project.pagination);
  const filters = useSelector((state) => state.project.filters);
  const loading = useSelector((state) => state.project.loading);
  const error = useSelector((state) => state.project.error);
  const selectedItem = useSelector((state) => state.project.selectedItem);
  const form = useSelector((state) => state.project.form);

  // 액션 핸들러
  const actions = {
    // 페이지네이션 액션
    pagination: {
      setPage: (page) => dispatch(setPage(page)),
      setPageSize: (pageSize) => dispatch(setPageSize(pageSize)),
    },

    // 필터 액션
    filter: {
      setFilters: (filters) => dispatch(setFilters(filters)),
      resetFilters: () => dispatch(resetFilters()),
    },

    // 상세 정보 액션
    detail: {
      fetchDetail: (id) => {
        dispatch(fetchProjectDetail(id));
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
      clearDetail: () => dispatch(clearSelectedItem()),
    },

    // 폼 액션
    form: {
      updateField: (name, value) => dispatch(updateFormField({ name, value })),
      resetForm: () => dispatch(resetForm()),
    },

    // 프로젝트 목록 새로고침
    refreshList: () => dispatch(fetchProjects()),
  };

  // 선택된 프로젝트 데이터 가져오기
  const getSelectedProject = () => {
    return selectedItem || null;
  };

  // 선택된 프로젝트의 특정 필드 가져오기
  const getSelectedProjectField = (field) => {
    return selectedItem ? selectedItem[field] : null;
  };

  return {
    // 상태
    items,
    pagination,
    filters,
    loading,
    error,
    selectedItem,
    form,

    // 액션
    actions,

    // 유틸리티 함수
    getSelectedProject,
    getSelectedProjectField,
  };
};

export default useProjectStore;
