import React, { useEffect, useState, useRef } from 'react';

const CheckBoxComponent = ({ items, group, checkedItemsRef }) => {
  const [checkedItems, setCheckedItems] = useState({});
  const [extraInfo, setExtraInfo] = useState('');

  useEffect(() => {
    const initialItems = items.reduce(
      (obj, item) => ({ ...obj, [item]: false }),
      {},
    );
    setCheckedItems(initialItems);
    checkedItemsRef.current[group] = [];
  }, [group, items, checkedItemsRef]);

  const handleChange = (event) => {
    setCheckedItems((prevState) => {
      const newState = {
        ...prevState,
        [event.target.name]: event.target.checked,
      };

      checkedItemsRef.current[group] = Object.keys(newState).filter(
        (item) => newState[item],
      );

      // "기타"가 선택되었을 때 "기타"에 대한 입력 필드의 값을 저장합니다.
      if (newState['기타']) {
        checkedItemsRef.current[group] = [
          ...checkedItemsRef.current[group],
          extraInfo,
        ];
      }

      // console.log(checkedItemsRef.current); // 체크된 항목들을 출력합니다.

      return newState;
    });
  };

  const handleExtraInfoChange = (event) => {
    setExtraInfo(event.target.value);

    // "기타"가 선택되었을 때 입력 필드의 값을 체크된 항목에 추가하거나 업데이트합니다.
    if (checkedItems['기타']) {
      checkedItemsRef.current[group] = checkedItemsRef.current[group].filter(
        (item) => item !== '기타' && item !== extraInfo,
      );
      checkedItemsRef.current[group].push(event.target.value);
      // console.log(checkedItemsRef.current); // 체크된 항목들을 출력합니다.
    }
  };

  return (
    <div>
      {items.map((item, index) => (
        <label key={index}>
          <input
            type="checkbox"
            name={item}
            checked={checkedItems[item]}
            onChange={handleChange}
          />
          {item}
        </label>
      ))}
      {checkedItems['기타'] && (
        <input
          type="text"
          value={extraInfo}
          onChange={handleExtraInfoChange}
          placeholder="기타 정보 입력"
        />
      )}
    </div>
  );
};

export default CheckBoxComponent;
