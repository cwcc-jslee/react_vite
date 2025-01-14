import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { AutoComplete } from 'antd';

const CustomerAutoComplete = ({ customerOnSelect, selectBook }) => {
  const { customers } = useSelector(({ customer }) => ({
    customers: customer.data,
  }));
  const [suggestions, setSuggestions] = useState([]);
  // const customers = selectBook.customer;
  console.log('customers', customers);

  const onSearch = (searchText) => {
    // console.log('selectBook', selectBook);
    console.log('searchtext', searchText);
    let matches = [];
    if (customers && searchText.length > 0) {
      matches = customers.filter((customer) => {
        const regex = new RegExp(`${searchText}`, 'gi');
        console.log('regex', regex);
        return customer.name.match(regex);
      });
    }
    console.log('matches', matches);
    // ant.d option 포멧 { value: "한일"}
    const suggestionText = matches.map((text) => {
      return { value: text.name, id: text.id };
    });
    console.log('suggestionText', suggestionText);
    setSuggestions(suggestionText);
    // setText(text);
  };

  return (
    <AutoComplete
      options={suggestions}
      style={{
        width: 200,
      }}
      onSelect={customerOnSelect}
      onSearch={onSearch}
      placeholder="고객사 입력 후 선택"
    />
  );
};

export default CustomerAutoComplete;
