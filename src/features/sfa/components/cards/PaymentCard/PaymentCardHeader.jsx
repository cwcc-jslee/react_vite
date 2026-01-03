/**
 * PaymentCard 헤더 컴포넌트
 * - ID 표시 (좁은 폭, 고정)
 */
import React from 'react';
import PropTypes from 'prop-types';

const PaymentCardHeader = ({ id }) => {
  return (
    <div className="w-16 flex-shrink-0">
      <span className="text-xs text-gray-500">ID</span>
      <p className="text-sm font-medium">{id}</p>
    </div>
  );
};

PaymentCardHeader.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export default PaymentCardHeader;
