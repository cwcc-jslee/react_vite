// src/features/contact/components/table/ContactTable.jsx
import React from 'react';
import { useContact } from '../../context/ContactProvider';
import { Button } from '../../../../shared/components/ui';
import { Card } from '../../../../shared/components/ui/card/Card';
import { StateDisplay } from '../../../../shared/components/ui/state/StateDisplay';
import { Pagination } from '../../../../shared/components/ui/pagination/Pagination';

const COLUMNS = [
  { key: 'name', title: '유형', align: 'left' }, // 고객,파트너, 공급업체, 자문위원 등
  { key: 'name1', title: '이름', align: 'left' },
  { key: 'funnel', title: '회사명', align: 'center' },
  { key: 'region', title: '직위', align: 'center' },
  { key: 'city', title: '부서', align: 'center' },
  { key: 'business_item', title: '휴대폰번호', align: 'center' },
  { key: 'business_type', title: '이메일', align: 'center' },
  { key: 'createdAt', title: '등록일', align: 'center' },
  { key: 'action', title: 'Action', align: 'center' },
];

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

const TableRow = ({ item, index, pageSize, currentPage }) => {
  const actualIndex = (currentPage - 1) * pageSize + index + 1;
  const { fetchContactDetail } = useContact();

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
        {formatValue(item?.co_classification?.name)}
      </td>
      <td className="px-3 py-2 text-sm">{item.name || '-'}</td>
      <td className="px-3 py-2 text-center text-sm">
        {formatBusinessType(item.business_type)}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {formatValue(item.business_item)}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {formatValue(item.region)}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {formatValue(item.city)}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {getNameFromArray(item.funnel)}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {item?.createdAt
          ? new Date(item.createdAt).toLocaleDateString('ko-KR')
          : '-'}
      </td>
      <td className="px-3 py-2 text-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchContactDetail(item.id)}
        >
          View
        </Button>
      </td>
    </tr>
  );
};

const ContactTable = () => {
  const { fetchData, loading, error, pagination, setPage, setPageSize } =
    useContact();

  console.log(`ContactTable's fetchData : `, fetchData);

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
            ) : !fetchData?.length ? (
              <TableEmptyState columnsCount={COLUMNS.length} />
            ) : (
              fetchData.map((item, index) => (
                <TableRow
                  key={item.id}
                  item={item}
                  index={item.id}
                  pageSize={pagination.pageSize}
                  currentPage={pagination.current}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && !error && fetchData?.length > 0 && (
        <Pagination
          current={pagination.current}
          pageSize={pagination.pageSize}
          total={pagination.total}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
        />
      )}
    </Card>
  );
};

export default ContactTable;
