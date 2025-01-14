import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { UploadOutlined } from '@ant-design/icons';
import {
  Form,
  Button,
  Col,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Divider,
  Upload,
  Checkbox,
  Switch,
  Space,
  Row,
  Typography,
} from 'antd';
import SfaAddFormList from './SfaAddFormList';

// 고객등록, 고객정보조회, 고객정보수정 폼으로 사용
// 고객ID 정보 있을 경우 고객정보, 고객수정 기능 활성화

const { RangePicker } = DatePicker;
const { Option } = Select;

const FormIteams = ({
  selectBook,
  formItems,
  handleOnSubmit,
  handleOnChange,
  initialValues,
}) => {
  //
  const { drawer } = useSelector(({ status }) => ({
    drawer: status.drawer,
  }));
  const { mode, btnDisabled } = drawer;
  // console.log('****drawer from 실행 ****');
  const [form] = Form.useForm();
  const [isChecked, setIsChecked] = useState({});
  console.log('(initialValues)>>>>>>>>>>>>>>>>>>>>>>>', initialValues);
  const dateOnChange = (date, dateString) => {
    console.log(date, dateString);
  };

  // form initialvalus 변경시
  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(initialValues);
  }, [form, initialValues]);

  const onFinishFailed = (value) => {
    console.log('>>>>onsubmit', value);
  };

  const DrawerFormItems = () => {
    const FormList = () =>
      formItems.map((item, index) => {
        const AddFormItem = MakeFormItems(item);
        return (
          <Col span={item.span ? item.span : 8} key={index}>
            <AddFormItem />
          </Col>
        );
      });
    const SubmitButton = () => {
      if (mode === 'view') return '';
      else {
        return (
          <Row>
            <Form.Item label=" " name="">
              <Button type="primary" htmlType="submit" disabled={btnDisabled}>
                submit
              </Button>
            </Form.Item>
          </Row>
        );
      }
    };
    return (
      <>
        <FormList />
        <SubmitButton />
      </>
    );
  };

  // 수정 form 에서 체크 박스 변경시
  const handleCheck = (e) => {
    const name = e.target['data-id'];
    console.log('>>>(handleCheck)', e);
    // // setCheckbox({ ...checkbox, [name]: e.target.checked });
    setIsChecked({ ...isChecked, [name]: e.target.checked });
  };

  const MakeFormItems = (list) => {
    const { name, label, coid, req, form } = list;
    const selectid = coid ? coid : name;
    let disabled = true;
    if (mode === 'add') disabled = false;
    if (mode === 'view') disabled = true;
    if (mode === 'edit') {
      //
      const isCheckedTrue = isChecked[name] ? true : false;
      // console.log(`(ischecked)(${name})>>>>>>>>>>>>>>>>>>>>>>>`, isCheckedTrue);
      if (isCheckedTrue) disabled = false;
      console.log(`(disabled)(${name})>>>>>>>>>>>>>>>`, disabled);
      // else disabled = true;
    }

    const FormItems = () => {
      if (mode === 'edit') {
        return (
          <>
            <EditModeCheckbox />
            <Form.Item name={list.name} rules={[{ required: req }]}>
              {InputForm()}
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
              {InputForm()}
            </Form.Item>
          </>
        );
      }
    };

    // edit 모드시 체크 박스 활성화
    const EditModeCheckbox = () => {
      return (
        <Space>
          <Checkbox
            data-id={list.name}
            onChange={handleCheck}
            checked={isChecked[list.name]}
          />
          <span>{list.label}</span>
        </Space>
      );
    };

    // form item 내부
    const InputForm = () => {
      switch (form) {
        case 'SELECT':
          return (
            <Select onChange={handleOnChange} disabled={disabled}>
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
          );
        case 'DIVIDER':
          return <Divider />;
        case 'SELECT-USER':
          return (
            <Select onChange={handleOnChange} disabled={disabled}>
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
          );
        case 'DATE':
          return <DatePicker onChange={dateOnChange} disabled={disabled} />;
        case 'RANGE':
          return <RangePicker disabled={disabled} />;
        case 'NUMBER':
          return <InputNumber />;
        case 'TEXTAREA':
          return (
            <Input.TextArea rows={4} placeholder={label} disabled={disabled} />
          );
        case 'UPLOAD':
          return (
            <Upload>
              <Button icon={<UploadOutlined />} disabled={disabled}>
                Click to upload
              </Button>
            </Upload>
          );
        case 'SWITCH':
          return (
            // {list.name === 'used' ? '' : <Switch disabled={disabled} />}
            <Switch disabled={disabled} />
          );
        case 'CHECKBOX':
          return <Checkbox disabled={disabled} />;

        case 'SFAADDFORM':
          if (mode !== 'view') {
            return <SfaAddFormList selectBook={selectBook} />;
          }
          return;

        default:
          return (
            // <>
            //   <Form.Item
            //     label={list.label}
            //     name={list.name}
            //     rules={[{ required: req }]}
            //   >
            <Input disabled={disabled} />
            //   </Form.Item>
            // </>
          );
      }
    };

    return FormItems;
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={(value) =>
          handleOnSubmit({
            value: value,
            isChecked: isChecked,
          })
        }
        onFinishFailed={onFinishFailed}
        initialValues={initialValues}
      >
        <Row gutter={16}>
          <DrawerFormItems />
        </Row>
      </Form>
    </>
  );
};

export default FormIteams;
