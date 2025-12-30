// src/features/project/components/ui/CompactStatusBadge.jsx

import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/ko';
import {
  PROJECT_STATUS_LABEL_TO_KEY,
  getStatusColorByKey,
  PROJECT_STATUS_DESCRIPTIONS,
} from '../../constants/projectStatusConstants';

// dayjs 플러그인 및 로케일 설정
dayjs.extend(relativeTime);
dayjs.locale('ko');

/**
 * 컴팩트한 프로젝트 상태 Badge 컴포넌트
 * 현재 상태를 Badge로 표시하고, 클릭 시 Drawer 열기
 *
 * @param {Object} props
 * @param {string} props.currentStatus - 현재 상태 (한글 라벨)
 * @param {string} props.previousStatus - 이전 상태 (선택, 시작전이 아닐 때)
 * @param {string} props.statusDetail - 상태 세부 내용 (선택)
 * @param {string} props.approvalStatus - 승인 상태 ('pending' | 'approved' | 'rejected' | null)
 * @param {boolean} props.isException - 예외 상태 여부
 * @param {Function} props.onClick - 클릭 핸들러 (Drawer 열기)
 * @param {string} props.timeAgo - 변경 시간 (ISO 8601 형식 또는 날짜 문자열)
 * @param {string} props.changedBy - 변경자 이름
 */
const CompactStatusBadge = ({
  currentStatus = '시작전',
  previousStatus = null,
  statusDetail = null,
  approvalStatus = null,
  isException = false,
  onClick,
  timeAgo = null,
  changedBy = null,
}) => {
  // 영문 키로 변환
  const statusKey = PROJECT_STATUS_LABEL_TO_KEY[currentStatus];
  const colorInfo = getStatusColorByKey(statusKey);
  const description = PROJECT_STATUS_DESCRIPTIONS[statusKey];

  // 시간 포맷팅 (상대 시간 또는 절대 시간)
  const formattedTime = useMemo(() => {
    if (!timeAgo) return null;

    const now = dayjs();
    const changeTime = dayjs(timeAgo);
    const diffInHours = now.diff(changeTime, 'hour');

    // 24시간 이내: 상대 시간 (예: "2시간 전")
    if (diffInHours < 24) {
      return changeTime.fromNow();
    }

    // 24시간 이후: 절대 시간 (예: "2025-12-29 10:30")
    return changeTime.format('YYYY-MM-DD HH:mm');
  }, [timeAgo]);

  // 색상 클래스 매핑
  const getColorClasses = () => {
    const colorMap = {
      pendingWaiting: 'bg-red-100 text-red-800 ring-red-600 hover:bg-red-200',
      notStarted: 'bg-gray-100 text-gray-700 ring-gray-400 hover:bg-gray-200',
      interimReview: 'bg-blue-100 text-blue-800 ring-blue-600 hover:bg-blue-200',
      inProgress: 'bg-green-100 text-green-800 ring-green-600 hover:bg-green-200',
      finalReview: 'bg-purple-100 text-purple-800 ring-purple-600 hover:bg-purple-200',
      closed: 'bg-slate-100 text-slate-700 ring-slate-500 hover:bg-slate-200',
    };

    return colorMap[statusKey] || 'bg-gray-100 text-gray-700 ring-gray-400';
  };

  // 승인 상태 배지 (간단한 사각 박스: 대기/승인/거부)
  const ApprovalBadge = () => {
    const config = {
      pending: { letter: '대기', label: '승인 대기', className: 'bg-yellow-400 text-white' },
      approved: { letter: '승인', label: '승인 완료', className: 'bg-green-500 text-white' },
      rejected: { letter: '거부', label: '거부됨', className: 'bg-red-500 text-white' },
    };

    if (!approvalStatus || !config[approvalStatus]) return null;

    const { letter, label, className } = config[approvalStatus];

    return (
      <div
        className={`flex items-center justify-center px-2 h-8 text-xs font-bold rounded ${className}`}
        title={label}
      >
        {letter}
      </div>
    );
  };

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {/* 1줄: 상태 전환 + 승인 상태 (우측 배치) */}
      <div className="flex items-center justify-between gap-2">
        {/* 왼쪽: 상태 전환 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 이전 상태 (시작전이 아닐 때만) */}
          {previousStatus && (
            <>
              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                {previousStatus}
              </span>
              <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </>
          )}

          {/* 현재 상태 Badge (클릭 가능) */}
          <button
            type="button"
            onClick={handleClick}
            className={`
              inline-flex items-center gap-1.5 px-3 py-1.5
              text-sm font-semibold rounded-md
              ring-1 transition-all duration-200
              cursor-pointer
              ${getColorClasses()}
              ${isException ? 'ring-2' : 'ring-1'}
            `}
            aria-label={`현재 상태: ${currentStatus}. 클릭하여 상태 관리`}
            title={description}
          >
            {/* 상태 표시 점 */}
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: colorInfo?.color }}
            />

            {/* 상태 텍스트 */}
            <span>{currentStatus}</span>

            {/* 상태 세부 내용 */}
            {statusDetail && (
              <span className="text-xs opacity-75">({statusDetail})</span>
            )}

            {/* 예외 상태 표시 */}
            {isException && (
              <span className="text-xs opacity-75">(예외)</span>
            )}
          </button>
        </div>

        {/* 우측: 승인 상태 배지 */}
        <ApprovalBadge />
      </div>

      {/* 2줄: 메타 정보 (변경 시간, 변경자) */}
      {(formattedTime || changedBy) && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          {formattedTime && <span>{formattedTime}</span>}
          {formattedTime && changedBy && <span>·</span>}
          {changedBy && <span>{changedBy}</span>}
        </div>
      )}
    </div>
  );
};

CompactStatusBadge.propTypes = {
  currentStatus: PropTypes.string,
  previousStatus: PropTypes.string,
  statusDetail: PropTypes.string,
  approvalStatus: PropTypes.oneOf(['pending', 'approved', 'rejected', null]),
  isException: PropTypes.bool,
  onClick: PropTypes.func,
  timeAgo: PropTypes.string,
  changedBy: PropTypes.string,
};

export default CompactStatusBadge;
