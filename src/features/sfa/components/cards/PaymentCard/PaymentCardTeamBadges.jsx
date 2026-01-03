/**
 * PaymentCard 팀별 매출액 배지 컴포넌트
 * - teamAllocations 배열을 받아 배지 리스트 렌더링
 */
import React from 'react';
import PropTypes from 'prop-types';
import { TeamAllocationBadge } from '../shared';

const PaymentCardTeamBadges = ({ teamAllocations }) => {
  if (!teamAllocations || teamAllocations.length === 0) {
    return null;
  }

  return (
    <div className="ml-20 flex flex-wrap gap-2">
      {teamAllocations.map((allocation, idx) => (
        <TeamAllocationBadge key={idx} allocation={allocation} index={idx} />
      ))}
    </div>
  );
};

PaymentCardTeamBadges.propTypes = {
  teamAllocations: PropTypes.arrayOf(
    PropTypes.shape({
      itemName: PropTypes.string,
      teamName: PropTypes.string,
      allocatedAmount: PropTypes.number,
    }),
  ),
};

PaymentCardTeamBadges.defaultProps = {
  teamAllocations: [],
};

export default PaymentCardTeamBadges;
