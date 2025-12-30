// src/shared/components/ui/layout/components/common/Breadcrumb.jsx
import React from 'react';

/**
 * 브레드크럼 컴포넌트
 * @param {Array} items - 브레드크럼 아이템 배열 [{label, path}]
 */
const Breadcrumb = ({ items = [], className = '' }) => (
  <div className={`flex items-center text-sm text-slate-500 ${className}`}>
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && (
          <span className="mx-2 text-slate-300">/</span>
        )}
        {item.path ? (
          <a
            href={item.path}
            className="hover:text-blue-600 transition-colors font-medium"
          >
            {item.label}
          </a>
        ) : (
          <span className="font-semibold text-slate-700">{item.label}</span>
        )}
      </React.Fragment>
    ))}
  </div>
);

export default Breadcrumb;
