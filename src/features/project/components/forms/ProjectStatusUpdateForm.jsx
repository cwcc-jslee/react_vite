// src/features/project/components/forms/ProjectStatusUpdateForm.jsx
// 프로젝트 상태 변경을 위한 폼 컴포넌트
// 프로젝트 상태 및 종료타입을 변경합니다

import React from 'react';
import { useCodebook } from '../../../../shared/hooks/useCodebook';
import {
  FormItem,
  Group,
  Label,
  Select,
  Button,
  Card,
  Stack,
} from '../../../../shared/components/ui';
import { useProjectUpdate } from '../../hooks/useProjectUpdate';
import { notification } from '../../../../shared/services/notification';
import useUiStore from '../../../../shared/hooks/useUiStore';
import { useProjectStore } from '../../hooks/useProjectStore';

// 프로젝트 상태 변경 폼 컴포넌트
const ProjectStatusUpdateForm = ({ data }) => {
  const { actions: uiActions } = useUiStore();
  const { actions } = useProjectStore();

  const {
    formData,
    isSubmitting,
    error,
    codebooks,
    updateField,
    handleSubmit,
    handleCancel,
    availableStatuses,
  } = useProjectUpdate(data);

  // 상태 변경 여부
  const isStatusChanged = formData.pjtStatus?.id !== data.pjtStatus?.id;
  const hasChanges = isStatusChanged;

  const prevStatusName = data.pjtStatus?.name;
  const nextStatusName = formData.pjtStatus?.name;

  // 제출 처리 함수
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await handleSubmit(e);

      if (result.success) {
        const description = `${prevStatusName} → ${nextStatusName} 상태로 변경되었습니다.`;

        notification.success({
          message: '프로젝트 상태 변경 성공',
          description,
        });
        // 프로젝트 상페 페이지 리로드
        actions.detail.fetchDetail(data.id);

        // drawer 닫기
        uiActions.drawer.close();
      } else {
        notification.error({
          message: '프로젝트 상태 변경 실패',
          description:
            result.error?.message || '상태 변경 중 오류가 발생했습니다.',
        });
      }
    } catch (err) {
      notification.error({
        message: '프로젝트 상태 변경 실패',
        description: err.message || '상태 변경 중 오류가 발생했습니다.',
      });
    }
  };

  return (
    <Card className="w-full p-6">
      <Group direction="horizontal" className="gap-6">
        {/* 상태 변경 내역 표기 */}
        {hasChanges && (
          <div className="text-sm text-blue-600 font-semibold mb-2">
            {isStatusChanged && (
              <div>
                {prevStatusName} → {nextStatusName}
              </div>
            )}
          </div>
        )}

        {/* 상태가 변경되지 않았을 때만 FormItem(상태 셀렉트) 노출, 아니면 동일 공간 차지하는 빈 div */}
        {!isStatusChanged ? (
          <FormItem className="flex-1">
            <Label className="text-left mb-2">상태</Label>
            <Select
              name="pjtStatus"
              value={formData.pjtStatus?.id}
              onChange={(e) => {
                const selectedId = e.target.value;
                const selectedItem = codebooks?.pjtStatus?.find(
                  (item) =>
                    item.id === selectedId || item.id === Number(selectedId),
                );
                updateField('pjtStatus', selectedItem);
              }}
              className="w-full"
              disabled={availableStatuses.length === 0}
            >
              {availableStatuses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
        ) : (
          <div className="flex-1" />
        )}
      </Group>

      {/* 상태 세부 내용 및 변경 사유 (상태가 변경된 경우에만 표시) */}
      {isStatusChanged && (
        <>
          <Group direction="vertical" className="gap-4 mt-4">
            <FormItem className="flex-1">
              <Label className="text-left mb-2">상태 세부 내용</Label>
              <input
                type="text"
                name="statusDetail"
                value={formData.statusDetail || ''}
                onChange={(e) => updateField('statusDetail', e.target.value)}
                placeholder="예: 1차 수정반영, 2차 검수"
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="text-xs text-gray-500 mt-1">
                상태에 대한 추가 설명 (선택사항, 최대 100자)
              </div>
            </FormItem>

            <FormItem className="flex-1">
              <Label className="text-left mb-2">변경 사유</Label>
              <textarea
                name="changeDescription"
                value={formData.changeDescription || ''}
                onChange={(e) => updateField('changeDescription', e.target.value)}
                placeholder="상태 변경 사유를 입력하세요"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="text-xs text-gray-500 mt-1">
                상태 변경 이유에 대한 상세 설명 (선택사항)
              </div>
            </FormItem>
          </Group>
        </>
      )}

      <Group direction="horizontal" className="gap-6 pt-4">
        <Button
          type="button"
          variant="secondary"
          disabled={!hasChanges || isSubmitting}
          className="min-w-[100px] h-10"
          onClick={handleCancel}
        >
          취소
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={
            !hasChanges ||
            isSubmitting ||
            availableStatuses.length === 0
          }
          className="min-w-[100px] h-10"
          onClick={handleFormSubmit}
        >
          {isSubmitting ? '처리중...' : '저장'}
        </Button>
      </Group>
    </Card>
  );
};

export default ProjectStatusUpdateForm;
