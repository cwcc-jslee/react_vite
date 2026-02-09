/**
 * 검토 큐 카드 컴포넌트
 * Type D 항목을 카드 형태로 표시하고 빠른 분류 제공
 */
import React, { useState } from 'react';
import { FaExternalLinkAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { SUPPORT_TYPES, CONFIDENCE_LEVELS } from '../../constants/initialState';

/**
 * 신뢰도 표시 컴포넌트
 */
const ConfidenceIndicator = ({ level }) => {
    const config = CONFIDENCE_LEVELS[level] || { label: level, color: 'bg-gray-100 text-gray-800' };
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">신뢰도:</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                {config.label}
            </span>
        </div>
    );
};

/**
 * 빠른 분류 버튼
 */
const ClassifyButton = ({ type, onClick, isLoading }) => {
    const config = SUPPORT_TYPES[type];
    if (!config) return null;

    const getColorClasses = () => {
        switch (type) {
            case 'A':
                return 'bg-green-600 hover:bg-green-700 text-white';
            case 'B':
                return 'bg-blue-600 hover:bg-blue-700 text-white';
            case 'C':
                return 'bg-yellow-600 hover:bg-yellow-700 text-white';
            case 'F':
                return 'bg-gray-600 hover:bg-gray-700 text-white';
            default:
                return 'bg-gray-600 hover:bg-gray-700 text-white';
        }
    };

    return (
        <button
            onClick={() => onClick(type)}
            disabled={isLoading}
            className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${getColorClasses()}`}
            title={config.detail}
        >
            {config.label}
            <div className="text-xs font-normal opacity-90">{config.description}</div>
        </button>
    );
};

/**
 * 검토 큐 카드 메인 컴포넌트
 */
const ReviewQueueCard = ({ item, onClassify }) => {
    const [isClassifying, setIsClassifying] = useState(false);
    const [showReasonInput, setShowReasonInput] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [reason, setReason] = useState('');

    const handleQuickClassify = async (type) => {
        setSelectedType(type);
        setShowReasonInput(true);
    };

    const handleConfirmClassify = async () => {
        if (!selectedType) return;

        setIsClassifying(true);
        try {
            await onClassify(item.id, selectedType, reason);
            setShowReasonInput(false);
            setReason('');
            setSelectedType(null);
        } catch (err) {
            console.error('Classification failed:', err);
        } finally {
            setIsClassifying(false);
        }
    };

    const handleCancelClassify = () => {
        setShowReasonInput(false);
        setReason('');
        setSelectedType(null);
    };

    const handleOpenUrl = () => {
        if (item.url) {
            window.open(item.url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="bg-white border-2 border-orange-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
            {/* 헤더 */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{item.title}</h3>
                    <div className="flex items-center gap-3 flex-wrap text-sm">
                        <span className="px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-xs font-medium">
                            Type D - 검토필요
                        </span>
                        {item.source && (
                            <span className="text-gray-600">📌 {item.source.toUpperCase()}</span>
                        )}
                        {item.region && (
                            <span className="text-gray-600">📍 {item.region}</span>
                        )}
                    </div>
                </div>
                {item.url && (
                    <button
                        onClick={handleOpenUrl}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors flex-shrink-0"
                        title="원본 URL"
                    >
                        <FaExternalLinkAlt className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* AI 분석 요약 */}
            {item.summary && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700 line-clamp-3">{item.summary}</p>
                </div>
            )}

            {/* 상세 정보 */}
            <div className="mb-4 space-y-2 text-sm">
                {item.endDate || item.end_date ? (
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">📅 마감일:</span>
                        <span className="font-medium text-gray-900">{item.endDate || item.end_date}</span>
                    </div>
                ) : null}
                {item.confidence && (
                    <ConfidenceIndicator level={item.confidence} />
                )}
            </div>

            {/* 분류 사유 입력 */}
            {showReasonInput && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            {SUPPORT_TYPES[selectedType]?.label}로 분류하시겠습니까?
                        </span>
                    </div>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="분류 사유 (선택사항)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows={2}
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={handleConfirmClassify}
                            disabled={isClassifying}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            <FaCheck className="h-4 w-4" />
                            확인
                        </button>
                        <button
                            onClick={handleCancelClassify}
                            disabled={isClassifying}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 disabled:opacity-50 transition-colors"
                        >
                            <FaTimes className="h-4 w-4" />
                            취소
                        </button>
                    </div>
                </div>
            )}

            {/* 빠른 분류 버튼 */}
            {!showReasonInput && (
                <div>
                    <div className="text-xs font-medium text-gray-600 mb-2">빠른 분류:</div>
                    <div className="grid grid-cols-2 gap-2">
                        <ClassifyButton type="A" onClick={handleQuickClassify} isLoading={isClassifying} />
                        <ClassifyButton type="B" onClick={handleQuickClassify} isLoading={isClassifying} />
                        <ClassifyButton type="C" onClick={handleQuickClassify} isLoading={isClassifying} />
                        <ClassifyButton type="F" onClick={handleQuickClassify} isLoading={isClassifying} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewQueueCard;
