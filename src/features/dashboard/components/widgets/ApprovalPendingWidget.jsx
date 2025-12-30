// src/features/dashboard/components/widgets/ApprovalPendingWidget.jsx
/**
 * 승인 대기 위젯
 * - 승인 대기 목록 표시
 * - 클릭 시 상세 Drawer 열림
 */

import React, { useState } from 'react';
import { Clock, RefreshCw } from 'lucide-react';
import { useApprovalPending } from '../../hooks/useApprovalPending';
import ApprovalCard from '../cards/ApprovalCard';
import ApprovalDetailDrawer from '../approval/ApprovalDetailDrawer';

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
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-semibold text-gray-900">승인 대기</h3>
            <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">
              {total}
            </span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-50"
            title="새로고침"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* 승인 대기 목록 */}
        <div className="space-y-3">
          {isLoading && approvals.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              로딩 중...
            </div>
          ) : approvals.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-500">
              승인 대기 중인 항목이 없습니다.
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
          <div className="mt-4 text-center">
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              전체 보기 ({total})
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
