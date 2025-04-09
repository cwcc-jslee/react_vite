// src/shared/components/charts/ChartContainer.jsx
import React from 'react';

/**
 * 차트를 감싸는 공통 컨테이너 컴포넌트
 * 헤더, 차트 영역, 범례 영역을 포함
 *
 * @param {Object} props
 * @param {string} props.title - 차트 제목
 * @param {React.ReactNode} props.children - 차트 내용
 * @param {Array} [props.legends] - 범례 데이터 배열 [{name, value, color, highlight}]
 * @param {string} [props.className] - 추가 CSS 클래스
 * @param {Object} [props.style] - 추가 인라인 스타일
 * @returns {JSX.Element}
 */
const ChartContainer = ({
  title,
  children,
  legends = [],
  className = '',
  style = {},
}) => {
  return (
    <div
      className={`w-full border border-gray-200 rounded shadow-sm h-full ${className}`}
      style={style}
    >
      {/* 헤더 영역 */}
      <h2 className="text-sm p-3 bg-zinc-100 border-b">{title}</h2>

      {/* 차트 영역 */}
      <div className="p-4 bg-white h-[calc(100%_-_58px)]">
        {' '}
        {/* 헤더 높이(58px)를 제외한 높이 */}
        {/* 범례가 있으면 공간 확보, 없으면 전체 높이 사용 */}
        <div
          className={`w-full ${
            legends.length > 0 ? 'h-[calc(100%_-_48px)]' : 'h-full'
          }`}
        >
          {children}
        </div>
        {/* 범례 영역 - 범례 데이터가 있을 경우만 표시 */}
        {legends.length > 0 && (
          <div className="flex flex-wrap p-2 border-t mt-2 bg-gray-50">
            {legends.map((legend, index) => (
              <div key={index} className="flex items-center mr-3 mb-1">
                <div
                  className="w-3 h-3 mr-1"
                  style={{
                    backgroundColor: legend.color,
                    border: legend.highlight ? '1px solid #0078D4' : 'none',
                  }}
                />
                <span className="text-xs">
                  {legend.name} ({legend.value})
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartContainer;
