import React from 'react';
import { Button, Badge } from '@/shared/components/ui';
import { Check, Zap } from 'lucide-react';

const AIInsightActionPanel = ({
    item,
    isSubmitting,
    selectedCategory,
    reviewComment,
    onCategorySelect,
    onReviewCommentChange,
    onConfirm,
    onReject
}) => {
    if (!item) return null;

    return (
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
            {/* 1. Controller (Sticky Header) */}
            <div className="px-6 py-3 bg-white space-y-3">
                {/* 제목 영역 */}
                <div className="flex items-center space-x-2">
                    <h2 className="text-lg font-bold text-gray-800 truncate flex-1" title={item.title}>
                        {item.title}
                    </h2>
                    <Badge variant="outline" className="text-xs">
                        {item.agency || item.source}
                    </Badge>
                </div>

                {/* 카테고리 + 액션 버튼 (한 줄) */}
                <div className="flex items-center justify-between">
                    {/* 카테고리 선택 */}
                    <div className="flex bg-gray-100 rounded-md p-1 space-x-1">
                        {['A', 'B', 'C', 'D', 'F'].map((type) => (
                            <button
                                key={type}
                                onClick={() => onCategorySelect(type)}
                                disabled={isSubmitting}
                                className={`px-3 py-1 text-sm font-medium rounded transition-colors ${selectedCategory === type
                                        ? type === 'A' ? 'bg-indigo-600 text-white'
                                            : type === 'B' ? 'bg-blue-600 text-white'
                                                : type === 'C' ? 'bg-green-600 text-white'
                                                    : type === 'D' ? 'bg-orange-600 text-white'
                                                        : 'bg-gray-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                Cat {type}
                            </button>
                        ))}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex space-x-2">
                        <Button
                            size="sm"
                            onClick={onConfirm}
                            className="bg-blue-600 hover:bg-blue-700 text-white min-w-[80px]"
                            disabled={!selectedCategory || isSubmitting}
                            loading={isSubmitting}
                        >
                            <Check className="h-4 w-4 mr-1" />
                            확정
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onReject}
                            className="text-gray-600 border-gray-300 hover:bg-gray-50 min-w-[80px]"
                            disabled={isSubmitting}
                        >
                            재검토
                        </Button>
                    </div>
                </div>

                {/* 의견 입력 (컴팩트) */}
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 whitespace-nowrap">💬 의견:</span>
                    <input
                        type="text"
                        value={reviewComment}
                        onChange={(e) => onReviewCommentChange(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && selectedCategory && !isSubmitting) {
                                onConfirm();
                            }
                        }}
                        placeholder="예: 예산 확인 필요, 우리 역량 적합 등... (선택사항)"
                        disabled={isSubmitting}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                    />
                </div>
            </div>

            {/* 2. AI Insight Summary */}
            <div className="px-6 py-4 bg-yellow-50/50 border-b border-yellow-100">
                <div className="flex items-start space-x-3">
                    <div className="bg-yellow-100 p-1.5 rounded-full mt-0.5">
                        <Zap className="h-4 w-4 text-yellow-600 fill-yellow-600" />
                    </div>
                    <div className="flex-1">
                        <div className="flex flex-wrap gap-2 mb-2">
                            {Array.isArray(item.tags) && item.tags.map((tag, idx) => (
                                <span key={idx} className="text-xs font-medium text-yellow-800 bg-yellow-100 px-2 py-0.5 rounded-full">
                                    {tag}
                                </span>
                            ))}
                            <span className="text-xs text-gray-500 flex items-center">
                                마감일: <span className="font-semibold text-gray-900 ml-1">{item.endDate || item.end_date || item.deadline}</span>
                                {item.budget && (
                                    <>
                                        <span className="mx-2">|</span>
                                        예산: <span className="font-semibold text-gray-900 ml-1">{typeof item.budget === 'object' ? item.budget.total : item.budget}</span>
                                    </>
                                )}
                            </span>
                        </div>
                        <p className="text-sm text-gray-800 leading-relaxed">
                            <span className="font-semibold text-yellow-800">[AI 분류 사유] </span>
                            {item.analyzedReason || item.analyzed_reason || item.reason}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AIInsightActionPanel;
