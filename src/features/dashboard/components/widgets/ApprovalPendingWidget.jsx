// src/features/dashboard/components/widgets/ApprovalPendingWidget.jsx
/**
 * 승인 대기 위젯
 * - 승인 대기 목록 표시
 * - 클릭 시 상세 Drawer 열림
 */

import React, { useState } from 'react';
import { Clock, RefreshCw, ChevronRight } from 'lucide-react';
import { useApprovalPending } from '../../hooks/useApprovalPending';
import ApprovalCard from '../approval/ApprovalCard';
import ApprovalDetailDrawer from '../approval/ApprovalDetailDrawer';
import { TRANSITION_CLASSES } from '../../constants/approvalStyleConstants';

const ApprovalPendingWidget = () => {
  const { approvals, total, isLoading, refetch } = useApprovalPending();
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleApprovalClick = (approval) => {
    setSelectedApproval(approval);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
    setSelectedApproval(null);
  };

  const handleRefresh = () => {
    refetch();
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 bg-orange-100 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-gray-900">승인 대기</h3>
              <p className="text-xs text-gray-500 mt-0.5">처리가 필요한 항목</p>
            </div>
            {total > 0 && (
              <span className="px-2.5 py-1 text-xs font-semibold bg-orange-100 text-orange-700 rounded-full">
                {total}
              </span>
            )}
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className={`
              p-2.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100
              ${TRANSITION_CLASSES.fast}
              disabled:opacity-50 disabled:cursor-not-allowed
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-300
            `}
            title="새로고침"
            aria-label="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* 승인 대기 목록 */}
        <div className="p-4 space-y-3">
          {isLoading && approvals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm text-gray-500">로딩 중...</p>
            </div>
          ) : approvals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">승인 대기 중인 항목이 없습니다.</p>
              <p className="text-xs text-gray-400 mt-1">새로운 요청이 들어오면 여기에 표시됩니다.</p>
            </div>
          ) : (
            approvals.slice(0, 5).map((approval) => (
              <ApprovalCard
                key={approval.id}
                approval={approval}
                onClick={() => handleApprovalClick(approval)}
              />
            ))
          )}
        </div>

        {/* 더보기 */}
        {total > 5 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button
              className={`
                w-full flex items-center justify-center gap-1.5
                text-sm text-blue-600 hover:text-blue-700 font-medium
                py-2 rounded-lg hover:bg-blue-50
                ${TRANSITION_CLASSES.fast}
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300
              `}
            >
              전체 보기 ({total})
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* 승인 상세 Drawer */}
      {isDrawerOpen && selectedApproval && (
        <ApprovalDetailDrawer
          approval={selectedApproval}
          onClose={handleDrawerClose}
        />
      )}
    </>
  );
};

export default ApprovalPendingWidget;
