// src/features/sfa/components/analytics/TeamMonthlyRevenue.jsx
import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { sfaApi } from '../../api/sfaApi';
import { StateDisplay } from '../../../../shared/components/ui/state/StateDisplay';

/**
 * 팀별 매출 현황 테이블
 * - 확정 매출 누계 (전월까지의 confirmed)
 * - 매출예정금액 (100%)
 * - 팀별 목표 매출액
 * - 매출 달성률
 */
const TeamMonthlyRevenue = ({ selectedYear }) => {
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 팀별 목표 매출 (임시 하드코딩 - 추후 API나 설정에서 가져와야 함)
  const TEAM_TARGETS = {
    '디지털혁신사업부': 500000000, // 5억
    'SI사업부': 800000000, // 8억
    '솔루션사업부': 600000000, // 6억
    '기타': 200000000, // 2억
  };

  useEffect(() => {
    const fetchRevenueData = async () => {
      setLoading(true);
      setError(null);

      try {
        const teamData = await sfaApi.getTeamYearlyStats(selectedYear);

        console.log('Team Data from API:', teamData);

        // 테이블 데이터 구조화
        const formattedData = Object.entries(teamData).map(([teamName, data]) => {
          const confirmedRevenue = data.confirmedRevenue || 0;
          const probableRevenue = data.probableRevenue || 0;
          const totalRevenue = data.totalRevenue || 0;
          const targetRevenue = TEAM_TARGETS[teamName] || 0;

          // 달성률 계산
          const achievementRate = targetRevenue > 0
            ? Math.round((totalRevenue / targetRevenue) * 100)
            : 0;

          return {
            teamName,
            confirmedRevenue,
            probableRevenue,
            totalRevenue,
            targetRevenue,
            achievementRate,
          };
        });

        // 팀명으로 정렬
        formattedData.sort((a, b) => a.teamName.localeCompare(b.teamName));

        // 합계 행 추가
        const totals = formattedData.reduce(
          (acc, item) => ({
            teamName: '합계',
            confirmedRevenue: acc.confirmedRevenue + item.confirmedRevenue,
            probableRevenue: acc.probableRevenue + item.probableRevenue,
            totalRevenue: acc.totalRevenue + item.totalRevenue,
            targetRevenue: acc.targetRevenue + item.targetRevenue,
            achievementRate: 0, // 합계 달성률은 마지막에 계산
          }),
          {
            confirmedRevenue: 0,
            probableRevenue: 0,
            totalRevenue: 0,
            targetRevenue: 0,
          }
        );

        // 합계 달성률 계산
        totals.achievementRate = totals.targetRevenue > 0
          ? Math.round((totals.totalRevenue / totals.targetRevenue) * 100)
          : 0;

        formattedData.push(totals);

        setRevenueData(formattedData);
      } catch (error) {
        console.error('Failed to fetch revenue data:', error);
        setError('매출 데이터를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRevenueData();
  }, [selectedYear]);

  if (loading) return <StateDisplay type="loading" />;
  if (error) return <StateDisplay type="error" message={error} />;

  // 달성률에 따른 색상
  const getAchievementColor = (rate) => {
    if (rate >= 100) return 'text-green-600 font-bold';
    if (rate >= 80) return 'text-blue-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        팀별 매출 현황 ({selectedYear}년)
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="bg-gray-100 p-3 text-center border border-gray-200 font-semibold min-w-[150px]">
                팀명
              </th>
              <th className="bg-blue-100 p-3 text-center border border-gray-200 font-semibold min-w-[120px]">
                확정 매출 누계
              </th>
              <th className="bg-green-100 p-3 text-center border border-gray-200 font-semibold min-w-[120px]">
                매출예정금액
                <div className="text-xs text-gray-600 font-normal">(100%)</div>
              </th>
              <th className="bg-purple-100 p-3 text-center border border-gray-200 font-semibold min-w-[120px]">
                총 매출
              </th>
              <th className="bg-yellow-100 p-3 text-center border border-gray-200 font-semibold min-w-[120px]">
                목표 매출액
              </th>
              <th className="bg-orange-100 p-3 text-center border border-gray-200 font-semibold min-w-[100px]">
                달성률
              </th>
            </tr>
          </thead>
          <tbody>
            {revenueData.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="p-4 text-center text-gray-500"
                >
                  데이터가 없습니다
                </td>
              </tr>
            ) : (
              revenueData.map((item, index) => {
                const isTotal = item.teamName === '합계';
                return (
                  <tr
                    key={item.teamName}
                    className={`hover:bg-gray-50 ${isTotal ? 'bg-gray-100 font-bold' : ''}`}
                  >
                    <td className={`p-3 border border-gray-200 ${isTotal ? 'font-bold' : ''}`}>
                      {item.teamName}
                    </td>
                    <td className="p-3 border border-gray-200 text-right">
                      {item.confirmedRevenue.toLocaleString()}
                    </td>
                    <td className="p-3 border border-gray-200 text-right">
                      {item.probableRevenue.toLocaleString()}
                    </td>
                    <td className="p-3 border border-gray-200 text-right font-semibold">
                      {item.totalRevenue.toLocaleString()}
                    </td>
                    <td className="p-3 border border-gray-200 text-right">
                      {item.targetRevenue.toLocaleString()}
                    </td>
                    <td className={`p-3 border border-gray-200 text-center ${getAchievementColor(item.achievementRate)}`}>
                      {item.achievementRate}%
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 범례 및 설명 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-600">
        <div className="space-y-2">
          <div>
            <span className="font-semibold">• 확정 매출 누계:</span> 전월까지의 confirmed 매출 합계
          </div>
          <div>
            <span className="font-semibold">• 매출예정금액:</span> 확률 100% (매출일 미확정)
          </div>
          <div>
            <span className="font-semibold">• 총 매출:</span> 확정 매출 + 매출예정금액
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">• 달성률 색상:</span>
            <span className="ml-2 text-green-600">100%↑</span>
            <span className="ml-2 text-blue-600">80%↑</span>
            <span className="ml-2 text-yellow-600">60%↑</span>
            <span className="ml-2 text-red-600">60%↓</span>
          </div>
          <div className="text-amber-600">
            * 목표 매출액은 설정 기능에서 변경 가능합니다
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamMonthlyRevenue;
