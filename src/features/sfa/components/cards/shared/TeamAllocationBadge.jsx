/**
 * 팀별 매출액 배지 컴포넌트
 * - 단일/다중 사업부 매출액 표시
 */
import React from 'react';
import PropTypes from 'prop-types';

// 팀별 색상 매핑 (최대 4개 팀 지원)
const TEAM_COLORS = [
  'bg-blue-100 text-blue-800 border-blue-200',
  'bg-purple-100 text-purple-800 border-purple-200',
  'bg-pink-100 text-pink-800 border-pink-200',
  'bg-indigo-100 text-indigo-800 border-indigo-200',
];

const TeamAllocationBadge = ({ allocation, index }) => {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-3 py-1 rounded-full text-xs font-medium border
        ${TEAM_COLORS[index % TEAM_COLORS.length]}
      `}
    >
      <span className="font-semibold">
        {allocation.itemName || allocation.teamName}
      </span>
      <span className="text-gray-400">|</span>
      <span>
        {Number(allocation.allocatedAmount || 0).toLocaleString()}원
      </span>
    </span>
  );
};

TeamAllocationBadge.propTypes = {
  allocation: PropTypes.shape({
    itemName: PropTypes.string,
    teamName: PropTypes.string,
    allocatedAmount: PropTypes.number,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

export default TeamAllocationBadge;
