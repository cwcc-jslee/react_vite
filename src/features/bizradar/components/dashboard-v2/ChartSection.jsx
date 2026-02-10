import React from 'react';
import {
    FunnelChart,
    Funnel,
    LabelList,
    Tooltip,
    ResponsiveContainer,
    ComposedChart,
    Bar,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Legend,
    Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

const ChartSection = ({ sourcingFunnelData, salesFunnelData, monthlyWinsData }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
            {/* 1. AI Sourcing Efficiency (1/4 width) */}
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>AI 소싱 효율</CardTitle>
                    <p className="text-sm text-gray-500">공고 수집 및 1차 필터링 단계</p>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <FunnelChart>
                                <Tooltip
                                    formatter={(value, name, props) => {
                                        const label = props.payload.label;
                                        return [`${value.toLocaleString()}`, label];
                                    }}
                                />
                                <Funnel dataKey="value" data={sourcingFunnelData} isAnimationActive>
                                    <LabelList position="right" fill="#000" stroke="none" dataKey="label" />
                                    {sourcingFunnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Funnel>
                            </FunnelChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* 2. Sales Conversion (1/4 width) */}
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>영업 전환율</CardTitle>
                    <p className="text-sm text-gray-500">유효 사업 기회 수주 전환</p>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <FunnelChart>
                                <Tooltip formatter={(value) => value.toLocaleString()} />
                                <Funnel dataKey="value" data={salesFunnelData} isAnimationActive>
                                    <LabelList position="right" fill="#000" stroke="none" dataKey="label" />
                                    {salesFunnelData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Funnel>
                            </FunnelChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* 3. Monthly Wins (1/2 width) */}
            <Card className="col-span-1 lg:col-span-2">
                <CardHeader>
                    <CardTitle>월별 수주 현황</CardTitle>
                    <p className="text-sm text-gray-500">수주 건수 및 매출 추이</p>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart
                                data={monthlyWinsData}
                                margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                            >
                                <CartesianGrid stroke="#f5f5f5" />
                                <XAxis dataKey="name" scale="band" />
                                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" unit="억" />
                                <Tooltip />
                                <Legend />
                                <Bar yAxisId="left" dataKey="won" barSize={20} fill="#413ea0" name="선정 건수" />
                                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#ff7300" name="매출 (억)" />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default ChartSection;
