import React from 'react';
import { Form, Space, Button, Select, InputNumber } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const SfaAddItemForm = ({ selectBook }) => {
  console.log('>>>>>', selectBook['sfa_item']);
  const sfa_item = selectBook['sfa_item'] ? selectBook['sfa_item'] : [];

  // fields -> [{fieldKey:0, isListField: true, key:0, name:0}, {fieldKey:1, isListField: true, key:1, name:1}]
  return (
    <>
      <Form.List name="sfa_item_price">
        {(fields, { add, remove }) => (
          <>
            <Form.Item>
              <Button
                type="dashed"
                onClick={() => {
                  add();
                  console.log('>>(fields)..', fields);
                }}
                block
                icon={<PlusOutlined />}
                disabled={fields.length >= 3}
              >
                매출ITEM등록
              </Button>
            </Form.Item>
            {fields.map(({ key, name, ...restField }) => (
              // <div key={key}>
              <Space key={key}>
                <Form.Item
                  {...restField}
                  name={[name, 'sfa_item']}
                  label="매출품목"
                  rules={[
                    {
                      required: true,
                      message: '선택',
                    },
                  ]}
                >
                  <Select>
                    {sfa_item.map((code, index) => {
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
                  name={[name, 'team']}
                  label="사업부"
                  rules={[
                    {
                      required: true,
                      message: '선택',
                    },
                  ]}
                >
                  <Select>
                    {selectBook['team'].map((code, index) => {
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
                  name={[name, 'item_price']}
                  label="금액"
                  rules={[
                    {
                      required: true,
                      message: '값을 입력하세요',
                    },
                  ]}
                >
                  <InputNumber placeholder="값" />
                </Form.Item>
                <MinusCircleOutlined onClick={() => remove(name)} />
              </Space>
              // </div>
            ))}
          </>
        )}
      </Form.List>
    </>
  );
};

export default SfaAddItemForm;
