// src/features/project/components/ProjectProgressExample.jsx
// Progress 컴포넌트 사용 예시
// 다양한 형태와 옵션으로 Progress 컴포넌트를 사용하는 방법을 보여줍니다

import React, { useState } from 'react';
import { Progress } from '@shared/components/ui';

const ProgressExample = () => {
  const [percent, setPercent] = useState(30);

  // 퍼센트 증가 버튼 핸들러
  const increase = () => {
    let newPercent = percent + 10;
    if (newPercent > 100) {
      newPercent = 100;
    }
    setPercent(newPercent);
  };

  // 퍼센트 감소 버튼 핸들러
  const decrease = () => {
    let newPercent = percent - 10;
    if (newPercent < 0) {
      newPercent = 0;
    }
    setPercent(newPercent);
  };

  return (
    <div className="space-y-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">Progress 컴포넌트 사용 예시</h2>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">기본 막대(Bar) 형태</h3>
        <Progress percent={percent} />
        <Progress percent={percent} status="success" />
        <Progress percent={percent} status="exception" />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">다양한 크기의 막대 형태</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="mb-1">기본 크기:</p>
            <Progress percent={percent} />
          </div>
          <div>
            <p className="mb-1">작은 크기:</p>
            <Progress percent={percent} size="small" />
          </div>
          <div>
            <p className="mb-1">커스텀 크기 (12px):</p>
            <Progress percent={percent} size={12} />
          </div>
          <div>
            <p className="mb-1">정보 숨김:</p>
            <Progress percent={percent} showInfo={false} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">원형(Circle) 형태</h3>
        <div className="flex flex-wrap gap-6">
          <div>
            <p className="mb-1 text-center">기본 원형:</p>
            <Progress percent={percent} type="circle" />
          </div>
          <div>
            <p className="mb-1 text-center">작은 원형:</p>
            <Progress percent={percent} type="circle" size="small" />
          </div>
          <div>
            <p className="mb-1 text-center">완료 상태:</p>
            <Progress percent={100} type="circle" status="success" />
          </div>
          <div>
            <p className="mb-1 text-center">예외 상태:</p>
            <Progress percent={percent} type="circle" status="exception" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">커스텀 색상</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="mb-1">커스텀 색상 막대:</p>
            <Progress percent={percent} strokeColor="#722ed1" />
          </div>
          <div>
            <p className="mb-1">커스텀 색상 원형:</p>
            <Progress
              percent={percent}
              type="circle"
              size="small"
              strokeColor="#13c2c2"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <button
          onClick={decrease}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
        >
          -
        </button>
        <button
          onClick={increase}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          +
        </button>
        <span className="text-sm text-gray-500">현재 진행률: {percent}%</span>
      </div>
    </div>
  );
};

export default ProgressExample;
