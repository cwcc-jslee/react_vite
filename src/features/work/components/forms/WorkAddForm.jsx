import React, { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import {
  Form,
  FormItem,
  Group,
  Label,
  Input,
  Select,
  Button,
  TextArea,
} from '../../../../shared/components/ui';
import { notification } from '@shared/services/notification';
import { useCodebook } from '@shared/hooks/useCodebook';
import { useWorkStore } from '../../hooks/useWorkStore';
import { useWorkSubmit } from '../../hooks/useWorkSubmit';
import { closeDrawer } from '../../../../store/slices/uiSlice';

const WorkAddForm = ({ taskId }) => {
  const dispatch = useDispatch();
  const { form, actions, validateForm, processSubmit } = useWorkStore();
  const { isSubmitting, handleFormSubmit } = useWorkSubmit();

  // task 상태 가져오기
  const taskState = useSelector((state) => state.task);
  const { items: tasks } = taskState;

  // auth 상태 가져오기
  const authState = useSelector((state) => state.auth);
  const { user } = authState;

  // taskId에 해당하는 작업 정보 찾기
  const currentTask = tasks.find((task) => task.id === taskId);

  const { data: codebooks, isLoading: isLoadingCodebook } = useCodebook([
    'taskProgress', // TASK 진행률
  ]);

  // 현재 진행상태의 인덱스 찾기
  const getCurrentProgressIndex = () => {
    const currentProgress = currentTask?.taskProgress?.name || '0%';
    const progressList = codebooks?.taskProgress || [];
    return progressList.findIndex((item) => item.name === currentProgress);
  };

  // 선택 가능한 진행상태 필터링
  const getAvailableProgressOptions = () => {
    const currentIndex = getCurrentProgressIndex();
    const progressList = codebooks?.taskProgress || [];
    return progressList.filter((item, index) => index >= currentIndex);
  };

  // 오늘 날짜를 YYYY-MM-DD 형식으로 가져오기
  const today = dayjs().format('YYYY-MM-DD');

  // 컴포넌트 마운트 시 폼 데이터 초기화
  useEffect(() => {
    if (!currentTask || !user) return;

    const initialFormData = {
      projectTask: currentTask.id,
      revisionNumber: currentTask.revisionNumber,
      user: user.user.id,
      team: user.user?.team?.id || null,
      workDate: today,
      nonBillableHours: '0',
      taskProgress: currentTask.taskProgress
        ? {
            id: currentTask.taskProgress.id,
            name: currentTask.taskProgress.name,
          }
        : null,
    };

    // setTimeout을 사용하여 마이크로태스크 큐에 넣어 실행
    // 렌더링 중 상태 업데이트로 인한 React 경고를 방지하기 위해 사용
    const timer = setTimeout(() => {
      // 폼 초기화 액션 사용
      actions.form.initializeForm(initialFormData);
    }, 0);

    // cleanup 함수
    return () => {
      clearTimeout(timer);
      // 폼 초기화
      actions.form.resetForm();
    };
  }, [currentTask?.id, user?.user?.id, today]);

  // 숫자 입력 검증 핸들러
  const handleNumberInput = (e) => {
    const { name, value } = e.target;
    const numericValue = value.replace(/[^0-9.]/g, '');
    const parts = numericValue.split('.');

    // 소수점이 2개 이상이면 첫 번째 소수점까지만 허용
    if (parts.length > 2) {
      return;
    }

    // 소수점 뒤에 2자리 이상이면 1자리까지만 허용
    if (parts[1] && parts[1].length > 1) {
      return;
    }

    // 0~20 범위 검증
    const numValue = parseFloat(numericValue);
    if (numValue > 20) {
      notification.error({
        message: '입력 오류',
        description: '0~20 사이의 값을 입력하세요.',
        duration: 3,
      });
      return;
    }

    actions.form.updateField(name, numericValue);
  };

  // 진행율 변경 핸들러
  const handleTaskProgressChange = useCallback(
    (e) => {
      const { value } = e.target;
      if (!value) return;

      const selectedStatus = codebooks.taskProgress?.find(
        (status) => status.id === parseInt(value),
      );

      if (selectedStatus) {
        actions.form.updateField('taskProgress', {
          id: selectedStatus.id,
          name: selectedStatus.name,
        });
      }
    },
    [codebooks.taskProgress, actions.form],
  );

  // 폼 제출 핸들러
  const handleSubmit = async () => {
    try {
      await handleFormSubmit(form.data);
      // 폼 제출 완료 후 처리

      // drawer 닫기
      dispatch(closeDrawer());
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // 진행상태가 100%인지 확인
  const isProgress100 = currentTask?.task?.Progress?.name === '100%';

  return (
    <div className="space-y-8">
      {/* 1열: 고객명, 프로젝트명 */}
      <Group direction="horizontal" spacing="lg">
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">고객명</Label>
          <Input
            type="text"
            name="customerName"
            value={currentTask?.project?.sfa?.customer?.name || ''}
            disabled={true}
          />
        </FormItem>

        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">프로젝트명</Label>
          <Input
            type="text"
            name="projectName"
            value={currentTask?.project?.name || ''}
            disabled={true}
          />
        </FormItem>
      </Group>

      {/* 2열: Task 명, 작업일, 작업시간, 이동/기타시간 */}
      <Group direction="horizontal" spacing="lg">
        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">Task 명</Label>
          <Input
            type="text"
            name="taskName"
            value={currentTask?.name || ''}
            disabled={true}
          />
        </FormItem>

        <FormItem direction="vertical" className="flex-1">
          <Label required className="text-left">
            작업일
          </Label>
          <Input
            type="date"
            name="workDate"
            onChange={actions.form.updateField}
            value={form.data.workDate}
            disabled={isSubmitting}
            required
          />
        </FormItem>

        <FormItem direction="vertical" className="flex-1">
          <Label required className="text-left">
            작업시간
          </Label>
          <Input
            type="text"
            name="workHours"
            onChange={handleNumberInput}
            value={form.data.workHours}
            disabled={isSubmitting}
            required
          />
        </FormItem>

        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">이동/기타</Label>
          <Input
            type="text"
            name="nonBillableHours"
            onChange={handleNumberInput}
            value={form.data.nonBillableHours}
            disabled={isSubmitting}
          />
        </FormItem>
      </Group>

      {/* 3열: 진행상태, RevisionCount */}
      <Group direction="horizontal" spacing="lg">
        <FormItem direction="vertical" className="flex-1">
          <Label required className="text-left">
            진행율
          </Label>
          <Select
            name="taskProgress"
            value={form.data.taskProgress?.id || ''}
            onChange={handleTaskProgressChange}
            disabled={isSubmitting}
            required
          >
            <option value="">진행율 선택</option>
            {codebooks.taskProgress?.map((status) => (
              <option key={status.id} value={status.id}>
                {status.name}
              </option>
            ))}
          </Select>
        </FormItem>

        <FormItem direction="vertical" className="flex-1">
          <Label className="text-left">RevisionNumber</Label>
          <Button
            type="button"
            variant="outline"
            disabled={!isProgress100 || isSubmitting}
            className="w-full"
          >
            Rev {currentTask?.revisionNumber || 0}
          </Button>
        </FormItem>
      </Group>

      {/* 4열: 메모 */}
      <Group>
        <FormItem direction="vertical" className="w-full">
          <Label className="text-left">메모</Label>
          <TextArea
            name="notes"
            placeholder="메모를 입력하세요"
            value={form.data.notes}
            onChange={actions.form.updateField}
            disabled={isSubmitting}
          />
        </FormItem>
      </Group>

      {/* 버튼 그룹 */}
      <Group direction="horizontal" spacing="md">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            // TODO: 취소 액션 구현
          }}
          disabled={isSubmitting}
          className="flex-1"
        >
          취소
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1"
        >
          {isSubmitting ? '처리중...' : '전송'}
        </Button>
      </Group>
    </div>
  );
};

export default WorkAddForm;
