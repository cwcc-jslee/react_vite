// src/features/project/components/registration/TaskDetailDrawer.jsx
/**
 * 작업 상세 정보 입력/수정용 Drawer (디자인 개선)
 * - Footer 영역 분리
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Drawer } from '@shared/components/drawer';
import { Button } from '@shared/components/ui';
import ProjectTaskForm from '../forms/ProjectTaskForm';

const TaskDetailDrawer = ({ 
  visible, 
  onClose, 
  task, 
  onSave, 
  codebooks, 
  usersData,
  mode = 'edit'
}) => {
  const title = mode === 'add' ? '새 작업 등록' : '작업 상세 정보';
  
  // 폼 내부의 submit 트리거를 위한 ref (필요시 사용, 현재는 ProjectTaskForm 내부 버튼 사용)
  // 디자인 일관성을 위해 ProjectTaskForm의 버튼을 숨기고 Drawer Footer를 사용할 수도 있음
  // 여기서는 ProjectTaskForm 내부 구조를 변경하여 Footer를 렌더링하도록 함

  return (
    <Drawer
      visible={visible}
      title={title}
      onClose={onClose}
      width="LG"
      level="secondary"
      enableOverlayClick={true}
      mode={mode}
      animationEnabled={true}
      // footer는 ProjectTaskForm 내부에서 처리하거나 여기서 공통 버튼을 둘 수 있음
      // 현재 ProjectTaskForm이 자체적으로 버튼을 가지고 있으므로 여기서는 생략
    >
      <div className="h-full flex flex-col bg-gray-50/30">
        <ProjectTaskForm
          task={task}
          codebooks={codebooks}
          usersData={usersData}
          onSave={(data) => {
            onSave(data);
            onClose();
          }}
          onCancel={onClose}
          isDrawerMode={true} // 디자인 분기용 prop
        />
      </div>
    </Drawer>
  );
};

TaskDetailDrawer.propTypes = {
  visible: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  task: PropTypes.object,
  onSave: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(['add', 'edit']),
};

export default TaskDetailDrawer;