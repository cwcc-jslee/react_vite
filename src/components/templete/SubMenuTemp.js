import React from 'react';
import { Button, Select } from 'antd';
import { Link } from 'react-router-dom';

const SubMenuTemp = ({ items, handleDfAction }) => {
  const ReturnMenu = items.map((item, index) => {
    if (item.component === 'BUTTON') {
      return (
        <Button key={index} onClick={() => handleDfAction(item.action)}>
          {item.name}
        </Button>
      );
    } else if (item.component === 'LINKTO') {
      return (
        <Link to={item.linkto}>
          <Button key={index}>{item.name}</Button>
        </Link>
      );
    }
  });

  return <>{ReturnMenu}</>;
};

export default SubMenuTemp;
