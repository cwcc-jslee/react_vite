import React from 'react';
import { useDispatch } from 'react-redux';
import { ExternalLink } from 'lucide-react';
import { setDrawer } from '@/store/slices/uiSlice';
import { SUPPORT_TYPES } from '../../constants/initialState';

/**
 * 범용 검토 카드 메인 컴포넌트
 */
const UniversalReviewCard = ({ item }) => {
    const dispatch = useDispatch();

    // 초기값 설정
    const initialType = item.confirmedCategory || item.confirmed_category || item.analyzedCategory || item.analyzed_category;
    const confirmationStatus = item.reviewStatus || item.review_status || 'pending';

    const handleCardClick = () => {
        dispatch(
            setDrawer({
                visible: true,
                type: 'bizradar',
                mode: 'review',
                data: item,
                width: 'lg',
            })
        );
    };

    const handleOpenUrl = (e) => {
        e.stopPropagation();
        if (item.url) {
            window.open(item.url, '_blank', 'noopener,noreferrer');
        }
    };

    const currentTypeConfig = SUPPORT_TYPES[initialType];
    const borderColor = confirmationStatus === 'confirmed' ? 'border-green-300' :
        confirmationStatus === 'rejected' ? 'border-red-300' :
            'border-gray-200';

    return (
        <div
            onClick={handleCardClick}
            className={`bg-white border-2 ${borderColor} rounded-xl p-6 transition-all duration-300 cursor-pointer hover:shadow-md hover:border-blue-300 group`}
        >
            {/* 상단 정보 영역 */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-bold uppercase ${currentTypeConfig?.color || 'bg-gray-100 text-gray-800'}`}>
                            {initialType}
                        </span>
                        {item.source && (
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                                {item.source}
                            </span>
                        )}
                    </div>
                    <h3 className="font-bold text-gray-900 leading-tight text-base line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {item.title}
                    </h3>
                </div>
                {item.url && (
                    <button
                        onClick={handleOpenUrl}
                        className="p-2 text-blue-300 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors flex-shrink-0"
                        title="원본 공고 보기"
                    >
                        <ExternalLink className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* AI 요약 */}
            {item.summary && (
                <div className="mb-4 text-sm text-gray-600 leading-relaxed line-clamp-2">
                    {item.summary}
                </div>
            )}

            {/* 하단 메타 정보 */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                <div className="flex gap-4 text-xs text-gray-500 font-medium">
                    {item.region && (
                        <span className="flex items-center gap-1">📍 {item.region}</span>
                    )}
                    {(item.endDate || item.end_date) && (
                        <span className="flex items-center gap-1">📅 ~{item.endDate || item.end_date}</span>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    {confirmationStatus === 'rejected' && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-1 rounded">RE-REVIEW</span>
                    )}
                    <span className="text-xs font-bold text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">Review Details →</span>
                </div>
            </div>
        </div>
    );
};

export default UniversalReviewCard;
