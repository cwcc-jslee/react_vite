/**
 * BizRadar 마감일 타임라인
 * 마감일이 임박한 공고를 타임라인 형태로 표시
 */
import React from 'react';
import { FaClock, FaExternalLinkAlt, FaEye } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { setDrawer } from '@/store/slices/uiSlice';
import { SUPPORT_TYPE_COLORS } from '../../constants/initialState';

/**
 * D-Day 계산 함수
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
 * D-Day 뱃지 컴포넌트
 */
const DdayBadge = ({ dday }) => {
    if (dday === null) return <span className="text-xs text-gray-400">-</span>;

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
 * 타임라인 아이템 컴포넌트
 */
const TimelineItem = ({ item, onView, onOpenUrl }) => {
    const dday = calculateDDay(item.endDate || item.end_date);

    return (
        <div className="relative pl-8 pb-6 group">
            {/* 타임라인 선 */}
            <div className="absolute left-2 top-2 bottom-0 w-0.5 bg-gray-200 group-last:hidden" />

            {/* 타임라인 점 */}
            <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow" />

            {/* 카드 */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 line-clamp-2 mb-1">{item.title}</h4>
                        <div className="flex items-center gap-2 flex-wrap">
                            <DdayBadge dday={dday} />
                            {(item.confirmedCategory || item.confirmed_category) && (
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${SUPPORT_TYPE_COLORS[item.confirmedCategory || item.confirmed_category]}`}>
                                    Type {item.confirmedCategory || item.confirmed_category}
                                </span>
                            )}
                            {item.region && (
                                <span className="text-xs text-gray-500">📍 {item.region}</span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                            onClick={() => onView(item)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="상세 보기"
                        >
                            <FaEye className="h-4 w-4" />
                        </button>
                        {item.url && (
                            <button
                                onClick={() => onOpenUrl(item.url)}
                                className="p-2 text-gray-600 hover:bg-gray-50 rounded transition-colors"
                                title="원본 URL"
                            >
                                <FaExternalLinkAlt className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>📅 {item.endDate || item.end_date || '-'}</span>
                    {item.source && <span>📌 {item.source.toUpperCase()}</span>}
                </div>

                {item.summary && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{item.summary}</p>
                )}
            </div>
        </div>
    );
};

/**
 * BizRadar 마감일 타임라인 컴포넌트
 */
const BizRadarDeadlineTimeline = ({ items, maxItems = 10 }) => {
    const dispatch = useDispatch();

    // 마감일 기준 정렬 (마감 임박 순)
    const sortedItems = React.useMemo(() => {
        if (!items || !items.length) return [];

        return [...items]
            .filter((item) => item.endDate || item.end_date)
            .sort((a, b) => {
                const dateA = new Date(a.endDate || a.end_date);
                const dateB = new Date(b.endDate || b.end_date);
                return dateA - dateB;
            })
            .slice(0, maxItems);
    }, [items, maxItems]);

    const handleView = (item) => {
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

    const handleOpenUrl = (url) => {
        if (url) {
            window.open(url, '_blank', 'noopener,noreferrer');
        }
    };

    if (!sortedItems.length) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">마감 임박 공고</h3>
                <div className="flex items-center justify-center h-32 text-gray-500">
                    마감 예정 공고가 없습니다.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">마감 임박 공고</h3>
                <span className="text-sm text-gray-500">{sortedItems.length}건</span>
            </div>

            <div className="space-y-0">
                {sortedItems.map((item) => (
                    <TimelineItem
                        key={item.id}
                        item={item}
                        onView={handleView}
                        onOpenUrl={handleOpenUrl}
                    />
                ))}
            </div>
        </div>
    );
};

export default BizRadarDeadlineTimeline;
