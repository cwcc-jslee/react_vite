
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '@components/ui';
import { FaTrophy, FaTimesCircle, FaBan } from 'react-icons/fa';

const ResultInputModal = ({ isOpen, onClose, onSave, item }) => {
    const [resultType, setResultType] = useState('Win'); // 'Win' | 'Loss' | 'Drop'
    const [amount, setAmount] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (isOpen && item) {
            setResultType('Win');
            setAmount(item.amount || '');
            setReason('');
        }
    }, [isOpen, item]);

    const handleSave = () => {
        onSave({
            itemId: item.id,
            result: resultType,
            finalAmount: resultType === 'Win' ? amount : null,
            lossReason: (resultType === 'Loss' || resultType === 'Drop') ? reason : null
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="결과 확정 (Result Confirmation)"
            size="md"
        >
            <div className="space-y-6 py-2">
                {/* Result Type Selection */}
                <div className="grid grid-cols-3 gap-3">
                    <button
                        className={`flex flex - col items - center justify - center p - 3 rounded - lg border - 2 transition - all ${resultType === 'Win' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'} `}
                        onClick={() => setResultType('Win')}
                    >
                        <FaTrophy className={`w - 6 h - 6 mb - 2 ${resultType === 'Win' ? 'text-blue-600' : 'text-gray-400'} `} />
                        <span className="font-bold text-sm">수주 성공 (Win)</span>
                    </button>
                    <button
                        className={`flex flex - col items - center justify - center p - 3 rounded - lg border - 2 transition - all ${resultType === 'Loss' ? 'border-red-500 bg-red-50 text-red-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'} `}
                        onClick={() => setResultType('Loss')}
                    >
                        <FaTimesCircle className={`w - 6 h - 6 mb - 2 ${resultType === 'Loss' ? 'text-red-600' : 'text-gray-400'} `} />
                        <span className="font-bold text-sm">수주 실패 (Loss)</span>
                    </button>
                    <button
                        className={`flex flex - col items - center justify - center p - 3 rounded - lg border - 2 transition - all ${resultType === 'Drop' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-500 hover:bg-gray-50'} `}
                        onClick={() => setResultType('Drop')}
                    >
                        <FaBan className={`w - 6 h - 6 mb - 2 ${resultType === 'Drop' ? 'text-orange-600' : 'text-gray-400'} `} />
                        <span className="font-bold text-sm">미참여 (Drop)</span>
                    </button>
                </div>

                {/* Dynamic Inputs based on Result Type */}
                {resultType === 'Win' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">최종 수주 금액 (확정)</label>
                            <Input
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="예: 3.5억"
                                autoFocus
                            />
                            <p className="text-xs text-blue-600 mt-1">※ 계약 금액을 정확히 입력해주세요.</p>
                        </div>
                    </div>
                )}

                {resultType === 'Loss' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">실패 사유</label>
                            <Select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="mb-2"
                            >
                                <option value="">사유를 선택해주세요</option>
                                <option value="price">가격 경쟁력 부족</option>
                                <option value="tech">기술 점수 미달</option>
                                <option value="network">영업력/네트워크 부족</option>
                                <option value="spec">발주처 요구사항 불일치</option>
                                <option value="other">기타</option>
                            </Select>
                            {reason === 'other' && (
                                <Input
                                    placeholder="구체적인 사유를 입력하세요"
                                    autoFocus
                                />
                            )}
                        </div>
                    </div>
                )}

                {resultType === 'Drop' && (
                    <div className="space-y-4 animate-fadeIn">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">미참여 사유</label>
                            <Select
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                className="mb-2"
                            >
                                <option value="">사유를 선택해주세요</option>
                                <option value="internal">내부 사정 (인력/일정)</option>
                                <option value="budget">예산/수익성 부족</option>
                                <option value="client">고객사 의사 변경</option>
                                <option value="tech_mismatch">기술 스택 불일치</option>
                                <option value="other">기타</option>
                            </Select>
                            {reason === 'other' && (
                                <Input
                                    placeholder="구체적인 사유를 입력하세요"
                                    autoFocus
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-gray-100">
                <Button variant="secondary" onClick={onClose}>취소</Button>
                <Button variant="primary" onClick={handleSave}>
                    확정 저장
                </Button>
            </div>
        </Modal>
    );
};

export default ResultInputModal;
