/**
 * 결제매출 관련 유틸리티 함수
 */

/**
 * 초기 결제매출 객체 생성
 */
export const createInitialPayment = () => ({
  revenueSource: null,
  billingType: '',
  isConfirmed: false,
  probability: '',
  amount: '',
  profitAmount: '',
  isProfit: false,
  marginProfitValue: '',
  recognitionDate: '',
  scheduledDate: '',
  paymentLabel: '',
  memo: '',
});

/**
 * 매출원(revenueSource) 자동 설정
 */
export const setRevenueSource = (payment, data) => {
  if (data?.isSameBilling && data?.customer?.id) {
    return {
      ...payment,
      revenueSource: {
        id: data.customer.id,
        name: data.customer.name,
      },
    };
  }
  return payment;
};

/**
 * 단일 사업부 할당 생성
 */
const createSingleTeamAllocation = (sfaByItem) => [
  {
    teamId: sfaByItem.teamId,
    teamName: sfaByItem.teamName,
    itemId: sfaByItem.itemId,
    itemName: sfaByItem.itemName,
    allocatedAmount: 0,
    allocatedProfitAmount: 0,
  },
];

/**
 * 다중 사업부 할당 생성
 */
const createMultiTeamAllocations = (sfaByItems) =>
  sfaByItems.map((item) => ({
    teamId: item.teamId,
    teamName: item.teamName,
    itemId: item.itemId,
    itemName: item.itemName,
    allocatedAmount: 0,
    allocatedProfitAmount: 0,
  }));

/**
 * 사업부 할당(teamAllocations) 자동 생성
 */
export const generateTeamAllocations = (data) => {
  const sfaByItems = data?.sfaByItems || [];
  const isMultiTeam = data?.isMultiTeam || false;

  if (sfaByItems.length === 0) return [];

  return isMultiTeam
    ? createMultiTeamAllocations(sfaByItems)
    : createSingleTeamAllocation(sfaByItems[0]);
};

/**
 * 새로운 결제매출 객체 생성 (모든 로직 통합)
 */
export const createNewPayment = (data) => {
  let payment = createInitialPayment();

  // revenueSource 설정
  payment = setRevenueSource(payment, data);

  // teamAllocations 생성
  payment.teamAllocations = generateTeamAllocations(data);

  return payment;
};

/**
 * 결제매출 추가 가능 여부 확인
 */
export const canAddPayment = (currentPayments, maxLimit = 3) => {
  const count = currentPayments?.length || 0;
  return count < maxLimit;
};

/**
 * 결제매출 유효성 검증
 */
export const validatePayment = (payment) => {
  const errors = [];

  if (!payment.amount || parseFloat(payment.amount) <= 0) {
    errors.push('매출 금액을 입력해주세요.');
  }

  if (!payment.recognitionDate) {
    errors.push('매출 인식일을 선택해주세요.');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
