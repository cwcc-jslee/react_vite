// src/features/work/components/table/WorkList.jsx
import React from 'react';
import { Button, TableColumnMenu } from '@shared/components/ui';
import { Card } from '@shared/components/ui/card/Card';
import { Pagination } from '@shared/components/ui/pagination/Pagination';
import { useTableColumns } from '@shared/hooks/useTableColumns';

// 컴포넌트

const COLUMNS = [
  { key: 'no', title: 'NO', align: 'left', essential: true },
  { key: 'id', title: 'ID', align: 'left' },
  { key: 'projectTask', title: '작업명', align: 'left', essential: true },
  { key: 'taskProgress', title: '작업진행률', align: 'left' },
  { key: 'user', title: '담당자', align: 'left' },
  { key: 'workDate', title: '작업일', align: 'left', essential: true },
  { key: 'workHours', title: '작업시간', align: 'center', essential: true },
  { key: 'nonBillableHours', title: '기타시간', align: 'center' },
  { key: 'revision_number', title: '수정횟수', align: 'center' },
  { key: 'team', title: '사업부', align: 'center' },
  { key: 'note', title: 'note', align: 'center' },
  { key: 'action', title: 'Action', align: 'center', essential: true },
];

const DEFAULT_COLUMNS_XL = [
  'no',
  'id',
  'projectTask',
  'taskProgress',
  'user',
  'workDate',
  'workHours',
  'team',
  'action',
];

const DEFAULT_COLUMNS_WIDE = [
  'no',
  'id',
  'projectTask',
  'taskProgress',
  'user',
  'workDate',
  'workHours',
  'nonBillableHours',
  'revision_number',
  'team',
  'note',
  'action',
];

// 테이블 빈 상태 컴포넌트
const TableEmptyState = ({ columnsCount }) => {
  return (
    <tr>
      <td colSpan={columnsCount} className="py-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-sm text-gray-500">데이터가 없습니다</span>
        </div>
      </td>
    </tr>
  );
};

// 테이블 행 컴포넌트
const TableRow = ({ item, index, visibleColumns }) => {
  const isColumnVisible = (key) => visibleColumns.includes(key);

  return (
    <tr className="hover:bg-gray-50">
      {isColumnVisible('no') && (
        <td className="px-3 py-2 text-center text-sm">{index + 1}</td>
      )}
      {isColumnVisible('id') && (
        <td className="px-3 py-2 text-center text-sm">{item.id}</td>
      )}
      {isColumnVisible('projectTask') && (
        <td className="px-3 py-2 text-center text-sm">
          {item?.projectTask?.name || '-'}
        </td>
      )}
      {isColumnVisible('taskProgress') && (
        <td className="px-3 py-2 text-sm">
          {typeof item?.taskProgress === 'object'
            ? item?.taskProgress?.name || '-'
            : item?.taskProgress || '-'}
        </td>
      )}
      {isColumnVisible('user') && (
        <td className="px-3 py-2 text-center text-sm">
          {typeof item?.user === 'object'
            ? item?.user?.username || '-'
            : item?.user || '-'}
        </td>
      )}
      {isColumnVisible('workDate') && (
        <td className="px-3 py-2 text-center text-sm">
          {item?.workDate || '-'}
        </td>
      )}
      {isColumnVisible('workHours') && (
        <td className="px-3 py-2 text-center text-sm">
          {item?.workHours || '-'}
        </td>
      )}
      {isColumnVisible('nonBillableHours') && (
        <td className="px-3 py-2 text-center text-sm">
          {item?.nonBillableHours || '-'}
        </td>
      )}
      {isColumnVisible('revision_number') && (
        <td className="px-3 py-2 text-center text-sm">
          {item?.revisionNumber ?? '-'}
        </td>
      )}
      {isColumnVisible('team') && (
        <td className="px-3 py-2 text-center text-sm">
          {typeof item?.team === 'object'
            ? item?.team?.name || '-'
            : item?.team || '-'}
        </td>
      )}
      {isColumnVisible('note') && (
        <td className="px-3 py-2 text-center text-sm">{item?.notes || '-'}</td>
      )}
      {isColumnVisible('action') && (
        <td className="px-3 py-2 text-center">
          <Button variant="outline" size="sm">
            View
          </Button>
        </td>
      )}
    </tr>
  );
};

const WorkList = ({
  items,
  pagination,
  status,
  error,
  handlePageChange,
  handlePageSizeChange,
  isExpanded = false,
}) => {
  const { visibleColumns, toggleColumn, resetColumns, showAllColumns, setVisibleColumns } =
    useTableColumns(isExpanded ? DEFAULT_COLUMNS_WIDE : DEFAULT_COLUMNS_XL);

  // 확장 상태 변경 시 컬럼 자동 조정
  React.useEffect(() => {
    setVisibleColumns(isExpanded ? DEFAULT_COLUMNS_WIDE : DEFAULT_COLUMNS_XL);
  }, [isExpanded, setVisibleColumns]);

  const isColumnVisible = (key) => visibleColumns.includes(key);

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200">
              {COLUMNS.filter((col) => isColumnVisible(col.key)).map(
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
                        <TableColumnMenu
                          columns={COLUMNS}
                          visibleColumns={visibleColumns}
                          onToggleColumn={toggleColumn}
                          onReset={resetColumns}
                          onShowAll={showAllColumns}
                          essentialColumns={COLUMNS.filter(
                            (c) => c.essential,
                          ).map((c) => c.key)}
                          defaultVisibleColumns={isExpanded ? DEFAULT_COLUMNS_WIDE : DEFAULT_COLUMNS_XL}
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
            {!items?.length ? (
              <TableEmptyState columnsCount={visibleColumns.length} />
            ) : (
              items.map((item, index) => (
                <TableRow
                  key={item.id}
                  item={item}
                  index={index}
                  pageSize={pagination.pageSize}
                  currentPage={pagination.current}
                  visibleColumns={visibleColumns}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {items?.length > 0 && (
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}
    </Card>
  );
};

export default WorkList;
