import React from 'react';
import { ExternalLink } from 'lucide-react';
import {
    SUPPORT_TYPE_COLORS,
    CONFIDENCE_LEVELS,
} from '../../../constants/initialState';

const InfoRow = ({ label, value, children }) => (
    <div className="py-2 border-b border-gray-100">
        <dt className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 font-medium">{children || value || '-'}</dd>
    </div>
);

const Badge = ({ colorClass, children }) => (
    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${colorClass}`}>
        {children}
    </span>
);

const TagList = ({ tags }) => {
    if (!tags || tags.length === 0) return <span className="text-gray-400 text-xs text-italic">없음</span>;
    const tagArray = Array.isArray(tags) ? tags : JSON.parse(tags);
    return (
        <div className="flex flex-wrap gap-1.5">
            {tagArray.map((tag, index) => (
                <span key={index} className="px-2.5 py-1 bg-gray-50 text-gray-500 border border-gray-100 rounded-lg text-[11px] font-bold">
                    #{tag}
                </span>
            ))}
        </div>
    );
};

const BizInfoSection = ({ data }) => {
    const handleOpenUrl = () => {
        if (data.url) window.open(data.url, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="space-y-10">
            {/* 제목 및 헤더 */}
            <div>
                <div className="flex items-center gap-2 mb-3">
                    <Badge colorClass={SUPPORT_TYPE_COLORS[data.confirmed_category] || 'bg-gray-100 text-gray-800'}>
                        AI Classification: {data.confirmed_category}
                    </Badge>
                    {data.source && (
                        <span className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
                            {data.source}
                        </span>
                    )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-4 tracking-tight">
                    {data.title}
                </h3>
                {data.url && (
                    <button
                        onClick={handleOpenUrl}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-xs font-bold ring-1 ring-blue-100"
                    >
                        <ExternalLink className="h-3 w-3" />
                        원본 공고 바로가기
                    </button>
                )}
            </div>

            {/* 분석 정보 그리드 */}
            <div className="grid grid-cols-2 gap-8 p-6 bg-gray-50/50 rounded-2xl border border-gray-100/50">
                <div className="space-y-4">
                    <InfoRow label="📍 Region" value={data.region} />
                    <InfoRow label="📅 Start Date" value={data.start_date} />
                </div>
                <div className="space-y-4">
                    <InfoRow label="🎯 Confidence">
                        {data.confidence && (
                            <Badge colorClass={CONFIDENCE_LEVELS[data.confidence]?.color || 'bg-gray-100 text-gray-800'}>
                                {CONFIDENCE_LEVELS[data.confidence]?.label || data.confidence}
                            </Badge>
                        )}
                    </InfoRow>
                    <InfoRow label="⌛ End Date" value={data.end_date} />
                </div>
            </div>

            {/* 요약 */}
            <div>
                <h4 className="text-[11px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                    AI Insight Summary
                </h4>
                <div className="bg-white p-6 border border-gray-100 rounded-2xl text-[14px] text-gray-600 leading-relaxed shadow-sm">
                    {data.summary || '요약 정보가 없습니다.'}
                </div>
            </div>

            {/* 키워드 */}
            <div>
                <h4 className="text-[11px] font-black text-gray-400 mb-4 uppercase tracking-[0.2em]">Related Keywords</h4>
                <TagList tags={data.tags} />
            </div>
        </div>
    );
};

export default BizInfoSection;
