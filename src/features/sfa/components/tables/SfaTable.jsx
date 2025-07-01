// src/features/sfa/components/table/SfaTable.jsx
import React from 'react';
import { useSfaStore } from '../../hooks/useSfaStore';
import { useUiStore } from '../../../../shared/hooks/useUiStore';
import { fetchSfaDetail } from '../../../../store/slices/sfaSlice';
import { Button } from '../../../../shared/components/ui';
import { Card } from '../../../../shared/components/ui/card/Card';
import { StateDisplay } from '../../../../shared/components/ui/state/StateDisplay';
import { Pagination } from '../../../../shared/components/ui/pagination/Pagination';
import { formatCustomerDisplay } from '../../utils/displayUtils';
import { truncateText } from '../../../../shared/utils/textUtils';

const COLUMNS = [
  { key: 'no', title: 'No', align: 'center' },
  { key: 'confirmed', title: '확정여부', align: 'center' },
  { key: 'percentage', title: '확률', align: 'center' },
  { key: 'customer', title: '매출처', align: 'left' },
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

const TableRow = ({
  item,
  index,
  pageSize,
  currentPage,
  actions,
  uiActions,
}) => {
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

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-3 py-2 text-center text-sm">{actualIndex}</td>
      <td className="px-3 py-2 text-center text-sm">
        {item.isConfirmed ? 'YES' : 'NO'}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {item.probability || '-'}
      </td>
      <td className="px-3 py-2 text-sm">
        {item?.revenueSource?.name ? (
          item?.revenueSource?.name === item?.sfa?.customer?.name ? (
            <span title={item.revenueSource.name}>
              {truncateText(item.revenueSource.name, 10)}
            </span>
          ) : (
            <span
              title={`${item.revenueSource.name} / ${item.sfa.customer.name}`}
            >
              {truncateText(
                `${item.revenueSource.name} / ${item.sfa.customer.name}`,
                10,
              )}
            </span>
          )
        ) : (
          '-'
        )}
      </td>
      <td className="px-3 py-2 text-sm">
        <div className="group relative">
          <span>{truncateText(item.sfa?.name)}</span>
          {item.sfa?.name && item.sfa.name.length > 25 && (
            <div className="invisible group-hover:visible absolute z-10 p-2 bg-gray-800 text-white text-sm rounded shadow-lg whitespace-normal max-w-xs">
              {item.sfa.name}
            </div>
          )}
        </div>
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {item.billingType || '-'}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {item.sfa?.sfaClassification?.name || '-'}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {sfaItemPrice.map((item) => item.sfaItemName).join(', ') || '-'}
      </td>
      <td className="px-3 py-2 text-center text-sm">
        {sfaItemPrice.map((item) => item.teamName).join(', ') || '-'}
      </td>
      <td className="px-3 py-2 text-right text-sm font-mono">
        {new Intl.NumberFormat('ko-KR').format(item.amount)}
      </td>
      <td className="px-3 py-2 text-right text-sm font-mono">
        {new Intl.NumberFormat('ko-KR').format(item.profitAmount)}
      </td>
      <td className="px-3 py-2 text-center text-sm">{item.recognitionDate}</td>
      <td className="px-3 py-2 text-center">
        <Button variant="outline" size="sm" onClick={handleViewClick}>
          View
        </Button>
      </td>
    </tr>
  );
};

const SfaTable = () => {
  // SFA 데이터 관련 상태와 함수
  const { items, status, error, pagination, actions } = useSfaStore();
  const { actions: uiActions } = useUiStore();

  // console.log(`======== SfaTable pagination : `, pagination);

  const loading = status === 'loading';

  if (loading) return <StateDisplay type="loading" />;
  if (error) return <StateDisplay type="error" message={error} />;
  if (!items?.length) return <StateDisplay type="empty" />;

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
            {items.map((item, index) => (
              <TableRow
                key={item.id}
                item={item}
                index={index}
                pageSize={pagination.pageSize}
                currentPage={pagination.current}
                actions={actions}
                uiActions={uiActions}
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

export default SfaTable;
