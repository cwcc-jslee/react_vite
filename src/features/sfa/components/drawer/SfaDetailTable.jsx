// src/features/sfa/components/drawer/SfaDetailTable.jsx
import React from 'react';
import styled from 'styled-components';

const DetailContainer = styled.div`
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr 120px 1fr;
  border-bottom: 1px solid #e5e7eb;
  &:last-child {
    border-bottom: none;
  }
`;

const Cell = styled.div`
  padding: 12px;
  font-size: 12px;
  ${(props) =>
    props.label &&
    `
    background: #f9fafb;
    font-weight: 500;
    color: #374151;
    border-right: 1px solid #e5e7eb;
  `}
  ${(props) =>
    !props.label &&
    `
    color: #1f2937;
  `}
  ${(props) =>
    props.colSpan &&
    `
    grid-column: span ${props.colSpan};
  `}
`;

const SfaDetailTable = ({ data }) => {
  console.log(`>sfa detail table (data) : ${data}`);
  if (!data) return null;

  // 매출품목과 사업부 문자열 생성
  const itemsAndTeams =
    data.sfa_item_price
      ?.map(
        (item) =>
          `${item.sfa_item_name}${
            item.team_name ? ` (${item.team_name})` : ''
          }`,
      )
      .join(', ') || '-';

  return (
    <DetailContainer>
      {/* 1행: 매출유형, 지원프로그램 */}
      <Row>
        <Cell label>매출유형</Cell>
        <Cell>{data.sfa_sales_type?.name || '-'}</Cell>
        <Cell label>지원프로그램</Cell>
        <Cell>{data.proposal?.name || '-'}</Cell>
      </Row>

      {/* 2행: 고객사/매출처, 매출확정여부 */}
      <Row>
        <Cell label>고객사/매출처</Cell>
        <Cell>{data.customer?.name || '-'}</Cell>
        <Cell label>매출확정여부</Cell>
        <Cell>{data.confirmed ? 'YES' : 'NO'}</Cell>
      </Row>

      {/* 3행: 건명, 프로젝트여부 */}
      <Row>
        <Cell label>건명</Cell>
        <Cell>{data.name || '-'}</Cell>
        <Cell label>프로젝트여부</Cell>
        <Cell>{data.isProject ? 'YES' : 'NO'}</Cell>
      </Row>

      {/* 4행: 매출구분, 매출품목/사업부 */}
      <Row>
        <Cell label>매출구분</Cell>
        <Cell>{data.sfa_classification?.name || '-'}</Cell>
        <Cell label>매출품목/사업부</Cell>
        <Cell>{itemsAndTeams}</Cell>
      </Row>

      {/* 5행: 매출, 매출이익 */}
      <Row>
        <Cell label>매출</Cell>
        <Cell>
          {typeof data.sales_revenue === 'number'
            ? data.sales_revenue.toLocaleString()
            : '-'}
        </Cell>
        <Cell label>매출이익</Cell>
        <Cell>
          {typeof data.sales_profit === 'number'
            ? data.sales_profit.toLocaleString()
            : '-'}
        </Cell>
      </Row>

      {/* 6행: 비고 */}
      <Row>
        <Cell label>비고</Cell>
        <Cell colSpan={3}>{data.description || '-'}</Cell>
      </Row>
    </DetailContainer>
  );
};

export default SfaDetailTable;
