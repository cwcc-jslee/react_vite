import React from 'react';
import { useDispatch } from 'react-redux';
import { setDrawer, closeDrawer } from '../../../../store/slices/uiSlice';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer';
import ActionMenuBar from '../../../../shared/components/ui/button/ActionMenuBar';
import WorkAddForm from '../../../work/components/forms/WorkAddForm';

const TodoDrawer = ({ drawer }) => {
  const dispatch = useDispatch();
  const { visible, mode, options = {} } = drawer;
  const { taskId } = options;

  const controlMenus = [
    {
      key: 'add',
      label: '작업등록',
      active: mode === 'add',
      onClick: () => {
        handleSetDrawer({ mode: 'add' });
      },
    },
  ];

  const functionMenus = [];

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

  const handleSetDrawer = (newOptions) => {
    dispatch(
      setDrawer({
        ...drawer,
        ...newOptions,
      }),
    );
  };

  const setDrawerClose = () => {
    dispatch(closeDrawer());
  };

  return (
    <BaseDrawer
      visible={visible}
      title={getHeaderTitle()}
      onClose={setDrawerClose}
      menu={
        <ActionMenuBar
          controlMenus={controlMenus}
          functionMenus={functionMenus}
        />
      }
      width="900px"
      enableOverlayClick={false}
      controlMode={mode}
    >
      {mode === 'add' && taskId && <WorkAddForm taskId={taskId} />}
    </BaseDrawer>
  );
};

export default TodoDrawer;
