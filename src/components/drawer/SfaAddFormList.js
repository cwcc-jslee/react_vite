import React, { useState, useRef } from 'react';
import {
  Form,
  Input,
  Space,
  Button,
  DatePicker,
  Select,
  InputNumber,
  Typography,
  Switch,
} from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

const { Option } = Select;

const SfaAddFormList = ({ selectBook }) => {
  // 확정여부
  const [confirmed, setConfirmed] = useState({});
  const [testvalue, setTestvalue] = useState({});
  const [salesProfitValue, setSalesProfitValue] = useState({});

  const calSalesProfit = useRef({
    sales_revenue: null,
    sfa_profit_margin: null,
  });

  // 확정여부 Switch onClick
  const handleConfirmed = (key, e) => {
    console.log(`>>>>(key:${key}):`, e);
    // setConfirmed(value);
    setConfirmed((prevState) => {
      return { ...prevState, [key]: e };
    });
    console.log('>>(confirmed)>>', confirmed);
  };

  const onChange = (values, option) => {
    console.log('Received values of form:', values, option);
  };

  // 매출이익 계산 -
  const onChangeValue = (props) => {
    const { key, value, name } = props;
    console.log('0000@@@@@', props);
    //
    // const keyid = props.key;
    const addkey = { ...testvalue[key], [name]: value };
    setTestvalue({ ...testvalue, [key]: addkey });
    calSalesProfit.current = { ...testvalue, [key]: addkey };
    if (name === 'profitMargin_value') {
      if (
        'sales_revenue' in calSalesProfit['current'][key] &&
        'sfa_profit_margin' in calSalesProfit['current'][key]
      ) {
        console.log('$$$$$$$$$$$$$$$$');
        const sales_revenue = calSalesProfit['current'][key]['sales_revenue'];
        const sfa_profit_margin =
          calSalesProfit['current'][key]['sfa_profit_margin'];
        if (sfa_profit_margin === '이익') {
          setSalesProfitValue({ ...salesProfitValue, [key]: value });
        }
        if (sfa_profit_margin === '마진') {
          setSalesProfitValue({
            ...salesProfitValue,
            [key]: (sales_revenue * value) / 100,
          });
        }
      }
    } else {
      setSalesProfitValue({ ...salesProfitValue, [key]: null });
    }
  };
  console.log('>>>>>>>>>', calSalesProfit);
  console.log('>>>>>>>>>', salesProfitValue);

  return (
    <>
      {/* <Typography>{salesValue}</Typography> */}
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
                      onChange={(e) => handleConfirmed(key, e)}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, 'sfa_percentage']}
                    label="매출확률"
                    rules={[
                      {
                        required: !confirmed[key],
                        // message: '매출확률',
                      },
                    ]}
                  >
                    <Select disabled={confirmed[key]}>
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
                    <InputNumber
                      placeholder="매출액"
                      onChange={(value) =>
                        onChangeValue({
                          key,
                          name: 'sales_revenue',
                          value,
                        })
                      }
                    />
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
                    <Select
                      onChange={(value, option) =>
                        onChangeValue({
                          key,
                          name: 'sfa_profit_margin',
                          value: option.children,
                        })
                      }
                    >
                      {selectBook['sfa_profit_margin'].map((code, index) => {
                        return (
                          <Option
                            key={code.id}
                            value={code.id}
                            data-grp="sfa_profit_margin"
                          >
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
                    <InputNumber
                      placeholder="값"
                      onChange={(value) =>
                        onChangeValue({
                          key,
                          name: 'profitMargin_value',
                          value,
                        })
                      }
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, `sales_profit`]}
                    label="매출이익"
                    // value={salesValue}
                  >
                    {/* <InputNumber /> */}
                    <Typography>{salesProfitValue[key]}</Typography>
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
