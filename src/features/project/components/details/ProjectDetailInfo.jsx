// src/features/project/components/details/ProjectDetailInfo.jsx
// Tier 2: 프로젝트 상세 정보를 Expandable 형태로 표시

import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * 프로젝트 상세 정보 컴포넌트
 * 부가 정보를 펼치기/접기 형태로 표시
 */
const ProjectDetailInfo = ({ data = {} }) => {
  const [isExpanded, setIsExpanded] = useState(true); // 기본 펼침 상태

  // 정보 아이템 렌더링 헬퍼
  const InfoItem = ({ label, value, className = '' }) => (
    <div className={`flex flex-col gap-1 ${className}`}>
      <span className="text-xs font-medium text-gray-500">{label}</span>
      <span className="text-sm text-gray-700">{value || '-'}</span>
    </div>
  );

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200">
      {/* 헤더 (항상 표시) */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">📋</span>
          <h3 className="text-base font-semibold text-gray-800">
            상세 정보
          </h3>
          <span className="text-xs text-gray-500">
            (고객사, 사업부, 중요도, 위험도 등)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {isExpanded ? '접기' : '펼치기'}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* 상세 정보 (Expandable) */}
      {isExpanded && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {/* 1행 */}
            <InfoItem
              label="고객사"
              value={data?.sfa?.customer?.name || data?.customer?.name}
            />
            <InfoItem
              label="사업부"
              value={data.team?.name}
            />
            <InfoItem
              label="서비스"
              value={data.service?.name}
            />
            <InfoItem
              label="중요도"
              value={data.importanceLevel?.name}
            />

            {/* 2행 */}
            <InfoItem
              label="위험도 (기간/시간)"
              value={`${data.scheduleRisk || '정상'} / ${data.timeRisk || '정상'}`}
            />
            <InfoItem
              label="사업년도"
              value={data.fy?.name}
            />
            <InfoItem
              label="SFA"
              value={data.sfa?.name}
            />
            <InfoItem
              label="이슈사항"
              value={data.issueCount ? `${data.issueCount}건` : '없음'}
            />

            {/* 비고는 전체 너비 차지 */}
            {data.remarks && (
              <div className="col-span-full">
                <InfoItem
                  label="비고"
                  value={data.remarks}
                />
              </div>
            )}
          </div>

          {/* 추가 정보 섹션 (선택) */}
          {(data.projectClosure || data.totalProjectHours) && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-4">
                추가 정보
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.projectClosure && (
                  <>
                    <InfoItem
                      label="종료 유형"
                      value={data.projectClosure.closureType?.name}
                    />
                    <InfoItem
                      label="종료 일자"
                      value={data.projectClosure.closureDate}
                    />
                    {data.projectClosure.closureReason && (
                      <div className="col-span-full">
                        <InfoItem
                          label="종료 사유"
                          value={data.projectClosure.closureReason}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

ProjectDetailInfo.propTypes = {
  data: PropTypes.object.isRequired,
};

export default ProjectDetailInfo;
