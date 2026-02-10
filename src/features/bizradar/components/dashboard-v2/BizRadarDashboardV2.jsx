import React, { useState, useEffect } from 'react';
import KPICardSection from './KPICardSection';
import ChartSection from './ChartSection';
import UrgentStatusTable from './UrgentStatusTable';
import { SOURCING_FUNNEL_DATA, SALES_FUNNEL_DATA, MONTHLY_WINS_DATA, URGENT_STATUS_DATA } from './DashboardDummyData';
import { bizradarApi } from '../../api/bizradarApi';

const BizRadarDashboardV2 = () => {
    const [loading, setLoading] = useState(true);
    const [kpiData, setKpiData] = useState(null);
    const [sourcingFunnelData, setSourceingFunnelData] = useState(SOURCING_FUNNEL_DATA);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardStats = async () => {
            try {
                setLoading(true);
                // API server automatically calculates current year if no dates provided
                const response = await bizradarApi.getDashboardStats();

                // Transform API response to KPI card format
                const transformedData = {
                    source: {
                        totalNotices: response.data.total || 0,
                        todayIncrease: response.data.today || 0, // 오늘 수집된 공고 수
                        pendingReview: response.data.pending?.total || 0
                    },
                    business: {
                        urgentLeads: 0, // Not provided by API
                        activeProjects: 0, // Not provided by API
                        proposing: 0, // Not provided by API
                        submitted: 0 // Not provided by API
                    },
                    outcome: {
                        inReview: 0, // Not provided by API
                        wonYTD: 0, // User specified as 0
                        wonRevenue: 0 // User specified as 0
                    }
                };

                // Transform API response to sourcing funnel chart format
                const aiClassifiedCount = (response.data.analyzed.by_category.A || 0) +
                    (response.data.analyzed.by_category.B || 0) +
                    (response.data.analyzed.by_category.C || 0) +
                    (response.data.analyzed.by_category.D || 0);

                const funnelData = [
                    { label: '전체 공고', value: response.data.total || 0, fill: '#8884d8' },
                    { label: 'AI 분류', value: aiClassifiedCount, fill: '#83a6ed' },
                    { label: '분류 확정', value: response.data.confirmed.total || 0, fill: '#8dd1e1' }
                ];

                setKpiData(transformedData);
                setSourceingFunnelData(funnelData);
                setError(null);
            } catch (err) {
                console.error('Failed to fetch dashboard stats:', err);
                setError('대시보드 통계를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardStats();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-red-600">{error}</div>
            </div>
        );
    }

    return (
        <div className="p-6 h-full overflow-y-auto">

            {/* 1. KPI Cards */}
            {kpiData && <KPICardSection data={kpiData} />}

            {/* 2. Analysis Charts */}
            <ChartSection
                sourcingFunnelData={sourcingFunnelData}
                salesFunnelData={SALES_FUNNEL_DATA}
                monthlyWinsData={MONTHLY_WINS_DATA}
            />

            {/* 3. Urgent Status Table */}
            <UrgentStatusTable data={URGENT_STATUS_DATA} />
        </div>
    );
};

export default BizRadarDashboardV2;
