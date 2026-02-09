/**
 * BizRadar 검토 레이아웃 (Enhanced)
 * 모든 Type (A/B/C/D/F) 검토 지원, F는 검색 기반
 */
import React, { useEffect, useState, useMemo } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useBizRadarStore } from '../hooks/useBizRadarStore';
import UniversalReviewCard from '../components/review/UniversalReviewCard';
import { SUPPORT_TYPES } from '../constants/initialState';

const BizRadarReviewLayout = () => {
    const { items, isLoading, isError, error, actions } = useBizRadarStore();
    const [selectedType, setSelectedType] = useState('D'); // 기본값: Type D
    const [searchKeyword, setSearchKeyword] = useState('');
    const [displayItems, setDisplayItems] = useState([]);

    // Type별 데이터 로드 (A,B,C,D 통합 로드)
    useEffect(() => {
        if (selectedType === 'F') {
            // Type F는 검색어가 있을 때만 로드
            if (searchKeyword.trim()) {
                actions.filter.setFilters({ type: 'F', keyword: searchKeyword });
                actions.data.fetchList();
            }
        } else {
            // A/B/C/D는 통합 로드하여 카운트와 필터링 동시 제공
            actions.filter.setFilters({ type: 'A,B,C,D', keyword: '' });
            actions.data.fetchList();
        }
    }, [selectedType === 'F']); // selectedType이 F인지 아닌지가 바뀔 때만

    // 확정/유형 변경 후 데이터 갱신을 위한 유즈이펙트 (selectedType이 바뀔 때도 호출되게 함)
    useEffect(() => {
        if (selectedType !== 'F') {
            actions.filter.setFilters({ type: 'A,B,C,D' });
            actions.data.fetchList();
        }
    }, [selectedType]);

    // Type F 검색
    const handleSearchF = () => {
        if (searchKeyword.trim()) {
            actions.filter.setFilters({ type: 'F', keyword: searchKeyword });
            actions.data.fetchList();
        }
    };

    // 검토 대기 항목 필터링 (pending/rejected 상태)
    const pendingItems = useMemo(() => {
        if (!items || !Array.isArray(items)) return [];
        return items.filter(item => {
            const status = item.reviewStatus || item.review_status || 'pending';
            return status === 'pending' || status === 'rejected';
        });
    }, [items]);

    // 유형별 카운트 계산
    const typeCounts = useMemo(() => {
        const counts = { A: 0, B: 0, C: 0, D: 0, F: 0 };
        pendingItems.forEach(item => {
            const type = item.confirmedCategory || item.confirmed_category || item.analyzedCategory || item.analyzed_category;
            if (counts.hasOwnProperty(type)) {
                counts[type]++;
            }
        });

        // F의 경우 검색 결과 수로 표시 (A~D 데이터 로드 시에는 F가 없을 것이므로)
        if (selectedType === 'F') {
            counts.F = pendingItems.length;
        }

        return counts;
    }, [pendingItems, selectedType]);

    // 현재 선택된 유형의 항목만 필터링하여 표시
    useEffect(() => {
        if (selectedType === 'F') {
            setDisplayItems(pendingItems);
        } else {
            const filtered = pendingItems.filter(item => {
                const type = item.confirmedCategory || item.confirmed_category || item.analyzedCategory || item.analyzed_category;
                return type === selectedType;
            });
            setDisplayItems(filtered);
        }
    }, [pendingItems, selectedType]);

    // 확정 상태 변경 처리 (유형, 의견 통합)
    const handleConfirmationChange = async (itemId, newStatus, additionalData = {}) => {
        try {
            // 새 confirm API 사용 (동일한 데이터 구조 매핑)
            await actions.data.confirm(itemId, {
                review_status: newStatus,
                confirmed_category: additionalData.confirmed_category || additionalData.confirmedCategory,
                notes: additionalData.review_note || additionalData.notes
            });
            // 목록 새로고침
            if (selectedType === 'F' && searchKeyword.trim()) {
                actions.data.fetchList({ type: 'F', keyword: searchKeyword });
            } else if (selectedType !== 'F') {
                actions.data.fetchList({ type: 'A,B,C,D' });
            }
        } catch (err) {
            console.error('Confirmation change failed:', err);
            throw err;
        }
    };

    // 로딩 상태
    if (isLoading && !items.length) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">검토 항목을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    // 에러 상태
    if (isError && !items.length) {
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
            {/* 헤더 */}
            <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">검토 및 확정</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            AI 분석 결과를 검토하고 유형을 확정하여 완료합니다.
                        </p>
                    </div>
                    <div className="text-right bg-blue-50 px-6 py-3 rounded-xl border border-blue-100">
                        <div className="text-3xl font-bold text-blue-600">
                            {selectedType === 'F' ? typeCounts.F : (typeCounts.A + typeCounts.B + typeCounts.C + typeCounts.D)}
                        </div>
                        <div className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                            {selectedType === 'F' ? '검색 결과' : '전체 검토대기'}
                        </div>
                    </div>
                </div>

                {/* Type 선택 탭 */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {['A', 'B', 'C', 'D', 'F'].map((type) => {
                        const config = SUPPORT_TYPES[type];
                        const isActive = selectedType === type;
                        const count = typeCounts[type];

                        return (
                            <button
                                key={type}
                                onClick={() => setSelectedType(type)}
                                className={`flex-1 min-w-[140px] px-4 py-3 rounded-xl font-semibold transition-all duration-200 border-2 ${isActive
                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md transform -translate-y-0.5'
                                    : 'bg-white text-gray-700 border-gray-100 hover:border-blue-200 hover:bg-blue-50'
                                    }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm opacity-80 uppercase">{config.name}</span>
                                    {selectedType !== 'F' && type !== 'F' && (
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${isActive ? 'bg-white bg-opacity-20 text-white' : 'bg-gray-100 text-gray-500'}`}>
                                            {count}
                                        </span>
                                    )}
                                </div>
                                <div className="text-lg flex items-center gap-1">
                                    {config.label}
                                    <span className="text-xs font-normal opacity-70">({config.description})</span>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Type F 검색 */}
                {selectedType === 'F' && (
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchKeyword}
                                onChange={(e) => setSearchKeyword(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSearchF()}
                                placeholder="Type F 항목 검색 (키워드 입력 후 검색)"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <button
                            onClick={handleSearchF}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            검색
                        </button>
                    </div>
                )}
            </div>

            {/* 안내 메시지 (Type F 검색 전) */}
            {selectedType === 'F' && !searchKeyword.trim() && displayItems.length === 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        Type F 항목 검색
                    </h3>
                    <p className="text-gray-600">
                        검색어를 입력하여 Type F 항목을 조회하세요.
                    </p>
                </div>
            )}

            {/* 빈 상태 */}
            {displayItems.length === 0 && (selectedType !== 'F' || searchKeyword.trim()) && (
                <div className="bg-white rounded-lg shadow p-12 text-center border border-dashed border-gray-300">
                    <div className="text-6xl mb-4">✅</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                        검토 대기 항목이 없습니다
                    </h3>
                    <p className="text-gray-600">
                        모든 {SUPPORT_TYPES[selectedType]?.label} 항목이 확정되었습니다.
                    </p>
                </div>
            )}

            {/* 검토 카드 그리드 */}
            {displayItems.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {displayItems.map((item) => (
                        <UniversalReviewCard
                            key={item.id}
                            item={item}
                            onConfirmationChange={handleConfirmationChange}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default BizRadarReviewLayout;
