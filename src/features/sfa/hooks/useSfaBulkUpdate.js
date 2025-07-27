import { useState, useCallback } from 'react';
import { useCodebook } from '../../../shared/hooks/useCodebook';
import { useSfaOperations } from './useSfaSubmit';

/**
 * SFA 일괄 수정 기능을 위한 커스텀 훅
 *
 * 기능:
 * - 매출인식일 일괄 수정
 * - 확률 일괄 수정
 * - 체크박스 모드 토글
 * - 전체 선택/해제
 *
 * @returns {Object} 상태값들과 이벤트 핸들러 함수들
 */
export const useSfaBulkUpdate = () => {
  // 체크박스 모드 상태 관리
  const [isCheckboxMode, setIsCheckboxMode] = useState(false);
  const [checkedItems, setCheckedItems] = useState([]);

  // 일괄 수정 필드 상태
  const [bulkRecognitionDate, setBulkRecognitionDate] = useState('');
  const [bulkProbability, setBulkProbability] = useState('');
  const [bulkIsConfirmed, setBulkIsConfirmed] = useState(false);
  const [bulkUpdateType, setBulkUpdateType] = useState('date'); // 'date' | 'probability'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useSfaOperations 훅에서 bulkUpdatePayments 함수 가져오기
  const { bulkUpdatePayments } = useSfaOperations();

  // useCodebook으로 sfaPercentage 데이터 가져오기
  const { data: codebooks, isLoading: isLoadingCodebook } = useCodebook([
    'sfaPercentage',
  ]);

  /**
   * 매출일 일괄 수정 모드 시작
   */
  const handleBulkDateEdit = useCallback(() => {
    setBulkUpdateType('date');
    setIsCheckboxMode(true);
    setCheckedItems([]);
    console.log('체크박스 모드 활성화 - 매출일 일괄수정 준비');
  }, []);

  /**
   * 확률 일괄 수정 모드 시작
   */
  const handleBulkProbabilityEdit = useCallback(() => {
    setBulkUpdateType('probability');
    setIsCheckboxMode(true);
    setCheckedItems([]);
    console.log('체크박스 모드 활성화 - 확률 일괄수정 준비');
  }, []);

  /**
   * 확정여부 변경 처리
   * 확정 시 확률을 자동으로 100%로 설정
   */
  const handleBulkIsConfirmedChange = useCallback((checked) => {
    setBulkIsConfirmed(checked);
    if (checked) {
      // 확정 시 확률을 100으로 자동 설정
      setBulkProbability('100');
    } else {
      // 확정 해제 시 확률 초기화
      setBulkProbability('');
    }
  }, []);

  /**
   * 개별 항목 체크박스 상태 변경
   */
  const handleCheckChange = useCallback((itemId, isChecked) => {
    if (isChecked) {
      setCheckedItems((prev) => [...prev, itemId]);
    } else {
      setCheckedItems((prev) => prev.filter((id) => id !== itemId));
    }
  }, []);

  /**
   * 전체 선택/해제 처리
   */
  const handleSelectAll = useCallback((e, items) => {
    if (e.target.checked) {
      setCheckedItems(items.map((item) => item.id));
    } else {
      setCheckedItems([]);
    }
  }, []);

  /**
   * 체크박스 모드 종료 및 상태 초기화
   */
  const handleCancelCheckboxMode = useCallback(() => {
    setIsCheckboxMode(false);
    setCheckedItems([]);
    setBulkRecognitionDate('');
    setBulkProbability('');
    setBulkIsConfirmed(false);
    setBulkUpdateType('date');
    setIsSubmitting(false);
  }, []);

  /**
   * 일괄 수정 처리 함수
   * 매출일 또는 확률 일괄 수정을 처리
   */
  const handleBulkSubmit = useCallback(async () => {
    if (bulkUpdateType === 'date') {
      // 매출일 일괄 수정 처리
      if (!bulkRecognitionDate || checkedItems.length === 0) {
        alert('매출일을 입력하고 수정할 항목을 선택해주세요.');
        return;
      }

      if (
        !window.confirm(
          `선택된 ${checkedItems.length}개 항목의 매출인식일을 ${bulkRecognitionDate}로 변경하시겠습니까?`,
        )
      ) {
        return;
      }

      setIsSubmitting(true);
      try {
        // 매출일 업데이트 데이터 구성
        const updateData = {
          recognition_date: bulkRecognitionDate,
          //recognition_date
        };

        console.log('매출일 일괄 수정 요청:', {
          itemIds: checkedItems,
          updateData,
        });

        // API 호출
        const result = await bulkUpdatePayments(checkedItems, updateData);

        if (result.success) {
          // 체크박스 모드 종료
          handleCancelCheckboxMode();
        }
      } catch (error) {
        console.error('매출일 일괄 수정 실패:', error);
        alert('매출일 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setIsSubmitting(false);
      }
    } else if (bulkUpdateType === 'probability') {
      // 확률 일괄 수정 처리
      if (checkedItems.length === 0) {
        alert('수정할 항목을 선택해주세요.');
        return;
      }

      const confirmMessage = bulkIsConfirmed
        ? `선택된 ${checkedItems.length}개 항목을 확정 상태로 변경하시겠습니까? (확률은 자동으로 100%가 됩니다)`
        : `선택된 ${checkedItems.length}개 항목의 확률을 ${bulkProbability}%로 변경하시겠습니까?`;

      if (!bulkIsConfirmed && !bulkProbability) {
        alert('확정여부를 체크하거나 확률을 선택해주세요.');
        return;
      }

      if (!window.confirm(confirmMessage)) {
        return;
      }

      setIsSubmitting(true);
      try {
        // 확률 업데이트 데이터 구성
        const updateData = {
          probability: bulkIsConfirmed ? 100 : parseInt(bulkProbability, 10),
          is_confirmed: bulkIsConfirmed,
        };

        console.log('확률 일괄 수정 요청:', {
          itemIds: checkedItems,
          updateData,
        });

        // API 호출
        const result = await bulkUpdatePayments(checkedItems, updateData);

        if (result.success) {
          // 체크박스 모드 종료
          handleCancelCheckboxMode();
        }
      } catch (error) {
        console.error('확률 일괄 수정 실패:', error);
        alert('확률 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [
    bulkUpdateType,
    bulkRecognitionDate,
    bulkProbability,
    bulkIsConfirmed,
    checkedItems,
    handleCancelCheckboxMode,
    bulkUpdatePayments,
  ]);

  return {
    // 상태
    isCheckboxMode,
    checkedItems,
    bulkRecognitionDate,
    bulkProbability,
    bulkIsConfirmed,
    bulkUpdateType,
    isSubmitting,

    // 코드북 데이터
    codebooks,
    isLoadingCodebook,

    // 상태 변경 함수
    setBulkRecognitionDate,
    setBulkProbability,
    setBulkIsConfirmed,

    // 이벤트 핸들러
    handleBulkDateEdit,
    handleBulkProbabilityEdit,
    handleBulkIsConfirmedChange,
    handleCheckChange,
    handleSelectAll,
    handleCancelCheckboxMode,
    handleBulkSubmit,
  };
};
