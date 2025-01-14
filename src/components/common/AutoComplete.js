import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
// import Button from './Button';
import {
  Drawer,
  Form,
  Button,
  Col,
  Row,
  Input,
  Select,
  Space,
  Switch,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { addCustomer } from '../../modules/customerForm';
import { useNavigate } from 'react-router-dom';
import { getCustomerlist } from '../../modules/customer';
import { useDispatch } from 'react-redux';
import { setCustomerId } from '../../modules/common';
import { tbl_insert } from '../../modules/common/tbl_crud';
// import CustomerDrawerForm from '../customer/CustomerDrawerForm';
import { changeDrawerVisible } from '../../modules/status';
import { drawerInfo } from '../../config/customerConfig';

const { Option } = Select;

const AutoCompleteBlock = styled.div`
  .input-box {
    display: flex;
    width: 100%;
    padding-bottom: 5px;
  }
  .input-title {
    margin-right: 20px;
    padding-top: 4px;
  }

  .input-box > div {
    position: relative;
    margin-right: 10px;
  }
  .input-box input {
    /* width: 100%; */
    width: 300px;
  }
  .suggestion-box {
    position: absolute;
    top: 28px;
    left: 0;
    z-index: 50;
    width: 100%;
  }
  .suggestion {
    cursor: pointer;
    border-right: 1px solid black;
    border-left: 1px solid black;
    border-bottom: 1px solid black;
    background: #fff;
  }
  .suggestion:hover {
    background-color: gray;
  }
`;

const AutoComplete = ({ lists }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // 중복Submit 방지
  const [btnDisabled, setBtnDisabled] = useState(false);
  const [text, setText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [visible, setVisible] = useState(false);
  const [addBtnDisabled, setAddBtnDisabled] = useState(true);

  // <-- 등급결 권한..7이상 고객등록 가능하게 ..22/09/11
  const { auth } = useSelector(({ auth }) => ({
    auth: auth.auth,
  }));
  // console.log('------', auth.user);
  // ---->
  const { open, mode } = useSelector(({ status }) => ({
    open: status.drawer.open,
    mode: status.drawer.mode,
  }));
  useEffect(() => {
    setAddBtnDisabled(auth.user.level >= 7 ? false : true);
  }, [auth]);

  const onChangeHandler = (text) => {
    let matches = [];
    if (lists && text.length > 0) {
      matches = lists.filter((customer) => {
        const regex = new RegExp(`${text}`, 'gi');
        return customer.attributes.name.match(regex);
      });
    }
    console.log('matches', matches);
    setSuggestions(matches);
    setText(text);
  };

  const onSuggestHandler = (company) => {
    console.log('온클릭', company);
    setText(company.name);
    setSuggestions([]);
    dispatch(setCustomerId({ id: company.id, name: company.name }));
  };
  console.log('suggestion', suggestions);

  // drawer
  const handleDrawer = () => {
    // setVisible(true);
    dispatch(
      changeDrawerVisible({
        open: true,
        action: 'add',
        path: 'customers',
        title: '고객등록',
        width: 900,
      }),
    );
  };
  const onClose = () => {
    setVisible(false);
  };

  const handleOnclose = () => {
    dispatch(changeDrawerVisible({ open: false, mode: null }));
  };

  const onSubmit = async (values) => {
    setBtnDisabled(true);
    console.log('고객등록-onSubmit..', values);
    // const jwt = auth.jwt;
    const customer_data = {
      name_eng: values.customerId,
      name: values.name,
      business_number: values.businessNumber,
      business_type: values.businessType,
      description: values.description,
    };
    try {
      const result = await tbl_insert('api/customers', customer_data);
      console.log('result', result);
      // addCustomer(datas);
      // 고객등록 성공시 페이지 이동 기능 구현 필요
      message.success('고객등록 성공');
      setVisible(false);
      // navigate('/customer');
      dispatch(getCustomerlist());
    } catch (error) {
      message.error('관리자에게 문의 바랍니다.');
      console.log('고객등록 에러', error);
    }
    setBtnDisabled(false);
  };

  return (
    <>
      {/* autocomplete 기능 적용 */}
      <AutoCompleteBlock>
        <div className="input-box">
          <div className="input-title">고객검색</div>
          <div>
            <input
              type="text"
              onChange={(e) => onChangeHandler(e.target.value)}
              value={text}
              //   다른영역클릭시 suggestion 값 삭제

              // onBlur={() => {
              //   setTimeout(() => {
              //     console.log('onBlur..');
              //     setSuggestions([]);
              //   }, 100);
              // }}
            />
            <div className="suggestion-box">
              {suggestions &&
                suggestions.map((suggestion, i) => (
                  <div
                    key={suggestion.id}
                    className="suggestion"
                    onClick={() => onSuggestHandler(suggestion)}
                  >
                    {suggestion.attributes.name}
                  </div>
                ))}
            </div>
          </div>
          <Button
            onClick={handleDrawer}
            icon={<PlusOutlined />}
            disabled={addBtnDisabled}
          >
            고객등록
          </Button>
        </div>
      </AutoCompleteBlock>
    </>
  );
};

export default AutoComplete;
