// src/features/project/services/projectSubmitService.js
/**
 * 프로젝트 데이터 제출 관련 서비스
 * API 통신 로직을 처리하는 모듈
 */

import {
  baseSubmitService,
  createEntity,
} from '../../../shared/services/baseSubmitService';
import { notification } from '../../../shared/services/notification';

// Project 서비스 인스턴스 생성 (변환 함수 제거)
const projectService = baseSubmitService('/projects');

/**
 * 프로젝트 폼 데이터를 서버에 제출하는 함수
 * API 호출 및 결과 처리를 수행
 *
 * @param {Object} formData - 이미 정리 및 변환된 프로젝트 데이터
 * @returns {Promise<Object>} 성공 시 { success: true, data: response } 형태의 객체 반환
 * @throws {Error} 실패 시 오류 발생
 */
export const submitProjectData = async (formData) => {
  try {
    console.log(`projectSubmitService > 제출 데이터:`, formData);

    // API 호출 (이미 정리 및 변환된 데이터 사용)
    const response = await createProject(formData);

    return response;
  } catch (error) {
    // 오류 발생 시 콘솔에 로깅
    console.error('프로젝트 제출 오류:', error);

    // 오류를 다시 throw하여 호출자가 처리할 수 있게 함
    throw error;
  }
};

/**
 * Project 생성 함수
 * 내부적으로 baseSubmitService의 createEntity 사용
 */
export const createProject = async (formData) => {
  return createEntity(projectService, formData, 'Project');
};

/**
 * Project 관련 서비스 메서드 모음
 */
export const projectSubmitService = {
  submitProjectData,
  createProject,
  createProjectBase: (formData) => projectService.createBase(formData),
  updateProjectBase: (id, formData) => projectService.updateBase(id, formData),
  deleteProject: (id) => projectService.softDelete(id),
};
