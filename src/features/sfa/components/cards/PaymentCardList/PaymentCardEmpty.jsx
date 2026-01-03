/**
 * 결제매출 없음 상태 컴포넌트
 */
import React from 'react';
import PropTypes from 'prop-types';

const PaymentCardEmpty = ({ message = '등록된 결제매출이 없습니다.' }) => {
  return (
    <div className="text-center py-8 text-gray-500">
      {message}
    </div>
  );
};

PaymentCardEmpty.propTypes = {
  message: PropTypes.string,
};

export default PaymentCardEmpty;
