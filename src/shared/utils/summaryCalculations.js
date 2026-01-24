/**
 * SFA 매출 정보 요약 계산 유틸리티
 * - 매출액 합계
 * - 매출이익 합계
 * - 사업부별 매출액 집계
 */

/**
 * 전체 매출액 계산 (모든 결제매출의 amount 합계)
 * @param {Array} sfaByPayments - 결제매출 배열
 * @returns {number} 총 매출액
 */
export const calculateTotalAmount = (sfaByPayments = []) => {
  if (!Array.isArray(sfaByPayments) || sfaByPayments.length === 0) {
    return 0;
  }

  return sfaByPayments.reduce((sum, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return sum + amount;
  }, 0);
};

/**
 * 전체 매출이익 계산
 * - profitAmount 필드 사용 (계산된 이익 금액)
 * @param {Array} sfaByPayments - 결제매출 배열
 * @returns {number} 총 매출이익
 */
export const calculateTotalProfit = (sfaByPayments = []) => {
  if (!Array.isArray(sfaByPayments) || sfaByPayments.length === 0) {
    return 0;
  }

  return sfaByPayments.reduce((sum, payment) => {
    const profitAmount = parseFloat(payment.profitAmount) || 0;
    return sum + profitAmount;
  }, 0);
};

/**
 * 사업부별 매출액 집계
 * - teamAllocations에서 사업부별 allocatedAmount 합산
 * @param {Array} sfaByPayments - 결제매출 배열
 * @param {Array} sfaByItems - 사업부 매출 항목 (teamId, teamName, itemId, itemName 포함)
 * @returns {Array} [{ teamId, teamName, itemId, itemName, totalAmount }]
 */
export const calculateTeamRevenues = (sfaByPayments = [], sfaByItems = []) => {
  if (!Array.isArray(sfaByPayments) || sfaByPayments.length === 0) {
    return [];
  }

  // 사업부별 매출 집계용 맵 (key: `teamId-itemId`)
  const teamRevenueMap = new Map();

  // 모든 결제매출의 teamAllocations를 순회
  sfaByPayments.forEach((payment) => {
    const allocations = payment.teamAllocations || [];

    allocations.forEach((allocation) => {
      const key = `${allocation.teamId}-${allocation.itemId}`;
      const allocatedAmount = parseFloat(allocation.allocatedAmount) || 0;

      if (teamRevenueMap.has(key)) {
        // 기존 항목에 누적
        const existing = teamRevenueMap.get(key);
        existing.totalAmount += allocatedAmount;
      } else {
        // 새 항목 추가
        teamRevenueMap.set(key, {
          teamId: allocation.teamId,
          teamName: allocation.teamName,
          itemId: allocation.itemId,
          itemName: allocation.itemName,
          totalAmount: allocatedAmount,
        });
      }
    });
  });

  // Map을 배열로 변환하고 teamId로 정렬
  return Array.from(teamRevenueMap.values()).sort((a, b) => a.teamId - b.teamId);
};

/**
 * 이익률 계산 (매출이익 / 매출액 * 100)
 * @param {number} totalProfit - 총 매출이익
 * @param {number} totalAmount - 총 매출액
 * @returns {number} 이익률 (%)
 */
export const calculateProfitRate = (totalProfit, totalAmount) => {
  if (totalAmount === 0) {
    return 0;
  }
  return (totalProfit / totalAmount) * 100;
};

/**
 * 사업부별 매출액 합계가 전체 매출액과 일치하는지 검증
 * @param {number} totalAmount - 전체 매출액
 * @param {Array} teamRevenues - 사업부별 매출 배열
 * @returns {boolean}
 */
export const validateTeamRevenueTotal = (totalAmount, teamRevenues) => {
  const teamTotal = teamRevenues.reduce((sum, team) => sum + team.totalAmount, 0);
  return Math.abs(totalAmount - teamTotal) < 0.01; // 부동소수점 오차 허용
};

/**
 * 사업부별 매출이익 집계
 * - teamAllocations 정보를 바탕으로 팀별 이익 합산
 * @param {Array} sfaByPayments - 결제매출 배열
 * @returns {Array} [{ teamId, teamName, totalProfit, totalAmount }]
 */
export const calculateTeamProfits = (sfaByPayments = []) => {
  if (!Array.isArray(sfaByPayments) || sfaByPayments.length === 0) {
    return [];
  }

  const teamMap = new Map();

  sfaByPayments.forEach((payment) => {
    const profit = Number(payment.profitAmount || payment.profit_amount) || 0;
    const amount = Number(payment.amount) || 0;

    let allocations = payment.teamAllocations || payment.team_allocations || [];

    // JSON 문자열 처리
    if (typeof allocations === 'string') {
      try {
        allocations = JSON.parse(allocations);
      } catch (e) {
        allocations = [];
      }
    }

    if (Array.isArray(allocations)) {
      allocations.forEach((alloc) => {
        const teamId = alloc.teamId || alloc.team_id;
        const teamName = alloc.teamName || alloc.team_name;
        // teamId가 없으면 스킵
        if (!teamId) return;
        
        const key = teamId;

        // 이익 계산
        let allocProfit =
          Number(alloc.allocatedProfitAmount || alloc.allocated_profit_amount) || 0;
        let ratio =
          Number(alloc.ratio || alloc.allocation_ratio || alloc.percent) || 0;

        // 비율이 없고 금액만 있는 경우 비율 역산
        const allocAmount =
          Number(alloc.allocatedAmount || alloc.allocated_amount) || 0;
        if (ratio === 0 && amount > 0 && allocAmount > 0) {
          ratio = (allocAmount / amount) * 100;
        }

        // 이익이 0이고 비율이 있으면 계산 (profit이 있을 때)
        if (allocProfit === 0 && profit > 0 && ratio > 0) {
          allocProfit = Math.round(profit * (ratio / 100));
        }

        if (teamMap.has(key)) {
          const current = teamMap.get(key);
          teamMap.set(key, {
            ...current,
            totalProfit: current.totalProfit + allocProfit,
            totalAmount: current.totalAmount + allocAmount,
          });
        } else {
          teamMap.set(key, {
            teamId,
            teamName,
            totalProfit: allocProfit,
            totalAmount: allocAmount,
          });
        }
      });
    }
  });

  return Array.from(teamMap.values());
};
