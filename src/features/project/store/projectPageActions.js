// src/features/project/store/projectPageActions.js
/**
 * 프로젝트 페이지 상태 관리를 위한 액션 생성자
 * pageState 슬라이스를 활용하여 프로젝트 관련 액션을 정의합니다.
 */

import {
  createFetchItems,
  createFetchDetail,
  createAddItem,
  createUpdateItem,
  createDeleteItem,
} from '../../../store/slices/pageStateSlice';
import { projectApiService } from '../services/projectApiService';

// 프로젝트 페이지 타입 상수
export const PROJECT_PAGE_TYPE = 'project';

// 프로젝트 목록 조회 액션 생성
export const fetchProjects = createFetchItems(
  PROJECT_PAGE_TYPE,
  projectApiService.getProjectList,
);

// 프로젝트 상세 조회 액션 생성
export const fetchProjectDetail = createFetchDetail(
  PROJECT_PAGE_TYPE,
  projectApiService.getProjectDetail,
);

// 프로젝트 생성 액션 생성
export const createProject = createAddItem(
  PROJECT_PAGE_TYPE,
  projectApiService.createProject,
  fetchProjects,
);

// 프로젝트 수정 액션 생성
export const updateProject = createUpdateItem(
  PROJECT_PAGE_TYPE,
  projectApiService.updateProject,
  fetchProjects,
);

// 프로젝트 삭제 액션 생성
export const deleteProject = createDeleteItem(
  PROJECT_PAGE_TYPE,
  projectApiService.deleteProject,
  fetchProjects,
);

// 액션 생성자 객체 (일괄 내보내기용)
export const projectActions = {
  fetchProjects,
  fetchProjectDetail,
  createProject,
  updateProject,
  deleteProject,
};

export default projectActions;
