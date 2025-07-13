// src/features/sfa/components/forms/SfaEditItemForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Check, X, AlertCircle } from 'lucide-react';
import {
  Button,
  Select,
  Input,
  Badge,
  Message,
} from '../../../../shared/components/ui';
import { useTeam } from '../../../../shared/hooks/useTeam';
import {
  formatDisplayNumber,
  ensureNumericAmount,
} from '../../../../shared/utils/format/number';
import { apiCommon } from '../../../../shared/api/apiCommon';
import { useSfaStore } from '../../hooks/useSfaStore';

// 최대 허용 사업부 매출 아이템 수
const MAX_ITEMS = 3;

/**
 * 사업부 매출 편집 컴포넌트
 * EditableSfaDetail에서 사업부 매출 편집 기능을 분리한 컴포넌트
 */
const SfaEditItemForm = ({
  data = [],
  onSave,
  onCancel,
  codebooks,
  isLoadingCodebook,
  isEditing = false,
  sfaClassificationId, // 매출구분 ID 추가
}) => {
  // 팀 데이터 조회
  const { data: teamsData, isLoading: isTeamsLoading } = useTeam();

  // SFA Store actions 가져오기
  const { form, actions } = useSfaStore();

  // 새로운 아이템 입력 상태 관리
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [amountInput, setAmountInput] = useState('');

  // 편집 중인 아이템 인덱스 (-1이면 새로 추가, 0 이상이면 수정 모드)
  const [editingIndex, setEditingIndex] = useState(-1);

  // 최대 개수 초과 메시지 표시 여부
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  // 매출품목 데이터 상태 관리
  const [itemsData, setItemsData] = useState({ data: [] });
  const [isItemsLoading, setIsItemsLoading] = useState(false);

  console.log('>>>>> data: ', data);

  // 편집 모드 진입 시 편집 상태 초기화
  useEffect(() => {
    if (isEditing) {
      // 편집 상태 초기화
      setSelectedItemId('');
      setSelectedTeamId('');
      setAmountInput('');
      setEditingIndex(-1);
      setShowLimitWarning(false);
    }
  }, [isEditing]);

  // 매출품목 데이터 조회
  const loadItems = useCallback(async (classificationId) => {
    if (!classificationId) {
      setItemsData({ data: [] });
      return;
    }

    setIsItemsLoading(true);
    try {
      const response = await apiCommon.getSfaItems(classificationId);
      setItemsData(response);
    } catch (error) {
      console.error('매출품목 조회 실패:', error);
      setItemsData({ data: [] });
    } finally {
      setIsItemsLoading(false);
    }
  }, []);

  // 매출구분 ID 변경 시 매출품목 데이터 조회
  useEffect(() => {
    if (sfaClassificationId) {
      loadItems(sfaClassificationId);
    }
  }, [sfaClassificationId, loadItems]);

  // 최대 개수 도달 여부 확인 (편집 모드일 때는 제한 없음)
  const isMaxLimitReached =
    editingIndex === -1 && (form.data.sfaDraftItems || []).length >= MAX_ITEMS;

  // 경고 메시지 자동 숨김 효과
  useEffect(() => {
    let timer;
    if (showLimitWarning) {
      timer = setTimeout(() => {
        setShowLimitWarning(false);
      }, 3000); // 3초 후 메시지 숨김
    }
    return () => clearTimeout(timer);
  }, [showLimitWarning]);

  // Badge 클릭 핸들러 (편집 모드로 전환)
  const handleBadgeClick = (index) => {
    const item = (form.data.sfaDraftItems || [])[index];
    if (!item) return;

    // 입력 필드에 현재 값 채우기
    setSelectedItemId(String(item.itemId));
    setSelectedTeamId(String(item.teamId));
    setAmountInput(String(item.amount || ''));
    setEditingIndex(index);
  };

  // 편집 취소 핸들러
  const handleCancelEdit = () => {
    setSelectedItemId('');
    setSelectedTeamId('');
    setAmountInput('');
    setEditingIndex(-1);
  };

  // 사업부 매출 아이템 추가/수정
  const handleAddItem = () => {
    if (!selectedItemId || !selectedTeamId || !amountInput) {
      return;
    }

    // 매출품목 및 팀 데이터가 없는 경우 처리
    if (!itemsData?.data || !teamsData?.data) {
      console.log('매출품목 또는 팀 데이터가 아직 로드되지 않았습니다.');
      return;
    }

    // 매출품목 찾기
    const itemType = itemsData.data.find(
      (item) => String(item.id) === String(selectedItemId),
    );

    // 사업부 찾기
    const teamType = teamsData.data.find(
      (team) => String(team.id) === String(selectedTeamId),
    );

    if (!itemType || !teamType) {
      console.log('선택된 매출품목 또는 사업부를 찾을 수 없습니다.');
      return;
    }

    const currentItems = form.data.sfaDraftItems || [];

    // 편집 모드인 경우 아이템 업데이트
    if (editingIndex >= 0) {
      const updatedItems = [...currentItems];
      updatedItems[editingIndex] = {
        ...updatedItems[editingIndex],
        itemId: itemType.id,
        itemName: itemType.name,
        teamId: teamType.id,
        teamName: teamType.name,
        amount: ensureNumericAmount(amountInput),
      };
      actions.form.updateField('sfaDraftItems', updatedItems);
    } else {
      // 새로 추가하는 경우
      // 최대 개수 체크
      if (isMaxLimitReached) {
        setShowLimitWarning(true);
        return;
      }

      // 중복 체크 (같은 매출품목 + 사업부 조합)
      const isDuplicate = currentItems.some(
        (item) =>
          item.itemId === selectedItemId && item.teamId === selectedTeamId,
      );

      if (isDuplicate) {
        alert('이미 추가된 매출품목과 사업부 조합입니다.');
        return;
      }

      // 추가할 아이템 객체 생성
      const newItem = {
        id: Date.now(), // 임시 ID
        itemId: itemType.id,
        itemName: itemType.name,
        teamId: teamType.id,
        teamName: teamType.name,
        amount: ensureNumericAmount(amountInput),
      };

      // 기존 아이템 배열에 추가
      actions.form.updateField('sfaDraftItems', [...currentItems, newItem]);
    }

    // 입력 필드 초기화
    setSelectedItemId('');
    setSelectedTeamId('');
    setAmountInput('');
    setEditingIndex(-1);
  };

  // 사업부 매출 아이템 삭제
  const handleRemoveItem = (index) => {
    const currentItems = form.data.sfaDraftItems || [];
    const updatedItems = currentItems.filter((_, i) => i !== index);
    actions.form.updateField('sfaDraftItems', updatedItems);

    // 현재 편집 중인 아이템이 삭제된 경우 편집 모드 초기화
    if (editingIndex === index) {
      setSelectedItemId('');
      setSelectedTeamId('');
      setAmountInput('');
      setEditingIndex(-1);
    } else if (editingIndex > index) {
      // 편집 중인 아이템보다 앞의 아이템이 삭제된 경우 인덱스 조정
      setEditingIndex(editingIndex - 1);
    }

    // 제거 후 경고 메시지 숨김
    setShowLimitWarning(false);
  };

  // 금액 입력 처리
  const handleAmountChange = (value) => {
    const sanitizedValue = value.replace(/[^\d,]/g, '');
    setAmountInput(sanitizedValue);
  };

  // 키보드 이벤트 처리 (Enter 키로 추가)
  const handleKeyDown = (e) => {
    if (
      e.key === 'Enter' &&
      selectedItemId &&
      selectedTeamId &&
      amountInput &&
      !isMaxLimitReached
    ) {
      e.preventDefault(); // 폼 제출 방지
      handleAddItem();
    }
  };

  // 저장 핸들러
  const handleSave = () => {
    onSave(form.data.sfaDraftItems || []);
  };

  // 취소 핸들러
  const handleCancel = () => {
    setSelectedItemId('');
    setSelectedTeamId('');
    setAmountInput('');
    setEditingIndex(-1);
    setShowLimitWarning(false);
    onCancel();
  };

  if (!isEditing) return null;

  return (
    <div className="flex flex-col w-full gap-3">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">사업부 매출 편집</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center justify-center h-7 w-7 rounded-sm hover:bg-green-100"
          >
            <Check className="h-4 w-4 text-green-600" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center justify-center h-7 w-7 rounded-sm hover:bg-red-100"
          >
            <X className="h-4 w-4 text-red-600" strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="space-y-3">
        <div className="grid grid-cols-[1fr,1fr,1fr,auto] gap-2">
          {/* 매출품목 선택 */}
          <Select
            value={selectedItemId}
            onChange={(e) => setSelectedItemId(e.target.value)}
            disabled={isItemsLoading || isMaxLimitReached}
            className={
              isMaxLimitReached ? 'bg-gray-100 cursor-not-allowed' : ''
            }
          >
            <option value="">
              {isMaxLimitReached
                ? `최대 ${MAX_ITEMS}개까지 추가 가능`
                : '매출품목 선택'}
            </option>
            {!isMaxLimitReached &&
              itemsData?.data?.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name}
                </option>
              ))}
          </Select>

          {/* 사업부 선택 */}
          <Select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            disabled={isTeamsLoading || isMaxLimitReached}
            className={
              isMaxLimitReached ? 'bg-gray-100 cursor-not-allowed' : ''
            }
          >
            <option value="">
              {isMaxLimitReached
                ? `최대 ${MAX_ITEMS}개까지 추가 가능`
                : '사업부 선택'}
            </option>
            {!isMaxLimitReached &&
              teamsData?.data?.map((team) => (
                <option key={team.id} value={String(team.id)}>
                  {team.name}
                </option>
              ))}
          </Select>

          {/* 금액 입력 */}
          <Input
            type="text"
            placeholder={isMaxLimitReached ? '최대 개수 도달' : '금액 입력'}
            value={amountInput}
            onChange={(e) => handleAmountChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isMaxLimitReached}
            className={`text-right ${
              isMaxLimitReached ? 'bg-gray-100 cursor-not-allowed' : ''
            }`}
          />

          {/* 추가/수정 버튼 */}
          {editingIndex >= 0 ? (
            <div className="flex gap-1">
              <Button
                type="button"
                onClick={handleAddItem}
                disabled={!selectedItemId || !selectedTeamId || !amountInput}
                variant="outline"
                className="whitespace-nowrap"
              >
                <Check className="h-4 w-4 mr-1" />
                수정
              </Button>
              <Button
                type="button"
                onClick={handleCancelEdit}
                variant="outline"
                className="whitespace-nowrap"
              >
                <X className="h-4 w-4 mr-1" />
                취소
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              onClick={handleAddItem}
              disabled={
                !selectedItemId ||
                !selectedTeamId ||
                !amountInput ||
                isMaxLimitReached
              }
              variant="outline"
              className="whitespace-nowrap"
            >
              <Plus className="h-4 w-4 mr-1" />
              추가
            </Button>
          )}
        </div>

        {/* 최대 개수 경고 메시지 */}
        {showLimitWarning && (
          <Message type="warning" className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>
              사업부 매출은 최대 {MAX_ITEMS}개까지만 추가할 수 있습니다.
            </span>
          </Message>
        )}

        {/* 기존 아이템들을 Badge 형태로 표시 */}
        {(form.data.sfaDraftItems || []).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(form.data.sfaDraftItems || []).map((item, index) => {
              console.log(
                'Badge item:',
                item,
                'amount type:',
                typeof item.amount,
                'amount value:',
                item.amount,
              ); // 디버깅용 로그
              return (
                <Badge
                  key={item.id}
                  variant="info"
                  size="md"
                  className={`flex items-center gap-1 pl-3 pr-2 py-1.5 cursor-pointer transition-colors ${
                    editingIndex === index
                      ? 'bg-blue-200 border-blue-400'
                      : 'hover:bg-blue-200'
                  }`}
                  onClick={() => handleBadgeClick(index)}
                >
                  <span className="font-medium">
                    {item.itemName}-{item.teamName}(
                    {(() => {
                      const amount = item.amount || item.itemPrice;
                      return amount != null && amount !== ''
                        ? Number(amount).toLocaleString()
                        : '-';
                    })()}
                    )
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation(); // Badge 클릭 이벤트 방지
                      handleRemoveItem(index);
                    }}
                    className="ml-1 text-blue-500 hover:text-red-500 focus:outline-none"
                    aria-label={`${item.itemName} 삭제`}
                  >
                    <X size={14} />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        {/* 항목 개수 표시 */}
        {(form.data.sfaDraftItems || []).length > 0 && (
          <div className="text-xs text-gray-500">
            {(form.data.sfaDraftItems || []).length}/{MAX_ITEMS} 개 등록됨
          </div>
        )}

        {/* 빈 상태 메시지 */}
        {(form.data.sfaDraftItems || []).length === 0 && (
          <div className="text-center text-gray-500 py-4 border rounded-md bg-gray-50">
            사업부 매출 정보가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default SfaEditItemForm;
