/**
 * Todo 전용 Drawer 컴포넌트 (신규 Drawer 시스템 적용)
 * - Framer Motion 애니메이션
 * - useDrawer Hook 사용
 * - 작업 등록 기능
 */

import React from 'react';
import { Drawer, useDrawer, DRAWER_SIZES } from '@shared/components/drawer';
import WorkAddForm from '../forms/WorkAddForm';

const TodoDrawer = ({ drawer }) => {
  const { close } = useDrawer();
  const { visible, mode, options = {} } = drawer;
  const { taskId } = options;

  // Drawer 헤더 타이틀 설정
  const getHeaderTitle = () => {
    if (taskId && mode) {
      const titles = {
        add: `작업 등록 - (${taskId})`,
      };
      return titles[mode] || '';
    }
    return '';
  };

  return (
    <Drawer
      visible={visible}
      title={getHeaderTitle()}
      onClose={close}
      width={DRAWER_SIZES.XL}
      enableOverlayClick={false}
      mode={mode}
      animationEnabled={true}
    >
      {mode === 'add' && taskId && <WorkAddForm taskId={taskId} />}
    </Drawer>
  );
};

export default TodoDrawer;
