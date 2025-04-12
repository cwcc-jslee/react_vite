// src/shared/components/ui/layout/SidebarActions.jsx
// 사이드바 하단에 표시되는 등록 액션 버튼들을 제공합니다.
// 페이지 컨텍스트에 따라 적절한 등록 버튼을 렌더링합니다.

import React from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { changePageMenu } from '../../../../store/slices/uiSlice';
import { setCurrentPath } from '../../../../store/slices/pageStateSlice';
import { resetForm } from '../../../../store/slices/pageFormSlice';
import { ActionButton } from './components';

const ACTION_CONFIG = {
  sfa: {
    label: '매출등록',
    menuId: 'add',
    permissions: ['user'],
    config: {
      components: {
        monthlyStatus: true,
        sfaTable: true,
        searchForm: false,
        forecastTable: false,
      },
      drawer: {
        visible: true, // 드로어 표시 여부
        mode: 'add',
        data: null,
      },
    },
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  contact: {
    label: '새연락처',
    menuId: 'add',
    permissions: ['user'],
    config: {
      components: {
        contactSearchForm: true,
        contactTable: true,
        contactExcelUpload: false,
      },
      drawer: {
        visible: true, // 드로어 표시 여부
        mode: 'addSingle',
      },
    },
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
      </svg>
    ),
  },
  project: {
    label: '새프로젝트',
    menuId: 'add',
    permissions: ['user'],
    config: {
      components: {
        projectChart: false,
        projectTable: false,
        projectAddSection: true,
      },
      drawer: {
        visible: false, // 드로어 표시 여부
      },
    },
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V8z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  customer: {
    label: '고객등록',
    menuId: 'add',
    permissions: ['user'],
    config: {
      components: {
        customerTable: true,
      },
      drawer: {
        visible: true, // 드로어 표시 여부
        mode: 'add',
      },
    },
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
      </svg>
    ),
  },
};

const SidebarActionButton = ({ collapsed }) => {
  const location = useLocation();
  const dispatch = useDispatch();

  // 현재 경로에서 페이지 식별자 추출
  const getCurrentPageFromPath = (path) => {
    const segments = path.split('/').filter(Boolean);
    return segments.length > 0 ? segments[0] : '';
  };

  const currentPage = getCurrentPageFromPath(location.pathname);

  // 버튼 클릭 핸들러 - 리덕스 상태 변경 방식으로 수정
  const handleActionClick = (menuId, config) => {
    console.log(`액션 버튼 클릭: ${menuId}`, config);

    // 페이지 상태 초기화
    dispatch(setCurrentPath(currentPage));
    dispatch(resetForm());

    // UI 메뉴 변경
    dispatch(
      changePageMenu({
        menuId,
        config: config || {},
      }),
    );
  };

  // 현재 페이지에 해당하는 액션 버튼만 표시
  const renderActionButton = () => {
    const config = ACTION_CONFIG[currentPage];

    if (!config) return null;

    return (
      <ActionButton
        collapsed={collapsed}
        icon={config.icon}
        onClick={() => handleActionClick(config.menuId, config.config)}
        className="py-3"
      >
        {config.label}
      </ActionButton>
    );
  };

  return renderActionButton();
};

export default SidebarActionButton;
