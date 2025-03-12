/**
 * Contact 전용 Drawer 컴포넌트
 */
// src/features/contact/components/drawer/ContactDrawer.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { selectCodebookByType } from '../../../codebook/store/codebookSlice.js';
import { useContact } from '../../context/ContactProvider.jsx';
import Drawer from '../../../../shared/components/ui/drawer/Drawer.jsx';
import DrawerActionMenu from '../../../../shared/components/ui/button/DrawerActionMenu.jsx';
import ContactAddForm from '../forms/ContactAddForm';
import ContactExcelUpload from '../upload/ContactExcelUpload.jsx';

const ContactDrawer = () => {
  // Codebook 데이터 조회
  const sfaSalesTypeData = useSelector(selectCodebookByType('sfa_sales_type'));
  const sfaClassificationData = useSelector(
    selectCodebookByType('sfa_classification'),
  );

  const { drawerState, setDrawer, setDrawerClose } = useContact();
  const { visible, baseMode, subMode, data } = drawerState;

  console.log(`ContactDrawer's drawerState: `, drawerState);

  const baseMenus = [
    {
      key: 'add',
      label: '단일 등록',
      active: baseMode === 'addSingle',
      onClick: () => {
        // setActiveControl('view');
        setDrawer({ baseMode: 'addSingle' });
      },
    },
    {
      key: 'upload',
      label: '일괄 등록',
      active: baseMode === 'addBulk',
      onClick: () => {
        // setActiveControl('edit');
        setDrawer({ baseMode: 'addBulk' });
      },
    },
  ];

  const subMenus = [];

  // Drawer 헤더 타이틀 설정
  const getHeaderTitle = () => {
    if (baseMode) {
      const titles = {
        addSingle: '담당자 등록',
        addBulk: '담당자 일괄괄등록',
        view: '담당자 상세정보',
        edit: '담당자 수정',
      };
      return titles[baseMode] || '';
    }
    return '';
  };

  return (
    <Drawer
      visible={visible}
      title={getHeaderTitle()}
      onClose={setDrawerClose}
      width="900px"
      enableOverlayClick={false}
    >
      {/* 메뉴 영역 */}
      {(baseMenus.length > 0 || subMode.length > 0) && (
        <div className="border-b border-gray-200 px-4 py-2">
          <DrawerActionMenu baseMenus={baseMenus} subMenus={subMenus} />
        </div>
      )}
      {/* {renderDrawerContent()} */}
      {baseMode === 'addSingle' && <ContactAddForm />}
      {baseMode === 'addBulk' && <ContactExcelUpload />}
      {/* {controlMode === 'view' && <ViewContent data={data?.data[0]} />}
      {controlMode === 'edit' && <EditContent data={data?.data[0]} />} */}
    </Drawer>
  );
};

export default ContactDrawer;
