// src/features/work/components/table/WorkList.jsx
import React from 'react';
import { Button } from '@shared/components/ui';
import { Card } from '@shared/components/ui/card/Card';
import { Pagination } from '@shared/components/ui/pagination/Pagination';

// 컴포넌트

const COLUMNS = [
  { key: 'no', title: 'NO', align: 'left' },
  { key: 'id', title: 'ID', align: 'left' },
  { key: 'projectTask', title: '작업명', align: 'left' },
  { key: 'taskProgress', title: '작업진행률', align: 'left' },
  { key: 'user', title: '담당자', align: 'left' },
  { key: 'workDate', title: '작업일', align: 'left' },
  { key: 'workHours', title: '작업시간', align: 'center' },
  { key: 'nonBillableHours', title: '기타시간', align: 'center' },
  { key: 'revision_number', title: '수정횟수', align: 'center' },
  { key: 'team', title: '사업부', align: 'center' },
  { key: 'note', title: 'note', align: 'center' },
  { key: 'action', title: 'Action', align: 'center' },
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
const TableRow = ({ item, index, pageSize, currentPage }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-2 text-center text-sm">{index + 1}</td>
      <td className="px-3 py-2 text-center text-sm">{item.id}</td>
      <td className="px-3 py-2 text-center text-sm">
        {item?.projectTask?.name || '-'}
      </td>
      <td className="px-3 py-2 text-sm">
        {typeof item?.taskProgress === 'object'
          ? item?.taskProgress?.name || '-'
          : item?.taskProgress || '-'}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {typeof item?.user === 'object'
          ? item?.user?.username || '-'
          : item?.user || '-'}
      </td>
      <td className="px-3 py-2 text-center text-sm">{item?.workDate || '-'}</td>
      <td className="px-3 py-2 text-center text-sm">
        {item?.workHours || '-'}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {item?.nonBillableHours || '-'}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {item?.revisionNumber ?? '-'}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {typeof item?.team === 'object'
          ? item?.team?.name || '-'
          : item?.team || '-'}
      </td>
      <td className="px-3 py-2 text-center text-sm">{item?.notes || '-'}</td>
      <td className="px-3 py-2 text-center">
        <Button variant="outline" size="sm">
          View
        </Button>
      </td>
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
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-y border-gray-200">
              {COLUMNS.map((column) => (
                <th
                  key={column.key}
                  className={`px-3 py-2 text-sm font-semibold text-gray-700 whitespace-nowrap
                    ${column.align === 'center' && 'text-center'}
                    ${column.align === 'right' && 'text-right'}
                  `}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {!items?.length ? (
              <TableEmptyState columnsCount={COLUMNS.length} />
            ) : (
              items.map((item, index) => (
                <TableRow
                  key={item.id}
                  item={item}
                  index={index}
                  pageSize={pagination.pageSize}
                  currentPage={pagination.current}
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
