/**
 * 프로젝트 작업 수정 Drawer 컴포넌트
 * - 프로젝트 태스크를 칸반보드 형태로 수정
 * - 버킷 추가/삭제, 태스크 추가/수정/삭제 기능 제공
 */
import React, { useState, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { FiPlus } from 'react-icons/fi';
import { Drawer } from '@shared/components/drawer';
import { Button } from '@shared/components/ui';
import { apiCommon } from '@shared/api/apiCommon';
import ModalRenderer from '@shared/components/ui/modal/ModalRenderer';

// 커스텀 훅
import { useProjectBucketStore } from '../../hooks/useProjectBucketStore';
import { useCodebook } from '@shared/hooks/useCodebook';
import useSelectData from '@shared/hooks/useSelectData';
import useModal from '@shared/hooks/useModal';
import { useProjectTaskSubmit } from '../../hooks/useProjectTaskSubmit';

// 컴포넌트
import ProjectTaskBoard from '../card/ProjectTaskBoard';
import ProjectTaskEditForm from '../forms/ProjectTaskEditForm';

const ProjectTaskEditDrawer = ({
  visible,
  data, // project data with projectTaskBuckets and projectTasks
  onClose,
  onSaveSuccess,
}) => {
  // 칸반 보드 스토어
  const {
    buckets,
    editState,
    actions: { bucket, edit, task, ui },
  } = useProjectBucketStore();

  // 코드북 및 사용자 데이터
  const { data: codebooks, isLoading: isLoadingCodebook } = useCodebook([
    'priorityLevel',
    'taskProgress',
  ]);
  const { data: usersData, isLoading: isUsersLoading } = useSelectData(
    apiCommon.getUsers,
  );

  // 모달 상태
  const { modalState, openModal, closeModal, handleConfirm } = useModal();

  // 태스크 수정 여부 상태
  const [isTaskModified, setIsTaskModified] = useState(false);

  // 제출 상태
  const { isSubmitting, progress, handleTaskUpdate } = useProjectTaskSubmit();

  // 프로젝트 데이터가 변경될 때마다 칸반 보드 동기화
  useEffect(() => {
    if (visible && data) {
      const { projectTaskBuckets = [], projectTasks = [] } = data;
      if (projectTaskBuckets.length > 0 || projectTasks.length > 0) {
        bucket.syncProjectTasksToKanban(projectTaskBuckets, projectTasks);
      }
      setIsTaskModified(false);
    }
  }, [visible, data?.id]);

  // Drawer 닫힐 때 상태 초기화
  useEffect(() => {
    if (!visible) {
      setIsTaskModified(false);
    }
  }, [visible]);

  /**
   * 작업 수정 모달 핸들러
   */
  const handleOpenTaskEditModal = (taskData, bucketIndex, taskIndex) => {
    openModal(
      'custom',
      '작업 수정',
      <ProjectTaskEditForm
        task={taskData}
        codebooks={codebooks}
        usersData={usersData}
        onSave={(updatedTask) => {
          task.updateTask(bucketIndex, taskIndex, updatedTask);
          setIsTaskModified(true);
          closeModal();
        }}
        onCancel={closeModal}
      />,
      null,
      null,
      null,
      { size: 'xl' },
    );
  };

  /**
   * 새 버킷(컬럼) 추가 핸들러
   */
  const handleAddColumnClick = () => {
    const newColumn = {
      name: '새 버킷',
      tasks: [],
    };
    bucket.addColumn(newColumn);
    setIsTaskModified(true);
  };

  /**
   * 저장 핸들러
   */
  const handleSave = async () => {
    const result = await handleTaskUpdate(buckets);
    if (result.success) {
      setIsTaskModified(false);
      onSaveSuccess?.();
    }
  };

  /**
   * 닫기 핸들러
   */
  const handleClose = () => {
    if (isTaskModified) {
      // 변경사항이 있으면 확인 후 닫기
      if (window.confirm('저장하지 않은 변경사항이 있습니다. 닫으시겠습니까?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  if (!data) return null;

  return (
    <>
      <Drawer
        visible={visible}
        title={
          <div className="flex items-center gap-3">
            <span>작업 수정 - {data.name || ''}</span>
          </div>
        }
        onClose={handleClose}
        width="WIDE"
        level="secondary"
        enableOverlayClick={false}
        mode="edit"
        animationEnabled={true}
        headerActions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClose}
            >
              취소
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!isTaskModified || isSubmitting}
              onClick={handleSave}
            >
              {isSubmitting ? `저장 중... ${progress}%` : '저장'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col h-full">
          {/* 상단 정보 바 */}
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="text-sm text-gray-600">
              버킷 {buckets.length}개 /
              태스크 {buckets.reduce((sum, b) => sum + (b.tasks?.length || 0), 0)}개
            </div>
            {isTaskModified && (
              <span className="text-sm text-orange-600 font-medium">
                * 변경사항이 있습니다
              </span>
            )}
          </div>

          {/* 칸반보드 컨테이너 */}
          <div
            className="kanban-container flex h-full overflow-x-auto overflow-y-hidden flex-grow"
            style={{ height: 'calc(100vh - 200px)' }}
          >
            {buckets.map((bucketData, index) => (
              <ProjectTaskBoard
                key={bucketData.id || index}
                bucket={bucketData}
                bucketIndex={index}
                totalColumns={buckets.length}
                editState={editState}
                handleEditChange={edit.handleEditChange}
                saveEdit={() => {
                  edit.saveEdit();
                  setIsTaskModified(true);
                }}
                cancelEdit={edit.cancelEdit}
                onAddTask={(bucketIdx, taskData) => {
                  task.addTask(bucketIdx, taskData);
                  setIsTaskModified(true);
                }}
                startEditing={edit.startEditing}
                startEditingColumnTitle={(bucketIdx) => {
                  edit.startEditingColumnTitle(bucketIdx);
                }}
                toggleTaskCompletion={(bucketIdx, taskIdx) => {
                  task.toggleCompletion(bucketIdx, taskIdx);
                  setIsTaskModified(true);
                }}
                toggleCompletedSection={ui.toggleCompletedSection}
                deleteTask={(bucketIdx, taskIdx) => {
                  task.deleteTask(bucketIdx, taskIdx);
                  setIsTaskModified(true);
                }}
                deleteColumn={(bucketIdx) => {
                  bucket.deleteColumn(bucketIdx);
                  setIsTaskModified(true);
                }}
                moveColumn={(fromIdx, toIdx) => {
                  bucket.moveColumn(fromIdx, toIdx);
                  setIsTaskModified(true);
                }}
                onOpenTaskEditModal={handleOpenTaskEditModal}
                enableAddTask={true}
              />
            ))}

            {/* 버킷 추가 버튼 */}
            <div className="flex-shrink-0 w-72 h-full flex items-start p-2">
              <button
                className="w-full h-10 bg-indigo-600 text-white border-2 border-indigo-600 rounded-sm flex items-center justify-center text-sm hover:bg-indigo-700 transition-colors"
                onClick={handleAddColumnClick}
              >
                <FiPlus className="mr-2" size={18} />
                <span>버킷 추가</span>
              </button>
            </div>
          </div>
        </div>
      </Drawer>

      {/* 모달 렌더러 */}
      <ModalRenderer
        modalState={modalState}
        closeModal={closeModal}
        handleConfirm={handleConfirm}
      />
    </>
  );
};

ProjectTaskEditDrawer.propTypes = {
  visible: PropTypes.bool.isRequired,
  data: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onSaveSuccess: PropTypes.func,
};

export default ProjectTaskEditDrawer;
