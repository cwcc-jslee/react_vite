import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import {
  Drawer,
  Form,
  Button,
  Col,
  Row,
  Input,
  Select,
  Space,
  DatePicker,
  InputNumber,
  Typography,
  Divider,
  Radio,
} from 'antd';

// 1: co_classification, 2:co_funnel, 3:business_tpe, 4:business_item, 5:region

// 고객등록, 고객정보조회, 고객정보수정 폼으로 사용
// 고객ID 정보 있을 경우 고객정보, 고객수정 기능 활성화

const DrawerBlock = styled.div`
  //
`;

const DrawerForm = ({
  open,
  drawerLists,
  drawerInfo,
  handleOnclose,
  handleModeButton,
  handleOnSubmit,
}) => {
  // console.log('****drawer from 실행 ****');
  const [form] = Form.useForm();
  const [isMoreinfo, SetIsMoreinfo] = useState(false);
  const { codebook } = useSelector(({ status }) => ({
    codebook: status.codebook,
  }));

  const onReset = () => {
    // form.resetFields();
    // form.setFieldsValue({ workingDay: '' });
  };

  const onFinishFailed = (value) => {
    console.log('>>>>onsubmit', value);
  };

  const DrawerFormItems = () => {
    const FormList = drawerLists.map((list) => {
      return (
        <FormItemTemp
          name={list.name}
          label={list.label}
          codeid={list.codeid}
          span={list.span}
          req={list.req}
        />
      );
    });
    return FormList;
  };

  const FormItemTemp = ({ name, label, codeid, span, req }) => {
    const spanValue = span ? span : 8;
    const BaseForm = () => {
      return (
        <Col span={spanValue}>
          <Form.Item
            name={name}
            label={label}
            rules={[{ required: req ? req : false }]}
          >
            {}
          </Form.Item>
        </Col>
      );
    };
    if (codeid) {
      return (
        <Col span={spanValue}>
          <Form.Item
            name={name}
            label={label}
            rules={[{ required: req ? req : false }]}
          >
            <Select disabled={false}>
              {codebook[codeid].map((code, index) => {
                return (
                  <Select.Option key={code.id} value={code.id}>
                    {code.attributes.code}
                  </Select.Option>
                );
              })}
            </Select>
          </Form.Item>
        </Col>
      );
    } else if (!codeid) {
      return (
        <Col span={spanValue}>
          <Form.Item
            name={name}
            label={label}
            rules={[{ required: req ? req : false }]}
          >
            <Input />
          </Form.Item>
        </Col>
      );
    } else if (span >= 20) {
      return (
        <Col span={spanValue}>
          <Form.Item name={name} label={label}>
            <Input.TextArea rows={4} placeholder={label} />
          </Form.Item>
        </Col>
      );
    }
  };

  return (
    <>
      <DrawerBlock>
        <Drawer
          title={drawerInfo.title}
          open={open}
          width={drawerInfo.width}
          onClose={handleOnclose}
          bodyStyle={{ paddingBottom: 80 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleOnSubmit}
            onFinishFailed={onFinishFailed}
            initialValues={null}
          >
            <Row gutter={16}>
              <DrawerFormItems />
            </Row>
            <Row>
              <Form.Item label=" ">
                <Button type="primary" htmlType="submit">
                  submit
                </Button>
              </Form.Item>
            </Row>
          </Form>
        </Drawer>
      </DrawerBlock>
    </>
  );
};

export default DrawerForm;
