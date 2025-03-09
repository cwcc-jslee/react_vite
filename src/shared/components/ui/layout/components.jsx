// src/shared/components/ui/layout/components.jsx
import React from 'react';

export const Layout = ({ children, className = '' }) => (
  <div className={`flex min-h-screen flex-col ${className}`}>{children}</div>
);

export const Header = ({ children, className = '' }) => (
  <header
    className={`fixed top-0 left-0 right-0 h-16 bg-blue-800 shadow-md z-50 ${className}`}
  >
    <div className="h-full px-6 flex items-center justify-between">
      {children}
    </div>
  </header>
);

export const Content = ({ children, className = '' }) => (
  <main
    className={`ml-60 flex-1 p-3 bg-slate-50 min-h-[calc(100vh-64px)] mt-[0px] overflow-y-auto ${className}`}
  >
    {children}
  </main>
);

export const Sider = ({ children, className = '' }) => (
  <aside
    className={`fixed top-16 left-0 w-60 h-[calc(100vh-64px)] bg-slate-800 overflow-y-auto ${className}`}
  >
    {children}
  </aside>
);

export const Logo = ({ children, className = '' }) => (
  <div className={`text-xl font-bold text-white ${className}`}>{children}</div>
);

export const Navigation = ({ children, className = '' }) => (
  <nav className={`h-full ${className}`}>{children}</nav>
);

export const NavList = ({ children, className = '' }) => (
  <ul className={`list-none p-0 m-0 ${className}`}>{children}</ul>
);

export const NavItem = ({ active, children, onClick, className = '' }) => (
  <li
    onClick={onClick}
    className={`
      px-6 py-3 cursor-pointer transition-colors
      ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-slate-400 hover:bg-slate-700 hover:text-white'
      }
      ${className}
    `}
  >
    {children}
  </li>
);

export const Section = ({ children, className = '' }) => (
  <div className={`p-6 ${className}`}>{children}</div>
);
