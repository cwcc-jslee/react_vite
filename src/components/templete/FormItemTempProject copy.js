import React, { useState, useEffect } from 'react';
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
import ProjectTaskAddForm from '../project/ProjectTaskAddForm';

const { RangePicker } = DatePicker;
const { Option } = Select;

const FormItemTempProject = ({
  formItems,
  selectBook,
  initialValues,
  handleOnChange,
  // handleOnSubmit,
}) => {
  const { drawer } = useSelector(({ status }) => ({
    drawer: status.drawer,
  }));
  const { btnDisabled } = drawer;
  const [isChecked, setIsChecked] = useState({});
  //프로젝트 > 프로젝트 등록/ task 등록
  const [addedTasks, setAddedTasks] = useState([]);
  const [formInputValue, setFormInputValue] = useState({
    name: '프로젝트 등록',
  });

  // action 재정의 sub 키 존재시 sus.action 적용
  const action = drawer.sub ? drawer.sub.action : drawer.action;

  const handleChange = (e) => {
    // setValues({
    const key = e.target.name;
    const value = e.target.value;
    //   ...values,
    //   [e.target.name]: e.target.value,
    // })
    console.log('>>(name)>>', e.target.name);
    console.log('>>(value)>>', e.target.value);
    setFormInputValue({ ...formInputValue, [key]: value });
  };

  const handleOnSubmit = (e) => {
    e.preventDefault();
    console.log('>>(submit)>>', e.target.value);
  };

  const DrawerFormItems = () => {
    console.log('>>>>>>>>>>>>>>>>>>', formItems);
    const FormList = () =>
      formItems.map((item, index) => {
        const AddFormItem = MakeFormItems(item);
        //   console.log(`(check) -- :`, InputTemp);
        return (
          <p key={item.key}>
            <AddFormItem />
            {/* {MakeFormItems(item)} */}
          </p>
        );
      });

    return <FormList />;
  };

  const MakeFormItems = (list) => {
    const { name, label, coid, req, span, form } = list;
    // console.log('>>>(list)', list);
    const selectid = coid ? coid : name;
    let disabled = true;
    if (action === 'add' || action === 'sfa-add' || action === 'proposal-add')
      disabled = false;
    if (action === 'view') disabled = true;
    if (action === 'edit') {
      //
      const isCheckedTrue = isChecked[name] ? true : false;
      // console.log(`(ischecked)(${name})>>>>>>>>>>>>>>>>>>>>>>>`, isCheckedTrue);
      if (isCheckedTrue) disabled = false;
      // console.log(`(disabled)(${name})>>>>>>>>>>>>>>>`, disabled);
      // else disabled = true;
    }

    // form item 내부
    const InputForm = () => {
      switch (form) {
        case 'SELECT':
          return (
            <div>
              <span>{list.name}</span>
              <select name={list.name} onChange={handleOnChange}>
                {selectBook[selectid]
                  ? selectBook[selectid].map((code, index) => {
                      return (
                        <option key={code.id} value={code.id}>
                          {code.attributes ? code.attributes.name : code.name}
                        </option>
                      );
                    })
                  : ''}
              </select>
            </div>
          );

        case 'NUMBER':
          return <input type="number" />;

        // case 'PROJECTTASKADDFORM':
        //   if (action !== 'view') {
        //     return (
        //       <ProjectTaskAddForm
        //         selectBook={selectBook}
        //         addedTasks={addedTasks}
        //         setAddedTasks={setAddedTasks}
        //       />
        //     );
        //   }
        //   return;

        default:
          return (
            <div>
              <span>{list.name}</span>
              <input
                type="text"
                name={list.name}
                value={formInputValue[name]}
                onChange={handleChange}
              />
            </div>
          );
      }
    };
    return InputForm;
  };

  return (
    <>
      <div>
        <DrawerFormItems />
      </div>
      <p>
        <input type="submit" name="SUBMIT" onClick={handleOnSubmit} />
      </p>
    </>
  );
};

export default FormItemTempProject;
