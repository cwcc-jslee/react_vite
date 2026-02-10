import React from 'react';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/shared/components/ui';

const ContextViewer = ({ item }) => {
    if (!item) return null;

    return (
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
            {/* Viewer Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-2 text-gray-700">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">원문 뷰어 (Parsed Text)</span>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="xs" className="h-7 text-xs">
                        <Download className="h-3 w-3 mr-1" />
                        다운로드
                    </Button>
                    <Button variant="ghost" size="xs" className="h-7 text-xs">
                        <ExternalLink className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Viewer Content */}
            <div className="flex-1 overflow-y-auto p-8 font-serif leading-relaxed text-gray-800 bg-white">
                <div className="max-w-3xl mx-auto">
                    {/* Title */}
                    <h1 className="text-2xl font-bold mb-6 text-center border-b pb-4">
                        {item.title}
                    </h1>

                    {/* Meta */}
                    <div className="grid grid-cols-2 gap-4 mb-8 text-sm bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <div>
                            <span className="font-bold text-gray-500 block mb-1">공고기관</span>
                            {item.agency}
                        </div>
                        <div>
                            <span className="font-bold text-gray-500 block mb-1">접수기간</span>
                            {item.deadline || item.endDate || item.end_date || '미정'} ({item.dDay || 'D-?'})
                        </div>
                    </div>

                    {/* Parsed Text Body */}
                    <div className="prose prose-sm max-w-none">
                        {(item.content || item.body || item.summary || '상세 내용이 없습니다.').split('\n').map((line, index) => (
                            <p key={index} className="mb-2 min-h-[1em]">
                                {line}
                            </p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContextViewer;
