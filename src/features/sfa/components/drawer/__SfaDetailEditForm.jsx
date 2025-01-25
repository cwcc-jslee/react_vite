// src/features/sfa/components/draser/SfaDetailEditForm.jsx
import React, { useState, useEffect } from 'react';
import {
  FormContainer,
  FormRowInline,
  Label,
  Select,
  SubmitButton,
} from '../../../../shared/components/styles/formStyles';

const SfaDetailEditForm = ({ initialData, onSubmit }) => {
  const [formData, setFormData] = useState(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <FormRowInline>
        <Label>매출유형</Label>
        <Select
          name="salesType"
          value={formData.salesType}
          onChange={handleChange}
        >
          <option value="">선택하세요</option>
          <option value="direct">직접</option>
          <option value="partner">파트너</option>
        </Select>
      </FormRowInline>

      {/* CreateForm과 동일한 필드들 */}

      <SubmitButton type="submit">저장</SubmitButton>
    </FormContainer>
  );
};

export default SfaDetailEditForm;
