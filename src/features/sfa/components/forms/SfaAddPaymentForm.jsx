// src/features/sfa/components/forms/SfaAddPaymentForm.jsx
import { useFormValidation } from '../../hooks/useFormValidation';
import SalesByPayment from '../elements/SalesByPayment';
import { useSfaForm } from '../../hooks/useSfaForm.js';
import { Form, Group, Button } from '../../../../shared/components/ui';

const SfaAddPaymentForm = ({ data, controlMode }) => {
  const {
    formData,
    handleAddPayment,
    handlePaymentChange,
    handleRemovePayment,
    isSubmitting,
    errors,
    paymentData,
    percentageData,
    isPaymentDataLoading,
    processPaymentSubmit,
  } = useSfaForm();
  const { validatePayments } = useFormValidation(formData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const sfaId = data.id;
    console.log(`***** form : `, formData.salesByPayments);
    console.log(`***** sfaId : `, sfaId);

    // 유효성 검사 수행
    const paymentErrors = validatePayments(formData.salesByPayments);
    console.log(`***** paymentErrors : ${paymentErrors}`);
    if (paymentErrors.length > 0) return;

    // const isValid = validateForm();
    // if (!isValid) return;

    // submit
    await processPaymentSubmit(sfaId);
  };

  const handleCancle = async () => {};

  return (
    <>
      {controlMode === 'edit' && (
        <Button
          type="button"
          variant="primary"
          onClick={handleAddPayment}
          // disabled={isSubmitting || formData.salesByPayments.length >= 3}
          // className={`w-full ${
          //   formData.salesByPayments.length >= 3
          //     ? 'bg-gray-200 hover:bg-gray-200 text-gray-500 border-gray-200'
          //     : ''
          // }`}
        >
          결제매출등록
        </Button>
      )}
      <Form
        onSubmit={handleSubmit}
        className="space-y-6"
        // 추가: method와 action 속성 명시적 지정
        method="POST"
        action="#"
      >
        {/* 결제 매출 추가 */}
        <SalesByPayment
          payments={formData.salesByPayments}
          onChange={handlePaymentChange}
          // onAdd={handleAddSalesPayment}
          onRemove={handleRemovePayment}
          isSubmitting={isSubmitting}
          // errors={errors}
          paymentData={paymentData}
          percentageData={percentageData}
          isPaymentDataLoading={isPaymentDataLoading}
        />

        {/* Submit Button */}
        <Group>
          {formData.salesByPayments.length !== 0 && (
            <>
              <Button
                type="button"
                variant="primary"
                disabled={isSubmitting}
                className="w-full"
                onClick={handleCancle}
              >
                취소
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting}
                className="w-full"
                onClick={(e) => {
                  // 버튼 클릭 시에도 이벤트 전파 방지
                  e.preventDefault();
                  handleSubmit(e);
                }}
              >
                {isSubmitting ? '처리중...' : '저장'}
              </Button>
            </>
          )}
        </Group>
      </Form>
    </>
  );
};

export default SfaAddPaymentForm;
