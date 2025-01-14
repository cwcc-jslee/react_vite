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
  Upload,
  Checkbox,
  Switch,
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Option } = Select;

const FormItemTemp = ({ formItems, handleOnChange, selectBook }) => {
  const [form] = Form.useForm();

  const MapFormItems = () => {
    console.log('>>>>>>>>>>>>>>>>>>', formItems);
    const FormList = formItems.map((item, index) => {
      const InputTemp = FormItems(item);
      //   console.log(`(check) -- :`, InputTemp);
      return (
        <Col span={item.span ? item.span : 8} key={index}>
          <InputTemp />
        </Col>
      );
    });
    console.log('>>>>>>>>>>>>>>>>>>', FormList);
    return FormList;
  };

  const FormItems = (list) => {
    const { name, label, coid, req, span, form } = list;
    const selectid = coid ? coid : name;
    const inputForm = () => {
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
            <DatePicker />
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
            <Input.TextArea rows={1} placeholder={label} />
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
    };
    return inputForm;
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        // onFinish={handleOnSubmitProxy}
        // onFinishFailed={onFinishFailed}
        // initialValues={initialValues}
      >
        <Row gutter={16}>
          <MapFormItems />
          <Form.Item label=" " name="">
            <Button
              type="primary"
              htmlType="submit"
              //   disabled={drawer.btnDisabled}
            >
              submit
            </Button>
          </Form.Item>
        </Row>
      </Form>
    </>
  );
};

export default FormItemTemp;
