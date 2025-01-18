// src/features/sfa/pages/SfaPageContent.jsx
// SfaPage.jsx 에서 분리
// SfaPage 컴포넌트가 useSfa hook을 사용하기 전에 SfaProvider로 감싸져 있지 않아서 발생하는 문제해결
import React from 'react';
import { useSfa } from '../context/SfaContext';
import { Section } from '../../../shared/components/ui/layout/components.jsx';
import { Button } from '../../../shared/components/ui';
import BaseDrawer from '../../../shared/components/ui/drawer/BaseDrawer';

// Components
import SfaSubMenu from '../components/SfaSubMenu';
import SfaMonthlyStatus from '../components/SfaMonthlyStatus';
import SfaTable from '../components/SfaTable';
import SfaSearchForm from '../components/SfaSearchForm';
import SfaForecastTable from '../components/SfaForecastTable';
import SfaAddForm from '../components/drawer/SfaAddForm';
import SfaDetailTable from '../components/drawer/SfaDetailTable';
import SfaDetailSalesTable from '../components/drawer/SfaDetailSalesTable';

/**
 * SfaPageContent Component
 * Renders the main content of the SFA page and handles drawer functionality
 */
const SfaPageContent = () => {
  const {
    pageLayout,
    drawerState,
    setDrawer,
    handleFormSubmit,
    setDrawerClose,
  } = useSfa();

  const { components } = pageLayout;
  const { visible, mode, detailMode, data } = drawerState;

  // Drawer related functions
  const getHeaderTitle = () => {
    if (mode === 'add') return '매출등록';
    if (mode === 'detail') {
      const titles = {
        view: 'SFA 상세정보',
        edit: 'SFA 수정',
        'sales-view': '매출정보 상세 보기',
        'sales-edit': '매출정보 수정',
        'sales-add': '매출정보 추가',
      };
      return titles[detailMode] || '';
    }
    return '';
  };

  const renderMenu = () => {
    if (mode !== 'detail') return null;

    const menuItems = [
      { mode: 'view', label: 'View' },
      { mode: 'edit', label: 'Edit' },
      { mode: 'sales-add', label: '매출추가' },
    ];

    return menuItems.map(({ mode: btnMode, label }) => (
      <Button
        key={btnMode}
        variant={detailMode === btnMode ? 'primary' : 'outline'}
        onClick={() => setDrawer({ detailMode: btnMode })}
        size="sm"
        className="mx-1"
      >
        {label}
      </Button>
    ));
  };

  const renderDrawerContent = () => {
    if (!visible) return null;
    if (mode === 'detail' && !data) return null;

    if (mode === 'add') {
      return <SfaAddForm onSubmit={handleFormSubmit} />;
    }

    if (mode === 'detail' && detailMode === 'view') {
      return (
        <>
          <SfaDetailTable data={data} />
          <SfaDetailSalesTable
            data={data.sfa_moreinfos || []}
            onEdit={(item) =>
              setDrawer({
                detailMode: 'sales-edit',
                editData: item,
              })
            }
          />
        </>
      );
    }

    return null;
  };

  return (
    <>
      <Section>
        <SfaSubMenu />
        {components.searchForm && <SfaSearchForm />}
        {components.monthlyStatus && <SfaMonthlyStatus />}
        {components.sfaTable && <SfaTable />}
        {components.forecastTable && <SfaForecastTable />}
      </Section>

      {/* Drawer */}
      <BaseDrawer
        visible={visible}
        title={getHeaderTitle()}
        onClose={setDrawerClose}
        menu={renderMenu()}
        width="900px"
        enableOverlayClick={false} // Overlay 클릭시 닫기 비활성화
      >
        {renderDrawerContent()}
      </BaseDrawer>
    </>
  );
};

export default SfaPageContent;
