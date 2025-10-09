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
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
    isClosureStatus,
    availableClosureTypes,
  } = useProjectUpdate(data);

  // 상태 변경 여부
  const isStatusChanged = formData.pjtStatus?.id !== data.pjtStatus?.id;
  const isClosureTypeChanged =
    formData.pjtClosureType?.id !== data.pjtClosureType?.id;
  const hasChanges = isStatusChanged || isClosureTypeChanged;

  const prevStatusName = data.pjtStatus?.name;
  const nextStatusName = formData.pjtStatus?.name;
  const prevClosureTypeName = data.pjtClosureType?.name;
  const nextClosureTypeName = formData.pjtClosureType?.name;

  // 제출 처리 함수
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      const result = await handleSubmit(e);

      if (result.success) {
        let description = `${prevStatusName} → ${nextStatusName} 상태로 변경되었습니다.`;

        // 종료타입 변경이 있는 경우 메시지에 추가
        if (isClosureTypeChanged) {
          const closureTypeMsg = prevClosureTypeName
            ? `종료타입: ${prevClosureTypeName} → ${nextClosureTypeName}`
            : `종료타입: ${nextClosureTypeName}`;
          description += ` ${closureTypeMsg}`;
        }

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
      <Group direction="horizontal" className="gap-6">
        {/* 종료타입 선택 (종료 상태일 때만 표시) */}
        {isClosureStatus && (
          <>
            <FormItem className="flex-1">
              <Label className="text-left mb-2">종료타입 *</Label>
              <Select
                name="pjtClosureType"
                value={formData.pjtClosureType?.id || ''}
                onChange={(e) => {
                  const selectedId = e.target.value;
                  const selectedItem = availableClosureTypes.find(
                    (item) =>
                      item.id === selectedId || item.id === Number(selectedId),
                  );
                  updateField('pjtClosureType', selectedItem);
                }}
                className="w-full"
                disabled={availableClosureTypes.length === 0}
              >
                <option value="">종료타입을 선택하세요</option>
                {availableClosureTypes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </Select>
            </FormItem>
            <FormItem className="flex-1">
              <Label className="text-left mb-2">종료일 *</Label>
              <DatePicker
                selected={
                  formData.closureDate ? new Date(formData.closureDate) : null
                }
                onChange={(date) => updateField('closureDate', date)}
                dateFormat="yyyy-MM-dd"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholderText="종료일을 선택하세요"
              />
            </FormItem>
          </>
        )}
      </Group>

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
            availableStatuses.length === 0 ||
            (isClosureStatus &&
              (!formData.pjtClosureType || !formData.closureDate))
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
