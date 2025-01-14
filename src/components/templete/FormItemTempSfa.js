import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
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
  Upload,
  Checkbox,
  Switch,
  Radio,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import SfaAddFormList from '../drawer/SfaAddFormList';
import SfaAddItemForm from '../drawer/SfaAddItemForm';
import ProjectTaskAddForm from '../project/ProjectTaskAddForm';

const { RangePicker } = DatePicker;
const { Option } = Select;

const FormItemTempSfa = ({
  formItems,
  selectBook,
  initialValues,
  handleOnChange,
  handleOnSubmit,
}) => {
  const [form] = Form.useForm();
  const { drawer } = useSelector(({ status }) => ({
    drawer: status.drawer,
  }));
  const { btnDisabled } = drawer;
  const [isChecked, setIsChecked] = useState({});
  //프로젝트 > 프로젝트 등록/ task 등록
  const [addedTasks, setAddedTasks] = useState([]);
  //checkbox form
  // const [checkedList, setCheckedList] = useState({});
  const checkedList = useRef({});

  // action 재정의 sub 키 존재시 sus.action 적용
  const action = drawer.sub ? drawer.sub.action : drawer.action;

  // form initialvalus 변경시
  useEffect(() => {
    form.resetFields();
    form.setFieldsValue(initialValues);
  }, [form, initialValues, addedTasks]);

  const onFinishFailed = (value) => {
    console.log('>>>>onsubmit', value);
  };

  const DrawerFormItems = () => {
    console.log('>>>>>>>>>>>>>>>>>>', formItems);
    const FormList = () =>
      formItems.map((item, index) => {
        const AddFormItem = MakeFormItems(item);
        //   console.log(`(check) -- :`, InputTemp);
        return (
          <Col span={item.span ? item.span : 8} key={index}>
            <AddFormItem />
          </Col>
        );
      });
    console.log('>>>>>>>>>>>>>>>>>>', isChecked);
    const SubmitButton = () => {
      if (action === 'view') return '';
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

  // 체크박스 Form
  const CheckboxForm = ({ checklist, name, disabled }) => {
    return (
      <>
        <Form.Item name={`checkboxgroup_${name}`}>
          <Checkbox.Group disabled={disabled}>
            {selectBook[checklist].map((list) => {
              return (
                <Checkbox
                  key={list.id}
                  value={list.id}
                  // onChange={(e) => checkBoxFormOnchange(e, checklist, list)}
                >
                  {list.attributes.name}
                </Checkbox>
              );
            })}
          </Checkbox.Group>
        </Form.Item>
      </>
    );
  };

  // Radio Form
  const RadioForm = ({ checklist, name, disabled }) => {
    return (
      <>
        <Form.Item name={name}>
          <Radio.Group>
            {/* <Radio value="apple"> Apple </Radio> */}
            {selectBook[checklist].map((list) => {
              return (
                <Radio
                  key={list.id}
                  value={list.id}
                  // onChange={(e) => checkBoxFormOnchange(e, checklist, list)}
                >
                  {list.attributes.name}
                </Radio>
              );
            })}
          </Radio.Group>
        </Form.Item>
      </>
    );
  };

  //SFA 매출품목
  const onChangeItemCount = (e) => {
    //
    console.log('>>(e)>>', e);
  };
  const SfaItemForm = () => {
    return (
      <div>
        <span>매출품목</span>
        <Select onChange={handleOnChange}>
          {selectBook['sfa_item']
            ? selectBook['sfa_item'].map((code, index) => {
                return (
                  <Option key={code.id} value={code.id} data-grp="sfa_item">
                    {code.attributes ? code.attributes.name : code.name}
                  </Option>
                );
              })
            : ''}
        </Select>
        <span>사업부</span>
        <Select onChange={handleOnChange}>
          {selectBook['team']
            ? selectBook['team'].map((code, index) => {
                return (
                  <Option
                    key={code.id}
                    value={code.id}
                    // data-grp={list.name}
                  >
                    {code.attributes ? code.attributes.name : code.name}
                  </Option>
                );
              })
            : ''}
        </Select>
        <span>금액</span>
        <InputNumber />
      </div>
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
    const { name, label, coid, req, span, form, editable, checklist } = list;
    // console.log('>>>(list)', list);
    const selectid = coid ? coid : name;
    let disabled = true;
    if (action === 'add' || action === 'sfa-add' || action === 'proposal-add')
      disabled = false;
    if (action === 'view') disabled = true;
    if (action === 'edit' || drawer.subaction === 'edit') {
      //
      const isCheckedTrue = isChecked[name] ? true : false;
      // console.log(`(ischecked)(${name})>>>>>>>>>>>>>>>>>>>>>>>`, isCheckedTrue);
      if (isCheckedTrue) disabled = false;
      // console.log(`(disabled)(${name})>>>>>>>>>>>>>>>`, disabled);
      // else disabled = true;
    }

    const FormItems = () => {
      if (
        (action === 'edit' || drawer.subaction === 'edit') &&
        form !== 'CHECKBOX' &&
        editable !== false
      ) {
        return (
          <>
            <EditModeCheckbox />
            <Form.Item name={list.name} rules={[{ required: !disabled }]}>
              {InputForm()}
            </Form.Item>
          </>
        );
      } else if (action === 'edit' && form === 'CHECKBOX') {
        return (
          <>
            <EditModeCheckbox />
            <Form.Item name={list.name} rules={[{ required: !disabled }]}>
              <Checkbox disabled={disabled} />
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
                        {code.attributes ? code.attributes.name : code.name}
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
          return <DatePicker disabled={disabled} />;
        case 'RANGE':
          return <RangePicker disabled={disabled} />;
        case 'NUMBER':
          return <InputNumber />;
        case 'TEXTAREA':
          return (
            <Input.TextArea rows={1} placeholder={label} disabled={disabled} />
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

        case 'CHECKBOXFORM':
          return (
            <CheckboxForm
              checklist={checklist}
              name={name}
              disabled={disabled}
            />
          );

        case 'RADIOFORM':
          return (
            <RadioForm checklist={checklist} name={name} disabled={disabled} />
          );
        case 'COUNT':
          return (
            <InputNumber
              min={1}
              max={3}
              defaultValue={1}
              onChange={onChangeItemCount}
            />
          );

        case 'SFAITEMFORM':
          return <SfaItemForm />;

        case 'TYPOGRAPHY':
          return <Typography></Typography>;

        case 'SFAADDFORM':
          if (action === 'add') {
            return <SfaAddFormList selectBook={selectBook} />;
          }
          return;

        case 'SFAADDITEMFORM':
          if (action === 'add') {
            return <SfaAddItemForm selectBook={selectBook} />;
          }
          return;

        case 'PROJECTTASKADDFORM':
          if (action !== 'view') {
            return (
              <ProjectTaskAddForm
                selectBook={selectBook}
                addedTasks={addedTasks}
                setAddedTasks={setAddedTasks}
              />
            );
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

  console.log('>>>>isChecked : ', isChecked);
  return (
    <>
      <Form
        form={form}
        layout="vertical"
        onFinish={(value) =>
          handleOnSubmit({
            value: value,
            isChecked: isChecked,
            // initialValues: initialValues, //매출현황>매출수정시 기존정보 전송용
          })
        }
        // onFinish={handleOnSubmit}
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

export default FormItemTempSfa;
