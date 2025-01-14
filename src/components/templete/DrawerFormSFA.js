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
// import SfaAddFormList from './SfaAddFormList';

// 고객등록, 고객정보조회, 고객정보수정 폼으로 사용
// 고객ID 정보 있을 경우 고객정보, 고객수정 기능 활성화

const { RangePicker } = DatePicker;
const { Option } = Select;

const DrawerForm = ({
  // drawer,
  // open,
  // mode,
  selectBook,
  formItems,
  drawerInfo,
  handleOnclose,
  // handleModeButton,
  handleOnSubmit,
  handleOnChange,
  initialValues,
  pr_list,
  subMenu,
  // handleCheck,
}) => {
  const { drawer } = useSelector(({ status }) => ({
    drawer: status.drawer,
  }));
  // console.log('****drawer from 실행 ****');
  const [form] = Form.useForm();
  const [isChecked, setIsChecked] = useState({});
  // const { codebook } = useSelector(({ status }) => ({
  //   codebook: status.codebook,
  // }));

  // sfaAddForm 매출이익
  const [salesProfitValue, setSalesProfitValue] = useState({});

  const onReset = () => {
    // form.resetFields();
    // form.setFieldsValue({ workingDay: '' });
  };

  // form initialvalus 변경시
  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

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
    const FormList = formItems.map((item, index) => {
      const InputTemp = FormItemTemp(item);
      return (
        <Col span={item.span ? item.span : 8} key={index}>
          <InputTemp />
        </Col>
      );
    });
    return FormList;
  };

  // const handleOnSubmitProxy = (value) => {
  //   console.log(`>>>>onsubmit_proxy `, value);
  //   handleOnSubmit(value, isChacked);
  // };

  // 수정 form 에서 체크 박스 변경시
  const handleCheck = (e) => {
    const name = e.target['data-id'];
    console.log('>>>(handleCheck)', e);
    // // setCheckbox({ ...checkbox, [name]: e.target.checked });
    setIsChecked({ ...isChecked, [name]: e.target.checked });
  };

  console.log('>>>(ischecked)', isChecked);
  console.log('@@@@@@@init@@@@@', initialValues);
  console.log('@@@@@@@selectbook@@@@@', selectBook);
  //{ name, label, coid, req, span, form }

  const FormItemTemp = (list) => {
    const { name, label, coid, req, span, form } = list;
    // console.log(`(check) --${name} :`, checkInitialValues(name));
    const selectid = coid ? coid : name;
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
                {selectBook[selectid]
                  ? selectBook[selectid].map((code, index) => {
                      return (
                        <Option
                          key={code.id}
                          value={code.id}
                          data-grp={list.name}
                        >
                          {code.attributes.name}
                        </Option>
                      );
                    })
                  : ''}
              </Select>
            </Form.Item>
          );
        } else if (form === 'DIVIDER') {
          return <Divider />;
        } else if (form === 'SELECT-USER') {
          return (
            <Form.Item
              label={list.label}
              name={list.name}
              rules={[{ required: req }]}
            >
              <Select onChange={handleOnChange} disabled={false}>
                {selectBook[selectid]
                  ? selectBook[selectid].map((code, index) => {
                      return (
                        <Option key={code.id} value={code.id}>
                          {code.username}
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
        } else if (form === 'CHECKBOX') {
          return (
            <>
              <Form.Item
                label={list.label}
                name={list.name}
                rules={[{ required: req }]}
              >
                <Checkbox />
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
                  checked={isChecked[list.name]}
                />
                <span>{list.label}</span>
              </Space>
              <Form.Item
                name={list.name}
                rules={[{ required: isChecked[list.name] }]}
              >
                <Select
                  onChange={handleOnChange}
                  disabled={!isChecked[list.name]}
                >
                  {selectBook[selectid]
                    ? selectBook[selectid].map((code, index) => {
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
                  checked={isChecked[list.name]}
                />
                <span>{list.label}</span>
              </Space>
              <Form.Item
                name={list.name}
                rules={[{ required: isChecked[list.name] }]}
              >
                <DatePicker
                  onChange={dateOnChange}
                  disabled={!isChecked[list.name]}
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
                  checked={isChecked[list.name]}
                />
                <span>{list.label}</span>
              </Space>
              <Form.Item
                name={list.name}
                rules={[{ required: isChecked[list.name] }]}
              >
                <RangePicker disabled={!isChecked[list.name]} />
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
                  checked={isChecked[list.name]}
                />
                <span>{list.label}</span>
              </Space>
              <Form.Item
                name={list.name}
                rules={[{ required: isChecked[list.name] }]}
              >
                <InputNumber disabled={!isChecked[list.name]} />
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
                  checked={isChecked[list.name]}
                />
                <span>{list.label}</span>
              </Space>
              <Form.Item
                name={list.name}
                rules={[{ required: isChecked[list.name] }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder={label}
                  disabled={!isChecked[list.name]}
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
                  checked={isChecked[list.name]}
                />
                <span>{list.label}</span>
              </Space>
              <Form.Item
                name={list.name}
                rules={[{ required: isChecked[list.name] }]}
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
                  checked={isChecked[list.name]}
                />
                <span>{list.label}</span>
              </Space>
              <Form.Item
                name={list.name}
                rules={[{ required: isChecked[list.name] }]}
              >
                <Switch disabled={!isChecked[list.name]} />
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
                  checked={isChecked[list.name]}
                />
                <span>{list.label}</span>
              </Space>
              <Form.Item
                name={list.name}
                rules={[{ required: isChecked[list.name] }]}
              >
                <Input disabled={!isChecked[list.name]} />
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
                {selectBook[selectid]
                  ? selectBook[selectid].map((code, index) => {
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
      <Form
        form={form}
        layout="vertical"
        // onFinish={handleOnSubmitProxy}
        // onFinish={(value) => handleOnSubmit(value, isChacked, salesProfitValue)}
        onFinish={(value) =>
          handleOnSubmit({
            value: value,
            isChecked: isChecked,
            // salesProfitValue: salesProfitValue,
          })
        }
        onFinishFailed={onFinishFailed}
        initialValues={initialValues}
      >
        <Row gutter={16}>
          {/* Drawer Form Item  */}
          <DrawerFormItems />
          {/* Drawer Form Item  */}
          {/* {pr_list} */}
        </Row>

        {/* <SfaAddFormList
          selectBook={selectBook}
          salesProfitValue={salesProfitValue}
          setSalesProfitValue={setSalesProfitValue}
        /> */}

        {drawer.mode === 'view' ? (
          ''
        ) : (
          <Row>
            <Form.Item label=" " name="">
              <Button
                type="primary"
                htmlType="submit"
                disabled={drawer.btnDisabled}
              >
                submit
              </Button>
            </Form.Item>
          </Row>
        )}
      </Form>
    </>
  );
};

export default DrawerForm;
