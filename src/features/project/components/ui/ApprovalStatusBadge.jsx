import React from 'react';
import PropTypes from 'prop-types';

/**
 * 승인 상태 배지 컴포넌트
 * (대기/승인/거부 상태 표시)
 */
const ApprovalStatusBadge = ({ status }) => {
  const config = {
    pending: { letter: '대기', label: '승인 대기', className: 'bg-yellow-400 text-white' },
    approved: { letter: '승인', label: '승인 완료', className: 'bg-green-500 text-white' },
    rejected: { letter: '거부', label: '거부됨', className: 'bg-red-500 text-white' },
  };

  if (!status || !config[status]) return null;

  const { letter, label, className } = config[status];

  return (
    <div
      className={`flex items-center justify-center px-2 h-6 text-[10px] font-bold rounded ${className}`}
      title={label}
    >
      {letter}
    </div>
  );
};

ApprovalStatusBadge.propTypes = {
  status: PropTypes.oneOf(['pending', 'approved', 'rejected', null]),
};

export default ApprovalStatusBadge;
