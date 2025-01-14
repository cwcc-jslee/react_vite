import React, { useEffect, useState } from 'react';

const RndContainer = () => {
  const initialItems = ['경남경총', '벤처기업', '장유중', '기타'];
  const [items, setItems] = useState(initialItems);
  const [selectedItems, setSelectedItems] = useState([]);

  const handleSelect = (event) => {
    const selectedItem = event.target.value;
    if (selectedItem) {
      setItems(items.filter((item) => item !== selectedItem));
      setSelectedItems([...selectedItems, { name: selectedItem, suffix: '' }]);
    }
  };

  const handleInputChange = (event, index) => {
    const newSelectedItems = [...selectedItems];
    newSelectedItems[index].suffix = event.target.value;
    setSelectedItems(newSelectedItems);
  };

  const handleDelete = (index) => {
    const itemToBeDeleted = selectedItems[index];
    setItems([...items, itemToBeDeleted.name]);
    const newSelectedItems = [...selectedItems];
    newSelectedItems.splice(index, 1);
    setSelectedItems(newSelectedItems);
  };
  console.log('>>()>>', selectedItems);

  return (
    <div>
      <select onChange={handleSelect}>
        <option value="">-- 선택해 주세요 --</option>
        {items.map((item, index) => (
          <option key={index} value={item}>
            {item}
          </option>
        ))}
      </select>
      {selectedItems.map((item, index) => (
        <div key={index}>
          <input type="text" value={item.name} readOnly />
          <input
            type="text"
            value={item.suffix}
            onChange={(e) => handleInputChange(e, index)}
          />
          <button onClick={() => handleDelete(index)}>삭제</button>
        </div>
      ))}
    </div>
  );
};

export default RndContainer;
