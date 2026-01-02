/**
 * 사업부 매출 Badge 컴포넌트
 * - 단일/다중 사업부 모두 지원
 * - 팀별 색상 구분
 * - 매출액 표시
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Users } from 'lucide-react';

const TeamRevenueBadges = ({ items, isMultiTeam }) => {
  if (!items || items.length === 0) {
    return <span className="text-gray-500">-</span>;
  }

  // 팀별 색상 매핑 (SfaPaymentSection과 동일)
  const TEAM_COLORS = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
  ];

  return (
    <div className="flex items-start gap-2">
      <Users className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => {
          // 매출액 파싱 (괄호 안의 숫자)
          const amountMatch = item.text?.match(/\(([0-9,]+)\)/);
          const amount = amountMatch ? amountMatch[1] : null;

          // 팀명-항목명 파싱
          const nameMatch = item.text?.match(/^(.+?)(?:\(|$)/);
          const teamItemName = nameMatch ? nameMatch[1].trim() : item.text;

          return (
            <span
              key={item.key || idx}
              className={`
                inline-flex items-center gap-1.5
                px-3 py-1.5 rounded-lg text-xs font-medium border
                ${TEAM_COLORS[idx % TEAM_COLORS.length]}
              `}
            >
              <span className="font-semibold">{teamItemName}</span>
              {amount && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="font-mono">{amount}원</span>
                </>
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
};

TeamRevenueBadges.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      text: PropTypes.string,
      badgeClass: PropTypes.string,
    })
  ),
  isMultiTeam: PropTypes.bool,
};

TeamRevenueBadges.defaultProps = {
  isMultiTeam: false,
};

export default TeamRevenueBadges;
