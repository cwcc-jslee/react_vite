/**
 * 고객사 정보를 표시 형식으로 변환
 * @param {Object} revenueSource - 매출처 객체
 * @param {Object} sfaCustomer - SFA 고객사 객체
 * @returns {string} 포맷팅된 고객사 정보
 */
export const formatCustomerDisplay = (revenueSource, sfaCustomer) => {
  // null, undefined 체크
  if (!revenueSource) return '-';

  // revenueSource의 name 속성 존재 여부 체크
  if (!revenueSource?.name) return '-';

  // sfaCustomer가 없거나 name이 없는 경우 revenueSource만 반환
  if (!sfaCustomer?.name) return revenueSource.name;

  // revenueSource와 sfaCustomer의 name이 같은 경우 revenueSource만 반환
  if (revenueSource.name === sfaCustomer.name) return revenueSource.name;

  // 다른 경우 두 이름을 조합하여 반환
  return `${revenueSource.name} / ${sfaCustomer.name}`;
};

/**
 * 결제 매출/이익 합계 계산
 * @param {Array} paymentsData - 결제 데이터 배열
 * @returns {Object} { totalAmount, totalProfit } 합계 객체
 */
export const calculatePaymentTotals = (paymentsData) => {
  if (!paymentsData || !Array.isArray(paymentsData)) {
    return { totalAmount: 0, totalProfit: 0 };
  }

  return paymentsData.reduce(
    (totals, payment) => {
      const amount = typeof payment.amount === 'number' ? payment.amount : 0;
      const profitAmount =
        typeof payment.profitAmount === 'number' ? payment.profitAmount : 0;

      return {
        totalAmount: totals.totalAmount + amount,
        totalProfit: totals.totalProfit + profitAmount,
      };
    },
    { totalAmount: 0, totalProfit: 0 },
  );
};

/**
 * 사업부 매출 데이터를 포맷팅
 * @param {Array} itemsData - 사업부 항목 데이터 배열
 * @returns {Array|null} 포맷팅된 데이터 배열 또는 null
 */
export const formatSfaByItems = (itemsData) => {
  if (!itemsData || !Array.isArray(itemsData)) return null;

  return itemsData.map((item, index) => {
    const teamName = item.teamName || '-';
    const itemName = item.itemName || '-';

    // amount 또는 itemPrice 사용, null/undefined/빈 문자열인 경우만 '-' 표시
    const amount = item.amount ?? item.itemPrice;
    const price =
      amount != null && amount !== '' ? Number(amount).toLocaleString() : '-';

    // '항목명-팀명(가격)' 형태로 변경
    const badgeText = `${itemName}-${teamName}(${price})`;

    return {
      key: index,
      text: badgeText,
      teamName,
      itemName,
      price,
    };
  });
};
