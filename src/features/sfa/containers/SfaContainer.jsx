// src/features/sfa/containers/SfaContainer.jsx
// SfaPage.jsx 에서 분리
// SfaPage 컴포넌트가 useSfa hook을 사용하기 전에 SfaProvider로 감싸져 있지 않아서 발생하는 문제해결
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCodebookByType } from '../../codebook/store/codebookSlice';
import { useSfa } from '../context/SfaProvider';
import { useSfaSearchFilter } from '../hooks/useSfaSearchFilter';
import { Section } from '../../../shared/components/ui/layout/components';
import SfaDrawer from '../components/drawer/SfaDrawer';

// Components
import SfaQuarterlyOverview from '../components/tables/SfaQuarterlyOverview';
// import SfaAnnualOverview from '../components/tables/SfaAnnualOverview';
import SfaTable from '../components/tables/SfaTable';
import SfaSubMenu from '../components/SfaSubMenu';
import SfaSearchForm from '../components/forms/SfaSearchForm';

/**
 * SFA 메인 컨테이너 컴포넌트
 * 페이지 레이아웃과 주요 컴포넌트들을 관리
 */
const SfaContainer = () => {
  // 레이아웃 관련 상태 가져오기
  const { pageLayout } = useSfa();
  const { components } = pageLayout;

  return (
    <>
      <Section>
        <SfaSubMenu />
        {components.searchForm && (
          <SfaSearchForm
          // sfaSalesTypeData={sfaSalesTypeData}
          // sfaClassificationData={sfaClassificationData}
          />
        )}
        {components.monthlyStatus && <SfaQuarterlyOverview />}
        {components.sfaTable && <SfaTable />}
        {/* {components.forecastTable && <SfaAnnualOverview />} */}
      </Section>
      <SfaDrawer />
    </>
  );
};

export default SfaContainer;
