// src/features/project/components/detail/ProjectDetailSection.jsx
/**
 * 프로젝트 상세 정보를 표시하는 컴포넌트
 * 선택된 프로젝트의 상세 정보를 카드 형태로 제공하며, 로딩 상태와 에러 처리를 지원합니다.
 */

import React from 'react';
import { Card } from '../../../../shared/components/ui/card/Card';
import { Button } from '../../../../shared/components/ui';

// 로딩 상태 컴포넌트
const DetailLoadingIndicator = () => {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <span className="text-sm text-gray-500">
          상세 정보를 불러오는 중입니다...
        </span>
      </div>
    </div>
  );
};

// 에러 상태 컴포넌트
const DetailErrorState = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <span className="text-sm text-red-500">
        {message || '상세 정보를 불러오는 중 오류가 발생했습니다'}
      </span>
    </div>
  );
};

const ProjectDetailContainer = ({ project, loading, error, onClose }) => {
  // 데이터가 없는 경우 처리
  if (!project && !loading && !error) {
    return (
      <Card>
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">프로젝트 상세</h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              닫기
            </Button>
          </div>
          <div className="flex flex-col items-center justify-center py-8">
            <span className="text-sm text-gray-500">
              선택된 프로젝트가 없습니다
            </span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">프로젝트 상세</h2>
          <Button variant="outline" size="sm" onClick={onClose}>
            닫기
          </Button>
        </div>

        {loading ? (
          <DetailLoadingIndicator />
        ) : error ? (
          <DetailErrorState message={error} />
        ) : (
          <div className="space-y-4">
            {/* 프로젝트 정보 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 기본 정보 */}
              <div className="border rounded-md p-3">
                <h3 className="text-md font-medium mb-2">기본 정보</h3>
                <div className="grid grid-cols-1 gap-2">
                  <InfoItem label="프로젝트명" value={project.name} />
                  <InfoItem
                    label="고객사"
                    value={
                      project?.sfa?.customer?.name || project?.customer?.name
                    }
                  />
                  <InfoItem label="서비스" value={project?.service?.name} />
                  <InfoItem
                    label="중요도"
                    value={project?.importanceLevel?.name}
                  />
                </div>
              </div>

              {/* 상태 정보 */}
              <div className="border rounded-md p-3">
                <h3 className="text-md font-medium mb-2">상태 정보</h3>
                <div className="grid grid-cols-1 gap-2">
                  <InfoItem
                    label="프로젝트 상태"
                    value={project?.pjtStatus?.name}
                  />
                  <InfoItem label="진행률" value="계산" />
                  <InfoItem label="완료(예정)일" value={project.planEndDate} />
                  <InfoItem
                    label="최근 작업일"
                    value={project.lastWorkupdateDate}
                  />
                </div>
              </div>

              {/* 추가 정보 */}
              <div className="border rounded-md p-3 md:col-span-2">
                <h3 className="text-md font-medium mb-2">추가 정보</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <InfoItem label="만들어진 날짜" value={project.createdAt} />
                  <InfoItem label="수정된 날짜" value={project.updatedAt} />
                  <InfoItem label="프로젝트 ID" value={project.id} />
                </div>
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" size="sm">
                수정
              </Button>
              <Button variant="primary" size="sm">
                작업 관리
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// 정보 항목 컴포넌트
const InfoItem = ({ label, value }) => {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm">{value || '-'}</span>
    </div>
  );
};

export default ProjectDetailContainer;
