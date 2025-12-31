// src/features/sfa/containers/SfaContainer.jsx
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import dayjs from 'dayjs';
import { updateFilterFields, fetchSfas } from '../../../store/slices/sfaSlice';
import { Section } from '../../../shared/layout/components';

// Layouts
import SfaOverviewLayout from '../layouts/SfaOverviewLayout';
import SfaSearchLayout from '../layouts/SfaSearchLayout';
import SfaForecastLayout from '../layouts/SfaForecastLayout';
import SfaAnalyticsLayout from '../layouts/SfaAnalyticsLayout';
import SalesInformationLayout from '../layouts/SalesInformationLayout';
import SfaAddLayout from '../layouts/SfaAddLayout';
import SfaViewEditLayout from '../layouts/SfaViewEditLayout';

/**
 * SFA 메인 컨테이너 컴포넌트
 * 페이지 레이아웃을 조건부로 렌더링하여 각 메뉴별 화면 구성
 *
 * 레이아웃 매핑:
 * - list: SfaOverviewLayout (현황)
 * - search: SfaSearchLayout (상세조회)
 * - forecast: SfaForecastLayout (매출예측)
 * - analytics: SfaAnalyticsLayout (매출분석)
 * - salesInformation: SalesInformationLayout (매출정보)
 *
 * @component
 */
const SfaContainer = React.memo(() => {
  const dispatch = useDispatch();

  // 레이아웃 및 drawer 상태 가져오기
  const { layout } = useSelector((state) => state.ui.pageLayout);
  const drawer = useSelector((state) => state.ui.drawer);

  // 컴포넌트 마운트 시 초기 필터 설정 및 SFA 목록 데이터 조회
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
  }, [dispatch]);

  return (
    <>
      <Section>
        {/* 레이아웃 타입에 따라 조건부 렌더링 */}
        {layout === 'list' && <SfaOverviewLayout />}
        {layout === 'search' && <SfaSearchLayout />}
        {layout === 'forecast' && <SfaForecastLayout />}
        {layout === 'analytics' && <SfaAnalyticsLayout />}
        {layout === 'salesInformation' && <SalesInformationLayout />}
      </Section>

      {/* Drawer - 신규등록/상세보기/수정 */}
      {drawer.visible && drawer.mode === 'add' && <SfaAddLayout />}
      {drawer.visible && ['view', 'edit'].includes(drawer.mode) && (
        <SfaViewEditLayout />
      )}
    </>
  );
});

SfaContainer.displayName = 'SfaContainer';

export default SfaContainer;
