import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

const UrgentStatusTable = ({ data }) => {
    return (
        <Card className="mb-6">
            <CardHeader>
                <CardTitle>긴급 대응 현황</CardTitle>
                <p className="text-sm text-gray-500">즉각적인 조치가 필요한 항목</p>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-medium border-b border-gray-200">
                            <tr>
                                <th className="py-3 px-4">상태</th>
                                <th className="py-3 px-4">사업명</th>
                                <th className="py-3 px-4">고객사</th>
                                <th className="py-3 px-4">마감일</th>
                                <th className="py-3 px-4">담당자</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50/50">
                                    <td className="py-3 px-4">
                                        <span
                                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white border"
                                            style={{ borderColor: item.statusColor, color: item.statusColor }}
                                        >
                                            <span
                                                className="w-1.5 h-1.5 rounded-full mr-1.5"
                                                style={{ backgroundColor: item.statusColor }}
                                            ></span>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 font-medium text-gray-900">{item.project}</td>
                                    <td className="py-3 px-4 text-gray-600">{item.client}</td>
                                    <td className="py-3 px-4">
                                        <span className={item.due.includes('D-') ? 'text-red-500 font-medium' : 'text-gray-600'}>
                                            {item.due}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-gray-600">{item.owner}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
};

export default UrgentStatusTable;
