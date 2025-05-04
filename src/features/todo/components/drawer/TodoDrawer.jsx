import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDrawer, closeDrawer } from '../../../../store/slices/uiSlice';
import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer';
import ActionMenuBar from '../../../../shared/components/ui/button/ActionMenuBar';
import WorkAddForm from '../../../work/components/forms/WorkAddForm';

const TodoDrawer = ({ drawer }) => {
  const dispatch = useDispatch();
  const { visible, mode, options = {} } = drawer;
  const { taskId } = options;

  // 현재 선택된 작업 정보
  const [currentTask, setCurrentTask] = useState(null);

  // 코드북 데이터 가져오기

  // drawer가 열릴 때마다 선택된 작업 정보 가져오기
  useEffect(() => {
    if (visible && taskId) {
      // TODO: taskId로 작업 정보를 가져오는 로직 구현
      // 임시로 taskId를 currentTask로 설정
      setCurrentTask({ id: taskId });
    }
  }, [visible, options]);

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
    if (currentTask && mode) {
      const titles = {
        add: `작업 등록 - (${currentTask.id})`,
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

  // 작업 등록 폼 컴포넌트
  const AddContent = ({ task }) => {
    if (!task)
      return <div className="p-4">작업 정보를 불러오는 중입니다...</div>;
    return <WorkAddForm taskId={task.id} />;
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
      {mode === 'add' && <AddContent task={currentTask} />}
    </BaseDrawer>
  );
};

export default TodoDrawer;
