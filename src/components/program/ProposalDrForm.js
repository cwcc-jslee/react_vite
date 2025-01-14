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
  Checkbox,
  Switch,
} from 'antd';

// 고객등록, 고객정보조회, 고객정보수정 폼으로 사용
// 고객ID 정보 있을 경우 고객정보, 고객수정 기능 활성화

const DrawerBlock = styled.div`
  //
`;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ProposalDrForm = ({
  // drawer,
  // open,
  // mode,
  selectBook,
  drawerLists,
  drawerInfo,
  handleOnclose,
  handleModeButton,
  handleOnSubmit,
  handleOnChange,
  initialValues,
  // handleCheck,
}) => {
  const { drawer } = useSelector(({ status }) => ({
    drawer: status.drawer,
  }));
  // console.log('****drawer from 실행 ****');
  const [form] = Form.useForm();
  const [isChacked, setIsChecked] = useState({});
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

  // initialValues name 존재 여부 체크
  const checkInitialValues = (name) => {
    // console.log(`(init) --${name} : ${initialValues[name]}`);
    return typeof initialValues.name;
  };

  const DrawerFormItems = () => {
    const FormList = drawerLists.map((list, index) => {
      // console.log('88888888888888', list);
      const name = list.name;
      const label = list.label;

      // const test = formItemTemp(list);
      // console.log('@@@@@@@@@@@@@', test);
      const InputTemp = formItemTemp(list);
      return (
        <Col span={list.span ? list.span : 8} key={index}>
          {/* <Form.Item label={list.label} name={list.name}> */}
          {/* <Input /> */}
          <InputTemp />
          {/* {formItemTemp(list)} */}
          {/* </Form.Item> */}
        </Col>
      );
    });
    return FormList;
  };

  const handleOnSubmitProxy = (value) => {
    console.log(`>>>>onsubmit_proxy `, value);
    handleOnSubmit(value, isChacked);
  };

  // 수정 form 에서 체크 박스 변경시
  const handleCheck = (e) => {
    const name = e.target['data-id'];
    console.log('>>>(handleCheck)', e);
    // // setCheckbox({ ...checkbox, [name]: e.target.checked });
    setIsChecked({ ...isChacked, [name]: e.target.checked });
  };

  console.log('>>>(ischecked)', isChacked);
  console.log('@@@@@@@init@@@@@', initialValues);
  //{ name, label, coid, req, span, form }

  const formItemTemp = (list) => {
    const { name, label, coid, req, span, form } = list;
    // console.log(`(check) --${name} :`, checkInitialValues(name));
    const inputForm = () => {
      if (drawer.mode === 'add') {
        if (form === 'SELECT') {
          return (
            <Form.Item
              label={list.label}
              name={list.name}
              rules={[{ required: req }]}
            >
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
            </Form.Item>
          );
        } else if (form === 'DATE') {
          //
          return (
            <Form.Item
              label={list.label}
              name={list.name}
              rules={[{ required: req }]}
            >
              <DatePicker onChange={dateOnChange} />
            </Form.Item>
          );
        } else if (form === 'RANGE') {
          //
          return (
            <Form.Item
              label={list.label}
              name={list.name}
              rules={[{ required: req }]}
            >
              <RangePicker />
            </Form.Item>
          );
        } else if (form === 'NUMBER') {
          //
          return (
            <Form.Item
              label={list.label}
              name={list.name}
              rules={[{ required: req }]}
            >
              <InputNumber />
            </Form.Item>
          );
        } else if (form === 'TEXTAREA') {
          return (
            <Form.Item
              label={list.label}
              name={list.name}
              rules={[{ required: req }]}
            >
              <Input.TextArea rows={4} placeholder={label} />
            </Form.Item>
          );
        } else if (form === 'UPLOAD') {
          return (
            <Form.Item
              label={list.label}
              name={list.name}
              rules={[{ required: req }]}
            >
              <Upload>
                <Button icon={<UploadOutlined />}>Click to upload</Button>
              </Upload>
            </Form.Item>
          );
        } else if (form === 'SWITCH') {
          return (
            <>
              <Form.Item
                label={list.label}
                name={list.name}
                rules={[{ required: req }]}
              >
                {list.name === 'used' ? '' : <Switch />}
              </Form.Item>
            </>
          );
        } else {
          return (
            <>
              <Form.Item
                label={list.label}
                name={list.name}
                rules={[{ required: req }]}
              >
                <Input />
              </Form.Item>
            </>
          );
        }
      }
      // ********************************** //
      //          EDIT mode                 //
      // ********************************** //
      if (drawer.mode === 'edit') {
        if (form === 'SELECT') {
          return (
            <>
              <Space>
                <Checkbox
                  data-id={list.name}
                  onChange={handleCheck}
                  checked={isChacked[list.name]}
                />
                <span>{list.label}</span>
              </Space>
              <Form.Item
                name={list.name}
                rules={[{ required: isChacked[list.name] }]}
              >
                <Select
                  onChange={handleOnChange}
                  disabled={!isChacked[list.name]}
                >
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
              </Form.Item>
            </>
          );
        } else if (form === 'DATE') {
          return (
            <>
              <Space>
                <Checkbox
                  data-id={list.name}
                  onChange={handleCheck}
                  checked={isChacked[list.name]}
                />
                <span>{list.label}</span>
              </Space>
              <Form.Item
                name={list.name}
                rules={[{ required: isChacked[list.name] }]}
              >
                <DatePicker
                  onChange={dateOnChange}
                  disabled={!isChacked[list.name]}
                />
              </Form.Item>
            </>
          );
        } else if (form === 'RANGE') {
          return (
            <>
              <Space>
                <Checkbox
                  data-id={list.name}
                  onChange={handleCheck}
                  checked={isChacked[list.name]}
                />
                <span>{list.label}</span>
              </Space>
              <Form.Item
                name={list.name}
                rules={[{ required: isChacked[list.name] }]}
              >
                <RangePicker disabled={!isChacked[list.name]} />
              </Form.Item>
            </>
          );
        } else if (form === 'NUMBER') {
          return (
            <>
              <Space>
                <Checkbox
                  data-id={list.name}
                  onChange={handleCheck}
                  checked={isChacked[list.name]}
                />
                <span>{list.label}</span>
              </Space>
              <Form.Item
                name={list.name}
                rules={[{ required: isChacked[list.name] }]}
              >
                <InputNumber disabled={!isChacked[list.name]} />
              </Form.Item>
            </>
          );
        } else if (form === 'TEXTAREA') {
          return (
            <>
              <Space>
                <Checkbox
                  data-id={list.name}
                  onChange={handleCheck}
                  checked={isChacked[list.name]}
                />
                <span>{list.label}</span>
              </Space>
              <Form.Item
                name={list.name}
                rules={[{ required: isChacked[list.name] }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder={label}
                  disabled={!isChacked[list.name]}
                />
              </Form.Item>
            </>
          );
        } else if (form === 'UPLOAD') {
          return (
            <>
              <Space>
                <Checkbox
                  data-id={list.name}
                  onChange={handleCheck}
                  checked={isChacked[list.name]}
                />
                <span>{list.label}</span>
              </Space>
              <Form.Item
                name={list.name}
                rules={[{ required: isChacked[list.name] }]}
              >
                <Upload>
                  <Button icon={<UploadOutlined />}>Click to upload</Button>
                </Upload>
              </Form.Item>
            </>
          );
        } else if (form === 'SWITCH') {
          return (
            <>
              <Space>
                <Checkbox
                  data-id={list.name}
                  onChange={handleCheck}
                  checked={isChacked[list.name]}
                />
                <span>{list.label}</span>
              </Space>
              <Form.Item
                name={list.name}
                rules={[{ required: isChacked[list.name] }]}
              >
                <Switch disabled={!isChacked[list.name]} />
              </Form.Item>
            </>
          );
        } else {
          return (
            <>
              <Space>
                <Checkbox
                  data-id={list.name}
                  onChange={handleCheck}
                  checked={isChacked[list.name]}
                />
                <span>{list.label}</span>
              </Space>
              <Form.Item
                name={list.name}
                rules={[{ required: isChacked[list.name] }]}
              >
                <Input disabled={!isChacked[list.name]} />
              </Form.Item>
            </>
          );
        }
      }
      // ********************************** //
      //          VIEW mode                 //
      // ********************************** //
      if (drawer.mode === 'view' && initialValues) {
        if (form === 'SELECT') {
          return (
            <Form.Item name={list.name} label={list.label}>
              <Select disabled={true}>
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
            </Form.Item>
          );
        } else if (form === 'DATE') {
          // edit 모드에서 datapicker 사용시 dayjs 필수,
          // view 모드(Typography)에서 오류 발생하여 datepicker 형태로 변경 적용
          return (
            <Form.Item name={list.name} label={list.label}>
              <DatePicker disabled={true} />
            </Form.Item>
          );
        } else if (form === 'RANGE') {
          return (
            <Form.Item name={list.name} label={list.label}>
              <RangePicker disabled={true} />
            </Form.Item>
          );
        } else {
          return (
            <Form.Item label={list.label} name={list.name}>
              <Typography>
                <pre>
                  {checkInitialValues(name) ? initialValues[name] : '_'}
                </pre>
              </Typography>
            </Form.Item>
          );
        }
      }
    };

    return inputForm;
  };

  return (
    <>
      <DrawerBlock>
        <Drawer
          title={drawerInfo.title}
          open={drawer.open}
          width={drawerInfo.width}
          onClose={handleOnclose}
          bodyStyle={{ paddingBottom: 80 }}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleOnSubmitProxy}
            onFinishFailed={onFinishFailed}
            initialValues={initialValues}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Radio.Group
                  defaultValue="view"
                  onChange={handleModeButton}
                  buttonStyle="solid"
                >
                  <Radio.Button value="view">view</Radio.Button>
                  <Radio.Button value="add">제안</Radio.Button>
                </Radio.Group>
              </Col>
              <Divider />
              <h1>상단</h1>
              <Divider />
            </Row>

            <Row gutter={16}>
              {/* Drawer Form Item  */}
              <DrawerFormItems />
              {/* Drawer Form Item  */}
            </Row>
          </Form>
          <Divider />
          <h1>하단</h1>
        </Drawer>
      </DrawerBlock>
    </>
  );
};

export default ProposalDrForm;
