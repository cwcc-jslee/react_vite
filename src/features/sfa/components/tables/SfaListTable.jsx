import React, { useEffect } from 'react';
import { useSfaStore } from '../../hooks/useSfaStore';
import { useUiStore } from '../../../../shared/hooks/useUiStore';
import { useSfaBulkUpdate } from '../../hooks/useSfaBulkUpdate';
import { fetchSfaDetail } from '../../../../store/slices/sfaSlice';
import { useTableColumns } from '../../../../shared/hooks/useTableColumns';
import { Button, TableColumnMenu } from '../../../../shared/components/ui';
import { Card } from '../../../../shared/components/ui/card/Card';
import { StateDisplay } from '../../../../shared/components/ui/state/StateDisplay';
import { Pagination } from '../../../../shared/components/ui/pagination/Pagination';
import { truncateText } from '../../../../shared/utils/textUtils';
import SfaBulkActionMenu from './SfaBulkActionMenu';

const COLUMNS = [
  { key: 'no', title: 'No', align: 'center', essential: true },
  { key: 'confirmed', title: '확정여부', align: 'center', essential: true },
  { key: 'percentage', title: '확률', align: 'center', essential: true },
  { key: 'customer', title: '매출처', align: 'left' },
  { key: 'name', title: '건명', align: 'left', essential: true },
  { key: 'payment', title: '결제방법', align: 'center' },
  { key: 'classification', title: '매출구분', align: 'center' },
  { key: 'item', title: '매출품목', align: 'center' },
  { key: 'team', title: '사업부', align: 'center' },
  { key: 'revenue', title: '매출액', align: 'right', essential: true },
  { key: 'profit', title: '매출이익', align: 'right' },
  { key: 'date', title: '매출인식일', align: 'center' },
  { key: 'action', title: 'Action', align: 'center', essential: true },
];

// 기본적으로 표시할 컬럼 (필수 컬럼 + 기본 선택 컬럼)
const DEFAULT_VISIBLE_COLUMNS = [
  'no',
  'confirmed',
  'percentage',
  'customer',
  'name',
  'payment',
  'revenue',
  'profit',
  'date',
  'action',
];

/**
 * 텍스트가 길어질 경우 툴팁을 보여주는 셀 컴포넌트
 */
const TooltipCell = ({ text, subText, limit = 10 }) => {
  const displayText = subText ? `${text} / ${subText}` : text;
  const isLong = displayText && displayText.length > limit;

  if (!displayText) return '-';

  return (
    <div className="group relative">
      <span>{truncateText(displayText, limit)}</span>
      {isLong && (
        <div className="invisible group-hover:visible absolute bottom-full left-0 mb-1 z-10 p-2 bg-gray-800 text-white text-sm rounded shadow-lg whitespace-normal max-w-xs break-keep">
          {text}
          {subText && <div className="text-gray-300 text-xs mt-1">{subText}</div>}
        </div>
      )}
    </div>
  );
};

const TableRow = ({
  item,
  index,
  pageSize,
  currentPage,
  actions,
  uiActions,
  isCheckboxMode,
  checkedItems,
  onCheckChange,
  visibleColumns,
}) => {
  const isColumnVisible = (key) => visibleColumns.includes(key);
  const actualIndex = (currentPage - 1) * pageSize + index + 1;
  const sfaItemPrice = item.sfa?.sfa_item_price || [];

  const handleViewClick = async () => {
    try {
      // fetchSfaDetail 실행
      const resultAction = await actions.data.fetchSfaDetail(item.sfa.id);

      // fetchSfaDetail 성공 시 drawer 열기
      if (fetchSfaDetail.fulfilled.match(resultAction)) {
        uiActions.drawer.open({
          mode: 'view',
          data: resultAction.payload,
        });
      }
    } catch (error) {
      console.error('SFA 상세 조회 실패:', error);
    }
  };

  const handleCheckChange = (e) => {
    onCheckChange(item.id, e.target.checked);
  };

  // 컬럼별 렌더링 데이터 매핑
  const getCellContent = (columnKey) => {
    switch (columnKey) {
      case 'no':
        return actualIndex;
      case 'confirmed':
        return item.isConfirmed ? 'YES' : 'NO';
      case 'percentage':
        return item.probability || '-';
      case 'customer': {
        const revName = item?.revenueSource?.name;
        const custName = item?.sfa?.customer?.name;
        
        if (!revName) return '-';
        
        // 매출처와 고객사가 같으면 매출처만 표시
        if (revName === custName) {
          return <TooltipCell text={revName} limit={10} />;
        }
        // 다르면 둘 다 표시
        return <TooltipCell text={revName} subText={custName} limit={10} />;
      }
      case 'name': {
        const sfaName = item.sfa?.name;
        const paymentLabel = item.paymentLabel;
        const displayName = sfaName
          ? paymentLabel
            ? `${sfaName}_${paymentLabel}`
            : sfaName
          : '';
          
        return <TooltipCell text={displayName} limit={40} />;
      }
      case 'payment':
        return item.billingType || '-';
      case 'classification':
        return item.sfa?.sfaClassification?.name || '-';
      case 'item':
        return sfaItemPrice.map((item) => item.sfaItemName).join(', ') || '-';
      case 'team':
        return sfaItemPrice.map((item) => item.teamName).join(', ') || '-';
      case 'revenue':
        return new Intl.NumberFormat('ko-KR').format(item.amount);
      case 'profit':
        return new Intl.NumberFormat('ko-KR').format(item.profitAmount);
      case 'date':
        return item.recognitionDate;
      case 'action':
        return (
          <Button variant="outline" size="sm" onClick={handleViewClick}>
            View
          </Button>
        );
      default:
        return '-';
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      {isCheckboxMode && (
        <td className="px-3 py-2 text-center">
          <input
            type="checkbox"
            checked={checkedItems.includes(item.id)}
            onChange={handleCheckChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
        </td>
      )}
      {COLUMNS.filter((col) => isColumnVisible(col.key)).map((column) => (
        <td
          key={column.key}
          className={`px-3 py-2 text-sm ${
            column.align === 'center' && 'text-center'
          } ${column.align === 'right' && 'text-right font-mono'}`}
        >
          {getCellContent(column.key)}
        </td>
      ))}
    </tr>
  );
};

/**
 * SFA 매출 리스트 테이블 컴포넌트
 * 매출 데이터를 테이블 형태로 표시하고 일괄 수정 기능 제공
 *
 * @component
 */
const SfaListTable = () => {
  // SFA 데이터 관련 상태와 함수
  const { items, status, error, pagination, actions } = useSfaStore();
  const { actions: uiActions } = useUiStore();

  // ✅ 컬럼 표시 상태 관리 (공통 훅 사용)
  const { visibleColumns, toggleColumn, resetColumns, showAllColumns } =
    useTableColumns(DEFAULT_VISIBLE_COLUMNS);

  // 일괄 업데이트 훅 사용
  const {
    isCheckboxMode,
    checkedItems,
    bulkRecognitionDate,
    bulkProbability,
    bulkIsConfirmed,
    bulkUpdateType,
    isSubmitting,
    codebooks,
    isLoadingCodebook,
    setBulkRecognitionDate,
    setBulkProbability,
    setBulkIsConfirmed,
    handleBulkDateEdit,
    handleBulkProbabilityEdit,
    handleBulkIsConfirmedChange,
    handleCheckChange,
    handleSelectAll,
    handleCancelCheckboxMode,
    handleBulkSubmit,
  } = useSfaBulkUpdate();

  const loading = status === 'loading';

  if (loading) return <StateDisplay type="loading" />;
  if (error) return <StateDisplay type="error" message={error} />;
  if (!items?.length) return <StateDisplay type="empty" />;

  return (
    <Card>
      {isCheckboxMode && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-800">
                {bulkUpdateType === 'date'
                  ? '매출일 일괄수정 모드'
                  : '확률 일괄수정 모드'}
              </span>
              <span className="text-sm text-blue-600">
                선택된 항목: {checkedItems.length}개
              </span>
            </div>

            {checkedItems.length > 0 && (
              <div className="flex items-center gap-3">
                {bulkUpdateType === 'date' ? (
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="bulkRecognitionDate"
                      className="text-sm font-medium text-gray-700"
                    >
                      매출인식일:
                    </label>
                    <input
                      id="bulkRecognitionDate"
                      type="date"
                      value={bulkRecognitionDate}
                      onChange={(e) => setBulkRecognitionDate(e.target.value)}
                      className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="bulkIsConfirmed"
                        checked={bulkIsConfirmed}
                        onChange={(e) =>
                          handleBulkIsConfirmedChange(e.target.checked)
                        }
                        disabled={isSubmitting}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                      />
                      <label
                        htmlFor="bulkIsConfirmed"
                        className="text-sm font-medium text-gray-700"
                      >
                        확정여부
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="bulkProbability"
                        className="text-sm font-medium text-gray-700"
                      >
                        매출확률:
                      </label>
                      <select
                        id="bulkProbability"
                        value={bulkProbability}
                        onChange={(e) => setBulkProbability(e.target.value)}
                        className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={
                          isSubmitting || bulkIsConfirmed || isLoadingCodebook
                        }
                      >
                        <option value="">매출확률 선택</option>
                        {codebooks?.sfaPercentage?.map((percent) => (
                          <option key={percent.id} value={percent.code}>
                            {percent.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleBulkSubmit}
                  disabled={
                    (bulkUpdateType === 'date' && !bulkRecognitionDate) ||
                    (bulkUpdateType === 'probability' &&
                      !bulkIsConfirmed &&
                      !bulkProbability) ||
                    isSubmitting
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSubmitting ? '처리중...' : '적용'}
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleCancelCheckboxMode}
              className="text-red-600 border-red-300 hover:bg-red-50"
              disabled={isSubmitting}
            >
              취소
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200">
              {isCheckboxMode && (
                <th className="px-3 py-2 text-sm font-semibold text-gray-700">
                  <input
                    type="checkbox"
                    checked={
                      checkedItems.length === items.length && items.length > 0
                    }
                    onChange={(e) => handleSelectAll(e, items)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </th>
              )}
              {COLUMNS.filter((col) => visibleColumns.includes(col.key)).map(
                (column) => (
                  <th
                    key={column.key}
                    className={`px-3 py-2 text-sm font-semibold text-gray-700 whitespace-nowrap
                    ${column.align === 'center' && 'text-center'}
                    ${column.align === 'right' && 'text-right'}
                  `}
                  >
                    {column.key === 'action' ? (
                      <div className="flex items-center justify-center gap-1">
                        {/* 일괄수정 메뉴 컴포넌트 */}
                        <SfaBulkActionMenu 
                          onEditDate={handleBulkDateEdit}
                          onEditProbability={handleBulkProbabilityEdit}
                        />

                        {/* 설정 아이콘 - 컬럼 토글 (공통 컴포넌트 사용) */}
                        <TableColumnMenu
                          columns={COLUMNS}
                          visibleColumns={visibleColumns}
                          onToggleColumn={toggleColumn}
                          onReset={resetColumns}
                          onShowAll={showAllColumns}
                          essentialColumns={[
                            'no',
                            'confirmed',
                            'percentage',
                            'name',
                            'revenue',
                            'action',
                          ]}
                          defaultVisibleColumns={DEFAULT_VISIBLE_COLUMNS}
                        />
                      </div>
                    ) : (
                      column.title
                    )}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.map((item, index) => (
              <TableRow
                key={item.id}
                item={item}
                index={index}
                pageSize={pagination.pageSize}
                currentPage={pagination.current}
                actions={actions}
                uiActions={uiActions}
                isCheckboxMode={isCheckboxMode}
                checkedItems={checkedItems}
                onCheckChange={handleCheckChange}
                visibleColumns={visibleColumns}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onPageChange={actions.pagination.setPage}
        onPageSizeChange={actions.pagination.setPageSize}
      />
    </Card>
  );
};

export default SfaListTable;