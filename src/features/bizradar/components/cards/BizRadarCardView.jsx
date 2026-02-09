/**
 * BizRadar 카드 뷰
 * 목록을 카드 형태로 표시
 */
import React from 'react';
import { useDispatch } from 'react-redux';
import { FaExternalLinkAlt, FaEye, FaClock } from 'react-icons/fa';
import { setDrawer } from '@/store/slices/uiSlice';
import { useBizRadarStore } from '../../hooks/useBizRadarStore';
import { SUPPORT_TYPES, SUPPORT_TYPE_COLORS } from '../../constants/initialState';

/**
 * D-Day 계산
 */
const calculateDDay = (endDate) => {
    if (!endDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    if (isNaN(end.getTime())) return null;
    end.setHours(0, 0, 0, 0);
    const diffTime = end - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

/**
 * D-Day 뱃지
 */
const DdayBadge = ({ dday }) => {
    if (dday === null) return null;

    let colorClass = 'bg-blue-100 text-blue-800';
    let label = `D-${dday}`;

    if (dday < 0) {
        colorClass = 'bg-gray-100 text-gray-500';
        label = '마감';
    } else if (dday === 0) {
        colorClass = 'bg-red-100 text-red-800';
        label = 'D-Day';
    } else if (dday <= 3) {
        colorClass = 'bg-red-100 text-red-800';
    } else if (dday <= 7) {
        colorClass = 'bg-orange-100 text-orange-800';
    }

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${colorClass}`}>
            <FaClock className="h-3 w-3" />
            {label}
        </span>
    );
};

/**
 * 개별 카드 컴포넌트
 */
const BizRadarCard = ({ item, onClick, onOpenUrl, isSelected, onSelect }) => {
    const dday = calculateDDay(item.endDate || item.end_date);
    const type = item.confirmedCategory || item.confirmed_category || item.analyzedCategory || item.analyzed_category;
    const typeConfig = SUPPORT_TYPES[type];

    return (
        <div
            className={`bg-white border-2 rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                }`}
            onClick={() => onClick(item)}
        >
            {/* 헤더 */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    {onSelect && (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                                e.stopPropagation();
                                onSelect(item.id);
                            }}
                            className="mt-1 h-4 w-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        />
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{item.title}</h3>
                    </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick(item);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="상세 보기"
                    >
                        <FaEye className="h-4 w-4" />
                    </button>
                    {item.url && (
                        <button
                            onClick={(e) => onOpenUrl(e, item.url)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                            title="원본 URL"
                        >
                            <FaExternalLinkAlt className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* 요약 */}
            {item.summary && (
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{item.summary}</p>
            )}

            {/* 메타 정보 */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
                {type && (
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${SUPPORT_TYPE_COLORS[type]}`}>
                        {typeConfig?.label || type}
                    </span>
                )}
                {dday !== null && <DdayBadge dday={dday} />}
                {item.region && (
                    <span className="text-xs text-gray-500">📍 {item.region}</span>
                )}
                {item.source && (
                    <span className="text-xs text-gray-500">📌 {item.source.toUpperCase()}</span>
                )}
            </div>

            {/* 날짜 정보 */}
            <div className="flex items-center gap-4 text-xs text-gray-500">
                {item.endDate || item.end_date ? (
                    <span>📅 {item.endDate || item.end_date}</span>
                ) : null}
            </div>
        </div>
    );
};

/**
 * 페이지네이션
 */
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
        <div className="flex items-center justify-between px-4 py-3 bg-white border-t rounded-b-lg">
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
                        className={`px-3 py-1 text-sm border rounded ${current === page
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

/**
 * BizRadar 카드 뷰 메인 컴포넌트
 */
const BizRadarCardView = ({ selectedIds = [], onSelect }) => {
    const dispatch = useDispatch();
    const { items, pagination, isLoading, isError, error, changePage } = useBizRadarStore();

    const handleCardClick = (item) => {
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

    const handleOpenUrl = (e, url) => {
        e.stopPropagation();
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-500">데이터를 불러오는 중...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-red-500">{error || '데이터를 불러오는 중 오류가 발생했습니다.'}</p>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-8 text-center">
                <p className="text-gray-500">조회된 공고가 없습니다.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map((item) => (
                        <BizRadarCard
                            key={item.id}
                            item={item}
                            onClick={handleCardClick}
                            onOpenUrl={handleOpenUrl}
                            isSelected={selectedIds.includes(item.id)}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            </div>

            <Pagination
                current={pagination.current}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onChange={changePage}
            />
        </div>
    );
};

export default BizRadarCardView;
