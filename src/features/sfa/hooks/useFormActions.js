// src/features/sfa/hooks/useFormAction.js
// 구조개선(25.01.24)
import { apiClient } from '../../../shared/api/apiClient';
import { useFormData } from './useFormData';

/**
 * 초기 상태 정의
 */
const initialSalesByItem = {
  itemId: '',
  itemName: '',
  teamId: '',
  teamName: '',
  amount: '',
};

const initialSalesByPayment = {
  billingType: '',
  isConfirmed: false,
  probability: '',
  amount: '',
  profitAmount: '',
  isProfit: false,
  marginProfitValue: '',
  recognitionDate: '',
  scheduledDate: '',
  memo: '',
};

export const useFormAction = () =>
  // sfaForm,
  // formData,
  // setFormData,
  // setErrors,
  // isPaymentDataLoading,
  // paymentMethodData,
  // fetchPayments,
  {
    const { formData, setFormData, updateFormField } = useFormData();

    /**
     * 매출항목 추가 핸들러
     * 최대 3개까지만 추가 가능
     */
    const handleAddSalesItem = () => {
      if (formData.salesByItems.length < 3) {
        setFormData((prev) => ({
          ...prev,
          salesByItems: [...prev.salesByItems, { ...initialSalesByItem }],
        }));
      }
    };

    /**
     * 매출항목 제거 핸들러
     * @param {number} index - 제거할 매출항목의 인덱스
     */
    const handleRemoveSalesItem = (index) => {
      setFormData((prev) => {
        // 깊은 복사를 통해 새로운 배열 생성
        const updatedItems = [...prev.salesByItems];
        updatedItems.splice(index, 1);

        // 관련 에러 상태도 함께 제거
        setErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[`salesItems.${index}.productType`];
          delete newErrors[`salesItems.${index}.teamName`];
          delete newErrors[`salesItems.${index}.amount`];
          return newErrors;
        });

        // 나머지 항목들의 값 재설정
        return {
          ...prev,
          salesByItems: updatedItems.map((item) => ({
            itemId: item.itemId || '',
            itemName: item.itemName || '',
            teamId: item.teamId || '',
            teamName: item.teamName || '',
            amount: item.amount || '',
          })),
        };
      });
    };

    /**
     * 결제매출 추가 핸들러
     * 최대 3개까지만 추가 가능
     * 결제 방법 데이터가 없을 경우 먼저 조회
     */
    const handleAddPayment = async () => {
      if (formData.salesByPayments.length >= 3) return;

      try {
        if (!isPaymentDataLoading && !paymentMethodData.data.length) {
          await fetchPayments();
        }

        setFormData((prev) => ({
          ...prev,
          salesByPayments: [
            ...prev.salesByPayments,
            { ...initialSalesByPayment },
          ],
        }));
      } catch (error) {
        console.error('Failed to add sales payment:', error);
      }
    };

    /**
     * 결제매출 제거 핸들러
     * @param {number} index - 제거할 결제매출의 인덱스
     */
    const handleRemovePayment = (index) => {
      setFormData((prev) => ({
        ...prev,
        salesByPayments: prev.salesByPayments.filter((_, i) => i !== index),
      }));
    };

    return {
      // handleAddSalesItem,
      handleRemoveSalesItem,
      handleAddPayment,
      handleRemovePayment,
    };
  };
