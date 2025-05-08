/**
 * 검색 기능을 위한 커스텀 훅
 * ProjectProvider와 연동되어 검색 상태를 관리합니다.
 *
 * @returns {Object} {
 *   handleSearch: (filters) => void - 검색 실행 함수
 *   filters: Object - 현재 필터 상태
 *   isFetching: boolean - 검색 중 여부
 *   error: string | null - 에러 메시지
 * }
 */
import { useProject } from '../context/ProjectProvider';

export const useSearch = () => {
  const { handleSearch, search } = useProject();

  return {
    handleSearch,
    filters: search.filters,
    isFetching: search.isFetching,
    error: search.error,
  };
};
