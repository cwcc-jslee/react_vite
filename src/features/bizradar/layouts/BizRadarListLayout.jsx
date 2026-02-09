/**
 * BizRadar 목록 레이아웃 (Enhanced)
 * 필터바 + 뷰 전환 + 테이블/카드 뷰 + 일괄 작업
 */
import React, { useState } from 'react';
import { FaTable, FaTh } from 'react-icons/fa';
import BizRadarFilterBar from '../components/filters/BizRadarFilterBar';
import BizRadarListTable from '../components/tables/BizRadarListTable';
import BizRadarCardView from '../components/cards/BizRadarCardView';
import BulkActionBar from '../components/actions/BulkActionBar';
import { useBizRadarStore } from '../hooks/useBizRadarStore';

const BizRadarListLayout = () => {
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'card'
  const [selectedIds, setSelectedIds] = useState([]);
  const { items, actions } = useBizRadarStore();

  // 선택 토글
  const handleToggleSelection = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // 전체 선택/해제
  const handleToggleAll = () => {
    if (selectedIds.length === items?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items?.map((item) => item.id) || []);
    }
  };

  // 선택 해제
  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  // 엑셀 내보내기
  const handleExport = async (ids) => {
    try {
      // 선택된 항목만 필터링
      const selectedItems = items.filter((item) => ids.includes(item.id));

      // CSV 형식으로 변환
      const headers = ['ID', '공고명', '출처', '유형', '지역', '마감일', '요약'];
      const rows = selectedItems.map((item) => [
        item.id,
        item.title,
        item.source,
        item.confirmedCategory || item.confirmed_category,
        item.region || '',
        item.endDate || item.end_date || '',
        item.summary || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
      ].join('\n');

      // BOM 추가 (한글 깨짐 방지)
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `bizradar_export_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      alert(`${selectedItems.length}개 항목을 내보냈습니다.`);
      handleClearSelection();
    } catch (err) {
      console.error('Export failed:', err);
      alert('내보내기 중 오류가 발생했습니다.');
    }
  };

  // 일괄 업데이트
  const handleBulkUpdate = async (ids, data) => {
    try {
      // 각 항목을 순차적으로 업데이트
      for (const id of ids) {
        await actions.data.update(id, data);
      }
      alert(`${ids.length}개 항목이 업데이트되었습니다.`);
      handleClearSelection();
      // 목록 새로고침
      actions.data.fetchList();
    } catch (err) {
      console.error('Bulk update failed:', err);
      alert('일괄 업데이트 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-4">
      {/* 필터 바 */}
      <BizRadarFilterBar />

      {/* 뷰 전환 버튼 */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
        <div className="text-sm text-gray-600">
          {items?.length || 0}개 항목
          {selectedIds.length > 0 && ` (${selectedIds.length}개 선택됨)`}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'table'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <FaTable className="h-4 w-4" />
            테이블
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${viewMode === 'card'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <FaTh className="h-4 w-4" />
            카드
          </button>
        </div>
      </div>

      {/* 일괄 작업 바 */}
      <BulkActionBar
        selectedCount={selectedIds.length}
        selectedIds={selectedIds}
        onExport={handleExport}
        onBulkUpdate={handleBulkUpdate}
        onClearSelection={handleClearSelection}
      />

      {/* 목록 (테이블 또는 카드) */}
      {viewMode === 'table' ? (
        <BizRadarListTable
          selectedIds={selectedIds}
          onSelect={handleToggleSelection}
          onSelectAll={handleToggleAll}
        />
      ) : (
        <BizRadarCardView
          selectedIds={selectedIds}
          onSelect={handleToggleSelection}
        />
      )}
    </div>
  );
};

export default BizRadarListLayout;
