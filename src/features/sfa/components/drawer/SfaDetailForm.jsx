// src/features/sfa/components/drawer/SfaDetailForm.jsx
import React from 'react';
import styled from 'styled-components';

const FormContainer = styled.form`
  width: 100%;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr;
  border-bottom: 1px solid #e5e7eb;
`;

const Cell = styled.div`
  padding: 12px;
  font-size: 12px;
  ${(props) =>
    props.label &&
    `
    background: #f9fafb;
    font-weight: 500;
    color: #374151;
  `}
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 12px;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 12px;
  min-height: 80px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 1px #2563eb;
  }
`;

const SaveButton = styled.button`
  margin-top: 20px;
  padding: 8px 16px;
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    background: #1d4ed8;
  }
`;

const SfaDetailForm = ({ initialValues, onSubmit }) => {
  console.log(`sfa initvalue data >> : ${initialValues}`);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const values = {
      sfa_sales_type: formData.get('sfa_sales_type'),
      customer: formData.get('customer'),
      name: formData.get('name'),
      description: formData.get('description'),
    };
    onSubmit(values);
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <Row>
        <Cell label>매출유형</Cell>
        <Cell>
          <Input
            name="sfa_sales_type"
            defaultValue={initialValues.sfa_sales_type?.name}
          />
        </Cell>
      </Row>
      <Row>
        <Cell label>고객사/매출처</Cell>
        <Cell>
          <Input name="customer" defaultValue={initialValues.customer?.name} />
        </Cell>
      </Row>
      <Row>
        <Cell label>건명</Cell>
        <Cell>
          <Input name="name" defaultValue={initialValues.name} />
        </Cell>
      </Row>
      <Row>
        <Cell label>비고</Cell>
        <Cell>
          <TextArea
            name="description"
            defaultValue={initialValues.description}
          />
        </Cell>
      </Row>
      <SaveButton type="submit">저장</SaveButton>
    </FormContainer>
  );
};

export default SfaDetailForm;
