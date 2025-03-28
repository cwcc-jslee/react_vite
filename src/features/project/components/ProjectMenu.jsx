/**
 * 프로젝트 메뉴 컴포넌트 - 최종 개선 버전
 * - 텍스트 기반 수평 메뉴
 * - 메뉴와 추가 필드 영역 분리
 *
 * @date 25.03.24
 * @version 3.0.0
 * @filename src/features/project/components/ProjectMenu.jsx
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { changePageMenu } from '../../../store/slices/uiSlice';
import TabMenu from '../../../shared/components/ui/layout/TabMenu';

// 메뉴 설정 정보 (상수로 분리)
const MENU_CONFIGS = {
  default: {
    title: '현황',
    layoutMode: 'default',
    components: {
      projectTable: true,
      projectAddSection: false,
    },
    hasState: false,
  },
  addProject: {
    title: '등록',
    layoutMode: 'addProject',
    components: {
      projectTable: false,
      projectAddSection: true,
    },
    hasState: true,
    initialState: {
      sfa: null,
      template: null,
    },
  },
};

/**
 * 프로젝트 메뉴 컴포넌트
 * 메뉴 선택과 필드 표시를 담당
 *
 * @returns {JSX.Element} 프로젝트 메뉴 컴포넌트
 */
const ProjectMenu = () => {
  const dispatch = useDispatch();

  // Redux 상태 접근
  const activeMenu = useSelector((state) => state.ui.activeMenu.project);

  // 메뉴 탭 클릭 핸들러
  const handleMenuClick = (menuId) => {
    dispatch(
      changePageMenu({
        page: 'project',
        menuId,
        config: MENU_CONFIGS[menuId],
      }),
    );
  };

  // TabMenu 컴포넌트에 전달할 아이템 배열
  const tabItems = Object.keys(MENU_CONFIGS).map((key) => ({
    id: key,
    label: MENU_CONFIGS[key].title,
  }));

  return (
    <div className="mb-6">
      {/* 수평 텍스트 메뉴 */}
      <TabMenu
        items={tabItems}
        activeId={activeMenu}
        onChange={handleMenuClick}
        className="mb-6"
      />
    </div>
  );
};

export default ProjectMenu;
