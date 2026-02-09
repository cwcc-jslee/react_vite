import React from 'react';
import { Check } from 'lucide-react';
import { SUPPORT_TYPES } from '../../../constants/initialState';

const ReviewActionPanel = ({
    localType,
    setLocalType,
    localNote,
    setLocalNote,
    isSubmitting,
    onAction,
    canReview = true
}) => {
    if (!canReview) {
        return (
            <div className="text-center py-2 text-gray-400 text-sm font-medium">
                현재 권한으로는 검토 작업을 수행할 수 없습니다.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-5">
            {/* 유형 선택 섹션 */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Target Classification</label>
                    <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded">Selected: {localType}</span>
                </div>
                <div className="grid grid-cols-5 gap-3">
                    {['A', 'B', 'C', 'D', 'F'].map((type) => {
                        const config = SUPPORT_TYPES[type];
                        const isSelected = localType === type;
                        return (
                            <button
                                key={type}
                                onClick={() => setLocalType(type)}
                                className={`py-3.5 rounded-2xl border-2 transition-all font-bold text-sm flex flex-col items-center justify-center gap-0.5 ${isSelected
                                    ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200 -translate-y-0.5'
                                    : 'border-gray-100 bg-gray-50 text-gray-400 hover:border-blue-200 hover:bg-white hover:text-blue-500'
                                    }`}
                            >
                                <span className="text-[13px]">{type}</span>
                                <span className="truncate text-[9px] uppercase opacity-70 tracking-tighter">{config.name.split(' ')[0]}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 의견 작성 및 실행 섹션 */}
            <div className="flex gap-4">
                <div className="flex-1">
                    <textarea
                        value={localNote}
                        onChange={(e) => setLocalNote(e.target.value)}
                        placeholder="검토 의견이나 변경 사유를 입력하세요 (선택사항)..."
                        className="w-full h-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl text-sm focus:ring-4 focus:ring-blue-100 focus:border-blue-500 focus:bg-white transition-all outline-none resize-none placeholder:text-gray-300"
                        rows={2}
                    />
                </div>
                <div className="flex flex-col gap-2 min-w-[140px]">
                    <button
                        onClick={() => onAction('confirmed')}
                        disabled={isSubmitting}
                        className="flex-1 px-6 bg-blue-600 text-white rounded-2xl font-bold text-sm hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-200 transition-all disabled:opacity-50 disabled:translate-y-0 active:scale-95"
                    >
                        <Check className="inline-block mr-2" /> 확정완료
                    </button>
                    <button
                        onClick={() => onAction('rejected')}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-white text-red-500 border-2 border-red-50 rounded-2xl font-bold text-xs hover:bg-red-50 transition-all disabled:opacity-50"
                    >
                        재검토 전송
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ReviewActionPanel;
