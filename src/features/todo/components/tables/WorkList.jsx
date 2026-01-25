// src/features/todo/components/tables/WorkList.jsx
import React from 'react';
import { Button, TableColumnMenu } from '@shared/components/ui';
import { Card } from '@shared/components/ui';
import { Pagination } from '@shared/components/ui/pagination/Pagination';
import { useTableColumns } from '@shared/hooks/useTableColumns';

// 컴포넌트

const COLUMNS = [
  { key: 'no', title: 'NO', align: 'left', essential: true },
  { key: 'id', title: 'ID', align: 'left', essential: true },
  { key: 'project', title: '프로젝트', align: 'left', essential: true },
  { key: 'projectTask', title: '작업명', align: 'left', essential: true },
  { key: 'taskProgress', title: '작업진행률', align: 'left' },
  { key: 'user', title: '담당자', align: 'left' },
  { key: 'workDate', title: '작업일', align: 'left', essential: true },
  { key: 'workHours', title: '작업시간', align: 'center' },
  { key: 'nonBillableHours', title: '기타시간', align: 'center' },
  { key: 'revision_number', title: '수정횟수', align: 'center' },
  { key: 'team', title: '사업부', align: 'center' },
  { key: 'note', title: 'note', align: 'center' },
  { key: 'action', title: 'Action', align: 'center', essential: true },
];

const DEFAULT_VISIBLE_COLUMNS = [
  'no',
  'id',
  'project',
  'projectTask',
  'taskProgress',
  'user',
  'workDate',
  'workHours',
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
const TableRow = ({ item, index, pageSize, currentPage, visibleColumns }) => {
  const isColumnVisible = (key) => visibleColumns.includes(key);

  const renderCell = (key) => {
    switch (key) {
      case 'no':
        return index + 1;
      case 'id':
        return item.id;
      case 'project':
        return item?.projectTask?.project?.name || '-';
      case 'projectTask':
        return item?.projectTask?.name || '-';
      case 'taskProgress':
        return typeof item?.taskProgress === 'object'
          ? item?.taskProgress?.name || '-'
          : item?.taskProgress || '-';
      case 'user':
        return typeof item?.user === 'object'
          ? item?.user?.username || '-'
          : item?.user || '-';
      case 'workDate':
        return item?.workDate || '-';
      case 'workHours':
        return item?.workHours || '-';
      case 'nonBillableHours':
        return item?.nonBillableHours || '-';
      case 'revision_number':
        return item?.revisionNumber ?? '-';
      case 'team':
        return typeof item?.team === 'object'
          ? item?.team?.name || '-'
          : item?.team || '-';
      case 'note':
        return item?.notes || '-';
      case 'action':
        return (
          <Button variant="outline" size="sm">
            View
          </Button>
        );
      default:
        return '-';
    }
  };

  return (
    <tr className="hover:bg-gray-50">
      {COLUMNS.filter((col) => isColumnVisible(col.key)).map((col) => (
        <td
          key={col.key}
          className={`px-3 py-2 text-sm ${
            col.align === 'center' ? 'text-center' : 'text-left'
          }`}
        >
          {renderCell(col.key)}
        </td>
      ))}
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
}) => {
  const { visibleColumns, toggleColumn, resetColumns, showAllColumns } =
    useTableColumns(DEFAULT_VISIBLE_COLUMNS);

  const isColumnVisible = (key) => visibleColumns.includes(key);

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200">
              {COLUMNS.filter((col) => isColumnVisible(col.key)).map((column) => (
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
                        essentialColumns={['no', 'id', 'project', 'projectTask', 'workDate', 'action']}
                        defaultVisibleColumns={DEFAULT_VISIBLE_COLUMNS}
                      />
                    </div>
                  ) : (
                    column.title
                  )}
                </th>
              ))}
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
