// src/features/project/components/ui/ProjectBaseForm.jsx
// 프로젝트 정보 입력을 위한 폼 컴포넌트
// 고객사, SFA, 프로젝트명, 서비스, 사업부 정보를 입력 받습니다

import React from 'react';
import { useCodebook } from '../../../../shared/hooks/useCodebook';
import {
  FormItem,
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

// 프로젝트 정보 입력 폼 컴포넌트
const ProjectEditBaseForm = ({ data }) => {
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
  const prevStatusName = data.pjtStatus?.name;
  const nextStatusName = formData.pjtStatus?.name;

  // 제출 처리 함수
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await handleSubmit(e);

      if (result.success) {
        notification.success({
          message: '프로젝트 상태 변경 성공',
          description: `${prevStatusName} → ${nextStatusName} 상태로 변경되었습니다.`,
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
      <Stack spacing={6}>
        {/* 상태 변경 내역 표기 */}
        {isStatusChanged && (
          <div className="text-sm text-blue-600 font-semibold mb-2">
            {prevStatusName} → {nextStatusName}
          </div>
        )}

        <div className="flex items-center gap-6">
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
          <div className="flex justify-end gap-2 items-center">
            <Button
              type="button"
              variant="secondary"
              disabled={!isStatusChanged || isSubmitting}
              className="min-w-[100px] h-10"
              onClick={handleCancel}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={
                !isStatusChanged ||
                isSubmitting ||
                availableStatuses.length === 0
              }
              className="min-w-[100px] h-10"
              onClick={handleFormSubmit}
            >
              {isSubmitting ? '처리중...' : '저장'}
            </Button>
          </div>
        </div>
        {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
      </Stack>
    </Card>
  );
};

export default ProjectEditBaseForm;
