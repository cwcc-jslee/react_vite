// src/features/contact/components/ExcelUpload/UploadProgressBar.jsx
/**
 * 담당자 대량 등록 진행 상황을 표시하는 컴포넌트
 */
import React from 'react';

const UploadProgressBar = ({ progress, stats }) => {
  // 진행률 계산 (0-100)
  const percentage = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium">업로드 진행 중...</span>
        <span className="text-sm font-medium">{percentage}%</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
        <div
          className="bg-blue-600 h-2.5 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>

      {stats && (
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {stats.processed} / {stats.total} 항목 처리됨
          </span>
          <span>
            성공: {stats.successCount} / 실패: {stats.failCount}
          </span>
        </div>
      )}
    </div>
  );
};

export default UploadProgressBar;
