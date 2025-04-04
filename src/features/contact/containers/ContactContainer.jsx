// src/features/contact/containers/ContactContainer.jsx

import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useContact } from '../context/ContactProvider';
import { Section } from '../../../shared/components/ui/layout/components';

// Components
import ContactSubMenu from '../components/ContactSubMenu';
import ContactSearchForm from '../components/forms/ContactSearchForm';
import ContactTable from '../components/tables/ContactTable';
import ContactDrawer from '../components/drawer/ContactDrawer';

/**
 * Contact 메인 컨테이너 컴포넌트
 * 페이지 레이아웃과 주요 컴포넌트들을 관리
 */
const ContactContainer = () => {
  // 레이아웃 관련 상태 가져오기
  // const { pageLayout, drawerState } = useContact();
  // const { components } = pageLayout;

  // 레이아웃 관련 상태 가져오기
  const components = useSelector((state) => state.ui.pageLayout.components);
  const drawer = useSelector((state) => state.ui.drawer);

  // console.log(`DrawerState : `, drawerState);

  return (
    <>
      <Section>
        {/* <ContactSubMenu /> */}
        {/* <br></br> */}
        {components.contactTable && <ContactSearchForm />}
        {components.contactTable && <ContactTable />}
        {/* {components.contactExcelUpload && <ContactExcelUpload />} */}
      </Section>
      {drawer.visible && <ContactDrawer drawer={drawer} />}
    </>
  );
};

export default ContactContainer;
