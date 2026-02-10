import React from 'react';
import { FileText, Clock, AlertTriangle, Briefcase, Search, Trophy } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';

const KPICardSection = ({ data }) => {
    const { source, business, outcome } = data;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Zone A: Source Intelligence */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">정보 수집 (Source)</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-4 flex flex-col justify-between h-32">
                            <div className="flex justify-between items-start">
                                <div className="text-gray-500 text-sm font-medium">전체 공고</div>
                                <FileText className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{source.totalNotices.toLocaleString()}</div>
                                <div className="text-sm text-green-600 font-medium">↑{source.todayIncrease} 오늘</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col justify-between h-32">
                            <div className="flex justify-between items-start">
                                <div className="text-gray-500 text-sm font-medium">검토 대기</div>
                                <Clock className="h-5 w-5 text-orange-500" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{source.pendingReview}</div>
                                <div className="text-sm text-orange-500 font-medium">확인 필요</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Zone B: Active Business */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">진행 사업 (Business)</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-4 flex flex-col justify-between h-32">
                            <div className="flex justify-between items-start">
                                <div className="text-gray-500 text-sm font-medium">긴급 대응</div>
                                <AlertTriangle className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{business.urgentLeads}</div>
                                <div className="text-sm text-red-500 font-medium">D-3</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4 flex flex-col justify-between h-32">
                            <div className="flex justify-between items-start">
                                <div className="text-gray-500 text-sm font-medium">사업 기회</div>
                                <Briefcase className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{business.activeProjects}</div>
                                <div className="text-sm text-blue-600 font-medium">
                                    {business.proposing} 제안 중 / {business.submitted} 제출 완료
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Zone C: Business Outcome */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">사업 성과 (Outcome)</h3>
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardContent className="p-4 flex flex-col justify-between h-32">
                            <div className="flex justify-between items-start">
                                <div className="text-gray-500 text-sm font-medium">결과 대기</div>
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-gray-900">{outcome.inReview}</div>
                                <div className="text-sm text-gray-500 font-medium">결과 대기 중</div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-green-50 border-green-200">
                        <CardContent className="p-4 flex flex-col justify-between h-32">
                            <div className="flex justify-between items-start">
                                <div className="text-green-800 text-sm font-medium">누적 수주</div>
                                <Trophy className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-green-900">{outcome.wonYTD}</div>
                                <div className="text-sm text-green-700 font-medium">₩ {outcome.wonRevenue}억</div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default KPICardSection;
