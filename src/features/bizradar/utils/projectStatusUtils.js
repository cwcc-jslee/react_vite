/**
 * 프로젝트 상태 유틸리티
 * 진행중/과거 사업 판단 로직
 */

/**
 * 프로젝트가 진행중인지 판단
 * @param {Object} item - 프로젝트 항목
 * @returns {boolean} - 진행중이면 true, 과거면 false
 */
export const isActive = (item) => {
    if (!item) return false;

    // 1. status 필드가 있으면 우선 사용 (수동 오버라이드)
    if (item.status === 'archived') return false;
    if (item.status === 'active') return true;

    // 2. status 없으면 마감일 기준 (자동 판단)
    const endDate = item.endDate || item.end_date;

    // 마감일이 없으면 진행중으로 간주
    if (!endDate) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(endDate);

    // 날짜 파싱 실패 시 진행중으로 간주
    if (isNaN(end.getTime())) return true;

    end.setHours(0, 0, 0, 0);

    // 마감일이 지나지 않았으면 진행중
    return end >= today;
};

/**
 * 프로젝트 상태 레이블 가져오기
 * @param {Object} item - 프로젝트 항목
 * @returns {string} - '진행중' 또는 '과거'
 */
export const getProjectStatusLabel = (item) => {
    return isActive(item) ? '진행중' : '과거';
};

/**
 * 프로젝트 목록 필터링
 * @param {Array} items - 프로젝트 목록
 * @param {string} statusFilter - 'active', 'archived', 'all'
 * @returns {Array} - 필터링된 목록
 */
export const filterByProjectStatus = (items, statusFilter) => {
    // items가 배열이 아니거나 비어있으면 빈 배열 반환
    if (!items || !Array.isArray(items) || items.length === 0) {
        return [];
    }

    if (statusFilter === 'all') return items;

    return items.filter(item => {
        const active = isActive(item);
        return statusFilter === 'active' ? active : !active;
    });
};

/**
 * 프로젝트 상태별 통계
 * @param {Array} items - 프로젝트 목록
 * @returns {Object} - { active: number, archived: number }
 */
export const getProjectStatusStats = (items) => {
    // items가 배열이 아니거나 비어있으면 기본값 반환
    if (!items || !Array.isArray(items) || items.length === 0) {
        return { active: 0, archived: 0 };
    }

    const stats = { active: 0, archived: 0 };

    items.forEach(item => {
        if (isActive(item)) {
            stats.active++;
        } else {
            stats.archived++;
        }
    });

    return stats;
};

export default {
    isActive,
    getProjectStatusLabel,
    filterByProjectStatus,
    getProjectStatusStats,
};
