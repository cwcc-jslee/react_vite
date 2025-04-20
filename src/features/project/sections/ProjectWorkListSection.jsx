// src/features/project/sections/ProjectWorkListSection.jsx

import React from 'react';

// 커스텀 훅
import useWorkStore from '../../work/hooks/useWorkStore';

// 컴포넌트트
import ProjectWorkList from '../components/tables/ProjectWorkList';

/**
 * 프로젝트 목록 테이블 섹션 컴포넌트
 * 프로젝트 목록과 페이지네이션을 표시
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.items - 프로젝트 목록 데이터
 * @param {Object} props.pagination - 페이지네이션 정보
 * @param {boolean} props.loading - 로딩 상태
 * @param {string} props.error - 에러 메시지
 * @param {Function} props.handlePageChange - 페이지 변경 핸들러
 * @param {Function} props.handlePageSizeChange - 페이지 크기 변경 핸들러
 * @param {Function} props.loadProjectDetail - 프로젝트 상세 정보 로드 핸들러
 * @returns {JSX.Element} 프로젝트 테이블 섹션
 */
const ProjectWorkListSection = () => {
  // 작업리스트 상태 및 액션 훅
  const { items, pagination, loading, error, handleFilterChange } =
    useWorkStore();

  return (
    <div className="mt-6">
      <ProjectWorkList
        items={items}
        pagination={pagination}
        loading={loading}
        error={error}
        // handlePageChange={handlePageChange}
        // handlePageSizeChange={handlePageSizeChange}
        // loadProjectDetail={loadProjectDetail}
      />
    </div>
  );
};

export default ProjectWorkListSection;
