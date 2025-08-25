// src/features/project/components/table/ProjectTable.jsx
import React from 'react';
import { Button } from '../../../../shared/components/ui';
import { Pagination } from '../../../../shared/components/ui/pagination/Pagination';

// 테이블 컬럼 정의
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

// 테이블 헤더 컴포넌트
const TableHeader = () => (
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
);

// 객체를 문자열로 변환하는 유틸리티 함수
const getDisplayValue = (value) => {
  if (!value) return '-';
  if (typeof value === 'object') {
    if (value.name) return value.name;
    if (value.id) return value.id;
    if (value.documentId) return value.documentId;
    return '-';
  }
  return String(value);
};

// 테이블 행 컴포넌트
const TableRow = ({ item, index }) => {
  if (!item) return null;

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-2 text-center text-sm">{index + 1}</td>
      <td className="px-3 py-2 text-center text-sm">
        {getDisplayValue(item.id)}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {getDisplayValue(item.projectTask)}
      </td>
      <td className="px-3 py-2 text-sm">
        {getDisplayValue(item.taskProgress)}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {getDisplayValue(item.user.username)}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {getDisplayValue(item.workDate)}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {getDisplayValue(item.workHours)}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {getDisplayValue(item.nonBillableHours)}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {getDisplayValue(item.revisionNumber)}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {getDisplayValue(item.team)}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {getDisplayValue(item.notes)}
      </td>
      <td className="px-3 py-2 text-center">
        <Button variant="outline" size="sm">
          View
        </Button>
      </td>
    </tr>
  );
};

// 테이블 본문 컴포넌트
const TableBody = ({ items }) => {
  if (!Array.isArray(items)) {
    console.error('TableBody: items is not an array', items);
    return null;
  }

  return (
    <tbody className="divide-y divide-gray-200">
      {items.map((item, index) => (
        <TableRow key={item?.id || index} item={item} index={index} />
      ))}
    </tbody>
  );
};

// 페이지네이션 컴포넌트
const TablePagination = ({ pagination, actions }) => (
  <Pagination
    current={pagination.current}
    pageSize={pagination.pageSize}
    total={pagination.total}
    onPageChange={actions.pagination.setPage}
    onPageSizeChange={actions.pagination.setPageSize}
  />
);

/**
 * 프로젝트 작업 목록 테이블 컴포넌트
 */
const ProjectWorkList = ({ items, pagination, actions }) => {
  if (!Array.isArray(items)) {
    console.error('ProjectWorkList: items is not an array', items);
    return null;
  }

  return (
    <div className="w-full">
      <div className="overflow-x-auto">
        <table className="w-full">
          <TableHeader />
          <TableBody items={items} />
        </table>
      </div>
      <TablePagination pagination={pagination} actions={actions} />
    </div>
  );
};

export default ProjectWorkList;
