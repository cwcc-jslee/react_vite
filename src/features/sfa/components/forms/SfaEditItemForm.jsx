// src/features/sfa/components/forms/SfaEditItemForm.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Check, X, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Button,
  Select,
} from '../../../../shared/components/ui';
import { apiCommon } from '../../../../shared/api/apiCommon';
import { useSfaStore } from '../../hooks/useSfaStore';
import SalesByItem from '../elements/SalesByItem.jsx';
import TeamAllocationSection from '../elements/TeamAllocationSection.jsx';

/**
 * 사업부 매출 편집 컴포넌트
 * - 사업부/품목 구조 수정
 * - 연동된 모든 결제매출의 사업부별 할당 금액 수정 기능 추가
 */
const SfaEditItemForm = ({
  data = [],
  sfaByPayments = [], // 연동된 결제매출 목록 추가
  onSave,
  onCancel,
  codebooks,
  isLoadingCodebook,
  isEditing = false,
  sfaClassificationId,
}) => {
  const { form, actions } = useSfaStore();
  
  // 사업부 수량 상태
  const [teamCount, setTeamCount] = useState(1);
  
  // 매출품목 데이터 상태
  const [itemsData, setItemsData] = useState({ data: [] });
  const [isItemsLoading, setIsItemsLoading] = useState(false);

  // 결제매출 할당 수정용 로컬 상태
  const [draftPayments, setDraftPayments] = useState([]);
  const [allocationDisplayValues, setAllocationDisplayValues] = useState({});
  const [isAllocationSectionExpanded, setIsAllocationSectionExpanded] = useState(true); // 전체 섹션 아코디언 상태

  // 초기 로딩 시 itemsData 조회 및 상태 설정
  useEffect(() => {
    if (sfaClassificationId) {
      loadItems(sfaClassificationId);
    }
  }, [sfaClassificationId]);

  useEffect(() => {
    // 사업부 데이터 설정 (데이터가 로드되면 수량 동기화)
    if (form.data.sfaDraftItems && form.data.sfaDraftItems.length > 0) {
      setTeamCount(form.data.sfaDraftItems.length);
    } else if (isEditing && (!form.data.sfaDraftItems || form.data.sfaDraftItems.length === 0)) {
       // 데이터가 없을 때 초기화 (최초 1회)
       const initialItems = [{
          id: Date.now(),
          itemId: null,
          itemName: '',
          teamId: null,
          teamName: '',
       }];
       actions.form.updateField('sfaDraftItems', initialItems);
       setTeamCount(1);
    }
  }, [form.data.sfaDraftItems, isEditing]); // sfaDraftItems 변경 감지 추가

  useEffect(() => {
    // 결제매출 데이터 최초 설정 (원본 데이터가 들어올 때만)
    if (sfaByPayments?.length > 0 && draftPayments.length === 0) {
      setDraftPayments(JSON.parse(JSON.stringify(sfaByPayments)));
    }
  }, [sfaByPayments]); // 원동 데이터 변경 시에만 초기화

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

  // 수량 변경 핸들러
  const handleCountChange = (e) => {
    const newCount = Number(e.target.value);
    setTeamCount(newCount);
    handleAddSalesItemsByCount(newCount);
  };

  // 수량에 따른 아이템 생성/삭제 로직 (결제매출 할당 동기화 포함)
  const handleAddSalesItemsByCount = (count) => {
    const currentItems = form.data.sfaDraftItems || [];
    const currentCount = currentItems.length;
    let nextItems = [...currentItems];

    if (count > currentCount) {
      const addedCount = count - currentCount;
      const newItems = Array.from({ length: addedCount }).map((_, index) => ({
        id: Date.now() + index,
        itemId: null,
        itemName: '',
        teamId: null,
        teamName: '',
      }));
      nextItems = [...currentItems, ...newItems];
    } else if (count < currentCount) {
      nextItems = currentItems.slice(0, count);
    }
    
    actions.form.updateField('sfaDraftItems', nextItems);

    // 결제매출 할당 배열 동기화
    setDraftPayments(prev => prev.map(payment => {
      const currentAllocations = payment.teamAllocations || [];
      let nextAllocations = [...currentAllocations];

      if (count > currentCount) {
        const addedCount = count - currentCount;
        // 새로 추가된 nextItems의 뒷부분을 참조하여 할당 정보 생성
        const newAllocations = Array.from({ length: addedCount }).map((_, idx) => {
          const itemIndex = currentCount + idx;
          const sourceItem = nextItems[itemIndex];
          return {
            teamId: sourceItem?.teamId || null,
            teamName: sourceItem?.teamName || '',
            itemId: sourceItem?.itemId || null,
            itemName: sourceItem?.itemName || '',
            allocatedAmount: 0,
          };
        });
        nextAllocations = [...currentAllocations, ...newAllocations];
      } else if (count < currentCount) {
        nextAllocations = currentAllocations.slice(0, count);
        
        // 단일 사업부로 변경 시 전체 금액 자동 할당
        if (count === 1 && nextAllocations.length === 1) {
          nextAllocations[0] = {
            ...nextAllocations[0],
            allocatedAmount: payment.amount // 전체 금액 할당
          };
        }
      }

      return { ...payment, teamAllocations: nextAllocations };
    }));
  };

  // 개별 아이템 변경 핸들러 (결제매출 할당 동기화 포함)
  const handleSalesItemChange = (index, updates) => {
    const currentItems = [...(form.data.sfaDraftItems || [])];
    const updatedItem = { ...currentItems[index], ...updates };
    currentItems[index] = updatedItem;
    actions.form.updateField('sfaDraftItems', currentItems);

    // 결제매출 할당 정보(메타데이터) 동기화
    setDraftPayments(prev => prev.map(payment => {
      const allocations = [...(payment.teamAllocations || [])];
      // 해당 인덱스의 할당 정보가 없을 경우를 대비해 안전하게 처리
      if (!allocations[index]) {
         // 할당 정보가 없으면 새로 생성 (이론상 발생하면 안되지만 안전장치)
         allocations[index] = {
            teamId: updatedItem.teamId,
            teamName: updatedItem.teamName,
            itemId: updatedItem.itemId,
            itemName: updatedItem.itemName,
            allocatedAmount: 0
         };
      } else {
        allocations[index] = {
          ...allocations[index],
          teamId: updatedItem.teamId,
          teamName: updatedItem.teamName,
          itemId: updatedItem.itemId,
          itemName: updatedItem.itemName,
        };
      }
      return { ...payment, teamAllocations: allocations };
    }));
  };

  // 개별 아이템 삭제 핸들러 (결제매출 할당 동기화 포함)
  const handleRemoveItem = (index) => {
    const currentItems = form.data.sfaDraftItems || [];
    if (currentItems.length <= 1) {
        alert("최소 1개의 항목은 유지해야 합니다.");
        return;
    }
    const newItems = currentItems.filter((_, i) => i !== index);
    actions.form.updateField('sfaDraftItems', newItems);
    setTeamCount(newItems.length);

    // 결제매출 할당에서도 삭제
    setDraftPayments(prev => prev.map(payment => {
      const allocations = (payment.teamAllocations || []).filter((_, i) => i !== index);
      return { ...payment, teamAllocations: allocations };
    }));
  };

  // --- 할당 수정 관련 핸들러 ---
  const handleAllocationChange = (paymentIndex, teamIndex, value) => {
    const updatedPayments = [...draftPayments];
    const payment = { ...updatedPayments[paymentIndex] };
    const allocations = [...(payment.teamAllocations || [])];
    
    if (allocations[teamIndex]) {
      allocations[teamIndex] = { ...allocations[teamIndex], allocatedAmount: value };
    }
    
    payment.teamAllocations = allocations;
    updatedPayments[paymentIndex] = payment;
    setDraftPayments(updatedPayments);
  };

  const handleAllocationFocus = (paymentIndex, teamIndex) => {
    const key = `${paymentIndex}-${teamIndex}`;
    const amount = draftPayments[paymentIndex].teamAllocations[teamIndex].allocatedAmount;
    setAllocationDisplayValues(prev => ({ ...prev, [key]: String(amount || '') }));
  };

  const handleAllocationBlur = (paymentIndex, teamIndex) => {
    const key = `${paymentIndex}-${teamIndex}`;
    setAllocationDisplayValues(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleAllocationInputChange = (paymentIndex, teamIndex, value) => {
    const sanitized = value.replace(/[^\d]/g, '');
    const key = `${paymentIndex}-${teamIndex}`;
    setAllocationDisplayValues(prev => ({ ...prev, [key]: sanitized }));
    handleAllocationChange(paymentIndex, teamIndex, sanitized);
  };

  const handleSave = () => {
    const items = form.data.sfaDraftItems || [];
    const isValid = items.every(item => item.teamId && item.itemId);
    
    if (!isValid) {
      alert("모든 항목의 사업부와 매출품목을 선택해주세요.");
      return;
    }

    // 할당 금액 검증
    const isAllocationBalanced = draftPayments.every(p => {
      const total = (p.teamAllocations || []).reduce((sum, a) => sum + (parseFloat(a.allocatedAmount) || 0), 0);
      return Math.abs(total - (parseFloat(p.amount) || 0)) < 1;
    });

    if (!isAllocationBalanced) {
      alert("모든 결제매출의 사업부별 할당 합계가 매출액과 일치해야 합니다.\n빨간색으로 표시된 할당 금액을 확인해주세요.");
      return;
    }

    onSave(items, draftPayments);
  };

  if (!isEditing) return null;

  return (
    <div className="flex flex-col w-full gap-6">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between pb-2 border-b border-gray-100">
        <div className="flex items-center gap-2">
           <span className="text-base font-semibold text-gray-800">사업부 매출 정보 수정</span>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" onClick={onCancel} variant="secondary" className="h-8 px-3 text-sm">
            <X className="h-4 w-4 mr-1" /> 취소
          </Button>
          <Button type="button" onClick={handleSave} variant="primary" className="h-8 px-3 text-sm bg-blue-600 hover:bg-blue-700 text-white">
            <Check className="h-4 w-4 mr-1" /> 저장
          </Button>
        </div>
      </div>

      {/* 1. 사업부/품목 설정 섹션 */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
           <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
           <h3 className="text-sm font-bold text-gray-700">사업부 및 품목 설정</h3>
        </div>
        
        <div className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
          <span className="text-sm font-semibold text-blue-900">사업부 수량:</span>
          <Select
            value={teamCount}
            onChange={handleCountChange}
            className="w-20 px-2 py-1.5 text-center font-medium border border-blue-300 rounded-md bg-white"
          >
            {[1, 2, 3, 4, 5].map((num) => (
              <option key={num} value={num}>{num}</option>
            ))}
          </Select>
          <span className="text-xs text-blue-700 ml-1">※ 사업부 구성을 변경하면 아래 할당 정보도 자동 반영됩니다.</span>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <SalesByItem
            items={form.data.sfaDraftItems}
            onChange={handleSalesItemChange}
            onRemove={handleRemoveItem}
            itemsData={itemsData}
            isItemsLoading={isItemsLoading}
            isMultiTeam={true}
          />
        </div>
      </section>

      {/* 2. 결제매출 할당 수정 섹션 */}
      {draftPayments.length > 0 && (
        <section className="space-y-4 pt-4 border-t border-gray-100">
          <div 
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
            onClick={() => setIsAllocationSectionExpanded(!isAllocationSectionExpanded)}
          >
             <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <CreditCard size={16} className="text-green-600" />
                    결제매출별 사업부 할당 수정
                    <span className="text-xs font-normal text-gray-500 ml-1">
                      (총 {draftPayments.length}건)
                    </span>
                </h3>
             </div>
             {isAllocationSectionExpanded ? <ChevronUp size={18} className="text-gray-500" /> : <ChevronDown size={18} className="text-gray-500" />}
          </div>
          
          {isAllocationSectionExpanded && (
            <div className="space-y-4">
              {draftPayments.map((payment, pIndex) => (
                <div key={pIndex} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-700">
                          결제매출 #{pIndex + 1} | {payment.paymentLabel || '라벨없음'}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-blue-600">
                        {Number(payment.amount).toLocaleString()}원
                    </span>
                  </div>
                  
                  <div className="p-3 bg-white">
                    <TeamAllocationSection
                      isMultiTeam={teamCount > 1}
                      payment={payment}
                      index={pIndex}
                      onAllocationChange={(pIdx, tIdx, val) => handleAllocationChange(pIdx, tIdx, val)}
                      isSubmitting={false}
                      allocationDisplayValues={{
                        ...Object.keys(allocationDisplayValues)
                          .filter(key => key.startsWith(`${pIndex}-`))
                          .reduce((obj, key) => ({ ...obj, [key.split('-')[1]]: allocationDisplayValues[key] }), {})
                      }}
                      handleAllocationFocus={(tIdx) => handleAllocationFocus(pIndex, tIdx)}
                      handleAllocationBlur={(tIdx) => handleAllocationBlur(pIndex, tIdx)}
                      handleAllocationInputChange={(tIdx, val) => handleAllocationInputChange(pIndex, tIdx, val)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default SfaEditItemForm;
