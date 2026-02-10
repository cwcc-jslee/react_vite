import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '@components/ui';
import { FaComments, FaPhoneAlt, FaPaperPlane, FaCheck, FaTimes, FaHistory } from 'react-icons/fa';

const MatchingDetailModal = ({ isOpen, onClose, data, onSave }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [chatInput, setChatInput] = useState('');
    const [logs, setLogs] = useState([
        { id: 1, type: 'system', content: '공고가 자동 매칭되었습니다.', date: '2026-02-01 10:00', user: 'System' },
        { id: 2, type: 'call', content: '김철수 부장님과 통화, 제안 참여 의사 확인', date: '2026-02-02 14:30', user: '나영자' },
    ]);

    if (!isOpen || !data) return null;

    const handleAddLog = () => {
        if (!chatInput.trim()) return;
        const newLog = {
            id: Date.now(),
            type: 'note',
            content: chatInput,
            date: new Date().toISOString().slice(0, 16).replace('T', ' '),
            user: '나영자' // Mock User
        };
        setLogs([newLog, ...logs]);
        setChatInput('');
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={
                <div className="flex flex-col">
                    <span className="text-lg font-bold">{data.clientName}</span>
                    <span className="text-xs text-gray-500 font-normal">{data.projectTitle}</span>
                </div>
            }
            size="lg" // Larger modal for activity log
        >
            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-4">
                <button
                    className={`pb-2 px-4 text-sm font-medium ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('overview')}
                >
                    기본 정보
                </button>
                <button
                    className={`pb-2 px-4 text-sm font-medium ${activeTab === 'activity' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    onClick={() => setActiveTab('activity')}
                >
                    활동 로그 <span className="bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full ml-1">New</span>
                </button>
            </div>

            {/* Content */}
            <div className="h-[500px] overflow-y-auto custom-scrollbar pr-1">
                {activeTab === 'overview' && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">예상 수주액</label>
                                <Input value={data.amount} readOnly className="bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">마감일 (D-DAY)</label>
                                <Input value={data.dueDate} type="date" className="bg-gray-50" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">공고 원문 링크</label>
                            <a href="#" className="text-blue-600 text-sm hover:underline truncate block">
                                https://www.bid.go.kr/example/project/12345
                            </a>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">담당자 메모</label>
                            <textarea
                                className="w-full border border-gray-300 rounded-md p-2 text-sm h-32 resize-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="프로젝트 관련 주요 사항을 메모하세요..."
                            />
                        </div>
                    </div>
                )}

                {activeTab === 'activity' && (
                    <div className="flex flex-col h-full relative">
                        {/* Timeline List */}
                        <div className="flex-1 overflow-y-auto space-y-4 pb-20">
                            {logs.map((log) => (
                                <div key={log.id} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${log.type === 'system' ? 'bg-gray-400' : 'bg-blue-500'}`}>
                                            {log.type === 'system' ? 'Sys' : log.user.charAt(0)}
                                        </div>
                                        <div className="h-full w-px bg-gray-200 my-1"></div>
                                    </div>
                                    <div className="flex-1 pb-4">
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-gray-800">{log.user}</span>
                                            <span className="text-[10px] text-gray-400">{log.date}</span>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-lg mt-1 text-sm text-gray-700 shadow-sm border border-gray-100">
                                            {log.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area (Fixed Bottom) */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white pt-2 border-t border-gray-100">
                            <div className="flex gap-2 items-center">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        className="w-full border border-gray-300 rounded-full pl-4 pr-10 py-2 text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all"
                                        placeholder="활동 내용을 입력하세요 (예: 김부장님과 통화함)"
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleAddLog()}
                                    />
                                    <button
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600"
                                    >
                                        <FaPhoneAlt />
                                    </button>
                                </div>
                                <button
                                    onClick={handleAddLog}
                                    className="bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors shadow-md"
                                >
                                    <FaPaperPlane className="pl-0.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <Button variant="secondary" onClick={onClose}>닫기</Button>
                <Button variant="primary" onClick={onClose}>저장</Button>
            </div>
        </Modal>
    );
};

export default MatchingDetailModal;
