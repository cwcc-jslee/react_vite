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

const CustomerDrawerForm = ({
  handleOnclose,
  handleModeButton,
  customerInfo,
  handleOnSubmit,
}) => {
  // console.log('****drawer from 실행 ****');
  const [form] = Form.useForm();
  const [isMoreinfo, SetIsMoreinfo] = useState(false);
  const { codebook } = useSelector(({ status }) => ({
    codebook: status.codebook,
  }));
  const { open, mode } = useSelector(({ status }) => ({
    open: status.drawer.open,
    mode: status.drawer.mode,
  }));

  const [initialValues, setInitialValues] = useState();

  const onReset = () => {
    // form.resetFields();
    // form.setFieldsValue({ workingDay: '' });
  };

  // 추가정보 버튼 클릭시
  const handleMoreinfo = () => {
    //
    SetIsMoreinfo(!isMoreinfo);
  };
  useEffect(() => {
    if (customerInfo) {
      // console.log('### - customerInfo', customerInfo);
      const init = {
        customer_name: customerInfo.name,
        business_number: customerInfo.business_number,
        funnel_suffix: customerInfo.funnel_suffix,
        homepage: customerInfo.homepage,
        commencement_date: customerInfo.commencement_date,
        representative_name: customerInfo.representative_name,
        sales_revenue: customerInfo.sales_revenue,
        exports: customerInfo.exports,
        employee: customerInfo.employee,
        address: customerInfo.address,
        classification: valueCheck('cb_classification'),
        business_type: valueCheck('cb_bu_type'),
        business_item: valueCheck('cb_bu_item'),
        funnel: valueCheck('cb_funnel'),
        region: valueCheck('cb_region'),
      };
      setInitialValues(init);
    }
  }, [customerInfo]);
  console.log('###-initialValues', initialValues);

  // initvalues
  //customer drawer form
  // customerInfo 값 검증
  const valueCheck = (key1, key2) => {
    console.log('000', key1);
    console.log('1111', customerInfo[key1]);
    // console.log('###', typeof customerInfo[key1]);
    // 키에 해당하는 값이 array([0:{id12,att}]) 일경우..
    if (customerInfo[key1] && customerInfo[key1].length) {
      console.log('### - return key - array', customerInfo[key1]);
      //
      return customerInfo[key1][0].id;
    }
    // 키에 해당하는 값이 object({code:'김해고', id:1}) 일경우..
    else if (customerInfo[key1] && !customerInfo[key1].length) {
      console.log('### - return key - object', customerInfo[key1].length);
      return customerInfo[key1].id;
      //
    } else {
      // console.log('### - return null');
      return null;
    }
  };

  // const handleOnSubmit = (value) => {
  //   console.log('>>>>onsubmit', value);
  // };

  const onFinishFailed = (value) => {
    console.log('>>>>onsubmit', value);
  };

  const FormItemTemp = ({ name, label, codeid, span, req }) => {
    if (mode === 'view') {
      if (codeid) {
        return (
          <Col span={span ? span : '8'}>
            <Form.Item
              name={name}
              label={label}
              rules={[{ required: req ? req : false }]}
            >
              <Typography>
                <pre>{initialValues[name]}</pre>
              </Typography>
            </Form.Item>
          </Col>
        );
      } else if (!codeid) {
        return (
          <Col span={span ? span : '8'}>
            <Form.Item
              name={name}
              label={label}
              rules={[{ required: req ? req : false }]}
            >
              <Typography>
                <pre>{initialValues[name]}</pre>
              </Typography>
            </Form.Item>
          </Col>
        );
      }
    } else if (mode === 'edit' || mode === 'add') {
      //
      if (codeid) {
        return (
          <Col span={span ? span : '8'}>
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
          <Col span={span ? span : '8'}>
            <Form.Item
              name={name}
              label={label}
              rules={[{ required: req ? req : false }]}
            >
              <Input />
            </Form.Item>
          </Col>
        );
      }
    }
  };

  return (
    <>
      <DrawerBlock>
        <Drawer
          title="고객 정보 조회 / 고객 정보 수정 / 고객 등록"
          open={open}
          width={720}
          onClose={handleOnclose}
          bodyStyle={{ paddingBottom: 80 }}
          // extra={
          //   <Space>
          //     <Button
          //     onClick={onClose}
          //     >
          //       Cancel
          //     </Button>
          //     <Button htmlType="submit" type="primary">
          //       Submit
          //     </Button>
          //   </Space>
          // }
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
              </Row>
            ) : (
              ''
            )}
            <Divider />
            <>
              <Row gutter={16}>
                <FormItemTemp name="customer_name" label="고객명" req={true} />
                <FormItemTemp
                  name="classification"
                  label="기업분류"
                  codeid={'1'}
                  req={true}
                />
                <FormItemTemp name="business_number" label="c" />
              </Row>
              <Row gutter={16}>
                <FormItemTemp name="funnel" label="유입경로" codeid={'2'} />
                <FormItemTemp name="funnel_suffix" label="유입경로_suffix" />
                <FormItemTemp name="homepage" label="homepage" />
              </Row>
              {/* 추가정보 */}
              <Button
                onClick={handleMoreinfo}
                type={isMoreinfo ? 'primary' : 'link'}
              >
                추가정보
              </Button>
              <Divider />
              {isMoreinfo ? (
                <Row gutter={16}>
                  <FormItemTemp
                    name="business_type"
                    label="업태"
                    codeid={'3'}
                  />
                  <FormItemTemp
                    name="business_item"
                    label="업종"
                    codeid={'4'}
                  />
                  <FormItemTemp name="commencement_date" label="설립일" />
                  <FormItemTemp name="representative_name" label="대표자" />
                  <FormItemTemp name="sales_revenue" label="매출액" />
                  <FormItemTemp name="exports" label="수출액" />
                  <FormItemTemp name="employee" label="종업원" />
                  <FormItemTemp name="region" label="지역" codeid={'5'} />
                  <FormItemTemp name="address" label="주소" span={24} />
                </Row>
              ) : (
                ''
              )}
              <Row gutter={16}>
                <Col span={20}>
                  <Form.Item name="description" label="description">
                    <Input.TextArea rows={4} placeholder="description" />
                  </Form.Item>
                </Col>
                <Col span={4}>
                  <Form.Item name="used" label="사용여부">
                    <Input />
                  </Form.Item>
                </Col>
              </Row>
              {mode !== 'view' ? (
                <Row>
                  <Form.Item label=" ">
                    <Button type="primary" htmlType="submit">
                      submit
                    </Button>
                  </Form.Item>
                </Row>
              ) : (
                ''
              )}
            </>
          </Form>
        </Drawer>
      </DrawerBlock>
    </>
  );
};

export default CustomerDrawerForm;
