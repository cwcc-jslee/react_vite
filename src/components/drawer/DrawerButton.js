import React from 'react';
import { Row, Col, Radio, Divider } from 'antd';

const DrawerButton = (props) => {
  if (props.visible || props.visible === undefined) {
    return (
      <Row gutter={16}>
        <Col span={12}>
          <Radio.Group
            onChange={(e) => props.handleButtonOnclick(e.target.value)}
            buttonStyle="solid"
          >
            {props.items.map((item, index) => {
              return (
                <Radio.Button key={index} value={item}>
                  {item.name}
                </Radio.Button>
              );
            })}
          </Radio.Group>
        </Col>
        <Divider />
      </Row>
    );
  } else return '';
};

export default DrawerButton;
