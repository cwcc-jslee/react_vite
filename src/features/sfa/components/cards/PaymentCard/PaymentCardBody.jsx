/**
 * PaymentCard 본문 컴포넌트
 * - Grid 레이아웃 (6열)
 * - 매출처, 빌링타입, 매출액, 매출인식일, 확정여부, 확률 표시
 */
import React from 'react';
import PropTypes from 'prop-types';
import { ConfirmedBadge, ProbabilityBadge } from '../shared';

const PaymentCardBody = ({ payment }) => {
  return (
    <div className="flex-1 grid grid-cols-6 gap-4">
      {/* 매출처 */}
      <div>
        <span className="block text-xs text-gray-500 mb-0.5">매출처</span>
        <p className="text-sm font-medium">
          {payment.revenueSource?.name || '-'}
        </p>
      </div>

      {/* 빌링타입 */}
      <div>
        <span className="block text-xs text-gray-500 mb-0.5">빌링타입</span>
        <p className="text-sm">{payment.billingType || '-'}</p>
      </div>

      {/* 매출액 */}
      <div>
        <span className="block text-xs text-gray-500 mb-0.5">매출액</span>
        <p className="text-sm font-medium">
          {payment.amount?.toLocaleString() || 0}원
        </p>
      </div>

      {/* 매출인식일 */}
      <div>
        <span className="block text-xs text-gray-500 mb-0.5">매출인식일</span>
        <p className="text-sm">{payment.recognitionDate || '-'}</p>
      </div>

      {/* 확정여부 */}
      <div>
        <span className="block text-xs text-gray-500 mb-0.5">확정여부</span>
        <div className="mt-0.5">
          <ConfirmedBadge isConfirmed={payment.isConfirmed} />
        </div>
      </div>

      {/* 확률 */}
      <div>
        <span className="block text-xs text-gray-500 mb-0.5">확률</span>
        <div className="mt-0.5">
          <ProbabilityBadge probability={payment.probability || 0} />
        </div>
      </div>
    </div>
  );
};

PaymentCardBody.propTypes = {
  payment: PropTypes.shape({
    revenueSource: PropTypes.shape({
      name: PropTypes.string,
    }),
    billingType: PropTypes.string,
    amount: PropTypes.number,
    recognitionDate: PropTypes.string,
    isConfirmed: PropTypes.bool,
    probability: PropTypes.number,
  }).isRequired,
};

export default PaymentCardBody;
