import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import { UploadOutlined } from '@ant-design/icons';
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
  Upload,
} from 'antd';

// 고객등록, 고객정보조회, 고객정보수정 폼으로 사용
// 고객ID 정보 있을 경우 고객정보, 고객수정 기능 활성화

const DrawerBlock = styled.div`
  //
`;
const { RangePicker } = DatePicker;
const { Option } = Select;

const DrawerForm = ({
  open,
  mode,
  selectBook,
  drawerLists,
  drawerInfo,
  handleOnclose,
  handleModeButton,
  handleOnSubmit,
  handleOnChange,
  initialValues,
}) => {
  // console.log('****drawer from 실행 ****');
  const [form] = Form.useForm();
  const [isMoreinfo, SetIsMoreinfo] = useState(false);
  // const { codebook } = useSelector(({ status }) => ({
  //   codebook: status.codebook,
  // }));

  const onReset = () => {
    // form.resetFields();
    // form.setFieldsValue({ workingDay: '' });
  };

  const onFinishFailed = (value) => {
    console.log('>>>>onsubmit', value);
  };

  const dateOnChange = (date, dateString) => {
    console.log(date, dateString);
  };

  const DrawerFormItems = () => {
    const FormList = drawerLists.map((list, index) => {
      // console.log('88888888888888', list);
      return (
        // <Form.Item>
        <FormItemTemp
          key={index}
          name={list.name}
          label={list.label}
          coid={list.coid}
          span={list.span}
          req={list.req}
          form={list.form}
        />
        // </Form.Item>
      );
    });
    return FormList;
  };

  // initialValues name 존재 여부 체크
  const checkInitialValues = (name) => {
    // console.log(`(init) --${name} : ${initialValues[name]}`);
    return typeof initialValues.name;
  };

  console.log('@@@@@@@init@@@@@', initialValues);

  const FormItemTemp = ({ name, label, coid, req, span, form }) => {
    // console.log(`(check) --${name} :`, checkInitialValues(name));
    const InputForm = () => {
      if (mode === 'add' || mode === 'edit') {
        if (form === 'SELECT') {
          return (
            <Select onChange={handleOnChange} disabled={false}>
              {selectBook[coid]
                ? selectBook[coid].map((code, index) => {
                    return (
                      <Option key={code.id} value={code.id}>
                        {code.attributes.name}
                      </Option>
                    );
                  })
                : ''}
            </Select>
          );
        } else if (form === 'DATE') {
          //
          return <DatePicker onChange={dateOnChange} />;
        } else if (form === 'RANGE') {
          //
          return <RangePicker />;
        } else if (form === 'NUMBER') {
          //
          return <InputNumber />;
        } else if (form === 'TEXTAREA') {
          return <Input.TextArea rows={4} placeholder={label} />;
        } else if (form === 'UPLOAD') {
          return (
            <Upload>
              <Button icon={<UploadOutlined />}>Click to upload</Button>
            </Upload>
          );
        } else {
          return (
            <Form.Item>
              <Input />
            </Form.Item>
          );
        }
      } else if (mode === 'view' && initialValues) {
        return (
          <Typography>
            <pre>{checkInitialValues(name) ? initialValues[name] : ''}</pre>
          </Typography>
        );
      }
    };

    return (
      <Col span={span ? span : 8}>
        <Form.Item
          name={name}
          label={label}
          rules={[{ required: req ? req : false }]}
        >
          <InputForm />
        </Form.Item>
      </Col>
    );
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
            initialValues={initialValues}
          >
            {mode !== 'add' ? (
              <Row gutter={16}>
                <Col span={12}>
                  <Radio.Group
                    defaultValue="view"
                    onChange={handleModeButton}
                    buttonStyle="solid"
                  >
                    <Radio.Button value="view">view</Radio.Button>
                    <Radio.Button value="edit">edit</Radio.Button>
                  </Radio.Group>
                </Col>
                <Divider />
              </Row>
            ) : (
              ''
            )}
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
