/**
 * 고객사 정보를 표시 형식으로 변환
 * @param {Array} sfaCustomers - SFA 고객사 배열
 * @returns {string} 포맷팅된 고객사 정보
 */
export const formatCustomerDisplay = (sfaCustomers) => {
  if (!sfaCustomers || sfaCustomers.length === 0) return '-';
  if (sfaCustomers.length === 1) return sfaCustomers[0].customer.name;

  // 매출처(is_revenue_source)가 있는 경우 해당 항목을 앞으로 정렬
  const sortedCustomers = [...sfaCustomers].sort((a, b) => {
    if (a.is_revenue_source && !b.is_revenue_source) return -1;
    if (!a.is_revenue_source && b.is_revenue_source) return 1;
    return 0;
  });

  return sortedCustomers.map((c) => c.customer.name).join(' / ');
};
