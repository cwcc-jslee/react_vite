/**
 * BizRadar Type 분포 차트
 * Recharts를 사용한 파이/도넛 차트
 */
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { SUPPORT_TYPES } from '../../constants/initialState';

// Type별 색상 매핑
const TYPE_COLORS = {
    A: '#10b981', // green-500
    B: '#3b82f6', // blue-500
    C: '#f59e0b', // yellow-500
    D: '#f97316', // orange-500
    F: '#6b7280', // gray-500
};

/**
 * 커스텀 라벨 렌더러
 */
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // 5% 미만은 라벨 숨김

    return (
        <text
            x={x}
            y={y}
            fill="white"
            textAnchor={x > cx ? 'start' : 'end'}
            dominantBaseline="central"
            className="font-semibold text-sm"
        >
            {`${(percent * 100).toFixed(0)}%`}
        </text>
    );
};

/**
 * 커스텀 툴팁
 */
const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const config = SUPPORT_TYPES[data.type];

    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
            <p className="font-semibold text-gray-800 mb-1">{config?.label || data.type}</p>
            <p className="text-sm text-gray-600 mb-1">{config?.description}</p>
            <p className="text-xs text-gray-500 mb-2">{config?.detail}</p>
            <p className="text-lg font-bold" style={{ color: TYPE_COLORS[data.type] }}>
                {data.count}건
            </p>
            <p className="text-xs text-gray-500">
                전체의 {((data.count / data.total) * 100).toFixed(1)}%
            </p>
        </div>
    );
};

/**
 * 커스텀 범례
 */
const CustomLegend = ({ payload, onClick }) => {
    return (
        <div className="flex flex-wrap justify-center gap-3 mt-4">
            {payload.map((entry, index) => {
                const config = SUPPORT_TYPES[entry.value];
                return (
                    <div
                        key={`legend-${index}`}
                        onClick={() => onClick && onClick(entry.value)}
                        className="flex items-center gap-2 cursor-pointer hover:opacity-75 transition-opacity"
                    >
                        <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-gray-700">
                            {config?.label || entry.value} ({entry.payload.count})
                        </span>
                    </div>
                );
            })}
        </div>
    );
};

/**
 * BizRadar Type 분포 차트 컴포넌트
 */
const BizRadarTypeChart = ({ stats, onTypeClick }) => {
    const [activeIndex, setActiveIndex] = useState(null);

    // 차트 데이터 준비
    const chartData = ['A', 'B', 'C', 'D', 'F']
        .map((type) => ({
            type,
            count: stats?.byType?.[type] || 0,
            total: stats?.total || 0,
        }))
        .filter((item) => item.count > 0); // 0건인 항목 제외

    const handlePieClick = (data, index) => {
        setActiveIndex(index);
        if (onTypeClick) {
            onTypeClick(data.type);
        }
    };

    const handleLegendClick = (type) => {
        if (onTypeClick) {
            onTypeClick(type);
        }
    };

    if (!chartData.length) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">지원 유형 분포</h3>
                <div className="flex items-center justify-center h-64 text-gray-500">
                    데이터가 없습니다.
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">지원 유형 분포</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={100}
                        innerRadius={60}
                        fill="#8884d8"
                        dataKey="count"
                        onClick={handlePieClick}
                        activeIndex={activeIndex}
                        activeShape={{
                            outerRadius: 110,
                            stroke: '#fff',
                            strokeWidth: 2,
                        }}
                    >
                        {chartData.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={TYPE_COLORS[entry.type]}
                                className="cursor-pointer transition-all hover:opacity-80"
                            />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                        content={<CustomLegend onClick={handleLegendClick} />}
                        verticalAlign="bottom"
                    />
                </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                    총 <span className="font-semibold text-gray-800">{stats?.total || 0}</span>건
                </p>
            </div>
        </div>
    );
};

export default BizRadarTypeChart;
