import React from 'react';

/**
 * 상태 진행 표시기 컴포넌트
 * 여러 단계의 상태를 시각적으로 표시하고 현재 상태를 강조합니다.
 *
 * @param {Object} props
 * @param {string[]} props.statuses - 표시할 상태 목록 (예: ['시작전', '진행중', '검수', '종료'])
 * @param {string} props.currentStatus - 현재 상태 (statuses 배열의 값 중 하나)
 * @param {string} [props.defaultStatus] - 기본 상태 (currentStatus가 없을 경우 사용)
 * @returns {JSX.Element} - 상태 진행 표시 UI 요소
 */
const StatusProgressIndicator = ({
  statuses = ['시작전', '진행중', '검수', '종료'],
  currentStatus,
  defaultStatus = '시작전',
}) => {
  // 현재 상태가 없으면 기본값 사용
  const activeStatus = currentStatus || defaultStatus;

  // 표준 상태가 아닌 경우 해당 상태만 표시
  if (!statuses.includes(activeStatus)) {
    return (
      <div className="flex items-center justify-center px-2 h-6 text-[10px] font-medium rounded-md bg-gray-100 text-gray-700 ring-1 ring-gray-300">
        {activeStatus}
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {statuses.map((status, index) => {
        // 현재 상태인지 확인
        const isCurrent = status === activeStatus;

        return (
          <React.Fragment key={status}>
            {/* 상태 표시 박스 */}
            <div
              className={`flex items-center justify-center ${
                isCurrent
                  ? 'px-3 h-7 text-xs font-semibold bg-blue-100 text-blue-800 ring-1 ring-blue-600'
                  : 'px-2 h-6 text-[10px] font-medium bg-gray-100 text-gray-500'
              } rounded-md`}
            >
              {status}
            </div>

            {/* 연결선 (마지막 아이템 제외) */}
            {index < statuses.length - 1 && (
              <div className="w-2 h-0.5 mx-0.5 bg-gray-200" />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StatusProgressIndicator;
