// src/shared/components/ui/layout/components/Content/Section.jsx
import React from 'react';

/**
 * 콘텐츠 섹션 컴포넌트
 * @param {string} title - 섹션 제목
 * @param {ReactNode} children - 섹션 내용
 */
const Section = ({ title, children, className = '' }) => (
  <div className={`bg-white rounded-lg shadow-sm mb-6 overflow-hidden ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

export default Section;
