// src/shared/components/ui/layout/components/Footer/FooterLinks.jsx
import React from 'react';

const FOOTER_LINKS = [
  { label: '도움말', href: '#help' },
  { label: '문의하기', href: '#contact' },
  { label: '개인정보처리방침', href: '#privacy' },
];

/**
 * 푸터 링크 목록
 */
const FooterLinks = () => (
  <div className="flex items-center gap-3">
    {FOOTER_LINKS.map((link, index) => (
      <React.Fragment key={link.label}>
        {index > 0 && <span className="text-gray-300">·</span>}
        <a
          href={link.href}
          className="text-gray-600 hover:text-blue-600 transition-colors font-medium"
        >
          {link.label}
        </a>
      </React.Fragment>
    ))}
  </div>
);

export default FooterLinks;
