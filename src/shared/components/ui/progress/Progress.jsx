// src/shared/components/ui/Progress.jsx
// 진행률을 표시하는 UI 컴포넌트
// 막대 형태와 원형 형태의 진행률 표시를 지원합니다

import React from 'react';
import PropTypes from 'prop-types';

/**
 * 진행률을 표시하는 Progress 컴포넌트
 * @param {Object} props
 * @param {number} props.percent - 진행률 (0-100)
 * @param {string} props.type - 타입 ('line'(기본값) 또는 'circle')
 * @param {string|number} props.size - 크기 ('default', 'small' 또는 숫자 값)
 * @param {string} props.status - 상태 ('normal', 'success', 'exception')
 * @param {boolean} props.showInfo - 퍼센트 숫자 표시 여부
 * @param {string} props.strokeColor - 진행률 표시 색상
 * @param {string} props.trailColor - 배경 트랙 색상
 */
const Progress = ({
  percent = 0,
  type = 'line',
  size = 'default',
  status = 'normal',
  showInfo = true,
  strokeColor,
  trailColor = '#f5f5f5',
  ...rest
}) => {
  // 0-100 범위로 제한
  const normalizedPercent = Math.min(Math.max(percent, 0), 100);

  // 상태에 따른 색상 결정
  const getStrokeColor = () => {
    if (strokeColor) return strokeColor;

    switch (status) {
      case 'success':
        return '#52c41a';
      case 'exception':
        return '#ff4d4f';
      default:
        return '#1890ff';
    }
  };

  // 사이즈 값 계산
  const getSize = () => {
    if (typeof size === 'number') return size;

    if (type === 'line') {
      return size === 'small' ? 6 : 8; // 막대 높이
    } else {
      return size === 'small' ? 80 : 120; // 원 지름
    }
  };

  // 텍스트 크기 계산
  const getTextSize = () => {
    if (type === 'circle') {
      return size === 'small' ? 'text-sm' : 'text-lg';
    }
    return size === 'small' ? 'text-xs' : 'text-sm';
  };

  // 완료 상태일 때 아이콘
  const renderSuccessIcon = () => (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M912 190h-69.9c-9.8 0-19.1 4.5-25.1 12.2L404.7 724.5 207 474a32 32 0 0 0-25.1-12.2H112c-6.7 0-10.4 7.7-6.3 12.9l273.9 347c12.8 16.2 37.4 16.2 50.3 0l488.4-618.9c4.1-5.1.4-12.8-6.3-12.8z" />
    </svg>
  );

  // 예외 상태일 때 아이콘
  const renderExceptionIcon = () => (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm165.4 618.2l-66-.3L512 563.4l-99.3 118.4-66.1.3c-4.4 0-8-3.5-8-8 0-1.9.7-3.7 1.9-5.2l130.1-155L340.5 359a8.32 8.32 0 0 1-1.9-5.2c0-4.4 3.6-8 8-8l66.1.3L512 464.6l99.3-118.4 66-.3c4.4 0 8 3.5 8 8 0 1.9-.7 3.7-1.9 5.2L553.5 514l130 155c1.2 1.5 1.9 3.3 1.9 5.2 0 4.4-3.6 8-8 8z" />
    </svg>
  );

  // 정보 표시 (숫자 또는 아이콘)
  const renderInfo = () => {
    if (!showInfo) return null;

    if (normalizedPercent >= 100 && status !== 'exception') {
      return (
        <span className={`text-success ${getTextSize()}`}>
          {type === 'line' ? renderSuccessIcon() : '100%'}
        </span>
      );
    }

    if (status === 'exception') {
      return (
        <span className={`text-error ${getTextSize()}`}>
          {type === 'line' ? renderExceptionIcon() : `${normalizedPercent}%`}
        </span>
      );
    }

    return <span className={getTextSize()}>{normalizedPercent}%</span>;
  };

  // 선형(막대) 진행률 렌더링
  const renderLineProgress = () => {
    const height = getSize();

    return (
      <div className="flex items-center">
        <div className="flex-1 mr-2">
          <div
            className="relative w-full overflow-hidden rounded-full"
            style={{ backgroundColor: trailColor, height: `${height}px` }}
          >
            <div
              className="absolute top-0 left-0 h-full rounded-full transition-all duration-300 ease-in-out"
              style={{
                width: `${normalizedPercent}%`,
                backgroundColor: getStrokeColor(),
              }}
            />
          </div>
        </div>
        {showInfo && <div className="w-8 text-right">{renderInfo()}</div>}
      </div>
    );
  };

  // 원형 진행률 렌더링
  const renderCircleProgress = () => {
    const size = getSize();
    const strokeWidth = size === 'small' ? 6 : 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset =
      circumference - (normalizedPercent / 100) * circumference;

    return (
      <div
        className="inline-flex flex-col items-center justify-center"
        style={{ width: size, height: size }}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            className="transition-all duration-300 ease-in-out"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            stroke={trailColor}
          />
          <circle
            className="transition-all duration-300 ease-in-out"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            stroke={getStrokeColor()}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        {showInfo && (
          <div className="absolute">
            {status === 'success' && normalizedPercent >= 100 ? (
              <span className={`text-success ${getTextSize()}`}>
                {renderSuccessIcon()}
              </span>
            ) : status === 'exception' ? (
              <span className={`text-error ${getTextSize()}`}>
                {renderExceptionIcon()}
              </span>
            ) : (
              <span className={getTextSize()}>{normalizedPercent}%</span>
            )}
          </div>
        )}
      </div>
    );
  };

  return type === 'circle' ? renderCircleProgress() : renderLineProgress();
};

Progress.propTypes = {
  percent: PropTypes.number,
  type: PropTypes.oneOf(['line', 'circle']),
  size: PropTypes.oneOfType([
    PropTypes.oneOf(['default', 'small']),
    PropTypes.number,
  ]),
  status: PropTypes.oneOf(['normal', 'success', 'exception']),
  showInfo: PropTypes.bool,
  strokeColor: PropTypes.string,
  trailColor: PropTypes.string,
};

export default Progress;
