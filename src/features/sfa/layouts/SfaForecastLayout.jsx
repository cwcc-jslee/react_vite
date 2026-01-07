// src/features/sfa/layouts/SfaForecastLayout.jsx
import React, { useState } from 'react';
import QuickDateFilter from '../components/filters/QuickDateFilter';
import FilterStatusBanner from '../components/filters/FilterStatusBanner';
import SfaAnnualOverview from '../components/tables/SfaAnnualOverview';
import SfaListTable from '../components/tables/SfaListTable';
import AdvancedSearchForm from '../components/filters/AdvancedSearchForm';
import { useSfaStore } from '../hooks/useSfaStore';
import { sfaService } from '../services/sfaService';
import { exportToExcel } from '../../../shared/utils/excelUtils';
import { convertKeysToCamelCase } from '../../../shared/utils/transformUtils';
import dayjs from 'dayjs';

/**
 * SFA 매출예측 페이지 레이아웃
 * 필터: QuickDateFilter + FilterStatusBanner
 * 상단: 연간 매출 예측 테이블 (12개월) 또는 상세 검색 폼
 * 하단: 매출 리스트 테이블
 *
 * @component
 */
const SfaForecastLayout = () => {
  const { actions, filters } = useSfaStore();

  // 뷰 모드 ('overview' | 'search')
  const [viewMode, setViewMode] = useState('overview');

  // 연간 테이블 기준월 (로컬 상태로 관리)
  const [annualBaseDate, setAnnualBaseDate] = useState(
    dayjs().subtract(1, 'month').startOf('month').format('YYYY-MM-DD'),
  );

  // 조회 기간 설정 (기본값 4개월)
  const [duration, setDuration] = useState(4);

  // QuickDateFilter의 월 변경 핸들러
  const handleDateChange = (startDate, endDate) => {
    setAnnualBaseDate(startDate);
  };

  // 조회 기간 변경 핸들러
  const handleDurationChange = (e) => {
    setDuration(Number(e.target.value));
  };

  // 뷰 모드 변경 시 필터 초기화
  const handleViewModeChange = (newMode) => {
    if (newMode !== viewMode) {
      actions.filter.resetFilters();
      setViewMode(newMode);
    }
  };

  // 엑셀 다운로드 핸들러
  const handleDownloadExcel = async () => {
    try {
      const BATCH_SIZE = 100; // API 최대 조회 제한 고려

      // 1. 첫 페이지 조회 (전체 개수 파악용)
      const firstResponse = await sfaService.getSfaList({
        filters: filters,
        pagination: {
          current: 1,
          pageSize: BATCH_SIZE,
        },
      });

      const { data: firstData, meta } = firstResponse;
      const total = meta?.pagination?.total || 0;

      let allRawItems = [...(firstData || [])];

      // 2. 추가 데이터가 있다면 병렬로 조회
      if (total > BATCH_SIZE) {
        const totalPages = Math.ceil(total / BATCH_SIZE);
        const promises = [];

        for (let page = 2; page <= totalPages; page++) {
          promises.push(
            sfaService.getSfaList({
              filters: filters,
              pagination: {
                current: page,
                pageSize: BATCH_SIZE,
              },
            }),
          );
        }

        const responses = await Promise.all(promises);
        responses.forEach((res) => {
          if (res?.data) {
            allRawItems = [...allRawItems, ...res.data];
          }
        });
      }

      // 3. 데이터 변환 (snake_case -> camelCase)
      const items = convertKeysToCamelCase(allRawItems);

      if (items.length === 0) {
        alert('다운로드할 데이터가 없습니다.');
        return;
      }

      // 4. 엑셀 데이터 매핑
      const excelData = items.map((item) => {
        const sfaByItem = item.sfa?.sfaByItems || [];
        const itemNames = sfaByItem.map((p) => p.itemName).join(', ');
        const teamNames = sfaByItem.map((p) => p.teamName).join(', ');

        return {
          No: item.id,
          확정여부: item.isConfirmed ? 'YES' : 'NO',
          확률: `${item.probability}%`,
          매출처: item.revenueSource?.name || '',
          고객사: item.sfa?.customer?.name || '',
          건명: item.sfa?.name || '',
          결제방법: item.billingType || '',
          매출구분: item.sfa?.sfaClassification?.name || '',
          매출품목: itemNames,
          사업부: teamNames,
          매출액: item.amount,
          매출이익: item.profitAmount,
          매출인식일: item.recognitionDate,
        };
      });

      // 5. 파일 다운로드
      exportToExcel(excelData, 'SFA_매출예측목록');
    } catch (error) {
      console.error('엑셀 다운로드 실패:', error);
      alert('엑셀 다운로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="space-y-2">
      {/* 필터 영역: QuickDateFilter (1/2) + FilterStatusBanner (1/2) */}
      <div className="flex gap-2 items-stretch">
        <div className="w-1/2">
          <QuickDateFilter
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            showAnnualRange={true}
            annualBaseDate={annualBaseDate}
            onAnnualDateChange={handleDateChange}
            duration={duration}
            onDurationChange={handleDurationChange}
            onDownload={handleDownloadExcel}
          />
        </div>
        <div className="w-1/2">
          <FilterStatusBanner />
        </div>
      </div>

      {/* 현황 모드: 연간 매출 예측 테이블 */}
      {viewMode === 'overview' && (
        <SfaAnnualOverview baseDate={annualBaseDate} duration={duration} />
      )}

      {/* 상세검색 모드: 상세 검색 폼 */}
      {viewMode === 'search' && <AdvancedSearchForm />}

      {/* 매출 리스트 */}
      <SfaListTable />
    </div>
  );
};

export default SfaForecastLayout;
