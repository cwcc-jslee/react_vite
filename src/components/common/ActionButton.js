import React from 'react';
import { Button } from 'antd';
import { Link } from 'react-router-dom';

const ActionButton = ({ items, handleButtonOnclick }) => {
  const ReturnMenu = items.map((item, index) => {
    if (item.action === 'LINKTO') {
      return (
        <span key={index}>
          <Link to={item.linkto}>
            <Button>{item.name}</Button>
          </Link>
        </span>
      );
    } else {
      return (
        <span key={index}>
          <Button key={index} onClick={() => handleButtonOnclick(item)}>
            {item.name}
          </Button>
        </span>
      );
    }
  });

  return <>{ReturnMenu}</>;
};

export default ActionButton;
