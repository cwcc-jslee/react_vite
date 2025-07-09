// src/features/sfa/containers/SfaContainer.jsx
// SfaPage.jsx 에서 분리
// SfaPage 컴포넌트가 useSfa hook을 사용하기 전에 SfaProvider로 감싸져 있지 않아서 발생하는 문제해결
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import { updateFilterFields, fetchSfas } from '../../../store/slices/sfaSlice';
// import { selectCodebookByType } from '../../codebook/store/codebookSlice';
// import { useSfa } from '../context/SfaProvider';
// import { useSfaSearchFilter } from '../hooks/useSfaSearchFilter';
import { Section } from '../../../shared/components/ui/layout/components';
import SfaDrawer from '../components/drawer/SfaDrawer';
// import { useSfaStore } from '../hooks/useSfaStore'; // 제거: SFA 상태 구독 방지

// Components
import SfaQuarterlyOverview from '../components/tables/SfaQuarterlyOverview';
import SfaAnnualOverview from '../components/tables/SfaAnnualOverview';
import SfaTable from '../components/tables/SfaTable';
// import SfaSubMenu from '../components/SfaSubMenu';
import SfaSearchForm from '../components/forms/SfaSearchForm';

/**
 * SFA 메인 컨테이너 컴포넌트
 * 페이지 레이아웃과 주요 컴포넌트들을 관리
 */
const SfaContainer = React.memo(() => {
  const dispatch = useDispatch();

  // 레이아웃 관련 상태 가져오기 (SFA 상태는 구독하지 않음)
  const components = useSelector((state) => state.ui.pageLayout.components);
  const drawer = useSelector((state) => state.ui.drawer);

  // 컴포넌트 마운트 시 초기 필터 설정 및 SFA 목록 데이터 조회 (1번만 실행)
  React.useEffect(() => {
    console.log('SfaContainer - 초기 필터 설정 및 fetchSfas 실행');

    // 초기 dateRange 설정 (현재 월의 시작일과 마지막일)
    const initialDateRange = {
      startDate: dayjs().startOf('month').format('YYYY-MM-DD'),
      endDate: dayjs().endOf('month').format('YYYY-MM-DD'),
    };

    // 초기 필터를 스토어에 저장
    dispatch(
      updateFilterFields({
        dateRange: initialDateRange,
      }),
    );

    // 초기 데이터 조회
    dispatch(fetchSfas());
  }, [dispatch]); // 의존성 배열 단순화

  // drawer를 더 세밀하게 메모이제이션하여 불필요한 리렌더링 방지

  return (
    <>
      <Section>
        {/* <SfaSubMenu /> */}
        {components.searchForm && <SfaSearchForm />}
        {components.forecastTable && <SfaAnnualOverview />}
        {components.monthlyStatus && <SfaQuarterlyOverview />}
        {components.sfaTable && <SfaTable />}
      </Section>
      {drawer.visible && <SfaDrawer drawer={drawer} />}
    </>
  );
});

SfaContainer.displayName = 'SfaContainer';

export default SfaContainer;
