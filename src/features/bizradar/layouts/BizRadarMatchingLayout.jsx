import React, { useState } from 'react';
import { Section } from '@shared/layout/components';
import MatchingControlBar from '../components/matching/MatchingControlBar';
import MatchingKanbanBoard from '../components/matching/MatchingKanbanBoard';
import MatchingDetailModal from '../components/matching/MatchingDetailModal';
import ResultInputModal from '../components/matching/ResultInputModal';

const BizRadarMatchingLayout = () => {
    const [viewMode, setViewMode] = useState('board');
    const [selectedItem, setSelectedItem] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Result Modal State
    const [isResultModalOpen, setIsResultModalOpen] = useState(false);
    const [movingItem, setMovingItem] = useState(null);

    // Mock Data
    const [items, setItems] = useState([
        { id: '1', clientName: '(주)대한식품', projectTitle: '2026 AI 바우처 지원사업', amount: '3.0억', dueDate: '2026-02-28', stage: 'proposing', lastContactSimple: '2일 전 통화', picName: '김철수' },
        { id: '2', clientName: '성진테크', projectTitle: '스마트공장 고도화 사업', amount: '1.5억', dueDate: '2026-03-15', stage: 'backlog', lastContactSimple: '1주 전 미팅', picName: '이영희' },
        { id: '3', clientName: '퓨처시스템', projectTitle: '데이터 바우처 가공', amount: '0.7억', dueDate: '2026-02-20', stage: 'verified', lastContactSimple: '오늘 오전 카톡', picName: '박준영' },
        { id: '4', clientName: '메타넷', projectTitle: '클라우드 전환 컨설팅', amount: '5.0억', dueDate: '2026-04-01', stage: 'evaluating', lastContactSimple: '3일 전 메일', picName: '김철수' },
    ]);

    const handleCardClick = (item) => {
        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleCardMove = (itemId, newStage) => {
        // Intercept 'result' stage move
        if (newStage === 'result') {
            const item = items.find(i => i.id === itemId);
            setMovingItem(item);
            setIsResultModalOpen(true);
            return;
        }

        // Verification Modal Logic (Simple Confirm)
        if (newStage === 'verified') {
            const confirmed = window.confirm("고객사 담당자에게 접수 완료 확인을 받으셨나요?\n\n[확인]을 누르면 '접수 확인 완료' 상태로 변경됩니다.");
            if (!confirmed) return;
        }

        updateItemStage(itemId, newStage);
    };

    const handleResultSave = ({ itemId, result, finalAmount, lossReason }) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? {
                    ...item,
                    stage: 'result',
                    result: result,
                    amount: finalAmount || item.amount, // Update amount if Win
                    lossReason: lossReason
                } : item
            )
        );
        setIsResultModalOpen(false);
        setMovingItem(null);
    };

    const updateItemStage = (itemId, stage) => {
        setItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, stage: stage } : item
            )
        );
    };

    return (
        <div className="h-full flex flex-col">
            {/* Header / Control Bar */}
            <MatchingControlBar
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                onFilterChange={(key, val) => console.log(key, val)}
            />

            {/* Content Area */}
            <div className="flex-1 bg-gray-50 rounded-lg border border-gray-200 p-4 overflow-hidden">
                {viewMode === 'board' ? (
                    <MatchingKanbanBoard
                        data={items}
                        onCardClick={handleCardClick}
                        onCardMove={handleCardMove}
                    />
                ) : (
                    <div className="text-center py-20 text-gray-500">
                        리스트 뷰 준비 중입니다... (보드 뷰를 사용해주세요)
                    </div>
                )}
            </div>

            {/* Modals */}
            <MatchingDetailModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}

                data={selectedItem}
            />
            <ResultInputModal
                isOpen={isResultModalOpen}
                onClose={() => setIsResultModalOpen(false)}
                onSave={handleResultSave}
                item={movingItem}
            />
        </div>
    );
};

export default BizRadarMatchingLayout;
