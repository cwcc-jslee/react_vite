// /src/containers/SfaContainer/SalesForecastContainer/SalesForecastContainer.js
import React, { useState, useEffect } from 'react';
import { fetchSalesForecastData } from '../../../lib/api/api';
import { getMonthRange } from '../../../modules/timeRangeUtils';
import SalesForecastTable from './components/SalesForecastTable';

const SalesForecastContainer = () => {
  const [forecastData, setForecastData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadForecastData = async () => {
      try {
        const monthsRange = getMonthRange(12); // 전월 포함 12개월
        const totalMonths = monthsRange.length;
        const limit = 50;

        const loadedData = [];
        for (let i = 0; i < totalMonths; i++) {
          const { year, month } = monthsRange[i];
          const result = await fetchSalesForecastData(year, month, limit);
          //console.log(`>>>>>>>>>>>>>>>>>(result)-${totalMonths}>>`, result);
          loadedData.push({ ...monthsRange[i], data: result.processedData });
          setProgress(((i + 1) / totalMonths) * limit);
        }

        setForecastData(loadedData);
        setLoading(false);
      } catch (err) {
        setError('데이터를 불러오는 데 실패했습니다.');
        setLoading(false);
      }
    };

    loadForecastData();
  }, []);

  if (loading) {
    return (
      <div>
        <p>데이터 로딩 중... {progress.toFixed(0)}% 완료</p>
        <progress value={progress} max="100" />
      </div>
    );
  }
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>매출 예측</h1>
      {forecastData.length > 0 && <SalesForecastTable data={forecastData} />}
    </div>
  );
};

export default SalesForecastContainer;
