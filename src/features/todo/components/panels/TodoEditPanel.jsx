import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Alert } from '@shared/components/ui';

/**
 * 할일 수정 폼을 제공하는 패널 컴포넌트
 * TodoPanelSection의 children으로 사용
 */
const TodoEditPanel = ({
  task,
  onSave,
  onCancel,
  isLoading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    startDate: '',
  });

  // 초기 데이터 설정
  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().split('T')[0]
          : '',
        startDate: task.startDate
          ? new Date(task.startDate).toISOString().split('T')[0]
          : '',
      });
    }
  }, [task]);

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSave && !isLoading) {
      onSave({ ...task, ...formData });
    }
  };

  if (!task) return <div>로딩 중...</div>;

  // 새 작업 생성 또는 기존 작업 수정 여부 확인
  const isNewTask = task.isNew === true;
  const actionText = isNewTask ? '생성' : '수정';

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        {/* 오류 메시지 표시 */}
        {error && (
          <Alert variant="error" className="mb-4">
            <p className="font-semibold">저장 오류</p>
            <p>{error}</p>
          </Alert>
        )}

        {/* 제목 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            제목
          </label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            placeholder="할일 제목을 입력하세요"
            className="w-full"
            disabled={isLoading}
          />
        </div>

        {/* 설명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            설명
          </label>
          {/* <Textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="상세 설명을 입력하세요"
            className="w-full"
            rows={4}
            disabled={isLoading}
          /> */}
        </div>

        {/* 상태 및 우선순위 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full"
              disabled={isLoading}
            >
              <option value="todo">할일</option>
              <option value="in_progress">진행중</option>
              <option value="done">완료</option>
              <option value="pending">보류</option>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              우선순위
            </label>
            <Select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full"
              disabled={isLoading}
            >
              <option value="low">낮음</option>
              <option value="medium">보통</option>
              <option value="high">높음</option>
              <option value="urgent">긴급</option>
            </Select>
          </div>
        </div>

        {/* 날짜 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작일
            </label>
            <Input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full"
              disabled={isLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              마감일
            </label>
            <Input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="w-full"
              disabled={isLoading}
            />
          </div>
        </div>

        {/* 버튼 */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            취소
          </Button>
          <Button type="submit" variant="primary" disabled={isLoading}>
            {actionText}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default TodoEditPanel;
