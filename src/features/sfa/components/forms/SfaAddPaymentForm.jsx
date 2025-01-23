// src/features/sfa/components/forms/SfaAddPaymentForm.jsx
import { useFormValidation } from '../../hooks/useFormValidation';
import SalesByPayment from '../elements/SalesByPayment';
import { Form, Group, Button } from '../../../../shared/components/ui';

const SfaAddPaymentForm = ({
  formData,
  handleSalesPaymentChange,
  handleRemoveSalesPayment,
  isSubmitting,
  errors,
  paymentMethodData,
  percentageData,
  isPaymentDataLoading,
}) => {
  const { validatePayments } = useFormValidation(formData);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사 수행
    const paymentErrors = validatePayments(formData.salesByPayments);
    console.log(`***** paymentErrors : ${paymentErrors}`);
    if (paymentErrors.length > 0) return;

    const isValid = validateForm();
    if (!isValid) return;

    // submit
  };

  return (
    <>
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
          onChange={handleSalesPaymentChange}
          // onAdd={handleAddSalesPayment}
          onRemove={handleRemoveSalesPayment}
          isSubmitting={isSubmitting}
          errors={errors}
          paymentMethodData={paymentMethodData}
          percentageData={percentageData}
          isPaymentDataLoading={isPaymentDataLoading}
        />

        {/* Submit Button */}
        <Group>
          {formData.salesByPayments.length !== 0 && (
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
          )}
        </Group>
      </Form>
    </>
  );
};

export default SfaAddPaymentForm;
