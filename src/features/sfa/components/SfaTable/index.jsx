// src/features/sfa/components/SfaTable/index.jsx
import React from 'react';
import styled from 'styled-components';
import { useSfa } from '../../context/SfaContext';
// import SfaPagination from '../SfaPagination';

// const TableContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   background: white;
//   border-radius: 8px;
//   box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
//   margin-top: 20px;
// `;

const TableContainer = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 12px; // 기본 폰트 사이즈 축소
`;

const Th = styled.th`
  padding: 8px 12px; // 패딩도 약간 줄임
  background: #f9fafb;
  text-align: ${(props) => props.align || 'left'};
  border-bottom: 2px solid #e5e7eb;
  font-size: 12px; // 헤더 폰트 사이즈 축소
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 8px 12px; // 패딩도 약간 줄임
  border-bottom: 1px solid #e5e7eb;
  text-align: ${(props) => props.align || 'left'};
  font-size: 12px; // 데이터 폰트 사이즈 축소
  color: #1f2937;

  // 숫자 데이터(매출액, 매출이익)인 경우
  ${(props) =>
    props.isNumber &&
    `
    font-family: 'Roboto', sans-serif;
    font-size: 11px;  // 숫자 데이터는 더 작게
  `}
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  color: #374151;
  transition: all 0.2s;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  &:active {
    background: #f3f4f6;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  padding: 48px;
  text-align: center;
  color: #6b7280;
`;

const LoadingState = styled.div`
  padding: 48px;
  text-align: center;
  color: #6b7280;
`;

const ErrorState = styled.div`
  padding: 24px;
  text-align: center;
  color: #ef4444;
  background: #fee2e2;
  border-radius: 8px;
  margin: 20px 0;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #e5e7eb;
`;

const PageSizeSelector = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Select = styled.select`
  font-size: 11px;
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
`;

const PaginationControls = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

// 페이지네이션 관련 폰트 사이즈도 조정
const PageInfo = styled.span`
  font-size: 11px;
  color: #6b7280;
`;

const PageButton = styled.button`
  padding: 4px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
  cursor: pointer;

  &:hover {
    background: #f9fafb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

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

  //   if (loading) return <LoadingState>데이터를 불러오는 중...</LoadingState>;
  //   if (error) return <ErrorState>{error}</ErrorState>;

  return (
    <tr>
      <Td align="center">{actualIndex}</Td>
      <Td align="center">{item.is_confirmed ? 'YES' : 'NO'}</Td>
      <Td align="center">{item.probability || '-'}</Td>
      <Td>{item.sfa?.customer?.name || '-'}</Td>
      <Td>{item.sfa?.name}</Td>
      <Td align="center">{item.billing_type || '-'}</Td>
      <Td align="center">{item.sfa?.sfa_classification?.name || '-'}</Td>
      <Td align="center">
        {sfaItemPrice.map((item) => item.sfa_item_name).join(', ') || '-'}
      </Td>
      <Td align="center">
        {sfaItemPrice.map((item) => item.team_name).join(', ') || '-'}
      </Td>
      <Td align="right">
        {new Intl.NumberFormat('ko-KR').format(item.amount)}
      </Td>
      <Td align="right">
        {new Intl.NumberFormat('ko-KR').format(item.profit_amount)}
      </Td>
      <Td align="center">{item.recognition_date}</Td>
      <Td align="center">
        <ActionButton onClick={() => fetchSfaDetail(item.sfa.id)}>
          View
        </ActionButton>
      </Td>
    </tr>
  );
};

const SfaTable = () => {
  const { sfaData, loading, error, pagination, setPage, setPageSize } =
    useSfa();

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  if (loading) return <LoadingState>데이터를 불러오는 중...</LoadingState>;
  if (error) return <ErrorState>{error}</ErrorState>;
  if (!sfaData?.length) return <EmptyState>데이터가 없습니다.</EmptyState>;

  return (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <Th key={column.key} align={column.align}>
                {column.title}
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
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
      </Table>
      <PaginationContainer>
        <PageSizeSelector>
          <span>페이지당 행:</span>
          <Select
            value={pagination.pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </Select>
        </PageSizeSelector>

        <PaginationControls>
          <PageButton
            disabled={pagination.current === 1}
            onClick={() => setPage(pagination.current - 1)}
          >
            이전
          </PageButton>

          <PageInfo>
            {pagination.current} / {totalPages} 페이지 (총 {pagination.total}개)
          </PageInfo>

          <PageButton
            disabled={pagination.current === totalPages}
            onClick={() => setPage(pagination.current + 1)}
          >
            다음
          </PageButton>
        </PaginationControls>
      </PaginationContainer>
    </TableContainer>
  );
};

export default SfaTable;
