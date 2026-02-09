/**
 * BizRadar 대시보드 레이아웃 (Redesigned)
 * 확정 상태 기반 통계 및 검토 워크플로우 중심
 * 진행중/과거 사업 구분
 */
import React, { useEffect, useState, useMemo } from 'react';
import { useBizRadarStore } from '../hooks/useBizRadarStore';
import BizRadarStatsCards from '../components/dashboard/BizRadarStatsCards';
import BizRadarTypeChart from '../components/dashboard/BizRadarTypeChart';
import BizRadarDeadlineTimeline from '../components/dashboard/BizRadarDeadlineTimeline';
import { filterByProjectStatus, getProjectStatusStats } from '../utils/projectStatusUtils';

/**
 * 확정 상태 기반 통계 계산
 */
const calculateConfirmationStats = (items) => {
    if (!items || !items.length) {
        return {
            total: 0,
            pending: 0,
            confirmed: 0,
            rejected: 0,
            byType: { A: 0, B: 0, C: 0, D: 0, F: 0 },
            byTypeConfirmed: { A: 0, B: 0, C: 0, D: 0, F: 0 },
            byTypePending: { A: 0, B: 0, C: 0, D: 0, F: 0 },
            deadlineSoon: 0,
            deadlineSoonPending: 0,
        };
    }

    const stats = {
        total: items.length,
        pending: 0,
        confirmed: 0,
        rejected: 0,
        byType: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        byTypeConfirmed: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        byTypePending: { A: 0, B: 0, C: 0, D: 0, F: 0 },
        deadlineSoon: 0,
        deadlineSoonPending: 0,
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekLater = new Date(today);
    weekLater.setDate(today.getDate() + 7);

    items.forEach((item) => {
        const type = item.confirmedCategory || item.confirmed_category || item.analyzedCategory || item.analyzed_category;
        const confirmationStatus = item.reviewStatus || item.review_status || 'pending';

        // 확정 상태별 카운트
        if (confirmationStatus === 'pending') {
            stats.pending++;
        } else if (confirmationStatus === 'confirmed') {
            stats.confirmed++;
        } else if (confirmationStatus === 'rejected') {
            stats.rejected++;
        }

        // Type별 카운트
        if (type && stats.byType.hasOwnProperty(type)) {
            stats.byType[type]++;

            if (confirmationStatus === 'confirmed') {
                stats.byTypeConfirmed[type]++;
            } else if (confirmationStatus === 'pending' || confirmationStatus === 'rejected') {
                stats.byTypePending[type]++;
            }
        }

        // 마감 임박 (7일 이내)
        const endDate = item.endDate || item.end_date;
        if (endDate) {
            const end = new Date(endDate);
            if (!isNaN(end.getTime())) {
                end.setHours(0, 0, 0, 0);
                if (end >= today && end <= weekLater) {
                    stats.deadlineSoon++;
                    if (confirmationStatus === 'pending' || confirmationStatus === 'rejected') {
                        stats.deadlineSoonPending++;
                    }
                }
            }
        }
    });

    return stats;
};

/**
 * BizRadar 대시보드 레이아웃
 */
const BizRadarDashboardLayout = () => {
    const { items, isLoading, isError, error, actions } = useBizRadarStore();
    const [showMode, setShowMode] = useState('all'); // 'all', 'pending', 'confirmed'
    const [projectStatus, setProjectStatus] = useState('active'); // 'active', 'all', 'archived'

    // 프로젝트 상태별 필터링 (항상 호출)
    const filteredByProjectStatus = useMemo(() => {
        return filterByProjectStatus(items, projectStatus);
    }, [items, projectStatus]);

    // 프로젝트 상태 통계 (항상 호출)
    const projectStatusStats = useMemo(() => {
        return getProjectStatusStats(items);
    }, [items]);

    // 확정 상태 통계 (항상 호출)
    const stats = useMemo(() => {
        return calculateConfirmationStats(filteredByProjectStatus);
    }, [filteredByProjectStatus]);

    // 표시 모드에 따른 필터링 (항상 호출)
    const filteredItems = useMemo(() => {
        if (!filteredByProjectStatus) return [];
        if (showMode === 'all') return filteredByProjectStatus;

        return filteredByProjectStatus.filter(item => {
            const status = item.reviewStatus || item.review_status || 'pending';
            if (showMode === 'pending') {
                return status === 'pending' || status === 'rejected';
            } else if (showMode === 'confirmed') {
                return status === 'confirmed';
            }
            return true;
        });
    }, [filteredByProjectStatus, showMode]);

    // 필터 적용 핸들러
    const handleFilterApply = (filters) => {
        actions.data.fetchList(filters);
    };

    // Type 클릭 핸들러
    const handleTypeClick = (type) => {
        handleFilterApply({ type });
    };

    // 로딩 상태
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // 에러 상태
    if (isError) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <p className="text-red-600">
                    {error || '데이터를 불러오는 중 오류가 발생했습니다.'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* 통합 필터 바 */}
            <div className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    {/* 왼쪽: 프로젝트 상태 */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-gray-700">프로젝트 상태:</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setProjectStatus('active')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${projectStatus === 'active'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                진행중 ({projectStatusStats.active})
                            </button>
                            <button
                                onClick={() => setProjectStatus('all')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${projectStatus === 'all'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                전체
                            </button>
                            <button
                                onClick={() => setProjectStatus('archived')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${projectStatus === 'archived'
                                    ? 'bg-gray-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                과거 ({projectStatusStats.archived})
                            </button>
                        </div>
                    </div>

                    {/* 오른쪽: 확정 상태 (진행중일 때만 표시) */}
                    {projectStatus === 'active' && (
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-gray-700">확정 상태:</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setShowMode('all')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${showMode === 'all'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    전체
                                </button>
                                <button
                                    onClick={() => setShowMode('pending')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${showMode === 'pending'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    검토대기
                                </button>
                                <button
                                    onClick={() => setShowMode('confirmed')}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${showMode === 'confirmed'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    확정완료
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 통계 카드 */}
            <BizRadarStatsCards
                stats={stats}
                onFilterApply={handleFilterApply}
                showMode={showMode}
                projectStatus={projectStatus}
            />

            {/* 차트와 타임라인 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Type 분포 차트 */}
                <BizRadarTypeChart
                    stats={showMode === 'pending' ? { ...stats, byType: stats?.byTypePending } :
                        showMode === 'confirmed' ? { ...stats, byType: stats?.byTypeConfirmed } :
                            stats}
                    onTypeClick={handleTypeClick}
                    title={`${projectStatus === 'active' ? '진행중' : projectStatus === 'archived' ? '과거' : '전체'} ${showMode === 'pending' ? '검토대기' : showMode === 'confirmed' ? '확정완료' : ''} Type 분포`}
                />

                {/* 마감일 타임라인 */}
                <BizRadarDeadlineTimeline
                    items={filteredItems}
                    maxItems={8}
                    title={`${projectStatus === 'active' ? '진행중' : projectStatus === 'archived' ? '과거' : '전체'} 마감 임박`}
                />
            </div>
        </div>
    );
};

export default BizRadarDashboardLayout;
