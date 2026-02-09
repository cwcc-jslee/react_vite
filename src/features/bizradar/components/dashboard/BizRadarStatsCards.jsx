/**
 * BizRadar 통계 카드 컴포넌트 (Redesigned)
 * 확정 상태 중심의 통계 표시
 */
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
    FaClipboardList,
    FaCheckCircle,
    FaExclamationTriangle,
    FaClock,
    FaTimesCircle,
    FaHourglassHalf
} from 'react-icons/fa';
import { changePageMenu } from '@/store/slices/uiSlice';
import { SUPPORT_TYPES } from '../../constants/initialState';

/**
 * 개별 통계 카드 컴포넌트
 */
const StatCard = ({ title, value, icon: Icon, color, bgColor, onClick, subtitle, badge }) => {
    return (
        <div
            onClick={onClick}
            className={`${bgColor} rounded-lg shadow-md p-6 transition-all duration-200 hover:shadow-lg ${onClick ? 'cursor-pointer hover:scale-105' : ''
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
                    <p className={`text-3xl font-bold ${color}`}>{value}</p>
                    {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
                    {badge && <div className="mt-2">{badge}</div>}
                </div>
                <div className={`${color} opacity-20`}>
                    <Icon className="h-12 w-12" />
                </div>
            </div>
        </div>
    );
};

/**
 * Type별 통계 카드
 */
const TypeStatCard = ({ type, count, confirmedCount, pendingCount, onClick, showMode }) => {
    const config = SUPPORT_TYPES[type];
    if (!config) return null;

    const displayCount = showMode === 'pending' ? pendingCount :
        showMode === 'confirmed' ? confirmedCount :
            count;

    // 색상 클래스를 추출하여 아이콘과 텍스트에 적용
    const getColorClasses = () => {
        switch (type) {
            case 'A':
                return { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' };
            case 'B':
                return { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' };
            case 'C':
                return { text: 'text-yellow-700', bg: 'bg-yellow-50', border: 'border-yellow-200' };
            case 'D':
                return { text: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-200' };
            case 'F':
                return { text: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200' };
            default:
                return { text: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-200' };
        }
    };

    const colors = getColorClasses();

    return (
        <div
            onClick={onClick}
            className={`${colors.bg} border ${colors.border} rounded-lg p-4 transition-all duration-200 hover:shadow-md cursor-pointer hover:scale-105`}
        >
            <div className="flex items-center justify-between mb-2">
                <span className={`text-xs font-semibold ${colors.text}`}>{config.label}</span>
                <span className={`text-2xl font-bold ${colors.text}`}>{displayCount}</span>
            </div>
            <p className="text-xs font-medium text-gray-700 mb-1">{config.description}</p>
            {showMode === 'all' && (
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                    <span className="text-green-600">✓ {confirmedCount}</span>
                    <span className="text-yellow-600">⏳ {pendingCount}</span>
                </div>
            )}
        </div>
    );
};

/**
 * BizRadar 통계 카드 메인 컴포넌트
 */
const BizRadarStatsCards = ({ stats, onFilterApply, showMode = 'all' }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // 목록 페이지로 이동하면서 필터 적용
    const handleNavigateWithFilter = (filters) => {
        dispatch(changePageMenu({ page: 'bizradar', menu: 'list', layout: 'list' }));
        if (onFilterApply) {
            onFilterApply(filters);
        }
    };

    // Type별 필터 적용
    const handleTypeClick = (type) => {
        handleNavigateWithFilter({ type });
    };

    // 검토대기 페이지로 이동
    const handleGoToReview = (type) => {
        dispatch(changePageMenu({ page: 'bizradar', menu: 'review', layout: 'review' }));
    };

    return (
        <div className="space-y-6">
            {/* 확정 상태 통계 카드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="전체 공고"
                    value={stats?.total || 0}
                    icon={FaClipboardList}
                    color="text-blue-600"
                    bgColor="bg-white"
                    onClick={() => handleNavigateWithFilter({})}
                />
                <StatCard
                    title="검토 대기"
                    value={stats?.pending || 0}
                    icon={FaHourglassHalf}
                    color="text-yellow-600"
                    bgColor="bg-white"
                    onClick={handleGoToReview}
                    subtitle="담당자 확정 필요"
                    badge={
                        stats?.rejected > 0 && (
                            <span className="text-xs text-red-600">
                                재검토 {stats.rejected}건 포함
                            </span>
                        )
                    }
                />
                <StatCard
                    title="확정 완료"
                    value={stats?.confirmed || 0}
                    icon={FaCheckCircle}
                    color="text-green-600"
                    bgColor="bg-white"
                    onClick={() => handleNavigateWithFilter({ review_status: 'confirmed' })}
                    subtitle={`전체의 ${stats?.total ? Math.round((stats.confirmed / stats.total) * 100) : 0}%`}
                />
                <StatCard
                    title="마감 임박 (7일 이내)"
                    value={stats?.deadlineSoon || 0}
                    icon={FaClock}
                    color="text-red-600"
                    bgColor="bg-white"
                    onClick={() => {
                        const today = new Date();
                        const weekLater = new Date(today);
                        weekLater.setDate(today.getDate() + 7);
                        handleNavigateWithFilter({
                            min_date: today.toISOString().split('T')[0],
                            max_date: weekLater.toISOString().split('T')[0]
                        });
                    }}
                    subtitle={
                        stats?.deadlineSoonPending > 0
                            ? `검토대기 ${stats.deadlineSoonPending}건`
                            : '모두 확정완료'
                    }
                />
            </div>

            {/* Type별 상세 통계 */}
            <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    지원 유형별 분포
                    {showMode === 'pending' && ' (검토대기)'}
                    {showMode === 'confirmed' && ' (확정완료)'}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {['A', 'B', 'C', 'D', 'F'].map((type) => (
                        <TypeStatCard
                            key={type}
                            type={type}
                            count={stats?.byType?.[type] || 0}
                            confirmedCount={stats?.byTypeConfirmed?.[type] || 0}
                            pendingCount={stats?.byTypePending?.[type] || 0}
                            onClick={() => handleTypeClick(type)}
                            showMode={showMode}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BizRadarStatsCards;
