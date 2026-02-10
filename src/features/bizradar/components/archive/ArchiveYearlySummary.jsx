import React from 'react';
import { Card } from '@components/ui';
import { FaFileInvoice, FaTrophy, FaChartLine, FaCoins } from 'react-icons/fa';

const StatCard = ({ title, value, subValue, icon: Icon, color }) => (
    <Card className="p-4 flex items-center justify-between border-l-4" style={{ borderLeftColor: color }}>
        <div>
            <p className="text-gray-500 text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
            {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-full opacity-20`} style={{ backgroundColor: color }}>
            <Icon className="w-6 h-6" style={{ color: color, opacity: 1 }} />
        </div>
    </Card>
);

const ArchiveYearlySummary = () => {
    // Mock Data
    const stats = [
        {
            title: '총 제안 건수',
            value: '54 건',
            subValue: '전년 대비 +10%',
            icon: FaFileInvoice,
            color: '#3B82F6', // Blue
        },
        {
            title: '선정(Win) 건수',
            value: '12 건',
            subValue: '평균 2.3개월 소요',
            icon: FaTrophy,
            color: '#10B981', // Green
        },
        {
            title: '수주 성공률',
            value: '22.2%',
            subValue: '목표 20% 달성',
            icon: FaChartLine,
            color: '#8B5CF6', // Purple
        },
        {
            title: '총 수주 금액',
            value: '₩ 15.4억',
            subValue: '최대 단일 건 3.0억',
            icon: FaCoins,
            color: '#F59E0B', // Amber
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};

export default ArchiveYearlySummary;
