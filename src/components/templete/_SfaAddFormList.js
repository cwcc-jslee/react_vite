import React, { useState } from 'react';
import {
  Form,
  Input,
  Space,
  Button,
  Col,
  DatePicker,
  Select,
  Row,
  Divider,
  InputNumber,
  Typography,
  Checkbox,
  Switch,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const onFinish = (values) => {
  console.log('Received values of form:', values);
};

const onChange = (values, option) => {
  console.log('Received values of form:', values, option);
};

const SfaAddFormList = ({ selectBook }) => {
  // 확정여부
  const [confirmed, setConfirmed] = useState(false);

  // 확정여부 Switch onClick
  const handleConfirmed = (value) => {
    // console.log('>>>>confirmed:', value);
    setConfirmed(value);
  };

  return (
    <>
      <Typography>테스트</Typography>
      <Form.List name="sfa-moreinfos">
        {(fields, { add, remove }) => (
          <>
            {fields.map(({ key, name, ...restField }) => (
              <div key={key}>
                <Space>
                  <Form.Item
                    {...restField}
                    name={[name, 're_payment_method']}
                    label="결제구분"
                    rules={[
                      {
                        required: true,
                        message: '선택',
                      },
                    ]}
                  >
                    <Select onChange={onChange}>
                      {selectBook['re_payment_method'].map((code, index) => {
                        return (
                          <Option key={code.id} value={code.id}>
                            {code.attributes.name}
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'confirmed']}
                    label="확정여부"
                  >
                    <Switch
                      checkedChildren="확정"
                      unCheckedChildren="예정"
                      onChange={handleConfirmed}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'sfa_percentage']}
                    label="매출확률"
                    rules={[
                      {
                        required: !confirmed,
                        // message: '매출확률',
                      },
                    ]}
                  >
                    <Select onChange={onChange} disabled={confirmed}>
                      {selectBook['sfa_percentage'].map((code, index) => {
                        return (
                          <Option key={code.id} value={code.id}>
                            {code.attributes.name}
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'sales_revenue']}
                    label="매출액"
                    rules={[
                      {
                        required: true,
                        message: '매출액을 입력하세요',
                      },
                    ]}
                  >
                    <InputNumber placeholder="매출액" onChange={onChange} />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'sfa_profit_margin']}
                    label="이익/마진"
                    rules={[
                      {
                        required: true,
                        message: '선택',
                      },
                    ]}
                  >
                    <Select>
                      {selectBook['sfa_profit_margin'].map((code, index) => {
                        return (
                          <Option key={code.id} value={code.id}>
                            {code.attributes.name}
                          </Option>
                        );
                      })}
                    </Select>
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'profitMargin_value']}
                    label="값입력"
                    rules={[
                      {
                        required: true,
                        message: '값을 입력하세요',
                      },
                    ]}
                  >
                    <InputNumber placeholder="값" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'sales_profit']}
                    label="매출이익"
                  >
                    <InputNumber placeholder="매출이익" disabled />
                  </Form.Item>
                </Space>
                <Space>
                  <Form.Item
                    {...restField}
                    name={[name, 'sales_rec_date']}
                    label="매출인식일자"
                    rules={[
                      {
                        required: true,
                        message: '매출인식일자 입력',
                      },
                    ]}
                  >
                    <DatePicker placeholder="매출인식일자" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'payment_date']}
                    label="결제일자"
                    rules={[
                      {
                        required: true,
                        message: '결제일자 입력',
                      },
                    ]}
                  >
                    <DatePicker placeholder="결제일자" />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'memo']}
                    label="메모"
                    rules={[
                      {
                        // required: true,
                        message: '메모 입력',
                      },
                    ]}
                  >
                    <Input.TextArea rows={1} placeholder={'메모입력'} />
                  </Form.Item>

                  <MinusCircleOutlined onClick={() => remove(name)} />
                </Space>
              </div>
            ))}
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                disabled={fields.length >= 3}
              >
                매출등록
              </Button>
            </Form.Item>
          </>
        )}
      </Form.List>
    </>
  );
};

export default SfaAddFormList;
