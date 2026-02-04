/**
 * BizRadar 목록 테이블
 * 공고 목록을 테이블 형태로 표시
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import { FaExternalLinkAlt, FaEye } from 'react-icons/fa';
import { setDrawer } from '@/store/slices/uiSlice';
import { useBizRadarStore } from '../../hooks/useBizRadarStore';
import { Tooltip, TableColumnMenu } from '@shared/components/ui';
import { useTableColumns } from '@shared/hooks/useTableColumns';
import {
  SUPPORT_TYPES,
  SUPPORT_TYPE_COLORS,
  CONFIDENCE_LEVELS,
  SUBMISSION_STATUS,
  DATA_SOURCES,
  TABLE_COLUMNS,
} from '../../constants/initialState';

// 테이블 컬럼 정의 (상수 + 액션 컬럼)
const COLUMNS_DEF = [
  ...TABLE_COLUMNS,
  { key: 'action', title: '액션', width: 100, align: 'center', essential: true },
];

const DEFAULT_VISIBLE_COLUMNS = [
  'source',
  'title',
  'final_support_type',
  'region',
  'period',
  'submission_status',
  'action',
];

// 출처 뱃지 컴포넌트
const SourceBadge = ({ source }) => {
  // source 값으로 DATA_SOURCES에서 해당 항목 찾기
  const sourceConfig = Object.values(DATA_SOURCES).find((s) => s.value === source);
  const label = sourceConfig?.label || source?.toUpperCase() || '-';
  return (
    <span className="inline-block w-16 px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium text-center">
      {label}
    </span>
  );
};

// 지원유형 뱃지 컴포넌트
const SupportTypeBadge = ({ type }) => {
  const config = SUPPORT_TYPES[type] || { color: 'bg-gray-100 text-gray-800', description: type };
  return (
    <span
      className={`inline-block w-12 px-2 py-1 rounded-full text-xs font-medium text-center ${config.color}`}
      title={config.detail || config.description}
    >
      {type}
    </span>
  );
};

// 신뢰도 뱃지 컴포넌트
const ConfidenceBadge = ({ level }) => {
  const config = CONFIDENCE_LEVELS[level] || { label: level, color: 'bg-gray-100 text-gray-800' };
  return (
    <span className={`inline-block w-14 px-2 py-1 rounded-full text-xs font-medium text-center ${config.color}`}>
      {config.label}
    </span>
  );
};

// 접수상태 뱃지 컴포넌트
const StatusBadge = ({ label, type }) => {
  const config = SUBMISSION_STATUS[type] || { color: 'bg-gray-100 text-gray-800' };
  return (
    <span className={`inline-block w-16 px-2 py-1 rounded-full text-xs font-medium text-center ${config.color}`}>
      {label}
    </span>
  );
};

// 상태 자동 계산 함수
const getComputedStatus = (item) => {
  if (!item.end_date) return { label: item.submission_status || '접수중', type: '접수중' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const endDate = new Date(item.end_date);
  
  // 날짜 파싱 실패 시 원본 상태 반환
  if (isNaN(endDate.getTime())) return { label: item.submission_status || '-', type: '접수중' };
  
  endDate.setHours(0, 0, 0, 0);

  // 마감일이 지났으면 '마감'
  if (endDate < today) return { label: '마감', type: '마감' };

  // D-Day 계산
  const diffTime = endDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // 라벨 생성
  const label = diffDays === 0 ? 'D-Day' : `D-${diffDays}일`;
  
  // 7일 이내면 '마감임박'(Red), 아니면 '접수중'(Blue)
  const type = diffDays <= 7 ? '마감임박' : '접수중';

  return { label, type };
};

// 테이블 행 컴포넌트
const TableRow = ({ item, onClick, onOpenUrl, visibleColumns }) => {
  const isColumnVisible = (key) => visibleColumns.includes(key);

  const renderCell = (key) => {
    switch (key) {
      case 'id':
        return item.id;
      case 'source':
        return <SourceBadge source={item.source} />;
      case 'title':
        return (
          <Tooltip content={item.summary || item.title}>
            <div className="line-clamp-2 font-medium hover:text-blue-600 transition-colors">
              {item.title}
            </div>
          </Tooltip>
        );
      case 'final_support_type':
        return (
          <SupportTypeBadge
            type={
              item.final_support_type ||
              item.finalSupportType ||
              item.support_type ||
              '-'
            }
          />
        );
      case 'region':
        return item.region || '-';
      case 'period':
        return (
          <div className="flex flex-col text-[11px] leading-tight">
            <span className="text-gray-400">{item.published_date || '-'}</span>
            <span className="font-medium text-gray-700">{item.end_date || '-'}</span>
          </div>
        );
      case 'submission_status': {
        const computed = getComputedStatus(item);
        return <StatusBadge label={computed.label} type={computed.type} />;
      }
      case 'confidence':
        return <ConfidenceBadge level={item.confidence} />;
      case 'action':
        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(item);
              }}
              className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
              title="상세 보기"
            >
              <FaEye className="h-4 w-4" />
            </button>
            {item.url && (
              <button
                onClick={(e) => onOpenUrl(e, item.url)}
                className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                title="원본 URL 열기"
              >
                <FaExternalLinkAlt className="h-4 w-4" />
              </button>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <tr
      onClick={() => onClick(item)}
      className="hover:bg-gray-50 cursor-pointer transition-colors"
    >
      {COLUMNS_DEF.filter((col) => isColumnVisible(col.key)).map((col) => (
        <td
          key={col.key}
          className={`px-4 py-3 text-sm ${
            col.key === 'title' ? 'text-gray-900' : 'whitespace-nowrap'
          } ${col.align === 'center' ? 'text-center' : 'text-left'} ${
            col.key === 'id' ||
            col.key === 'region' ||
            col.key === 'published_date' ||
            col.key === 'end_date'
              ? 'text-gray-500'
              : ''
          }`}
        >
          {renderCell(col.key)}
        </td>
      ))}
    </tr>
  );
};

// 페이지네이션 컴포넌트
const Pagination = ({ current, total, pageSize, onChange }) => {
  const totalPages = Math.ceil(total / pageSize);

  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, current - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white border-t">
      <div className="text-sm text-gray-700">
        총 <span className="font-medium">{total}</span>건 중{' '}
        <span className="font-medium">{(current - 1) * pageSize + 1}</span>-
        <span className="font-medium">{Math.min(current * pageSize, total)}</span>건
      </div>
      <div className="flex gap-1">
        <button
          onClick={() => onChange(1)}
          disabled={current === 1}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          처음
        </button>
        <button
          onClick={() => onChange(current - 1)}
          disabled={current === 1}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          이전
        </button>
        {getPageNumbers().map((page) => (
          <button
            key={page}
            onClick={() => onChange(page)}
            className={`px-3 py-1 text-sm border rounded ${
              current === page
                ? 'bg-blue-600 text-white border-blue-600'
                : 'hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        ))}
        <button
          onClick={() => onChange(current + 1)}
          disabled={current === totalPages}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          다음
        </button>
        <button
          onClick={() => onChange(totalPages)}
          disabled={current === totalPages}
          className="px-3 py-1 text-sm border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          마지막
        </button>
      </div>
    </div>
  );
};

const BizRadarListTable = () => {
  const dispatch = useDispatch();
  const { items, pagination, isLoading, isError, error, changePage } = useBizRadarStore();

  const { visibleColumns, toggleColumn, resetColumns, showAllColumns } =
    useTableColumns(DEFAULT_VISIBLE_COLUMNS);

  const isColumnVisible = (key) => visibleColumns.includes(key);

  // 행 클릭 - 상세 보기
  const handleRowClick = (item) => {
    dispatch(
      setDrawer({
        visible: true,
        type: 'bizradar',
        mode: 'view',
        data: item,
        width: 'lg',
      })
    );
  };

  // URL 열기
  const handleOpenUrl = (e, url) => {
    e.stopPropagation();
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500">데이터를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (isError) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-red-500">{error || '데이터를 불러오는 중 오류가 발생했습니다.'}</p>
      </div>
    );
  }

  // 빈 데이터
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">조회된 공고가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {COLUMNS_DEF.filter((col) => isColumnVisible(col.key)).map((col, index, array) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${col.align === 'center' ? 'text-center' : 'text-left'}
                  `}
                  style={{ width: col.width }}
                >
                  {index === array.length - 1 ? (
                    <div className="flex items-center justify-center gap-1">
                      <span>{col.title}</span>
                      <TableColumnMenu
                        columns={COLUMNS_DEF}
                        visibleColumns={visibleColumns}
                        onToggleColumn={toggleColumn}
                        onReset={resetColumns}
                        onShowAll={showAllColumns}
                        essentialColumns={['title', 'final_support_type', 'action']}
                        defaultVisibleColumns={DEFAULT_VISIBLE_COLUMNS}
                      />
                    </div>
                  ) : (
                    col.title
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item) => (
              <TableRow
                key={item.id}
                item={item}
                onClick={handleRowClick}
                onOpenUrl={handleOpenUrl}
                visibleColumns={visibleColumns}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* 페이지네이션 */}
      <Pagination
        current={pagination.current}
        total={pagination.total}
        pageSize={pagination.pageSize}
        onChange={changePage}
      />
    </div>
  );
};

export default BizRadarListTable;