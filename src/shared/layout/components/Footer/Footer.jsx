// src/shared/layout/components/Footer/Footer.jsx
import React from 'react';
import FooterLinks from './FooterLinks';

/**
 * 애플리케이션 푸터
 * 저작권, 링크, 버전 정보 표시
 */
const Footer = ({ className = '' }) => (
  <footer className={`bg-white border-t border-gray-200 mt-auto ${className}`}>
    <div className="px-6 py-4">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* 왼쪽: 저작권 + 링크 */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-gray-600">
          <span className="font-medium">
            © 2025 CWCC PMS. All rights reserved.
          </span>
          <span className="text-gray-300 hidden md:block">|</span>
          <FooterLinks />
        </div>

        {/* 오른쪽: 버전 정보 + 상태 */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <span>버전 1.0.0</span>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 bg-green-500 rounded-full animate-pulse"
              title="시스템 정상"
            />
            <span className="text-xs text-green-600">정상</span>
          </div>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
