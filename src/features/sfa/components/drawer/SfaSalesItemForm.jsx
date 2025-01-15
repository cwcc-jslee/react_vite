// src/features/sfa/components/drawer/SfaSalesItemForm.jsx
import React, { useState } from 'react';
import styled from 'styled-components';
import {
  FormContainer,
  Input,
  Select,
  SubmitButton,
} from '../../../../shared/components/styles/formStyles';

const ItemRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 12px;
  margin-bottom: 12px;
  align-items: start;
`;

const DeleteButton = styled.button`
  padding: 8px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: #dc2626;
  }
`;

const SfaSalesItemForm = ({ onSubmit }) => {
  const [items, setItems] = useState([]);

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), salesItem: '', team: '', amount: '' },
    ]);
  };

  const handleItemChange = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  const handleDeleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(items);
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      <h3>매출 품목 등록</h3>

      {items.map((item) => (
        <ItemRow key={item.id}>
          <Input
            placeholder="매출품목"
            value={item.salesItem}
            onChange={(e) =>
              handleItemChange(item.id, 'salesItem', e.target.value)
            }
          />
          <Select
            value={item.team}
            onChange={(e) => handleItemChange(item.id, 'team', e.target.value)}
          >
            <option value="">사업부 선택</option>
            <option value="solution">솔루션사업부</option>
            <option value="consulting">컨설팅사업부</option>
          </Select>
          <Input
            type="number"
            placeholder="금액"
            value={item.amount}
            onChange={(e) =>
              handleItemChange(item.id, 'amount', e.target.value)
            }
          />
          <DeleteButton onClick={() => handleDeleteItem(item.id)}>
            삭제
          </DeleteButton>
        </ItemRow>
      ))}

      <SubmitButton type="button" onClick={handleAddItem}>
        품목 추가
      </SubmitButton>

      <SubmitButton type="submit">저장</SubmitButton>
    </FormContainer>
  );
};

export default SfaSalesItemForm;
