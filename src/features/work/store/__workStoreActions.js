// src/features/work/store/workStoreActions.js
/**
 * 프로젝트 페이지 상태 관리를 위한 액션 생성자
 * pageState 슬라이스를 활용하여 프로젝트 관련 액션을 정의합니다.
 */

import { fetchWorks } from '../../../store/slices/workSlice';
import { workApiService } from '../services/workApiService';

// WORK 페이지 타입 상수
// export const PROJECT_PAGE_TYPE = 'work';

// 작업업 목록 조회 액션 생성
export const fetchWorks = createFetchItems(
  PROJECT_PAGE_TYPE,
  workApiService.getWorkList,
);

// 액션 생성자 객체 (일괄 내보내기용)
export const workActions = {
  fetchWorks,
  // fetchWorkDetail,
  // createWork,
  // updateWork,
  // deleteWork,
};

export default workActions;
