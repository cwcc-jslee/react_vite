// src/features/sfa/components/table/SfaTable.jsx
import React from 'react';
import { useSfa } from '../../context/SfaContext';
import { Button } from '../../../../shared/components/ui';
import { Card } from '../../../../shared/components/ui/card/Card';
import { StateDisplay } from '../../../../shared/components/ui/state/StateDisplay';
import { Pagination } from '../../../../shared/components/ui/pagination/Pagination';

const COLUMNS = [
  { key: 'no', title: 'No', align: 'center' },
  { key: 'confirmed', title: '확정여부', align: 'center' },
  { key: 'percentage', title: '확률', align: 'center' },
  { key: 'customer', title: '고객사/매출처', align: 'left' },
  { key: 'name', title: '건명', align: 'left' },
  { key: 'payment', title: '결제방법', align: 'center' },
  { key: 'classification', title: '매출구분', align: 'center' },
  { key: 'item', title: '매출품목', align: 'center' },
  { key: 'team', title: '사업부', align: 'center' },
  { key: 'revenue', title: '매출액', align: 'right' },
  { key: 'profit', title: '매출이익', align: 'right' },
  { key: 'date', title: '매출인식일', align: 'center' },
  { key: 'action', title: 'Action', align: 'center' },
];

const TableRow = ({ item, index, pageSize, currentPage }) => {
  const actualIndex = (currentPage - 1) * pageSize + index + 1;
  const sfaItemPrice = item.sfa?.sfa_item_price || [];
  const { fetchSfaDetail } = useSfa();

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-2 text-center text-sm">{actualIndex}</td>
      <td className="px-3 py-2 text-center text-sm">
        {item.is_confirmed ? 'YES' : 'NO'}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {item.probability || '-'}
      </td>
      <td className="px-3 py-2 text-sm">{item.sfa?.customer?.name || '-'}</td>
      <td className="px-3 py-2 text-sm">{item.sfa?.name}</td>
      <td className="px-3 py-2 text-center text-sm">
        {item.billing_type || '-'}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {item.sfa?.sfa_classification?.name || '-'}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {sfaItemPrice.map((item) => item.sfa_item_name).join(', ') || '-'}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {sfaItemPrice.map((item) => item.team_name).join(', ') || '-'}
      </td>
      <td className="px-3 py-2 text-right text-sm font-mono">
        {new Intl.NumberFormat('ko-KR').format(item.amount)}
      </td>
      <td className="px-3 py-2 text-right text-sm font-mono">
        {new Intl.NumberFormat('ko-KR').format(item.profit_amount)}
      </td>
      <td className="px-3 py-2 text-center text-sm">{item.recognition_date}</td>
      <td className="px-3 py-2 text-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchSfaDetail(item.sfa.id)}
        >
          View
        </Button>
      </td>
    </tr>
  );
};

const SfaTable = () => {
  const { sfaData, loading, error, pagination, setPage, setPageSize } =
    useSfa();

  if (loading) return <StateDisplay type="loading" />;
  if (error) return <StateDisplay type="error" message={error} />;
  if (!sfaData?.length) return <StateDisplay type="empty" />;

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
            {sfaData.map((item, index) => (
              <TableRow
                key={item.id}
                item={item}
                index={index}
                pageSize={pagination.pageSize}
                currentPage={pagination.current}
              />
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        current={pagination.current}
        pageSize={pagination.pageSize}
        total={pagination.total}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
      />
    </Card>
  );
};

export default SfaTable;
