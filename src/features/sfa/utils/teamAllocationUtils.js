/**
 * 팀 할당 관련 유틸리티 함수
 */

/**
 * SFA의 sfaByItems로부터 팀 할당 템플릿 생성
 * @param {Array} sfaByItems - [{ teamId, teamName, itemId, itemName, amount }]
 * @returns {Array} 팀 할당 템플릿
 */
export const createTeamAllocationTemplate = (sfaByItems) => {
  if (!Array.isArray(sfaByItems) || sfaByItems.length === 0) {
    return [];
  }

  return sfaByItems.map((item) => ({
    teamId: item.teamId,
    teamName: item.teamName,
    itemId: item.itemId,
    itemName: item.itemName,
    allocatedAmount: 0, // 초기값 0
  }));
};

/**
 * 결제 금액을 팀별 매출 비율로 자동 배분
 * @param {number} paymentAmount - 결제 금액
 * @param {Array} sfaByItems - 팀별 총 매출액 정보
 * @returns {Array} 할당된 팀 배열
 */
export const autoAllocateByRatio = (paymentAmount, sfaByItems) => {
  if (!Array.isArray(sfaByItems) || sfaByItems.length === 0) {
    return [];
  }

  const payment = parseFloat(paymentAmount || 0);
  if (payment === 0) {
    return createTeamAllocationTemplate(sfaByItems);
  }

  // 총 매출액 계산
  const totalAmount = sfaByItems.reduce((sum, item) => {
    return sum + parseFloat(item.amount || 0);
  }, 0);

  if (totalAmount === 0) {
    return createTeamAllocationTemplate(sfaByItems);
  }

  // 비율 계산하여 배분
  let allocatedTotal = 0;
  const allocations = sfaByItems.map((item, index) => {
    const ratio = parseFloat(item.amount || 0) / totalAmount;
    let allocated = Math.round(payment * ratio);

    // 마지막 항목은 반올림 오차 보정
    if (index === sfaByItems.length - 1) {
      allocated = payment - allocatedTotal;
    }

    allocatedTotal += allocated;

    return {
      teamId: item.teamId,
      teamName: item.teamName,
      itemId: item.itemId,
      itemName: item.itemName,
      allocatedAmount: allocated,
    };
  });

  return allocations;
};

/**
 * 균등 배분
 * @param {number} paymentAmount - 결제 금액
 * @param {Array} sfaByItems - 팀 정보
 * @returns {Array} 균등 할당된 팀 배열
 */
export const autoAllocateEqually = (paymentAmount, sfaByItems) => {
  if (!Array.isArray(sfaByItems) || sfaByItems.length === 0) {
    return [];
  }

  const payment = parseFloat(paymentAmount || 0);
  if (payment === 0) {
    return createTeamAllocationTemplate(sfaByItems);
  }

  const perTeam = Math.floor(payment / sfaByItems.length);
  const remainder = payment % sfaByItems.length;

  return sfaByItems.map((item, index) => ({
    teamId: item.teamId,
    teamName: item.teamName,
    itemId: item.itemId,
    itemName: item.itemName,
    // 나머지는 첫 번째 팀에 추가
    allocatedAmount: perTeam + (index === 0 ? remainder : 0),
  }));
};

/**
 * 팀별 할당 금액 합계 계산
 * @param {Array} teamAllocations
 * @returns {number}
 */
export const calculateTotalAllocated = (teamAllocations) => {
  if (!Array.isArray(teamAllocations)) return 0;

  return teamAllocations.reduce((sum, alloc) => {
    return sum + parseFloat(alloc.allocatedAmount || 0);
  }, 0);
};

/**
 * 팀별 할당 유효성 검증
 * @param {Array} teamAllocations
 * @param {number} paymentAmount
 * @returns {{ isValid: boolean, error: string }}
 */
export const validateTeamAllocations = (teamAllocations, paymentAmount) => {
  if (!Array.isArray(teamAllocations) || teamAllocations.length === 0) {
    return { isValid: false, error: '팀 할당 정보가 없습니다.' };
  }

  const totalAllocated = calculateTotalAllocated(teamAllocations);
  const payment = parseFloat(paymentAmount || 0);

  if (totalAllocated !== payment) {
    return {
      isValid: false,
      error: `할당 총액(${totalAllocated.toLocaleString()})이 결제금액(${payment.toLocaleString()})과 일치하지 않습니다.`,
    };
  }

  // 음수 체크
  const hasNegative = teamAllocations.some((alloc) => {
    return parseFloat(alloc.allocatedAmount || 0) < 0;
  });

  if (hasNegative) {
    return { isValid: false, error: '음수 금액은 입력할 수 없습니다.' };
  }

  return { isValid: true, error: '' };
};

/**
 * 특정 팀의 누적 할당 금액 계산
 * @param {number} teamId
 * @param {Array} sfaByPayments - 모든 결제 정보
 * @returns {number}
 */
export const getTeamTotalAllocated = (teamId, sfaByPayments) => {
  if (!Array.isArray(sfaByPayments)) return 0;

  return sfaByPayments.reduce((total, payment) => {
    const allocations = payment.teamAllocations || [];
    const teamAllocation = allocations.find((a) => a.teamId === teamId);
    return total + (teamAllocation?.allocatedAmount || 0);
  }, 0);
};

/**
 * 팀별 남은 할당 가능 금액 계산
 * @param {number} teamId
 * @param {number} teamTotalAmount - 팀 총 매출액
 * @param {Array} sfaByPayments - 기존 결제 정보들
 * @returns {number}
 */
export const getTeamRemainingAmount = (
  teamId,
  teamTotalAmount,
  sfaByPayments,
) => {
  const allocated = getTeamTotalAllocated(teamId, sfaByPayments);
  return Math.max(0, teamTotalAmount - allocated);
};
