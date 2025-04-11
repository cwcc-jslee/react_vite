// src/features/project/layouts/ProjectListLayout.jsx

import React from 'react';
import ProjectChartsSection from '../sections/ProjectChartsSection';
import ProjectListTableSection from '../sections/ProjectListTableSection';

/**
 * 프로젝트 목록/현황을 보여주는 레이아웃 컴포넌트
 * 상단에 차트 섹션과 하단에 테이블 섹션으로 구성
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Object} props.chartsData - 차트 데이터 (상태, 진행률 등)
 * @param {Array} props.items - 프로젝트 목록 데이터
 * @param {Object} props.pagination - 페이지네이션 정보
 * @param {boolean} props.loading - 로딩 상태
 * @param {string} props.error - 에러 메시지
 * @param {Function} props.handlePageChange - 페이지 변경 핸들러
 * @param {Function} props.handlePageSizeChange - 페이지 크기 변경 핸들러
 * @param {Function} props.loadProjectDetail - 프로젝트 상세 정보 로드 핸들러
 * @param {Object} props.uiComponents - UI 컴포넌트 표시 여부 설정
 * @returns {JSX.Element} 프로젝트 리스트 레이아웃
 */
const ProjectListLayout = ({
  chartsData,
  items,
  pagination,
  loading,
  error,
  handlePageChange,
  handlePageSizeChange,
  loadProjectDetail,
  uiComponents,
}) => {
  return (
    <>
      {/* 차트 섹션 (상태, 진행률, 트리맵) */}
      {uiComponents.projectChart && (
        <ProjectChartsSection
          projectStatus={chartsData.projectStatus}
          projectProgress={chartsData.projectProgress}
        />
      )}

      {/* 테이블 섹션 */}
      {uiComponents.projectTable && (
        <ProjectListTableSection
          items={items}
          pagination={pagination}
          loading={loading}
          error={error}
          handlePageChange={handlePageChange}
          handlePageSizeChange={handlePageSizeChange}
          loadProjectDetail={loadProjectDetail}
        />
      )}
    </>
  );
};

export default ProjectListLayout;
