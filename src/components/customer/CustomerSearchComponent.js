import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Form,
  Button,
  Col,
  Row,
  Select,
  DatePicker,
  Input,
  Divider,
} from 'antd';

const { RangePicker } = DatePicker;

const Base = styled.div`
  width: 70%;
`;

const CustomerSearchComponent = ({ searchOnSubmit, selectBook }) => {
  const [form] = Form.useForm();

  console.log('>>>(selectbook)>>', selectBook);

  const { co_classification, region, business_scale, employee, co_funnel } =
    selectBook;
  // const sfa_item = selectBook.sfa_item ? selectBook.sfa_item : [];
  // const customer = selectBook.customer ? selectBook.customer : [];

  // console.log('>>(selectBook:', selectBook);

  useEffect(() => {
    // console.log('customer', customer);
    return () => {
      form.resetFields();
    };
  }, []);

  const onReset = () => {
    // setSelectedCustomer();
    form.resetFields();
  };

  return (
    <>
      <Base>
        <Form
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 19,
          }}
          labelAlign="left"
          form={form}
          onFinish={(v) => searchOnSubmit(v)}
        >
          <Divider />
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="name" label="고객명">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="createdAt" label="등록일">
                <RangePicker picker="month" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="co_classfication" label="기업분류">
                <Select>
                  {co_classification.map((list, index) => {
                    return (
                      <Select.Option key={index} value={list.id}>
                        {list.attributes.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="business_scale" label="기업규모">
                <Select>
                  {business_scale.map((list, index) => {
                    return (
                      <Select.Option key={index} value={list.id}>
                        {list.attributes.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="employee" label="종업원">
                <Select>
                  {employee.map((list, index) => {
                    return (
                      <Select.Option key={index} value={list.id}>
                        {list.attributes.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="business_type" label="업태">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="business_item" label="종목">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="support_program" label="지원사업">
                <Select disabled>
                  {/* {sfa_item.map((list, index) => {
                    return (
                      <Select.Option key={index} value={list.attributes.name}>
                      {list.attributes.name}
                      </Select.Option>
                      );
                    })} */}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="region" label="지역">
                <Select>
                  {region.map((list, index) => {
                    return (
                      <Select.Option key={index} value={list.id}>
                        {list.attributes.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="city" label="시/군/구">
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="funnel" label="유입경로">
                <Select>
                  {co_funnel.map((list, index) => {
                    return (
                      <Select.Option key={index} value={list.attributes.name}>
                        {list.attributes.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="revinue" label="매출액"></Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col offset={2}>
              <Button type="primary" htmlType="submit">
                조회
              </Button>
            </Col>
            <Col>
              <Button htmlType="button" onClick={onReset}>
                초기화
              </Button>
            </Col>
          </Row>
          <Divider />
        </Form>
      </Base>
    </>
  );
};

export default CustomerSearchComponent;
