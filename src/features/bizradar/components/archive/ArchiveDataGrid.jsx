import React from 'react';
import { Card } from '@components/ui';
import { FaExternalLinkAlt } from 'react-icons/fa';

const ArchiveDataGrid = ({ onRowClick, viewMode = 'list' }) => {
    // Mock Data - One Project with Multiple Clients case included
    const data = [
        {
            id: 1,
            year: '2025',
            type: 'A',
            project: '2025 AI 바우처 지원사업',
            client: '(주)대한식품',
            result: 'Win',
            amount: '3.0억',
            pic: '김철수',
            note: '우수 사례 선정',
        },
        {
            id: 11,
            year: '2025',
            type: 'A',
            project: '2025 AI 바우처 지원사업', // Same Project
            client: '(주)코리아테크', // Different Client
            result: 'Loss',
            amount: '-',
            pic: '김철수',
            note: '가격 경쟁력 부족',
        },
        {
            id: 2,
            year: '2025',
            type: 'B',
            project: '스마트공장 구축 사업',
            client: '성진테크',
            result: 'Loss',
            amount: '-',
            pic: '이영희',
            note: '예산 초과',
        },
        {
            id: 3,
            year: '2024',
            type: 'C',
            project: '지역특화 콘텐츠 개발',
            client: '(주)우리문화',
            result: 'Drop',
            amount: '-',
            pic: '박준영',
            note: '기간 만료 미지원',
        },
        {
            id: 4,
            year: '2024',
            type: 'A',
            project: '데이터 바우처 지원사업',
            client: '퓨처시스템',
            result: 'Win',
            amount: '0.8억',
            pic: '김철수',
            note: '',
        },
        {
            id: 5,
            year: '2025',
            type: 'C',
            project: '메타버스 플랫폼 구축 사업',
            client: <span className="text-gray-400 italic">(미지정/내부검토)</span>,
            result: 'Drop',
            amount: '-',
            pic: '-',
            note: '기술 스택 불일치로 포기',
        },
    ];

    const getResultBadge = (result) => {
        switch (result) {
            case 'Win':
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">● 선정</span>;
            case 'Loss':
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">● 탈락</span>;
            case 'Drop':
                return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-600">● 미지원</span>;
            default:
                return <span className="text-gray-500">{result}</span>;
        }
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'A': return 'text-red-600 bg-red-50';
            case 'B': return 'text-blue-600 bg-blue-50';
            case 'C': return 'text-green-600 bg-green-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    }

    // Grouping Logic
    const getGroupedData = () => {
        const groups = {};

        data.forEach(item => {
            if (!groups[item.project]) {
                groups[item.project] = {
                    id: item.id, // Use first item's ID or generate a unique one
                    year: item.year,
                    type: item.type,
                    project: item.project,
                    total: 0,
                    win: 0,
                    loss: 0,
                    drop: 0,
                    pass: 0,
                    items: []
                };
            }

            const group = groups[item.project];
            group.items.push(item);
            group.total++;

            if (item.result === 'Win') group.win++;
            else if (item.result === 'Loss') group.loss++;
            else if (item.result === 'Drop') group.drop++;
            else if (item.result === 'Pass') group.pass++;
        });

        return Object.values(groups);
    };

    const groupedData = viewMode === 'group' ? getGroupedData() : [];

    return (
        <Card className="overflow-hidden bg-white shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 font-medium">
                        <tr>
                            <th className="px-4 py-3 w-16 text-center">연도</th>
                            <th className="px-4 py-3 w-16 text-center">구분</th>
                            <th className="px-4 py-3">공고명 (Project)</th>
                            {viewMode === 'list' && <th className="px-4 py-3 w-40">고객사 (Client)</th>}
                            {viewMode === 'group' && <th className="px-4 py-3 w-60 text-center">진행 현황 (총/선정/탈락/기타)</th>}
                            {viewMode === 'list' && <th className="px-4 py-3 w-28 text-center">최종 결과</th>}
                            {viewMode === 'list' && <th className="px-4 py-3 w-28 text-right">수주 금액</th>}
                            {viewMode === 'list' && <th className="px-4 py-3 w-24 text-center">담당자</th>}
                            {viewMode === 'list' && <th className="px-4 py-3 w-40">비고</th>}
                            <th className="px-4 py-3 w-16 text-center">상세</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {viewMode === 'list' ? (
                            data.map((item) => (
                                <tr
                                    key={item.id}
                                    onClick={() => onRowClick && onRowClick(item)}
                                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-4 py-3 text-center text-gray-500">{item.year}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getTypeColor(item.type)}`}>
                                            {item.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{item.project}</td>
                                    <td className="px-4 py-3 text-gray-600">{item.client}</td>
                                    <td className="px-4 py-3 text-center">{getResultBadge(item.result)}</td>
                                    <td className="px-4 py-3 text-right font-medium text-gray-700">{item.amount}</td>
                                    <td className="px-4 py-3 text-center text-gray-600">{item.pic}</td>
                                    <td className="px-4 py-3 text-xs text-gray-400 truncate max-w-[150px]">{item.note}</td>
                                    <td className="px-4 py-3 text-center">
                                        <button className="text-gray-400 hover:text-blue-600">
                                            <FaExternalLinkAlt className="w-3 h-3" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            groupedData.map((group) => (
                                <tr
                                    key={group.id}
                                    className="hover:bg-blue-50 transition-colors"
                                >
                                    <td className="px-4 py-3 text-center text-gray-500">{group.year}</td>
                                    <td className="px-4 py-3 text-center">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${getTypeColor(group.type)}`}>
                                            {group.type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-800">
                                        <div>{group.project}</div>
                                        <div className="text-xs text-gray-400 mt-1">
                                            {group.items.length > 0 && group.items.slice(0, 3).map(i => i.client && typeof i.client === 'string' ? i.client : '').filter(Boolean).join(', ')}
                                            {group.items.length > 3 && '...'}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2 text-xs">
                                            <span className="font-bold text-gray-700">총 {group.total}건</span>
                                            <span className="text-gray-300">|</span>
                                            {group.win > 0 && <span className="text-green-600 font-bold">{group.win} 선정</span>}
                                            {group.loss > 0 && <span className="text-gray-500">{group.loss} 탈락</span>}
                                            {group.drop > 0 && <span className="text-orange-500">{group.drop} 미지원</span>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            className="text-gray-400 hover:text-blue-600 border border-gray-200 rounded px-2 py-1 text-xs"
                                            onClick={() => {
                                                // If we want to support expanding, we need more state. 
                                                // For now, let's just use the main row interaction or keep it simple.
                                                // Maybe just open the modal with the first item or a summary view?
                                                // Let's pass the first item for now to allow viewing details.
                                                if (onRowClick && group.items.length > 0) onRowClick(group.items[0]);
                                            }}
                                        >
                                            상세 보기
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-end">
                <span className="text-xs text-gray-500">
                    {viewMode === 'list' ? `총 ${data.length}건 검색됨` : `총 ${groupedData.length}개 공고 검색됨`}
                </span>
            </div>
        </Card>
    );
};

export default ArchiveDataGrid;
