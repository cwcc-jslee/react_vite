/**
 * 브레드크럼과 페이지 메뉴를 통합한 컴포넌트
 * - 디자인 이미지에 맞춘 스타일링
 * - 수평 레이아웃 적용
 *
 * @date 25.03.24
 * @version 1.2.0
 * @filename src/shared/components/ui/layout/BreadcrumbWithMenu.jsx
 */
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
import { changePageMenu } from '../../../../store/slices/uiSlice';

/**
 * 브레드크럼과 페이지 메뉴를 통합한 컴포넌트
 *
 * @param {Object} props - 컴포넌트 속성
 * @param {Array} props.breadcrumbItems - 브레드크럼 항목 배열 [{label: string, path?: string}]
 * @param {string} props.currentPage - 현재 페이지 식별자 (예: 'project', 'customer', 'sfa' 등)
 * @param {Object} props.pageMenus - 페이지별 메뉴 구성 정보 (선택적)
 * @param {string} [props.className=''] - 추가 CSS 클래스
 * @returns {JSX.Element} 통합된 브레드크럼 및 메뉴 컴포넌트
 */
const BreadcrumbWithMenu = ({
  breadcrumbItems,
  currentPage,
  pageMenus = {},
  className = '',
}) => {
  const dispatch = useDispatch();
  // const navigate = useNavigate();

  // 현재 페이지의 활성 메뉴 상태 가져오기
  const activeMenu = useSelector(
    (state) => state.ui.activeMenu[currentPage] || '',
  );

  // 현재 페이지에 메뉴가 있는지 확인
  const hasPageMenu =
    pageMenus && pageMenus[currentPage] && pageMenus[currentPage].menus;

  // 메뉴 클릭 핸들러
  const handleMenuClick = (menuId) => {
    if (pageMenus[currentPage] && pageMenus[currentPage].menus[menuId]) {
      // 메뉴 상태 변경 액션 디스패치
      dispatch(
        changePageMenu({
          page: currentPage,
          menuId,
          config: pageMenus[currentPage].menus[menuId].config,
        }),
      );

      // 필요한 경우 경로 변경 (선택 사항)
      // if (pageMenus[currentPage].menus[menuId].path) {
      //   navigate(pageMenus[currentPage].menus[menuId].path);
      // }
    }
  };

  return (
    <div className={`flex items-center text-sm py-3 px-4 ${className}`}>
      {/* 브레드크럼 */}
      <div className="flex items-center text-slate-600">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && <span className="mx-2">/</span>}
            {item.path ? (
              <a
                href={item.path}
                className="hover:text-blue-600 transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <span className="font-medium text-slate-700">{item.label}</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 페이지별 메뉴 (존재하는 경우에만 표시) */}
      {hasPageMenu && (
        <>
          <span className="mx-2 text-slate-400">|</span>
          <div className="flex space-x-4">
            {Object.keys(pageMenus[currentPage].menus).map((menuId) => (
              <span
                key={menuId}
                onClick={() => handleMenuClick(menuId)}
                className={`cursor-pointer transition-colors ${
                  activeMenu === menuId
                    ? 'font-medium text-blue-600'
                    : 'text-slate-500 hover:text-blue-600'
                }`}
              >
                {pageMenus[currentPage].menus[menuId].label}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default BreadcrumbWithMenu;
