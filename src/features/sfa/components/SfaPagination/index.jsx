// src/features/sfa/components/SfaPagination/index.jsx
import React from 'react';
import styled from 'styled-components';
import { useSfa } from '../../context/SfaContext';

const Container = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
`;

const PageSize = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Select = styled.select`
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: white;
`;

const Pagination = styled.div`
  display: flex;
  gap: 4px;
`;

const PageButton = styled.button`
  padding: 4px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  background: ${(props) => (props.active ? '#e5e7eb' : 'white')};
  cursor: pointer;

  &:hover {
    background: #f3f4f6;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const PageInfo = styled.span`
  margin: 0 16px;
`;

const SfaPagination = () => {
  const { pagination, setPage, setPageSize } = useSfa();

  const totalPages = Math.ceil(pagination.total / pagination.pageSize);

  const pageSizeOptions = [10, 20, 50];

  return (
    <Container>
      <PageSize>
        <span>페이지당 행:</span>
        <Select
          value={pagination.pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </Select>
      </PageSize>

      <Pagination>
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
      </Pagination>
    </Container>
  );
};

export default SfaPagination;
