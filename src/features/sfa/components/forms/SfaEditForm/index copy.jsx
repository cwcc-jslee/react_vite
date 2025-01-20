// src/features/sfa/components/forms/SfaEditForm/index.jsx
import React, { useState } from 'react';
import { CustomerSearchInput } from '../../../../../shared/components/customer/CustomerSearchInput';
import SalesByItem from '../../elements/SalesByItemForm';
import SalesByPayment from '../../elements/SalesByPaymentForm';
import {
  Form,
  FormItem,
  Group,
  Stack,
  Label,
  Input,
  Select,
  TextArea,
  Button,
  Checkbox,
  Switch,
  Message,
  Modal,
} from '../../../../../shared/components/ui';

const SfaEditForm = ({
  formData,
  errors,
  isSubmitting,
  sfaSalesTypeData,
  itemsData,
  isItemsLoading,
  handleCustomerSelect,
  handleChange,
  processSubmit,
  validateForm,
  checkAmounts,
}) => {
  const [hasPartner, setHasPartner] = useState(false);
  const [isProject, setIsProject] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 유효성 검사 수행
    const isValid = validateForm(hasPartner);
    if (!isValid) return;

    await processSubmit(hasPartner, isProject);
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
        <Group direction="horizontal" className="gap-6">
          <FormItem className="flex-1">
            {/* flex-1 추가로 균등한 너비 */}
            <Label required>매출유형</Label>
            <Select
              name="sfaSalesType"
              value={formData.sfaSalesType}
              onChange={handleChange}
              disabled={isSubmitting}
              error={errors.sfaSalesType}
            >
              <option value="">선택하세요</option>
              {sfaSalesTypeData?.data?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
          <FormItem className="flex-1">
            <Label>매출파트너</Label>
            <Group direction="horizontal">
              <Checkbox
                id="hasPartner"
                checked={hasPartner}
                onChange={(e) => setHasPartner(e.target.checked)}
                disabled={isSubmitting}
              />
              {hasPartner && (
                <CustomerSearchInput
                  name="sellingPartner"
                  onSelect={(partner) =>
                    handleChange({
                      target: {
                        name: 'sellingPartner',
                        value: partner.id,
                      },
                    })
                  }
                  value={formData.SellingPrtner}
                  disabled={isSubmitting}
                  size="small"
                />
              )}
            </Group>
          </FormItem>
        </Group>

        {/* Project Name and Toggle */}
        <Group direction="horizontal" className="gap-6">
          <FormItem className="flex-1">
            <Label required>건명</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="건명을 입력하세요"
              disabled={isSubmitting}
            />
            {/* {errors.name && <Message type="error">{errors.name}</Message>} */}
          </FormItem>

          <FormItem className="flex-1">
            <Label>프로젝트</Label>
            <Switch
              checked={isProject}
              onChange={() => setIsProject(!isProject)}
              disabled={isSubmitting}
            />
          </FormItem>
        </Group>
      </Form>
    </>
  );
};

export default SfaEditForm;
