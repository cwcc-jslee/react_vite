/**
 * 결제매출 로딩 스켈레톤 컴포넌트
 */
import React from 'react';
import PropTypes from 'prop-types';

const PaymentCardSkeleton = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border-l-4 border-gray-200 p-4 animate-pulse"
        >
          <div className="flex items-center gap-4">
            {/* ID 영역 */}
            <div className="w-16 flex-shrink-0">
              <div className="h-3 bg-gray-200 rounded w-8 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-12"></div>
            </div>

            {/* 본문 영역 (Grid 6열) */}
            <div className="flex-1 grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i}>
                  <div className="h-3 bg-gray-200 rounded w-12 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                </div>
              ))}
            </div>

            {/* 액션 버튼 영역 */}
            <div className="flex gap-2 flex-shrink-0">
              <div className="h-9 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

PaymentCardSkeleton.propTypes = {
  count: PropTypes.number,
};

export default PaymentCardSkeleton;
