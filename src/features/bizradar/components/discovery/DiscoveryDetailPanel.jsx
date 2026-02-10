import React from 'react';
import AIInsightActionPanel from './AIInsightActionPanel';
import ContextViewer from './ContextViewer';

const DiscoveryDetailPanel = ({
    item,
    isProcessing,
    selectedCategory,
    reviewComment,
    onCategorySelect,
    onReviewCommentChange,
    onConfirm,
    onReject
}) => {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Zone B: AI Insight & Action (Sticky) */}
            <AIInsightActionPanel
                item={item}
                isSubmitting={isProcessing}
                selectedCategory={selectedCategory}
                reviewComment={reviewComment}
                onCategorySelect={onCategorySelect}
                onReviewCommentChange={onReviewCommentChange}
                onConfirm={onConfirm}
                onReject={onReject}
            />

            {/* Zone C: Context Viewer (Scrollable) */}
            <ContextViewer item={item} />
        </div>
    );
};

export default DiscoveryDetailPanel;
