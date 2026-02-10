/**
 * BizRadar Dashboard v2.0 Dummy Data
 */

export const KPI_DATA = {
    source: {
        totalNotices: 15420,
        todayIncrease: 35,
        pendingReview: 12,
    },
    business: {
        urgentLeads: 3,
        activeProjects: 8,
        proposing: 3,
        submitted: 5,
    },
    outcome: {
        inReview: 5,
        wonYTD: 7,
        wonRevenue: 5.2, // 억 원
    },
};

// AI Sourcing Efficiency Funnel
export const SOURCING_FUNNEL_DATA = [
    { stage: 'Collected', value: 15420, label: '전체 공고', fill: '#8884d8' },
    { stage: 'AI Analyzed', value: 8500, label: 'AI 수집', fill: '#83a6ed' },
    { stage: 'Confirmed', value: 1200, label: '분류 확정', fill: '#8dd1e1' },
    { stage: 'Valid', value: 350, label: '유효 사업', fill: '#82ca9d' },
];

// Sales Conversion Funnel
export const SALES_FUNNEL_DATA = [
    { stage: 'Identified', value: 50, label: '매칭 발굴', fill: '#a4de6c' },
    { stage: 'Proposing', value: 30, label: '제안 진행', fill: '#d0ed57' },
    { stage: 'Submitted', value: 20, label: '제출 완료', fill: '#ffc658' },
    { stage: 'Won', value: 5, label: '최종 수주', fill: '#ff7300' },
];

export const MONTHLY_WINS_DATA = [
    { name: '1월', won: 1, revenue: 0.5 },
    { name: '2월', won: 2, revenue: 1.2 },
    { name: '3월', won: 1, revenue: 1.5 },
    { name: '4월', won: 3, revenue: 2.8 },
    { name: '5월', won: 2, revenue: 3.5 },
    { name: '6월', won: 4, revenue: 5.2 },
];

export const URGENT_STATUS_DATA = [
    {
        id: 1,
        status: '접수필요',
        project: '2026 AI 바우처 지원사업',
        client: '(주)대한식품',
        due: 'D-2 (02.11)',
        owner: '김철수',
        statusColor: 'red',
    },
    {
        id: 2,
        status: '제안중',
        project: '2026 AI 바우처 지원사업',
        client: '(주)민국건설',
        due: 'D-5 (02.14)',
        owner: '이영희',
        statusColor: 'blue',
    },
    {
        id: 3,
        status: '심사중',
        project: '스마트공장 고도화 사업',
        client: '성진테크',
        due: '발표 D-1',
        owner: '박지민',
        statusColor: '#f59e0b',
    },
    {
        id: 4,
        status: '선정',
        project: '지역특화 콘텐츠 개발',
        client: '(주)우리문화',
        due: '확정',
        owner: '최대표',
        statusColor: 'green',
    },
];
