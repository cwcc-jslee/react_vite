import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  Form,
  Button,
  Col,
  Row,
  Select,
  DatePicker,
  AutoComplete,
  Input,
  Switch,
} from 'antd';

const { RangePicker } = DatePicker;

const Base = styled.div`
  width: 70%;
`;

const SfaSearchComponent = ({
  selectBook,
  handleSelectOnChange,
  searchOnSubmit,
  // customerOnSelect,
  // resetSelectedCustomer,
}) => {
  const [form] = Form.useForm();
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState();

  const {
    team,
    sfa_classification,
    re_payment_method,
    sfa_sales_type,
    sfa_percentage,
  } = selectBook;
  const sfa_item = selectBook.sfa_item ? selectBook.sfa_item : [];
  const customer = selectBook.customer ? selectBook.customer : [];

  console.log('>>(selectBook:', selectBook);

  useEffect(() => {
    console.log('customer', customer);
    return () => {
      form.resetFields();
    };
  }, []);

  //매출유형, 결제구분,

  const onSearch = (searchText) => {
    console.log('searchtext', searchText);
    let matches = [];
    if (customer && searchText.length > 0) {
      matches = customer.filter((customer) => {
        const regex = new RegExp(`${searchText}`, 'gi');
        console.log('regex', regex);
        return customer.attributes.name.match(regex);
      });
    }
    console.log('matches', matches);
    // ant.d option 포멧 { value: "한일"}
    const suggestionText = matches.map((text) => {
      return { value: text.attributes.name, id: text.id };
    });
    console.log('suggestionText', suggestionText);
    setSuggestions(suggestionText);
    // setText(text);
  };

  const onReset = () => {
    setSelectedCustomer();
    form.resetFields();
    // resetSelectedCustomer();
  };

  const customerOnSelect = (data, option) => {
    // console.log('onSelect', data);
    console.log('onSelect-option', option);
    setSelectedCustomer(option.id);
  };

  return (
    <>
      <Base>
        <Form
          // {...layout}
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 19,
          }}
          //   wrapperCol={{ flex: 1 }}
          labelAlign="left"
          form={form}
          // layout="vertical"
          onFinish={(v) => searchOnSubmit({ ...v, customer: selectedCustomer })}
        >
          <Row gutter={16}>
            <Col span={10}>
              <Form.Item
                name="sales_rec_date"
                label="기준일자"
                rules={[{ required: true }]}
              >
                <RangePicker picker="month" />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item name="sfa_classification" label="매출구분">
                <Select onChange={handleSelectOnChange}>
                  {sfa_classification.map((list, index) => {
                    return (
                      <Select.Option
                        key={index}
                        value={list.id}
                        data-grp="sfa_classification"
                      >
                        {list.attributes.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item name="sfa_percentage" label="확률">
                <Select>
                  {sfa_percentage.map((list, index) => {
                    return (
                      <Select.Option key={index} value={list.id}>
                        {list.attributes.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={3}>
              <Form.Item name="confirmed" label="확정">
                <Switch />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={10}>
              <Form.Item name="customer" label="매출처">
                <AutoComplete
                  options={suggestions}
                  style={{
                    width: 200,
                  }}
                  onSelect={customerOnSelect}
                  onSearch={onSearch}
                  placeholder="매출처 입력 후 선택"
                />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item name="sfa_item" label="매출품목">
                <Select>
                  {sfa_item.map((list, index) => {
                    return (
                      <Select.Option key={index} value={list.attributes.name}>
                        {list.attributes.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item name="sfa_sales_type" label="매출유형">
                <Select>
                  {sfa_sales_type.map((list, index) => {
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
            <Col span={10}>
              <Form.Item name="name" label="건명">
                <Input />
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item name="team" label="사업부">
                <Select>
                  {team.map((list, index) => {
                    return (
                      <Select.Option key={index} value={list.attributes.name}>
                        {list.attributes.name}
                      </Select.Option>
                    );
                  })}
                </Select>
              </Form.Item>
            </Col>
            <Col span={7}>
              <Form.Item name="re_payment_method" label="결제구분">
                <Select>
                  {re_payment_method.map((list, index) => {
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
        </Form>
      </Base>
    </>
  );
};

export default SfaSearchComponent;
