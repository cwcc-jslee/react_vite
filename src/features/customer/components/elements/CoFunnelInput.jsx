// src/features/customer/components/forms/CoFunnelInput/index.jsx
/**
 * 유입경로 인라인 입력 컴포넌트
 * 유입경로를 선택하고 상세 정보(suffix)를 추가로 입력할 수 있는 컴포넌트
 * - 최대 5개까지만 추가 가능
 */

import React, { useState, useEffect } from 'react';
import {
  FormItem,
  Select,
  Input,
  Button,
  Badge,
  Message,
} from '../../../../shared/components/ui';
import { X, AlertCircle } from 'lucide-react';

// 최대 허용 유입경로 수
const MAX_FUNNELS = 5;

const CoFunnelInput = ({
  codebooks,
  formData,
  updateFormField,
  isLoading,
  isSubmitting,
}) => {
  // 선택한 유입경로를 관리하기 위한 상태
  const [selectedFunnel, setSelectedFunnel] = useState('');
  const [suffixInput, setSuffixInput] = useState('');
  // 최대 개수 초과 메시지 표시 여부
  const [showLimitWarning, setShowLimitWarning] = useState(false);

  // formData에 coFunnels 필드가 없을 경우 초기화
  //   useEffect(() => {
  //     if (!formData.coFunnels) {
  //       updateFormField({
  //         target: {
  //           name: 'coFunnels',
  //           value: []
  //         }
  //       });
  //     }
  //   }, [formData, updateFormField]);

  // 현재 폼 데이터에서 유입경로 정보 가져오기 (없으면 빈 배열로 초기화)
  const funnels = formData.funnel || [];

  // 최대 개수 도달 여부 확인
  const isMaxLimitReached = funnels.length >= MAX_FUNNELS;

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

  // 유입경로 추가 처리
  const addFunnel = () => {
    if (!selectedFunnel) {
      return;
    }

    // 최대 개수 체크
    if (isMaxLimitReached) {
      setShowLimitWarning(true);
      return;
    }

    // 코드북 데이터가 없는 경우 처리
    if (!codebooks?.coFunnel) {
      console.log('코드북 데이터가 아직 로드되지 않았습니다.');
      return;
    }

    // 타입 변환을 통한 비교 (문자열 id와 숫자 id 모두 처리)
    const funnelItem = codebooks.coFunnel.find(
      (item) => String(item.id) === String(selectedFunnel),
    );

    if (!funnelItem) {
      console.log(`선택된 유입경로를 찾을 수 없습니다: ${selectedFunnel}`);
      return;
    }

    // 추가할 유입경로 객체 생성
    const newFunnel = {
      id: funnelItem.id,
      name: funnelItem.name,
      suffix: suffixInput.trim(), // 입력된 suffix 추가
    };

    // 기존 유입경로 배열에 추가
    const updatedFunnels = [...funnels, newFunnel];

    // 폼 데이터 업데이트
    updateFormField({
      target: {
        name: 'funnel',
        value: updatedFunnels,
      },
    });

    // 입력 필드 초기화
    setSelectedFunnel('');
    setSuffixInput('');
  };

  // 유입경로 제거 처리
  const removeFunnel = (index) => {
    const updatedFunnels = [...funnels];
    updatedFunnels.splice(index, 1);

    updateFormField({
      target: {
        name: 'funnel',
        value: updatedFunnels,
      },
    });

    // 제거 후 경고 메시지 숨김
    setShowLimitWarning(false);
  };

  // 키보드 이벤트 처리 (Enter 키로 추가)
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && selectedFunnel && !isMaxLimitReached) {
      e.preventDefault(); // 폼 제출 방지
      addFunnel();
    }
  };

  return (
    <div className="space-y-3">
      {/* 유입경로 선택 및 suffix 입력 영역 */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Select
            value={selectedFunnel}
            onChange={(e) => setSelectedFunnel(e.target.value)}
            disabled={isLoading || isMaxLimitReached || isSubmitting}
            className={
              isMaxLimitReached ? 'bg-gray-100 cursor-not-allowed' : ''
            }
          >
            <option value="">
              {isMaxLimitReached
                ? `최대 ${MAX_FUNNELS}개까지 추가 가능합니다`
                : '유입경로 선택'}
            </option>
            {!isMaxLimitReached &&
              codebooks?.coFunnel?.map((item) => (
                <option key={item.id} value={String(item.id)}>
                  {item.name}
                </option>
              ))}
          </Select>
        </div>
        <div className="flex-1">
          <Input
            type="text"
            placeholder={
              isMaxLimitReached
                ? '최대 개수 도달'
                : '상세 정보 입력 (예: 39기, 김해)'
            }
            value={suffixInput}
            onChange={(e) => setSuffixInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isMaxLimitReached || isSubmitting}
            className={
              isMaxLimitReached ? 'bg-gray-100 cursor-not-allowed' : ''
            }
          />
        </div>
        <Button
          type="button"
          onClick={addFunnel}
          disabled={!selectedFunnel || isMaxLimitReached || isSubmitting}
          variant="outline"
          className="whitespace-nowrap"
        >
          추가
        </Button>
      </div>

      {/* 최대 개수 경고 메시지 */}
      {showLimitWarning && (
        <div className="mt-2">
          <Message type="warning" className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>
              유입경로는 최대 {MAX_FUNNELS}개까지만 추가할 수 있습니다.
            </span>
          </Message>
        </div>
      )}

      {/* 선택된 유입경로 표시 영역 */}
      {funnels.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {funnels.map((funnel, index) => (
            <Badge
              key={index}
              variant="info"
              size="md"
              className="flex items-center gap-1 pl-3 pr-2 py-1.5"
            >
              <span className="font-medium">{funnel.name}</span>
              {funnel.suffix && (
                <span className="text-blue-700">- {funnel.suffix}</span>
              )}
              <button
                type="button"
                onClick={() => removeFunnel(index)}
                className="ml-1 text-blue-500 hover:text-red-500 focus:outline-none"
                aria-label={`${funnel.name} 삭제`}
              >
                <X size={14} />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* 항목 개수 표시 */}
      {funnels.length > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          {funnels.length}/{MAX_FUNNELS} 개 추가됨
        </div>
      )}
    </div>
  );
};

export default CoFunnelInput;
