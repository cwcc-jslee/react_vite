import React from 'react';
import { Card, Button } from '@shared/components/ui';

/**
 * Todo 패널 섹션 컴포넌트
 * 선택된 작업의 상세 정보를 표시하는 패널 담당
 *
 * @param {Object} props
 * @param {Object} props.task - 표시할 작업 객체
 * @param {string} props.panelType - 패널 타입 ('view', 'edit' 등)
 * @param {Function} props.onClose - 패널 닫기 함수
 * @param {string} [props.title] - 패널 제목 (기본값: 패널 타입에 따라 자동 설정)
 * @param {string} [props.headerBgColor] - 헤더 배경색 (기본값: 패널 타입에 따라 자동 설정)
 * @param {React.ReactNode} [props.headerActions] - 헤더에 추가할 액션 버튼들
 * @param {boolean} [props.isLoading] - 로딩 상태 여부
 * @param {React.ReactNode} [props.children] - 패널 내부 컨텐츠 (없으면 기본 컨텐츠 사용)
 */
const TodoPanelSection = ({
  task,
  panelType,
  onClose,
  title,
  headerBgColor,
  headerActions,
  isLoading = false,
  children,
}) => {
  // 패널 타입에 따른 기본값 설정
  const getPanelDefaults = () => {
    switch (panelType) {
      case 'view':
        return {
          title: '작업 상세 정보',
          headerBgColor: 'bg-blue-50',
        };
      case 'edit':
        return {
          title: '작업 수정',
          headerBgColor: 'bg-orange-50',
        };
      case 'create':
        return {
          title: '새 작업 생성',
          headerBgColor: 'bg-green-50',
        };
      default:
        return {
          title: '작업 정보',
          headerBgColor: 'bg-gray-50',
        };
    }
  };

  const defaults = getPanelDefaults();
  const panelTitle = title || defaults.title;
  const bgColor = headerBgColor || defaults.headerBgColor;

  // 기본 컨텐츠 렌더링 (children이 없을 경우)
  const renderDefaultContent = () => {
    if (!task) return <div className="p-4">선택된 작업이 없습니다.</div>;

    switch (panelType) {
      case 'view':
        return (
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-lg">{task.name}</h3>
              <p className="text-sm text-gray-500">ID: {task.id}</p>
            </div>
            <div>
              <h4 className="font-semibold">설명</h4>
              <p className="text-sm">
                {task.description || '설명이 없습니다.'}
              </p>
            </div>
            {/* 필요한 추가 정보 표시 */}
          </div>
        );
      case 'edit':
        return <p>작업 수정 폼이 여기에 들어갑니다.</p>;
      default:
        return <p>컨텐츠가 정의되지 않았습니다.</p>;
    }
  };

  // 로딩 중 오버레이
  const renderLoadingOverlay = () => {
    if (!isLoading) return null;

    return (
      <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
        <div className="flex flex-col items-center">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-2 text-blue-600 font-medium">처리 중...</p>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full relative">
      {renderLoadingOverlay()}
      <Card.Header className={bgColor}>
        <div className="flex justify-between items-center">
          <Card.Title>{panelTitle}</Card.Title>
          <div className="flex items-center space-x-2">
            {headerActions}
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="!p-1"
              disabled={isLoading}
            >
              닫기
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Content>{children || renderDefaultContent()}</Card.Content>
    </Card>
  );
};

export default TodoPanelSection;
