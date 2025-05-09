// src/features/project/components/table/ProjectTable.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { Button } from '../../../../shared/components/ui';
import { Card } from '../../../../shared/components/ui/card/Card';
import { Pagination } from '../../../../shared/components/ui/pagination/Pagination';
import { fetchProjectDetail } from '../../store/projectStoreActions';

// 컴포넌트

const COLUMNS = [
  { key: 'id', title: 'ID', align: 'left' },
  { key: 'customer', title: '고객사', align: 'left' },
  { key: 'name', title: '프로젝트명', align: 'left' },
  // { key: 'risk', title: '위험도', align: 'left' },
  { key: 'importanceLevel', title: '중요도', align: 'center' },
  { key: 'service', title: '서비스', align: 'center' },
  { key: 'pjtStatus', title: '상태', align: 'center' },
  { key: 'progress', title: '진행률', align: 'center' },
  // { key: 'tag', title: '시작일', align: 'center' },
  { key: 'planEndDate', title: '완료(예정)일', align: 'center' },
  { key: 'lastDate', title: '최근작업일', align: 'center' },
  { key: 'workCount', title: '작업시간', align: 'center' },
  { key: 'action', title: 'Action', align: 'center' },
];

// 테이블 로딩 상태 컴포넌트
const TableLoadingIndicator = ({ columnsCount }) => {
  return (
    <tr>
      <td colSpan={columnsCount} className="py-8">
        <div className="flex items-center justify-center gap-3">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-500">
            데이터를 불러오는 중입니다...
          </span>
        </div>
      </td>
    </tr>
  );
};

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

// 테이블 에러 상태 컴포넌트
const TableErrorState = ({ columnsCount, message }) => {
  return (
    <tr>
      <td colSpan={columnsCount} className="py-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <span className="text-sm text-red-500">
            {message || '데이터를 불러오는 중 오류가 발생했습니다'}
          </span>
        </div>
      </td>
    </tr>
  );
};

// 테이블 행 컴포넌트
const TableRow = ({
  item,
  index,
  pageSize,
  currentPage,
  loadProjectDetail,
}) => {
  const dispatch = useDispatch();
  const actualIndex = (currentPage - 1) * pageSize + index + 1;

  // 프로젝트 상세정보 조회 핸들러
  const handleViewDetail = () => {
    loadProjectDetail(item.id);
  };

  // business_type 표시를 위한 헬퍼 함수
  const formatBusinessType = (types) => {
    if (!Array.isArray(types) || types.length === 0) return '-';

    if (types.length === 1) {
      return types[0].name;
    }

    // 첫 번째 항목 + 추가 항목 수
    return `${types[0].name} +${types.length - 1}`;
  };

  // funnel 표시를 위한 헬퍼 함수
  const getNameFromArray = (arrayData) => {
    if (!Array.isArray(arrayData) || arrayData.length === 0) return '-';
    return arrayData.map((item) => item.name).join(', ');
  };

  // 일반적인 값 포맷팅을 위한 헬퍼 함수
  const formatValue = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);
    return '-';
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-2 text-center text-sm">{item.id}</td>
      <td className="px-3 py-2 text-center text-sm">
        {item?.sfa?.customer?.name || item?.customer?.name || '-'}
      </td>
      <td className="px-3 py-2 text-sm">{item.name || '-'}</td>
      <td className="px-3 py-2 text-center text-sm">
        {item?.importanceLevel?.name}
      </td>
      <td className="px-3 py-2 text-center text-sm">{item?.service?.name}</td>
      <td className="px-3 py-2 text-center text-sm">{item?.pjtStatus?.name}</td>
      <td className="px-3 py-2 text-center text-sm">{'계산'}</td>
      <td className="px-3 py-2 text-center text-sm">
        {item?.planEndDate || '-'}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {item?.lastWorkupdateDate}
      </td>
      <td className="px-3 py-2 text-center text-sm">{'계산'}</td>
      <td className="px-3 py-2 text-center">
        <Button variant="outline" size="sm" onClick={handleViewDetail}>
          View
        </Button>
      </td>
    </tr>
  );
};

const ProjectList = ({
  items,
  pagination,
  filters,
  loading,
  error,
  handlePageChange,
  handlePageSizeChange,
  loadProjectDetail,
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
            {loading ? (
              <TableLoadingIndicator columnsCount={COLUMNS.length} />
            ) : error ? (
              <TableErrorState columnsCount={COLUMNS.length} message={error} />
            ) : !items?.length ? (
              <TableEmptyState columnsCount={COLUMNS.length} />
            ) : (
              items.map((item, index) => (
                <TableRow
                  key={item.id}
                  item={item}
                  index={index}
                  pageSize={pagination.pageSize}
                  currentPage={pagination.current}
                  loadProjectDetail={loadProjectDetail}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && items?.length > 0 && (
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

export default ProjectList;
