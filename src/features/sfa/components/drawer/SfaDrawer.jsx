import BaseDrawer from '../../../../shared/components/ui/drawer/BaseDrawer';
import { useSfa } from '../../context/SfaContext';
import { Button } from '../../../../shared/components/ui';
import SfaAddForm from '../forms/SfaAddForm';
import SfaDetailTable from '../tables/SfaDetailTable';
// import SfaDetailTable from './SfaDetailTable';
// import SfaDetailSalesTable from './SfaDetailSalesTable';

const SfaDrawer = () => {
  const { drawerState, setDrawer, setDrawerClose, handleFormSubmit } = useSfa();
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
          <h1>테스트</h1>
          <SfaDetailTable data={data} />
          {/* <SfaDetailSalesTable
            data={data.sfa_moreinfos || []}
            onEdit={(item) =>
              setDrawer({
                detailMode: 'sales-edit',
                editData: item,
              })
            }
          /> */}
        </>
      );
    }

    return null;
  };

  return (
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
  );
};

export default SfaDrawer;
