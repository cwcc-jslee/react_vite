// src/shared/layout/components/Navigation/BreadcrumbBar.jsx
import React from 'react';
import { Breadcrumb } from '../common';

/**
 * 브레드크럼 영역 (2단 레이아웃의 첫 번째 줄)
 * @param {Array} items - 브레드크럼 아이템 [{label, path}]
 */
const BreadcrumbBar = ({ items }) => (
  <div className="px-6 py-2.5 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
    <Breadcrumb items={items} />
  </div>
);

export default BreadcrumbBar;
