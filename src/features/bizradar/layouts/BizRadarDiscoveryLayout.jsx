import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DiscoverySidebar from '../components/discovery/DiscoverySidebar';
import DiscoveryDetailPanel from '../components/discovery/DiscoveryDetailPanel';
import { useBizRadarStore } from '../hooks/useBizRadarStore';

const BizRadarDiscoveryLayout = () => {
    const { items, isLoading, isError, error, actions } = useBizRadarStore();
    const [selectedId, setSelectedId] = useState(null);
    const [filter, setFilter] = useState('ALL');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [reviewComment, setReviewComment] = useState('');

    // Load initial data - pass filters directly to avoid Redux state timing issues
    useEffect(() => {
        const discoveryFilters = {
            analyzed_category: 'A,B,C,D',
            review_status: '!confirmed'
        };
        actions.filter.setFilters(discoveryFilters);
        actions.data.fetchList({ filters: discoveryFilters });
    }, []);

    // Filter items locally for 'New' status (pending review)
    const discoveryItems = useMemo(() => {
        if (!items || !Array.isArray(items)) return [];
        return items.filter(item => {
            const status = item.reviewStatus || item.review_status || 'pending';
            return status === 'pending' || status === 'rejected';
        });
    }, [items]);

    // Select first item once loaded
    useEffect(() => {
        if (!selectedId && discoveryItems && discoveryItems.length > 0) {
            setSelectedId(discoveryItems[0].id);
        }
    }, [discoveryItems, selectedId]);

    const selectedItem = useMemo(() =>
        discoveryItems.find(item => item.id === selectedId) || null
        , [discoveryItems, selectedId]);

    // Initialize selectedCategory when item changes
    useEffect(() => {
        if (selectedItem) {
            const currentCategory = selectedItem.confirmedCategory ||
                selectedItem.confirmed_category ||
                selectedItem.analyzedCategory ||
                selectedItem.analyzed_category;
            setSelectedCategory(currentCategory || null);
            setReviewComment(''); // Reset comment when switching items
        }
    }, [selectedItem]);

    // Keyboard Shortcuts
    const handleKeyDown = useCallback(
        (e) => {
            if (!selectedItem) return;

            const currentIndex = discoveryItems.findIndex((item) => item.id === selectedItem.id);

            switch (e.key) {
                case 'ArrowUp':
                    if (currentIndex > 0) {
                        setSelectedId(discoveryItems[currentIndex - 1].id);
                    }
                    break;
                case 'ArrowDown':
                    if (currentIndex < discoveryItems.length - 1) {
                        setSelectedId(discoveryItems[currentIndex + 1].id);
                    }
                    break;
                case '1': setSelectedCategory('A'); break;
                case '2': setSelectedCategory('B'); break;
                case '3': setSelectedCategory('C'); break;
                case '4': setSelectedCategory('D'); break;
                case '5': setSelectedCategory('F'); break;
                case 'Enter':
                    if (selectedCategory) {
                        handleConfirm();
                    }
                    break;
                case 'Delete': handleReject(); break;
                default: break;
            }
        },
        [selectedItem, discoveryItems, selectedCategory]
    );

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Category selection (local state only)
    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
    };

    // Review comment change
    const handleReviewCommentChange = (comment) => {
        setReviewComment(comment);
    };

    const [isProcessing, setIsProcessing] = useState(false);

    const handleConfirm = async () => {
        console.log('[Discovery] handleConfirm called', { selectedId, selectedCategory, reviewComment, isProcessing });

        if (isProcessing) {
            console.log('[Discovery] Already processing, returning');
            return;
        }

        if (!selectedCategory) {
            alert('카테고리를 선택해주세요.');
            return;
        }

        // Find next item BEFORE the API call
        const currentIndex = discoveryItems.findIndex((item) => item.id === selectedId);
        const nextItem = discoveryItems[currentIndex + 1] || null;
        console.log('[Discovery] Current index:', currentIndex, 'Next item:', nextItem?.id);

        setIsProcessing(true);
        try {
            console.log('[Discovery] Calling confirm API...', {
                id: selectedId,
                review_status: 'confirmed',
                confirmed_category: selectedCategory,
                review_comment: reviewComment
            });

            await actions.data.confirm(selectedId, {
                review_status: 'confirmed',
                confirmed_category: selectedCategory,
                review_comment: reviewComment
            });

            console.log('[Discovery] Confirm API success, refreshing list...');

            // Refresh the list to sync with DB
            await actions.data.fetchList();

            console.log('[Discovery] List refreshed, moving to next item');

            // Move to next item
            setSelectedId(nextItem ? nextItem.id : null);
            setReviewComment(''); // Reset comment
        } catch (err) {
            console.error('[Discovery] Confirm failed:', err);
            alert('확정 처리 중 오류가 발생했습니다.');
        } finally {
            console.log('[Discovery] Setting isProcessing to false');
            setIsProcessing(false);
        }
    };

    const handleReject = async () => {
        if (isProcessing) return;

        // Find next item BEFORE the API call
        const currentIndex = discoveryItems.findIndex((item) => item.id === selectedId);
        const nextItem = discoveryItems[currentIndex + 1] || null;

        setIsProcessing(true);
        try {
            await actions.data.confirm(selectedId, {
                review_status: 'rejected',
                review_comment: reviewComment
            });

            // Refresh the list to sync with DB
            await actions.data.fetchList();

            // Move to next item
            setSelectedId(nextItem ? nextItem.id : null);
            setReviewComment(''); // Reset comment
        } catch (err) {
            console.error('Reject failed:', err);
            alert('재검토 처리 중 오류가 발생했습니다.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isLoading && discoveryItems.length === 0) {
        return <div className="flex h-full items-center justify-center">Loading...</div>;
    }

    return (
        <div className="flex h-full w-full overflow-hidden bg-white">
            {/* Zone A: Left Pane (List) */}
            <div className="w-[30%] min-w-[320px] border-r border-gray-200 flex flex-col">
                <DiscoverySidebar
                    items={discoveryItems}
                    selectedItem={selectedItem}
                    onSelect={(item) => setSelectedId(item.id)}
                    filter={filter}
                    setFilter={setFilter}
                />
            </div>

            {/* Zone B & C: Right Pane (Detail & Context) */}
            <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
                {selectedItem ? (
                    <DiscoveryDetailPanel
                        item={selectedItem}
                        isProcessing={isProcessing}
                        selectedCategory={selectedCategory}
                        reviewComment={reviewComment}
                        onCategorySelect={handleCategorySelect}
                        onReviewCommentChange={handleReviewCommentChange}
                        onConfirm={handleConfirm}
                        onReject={handleReject}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                        <div className="text-4xl mb-4">✅</div>
                        <p>검토할 사업 기회가 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BizRadarDiscoveryLayout;
