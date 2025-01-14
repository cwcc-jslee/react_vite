import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ProjectTaskAddForm from '../project/ProjectTaskAddForm';

const FormItemTempProject = ({ formItems, selectBook, handleOnSubmit }) => {
  const { drawer } = useSelector(({ status }) => ({
    drawer: status.drawer,
  }));
  const [formTasksValue, setFormTasksValue] = useState([]);
  const [formInputValue, setFormInputValue] = useState();
  // const formItems = CONF.drawerFormItems;

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    const task = e.target.dataset['task'];
    console.log('>>(e)>>', e);
    console.log('>>(task)>>', task);
    if (task === undefined) {
      setFormInputValue((prevState) => ({ ...prevState, [name]: value }));
    } else if (task) {
      const newData = formTasksValue.map((item) => {
        // console.log(`>>>>>(item.name) :`, item.name);
        // console.log(`>>>>>(key) :`, key);
        if (item.name === task) {
          console.log(`>>>>>(item) :`, item);
          return { ...item, [name]: value };
        } else return item;
      });
      console.log(`>>>>>(newData) :`, newData);
      setFormTasksValue(newData);
    }
    // customer 선택시 sfa 데이터 업데이트
    if (name === 'customer') {
      console.log('고객선택', value);
    }
  };

  const handleOnSubmitProxy = (e) => {
    e.preventDefault();
    handleOnSubmit(formInputValue);
    console.log(`>>(handle on submit proxy)>>`, formInputValue);
    console.log(`>>(handle on submit proxy)>>`, formTasksValue);
  };

  return (
    <form onSubmit={handleOnSubmitProxy}>
      {formItems.map(({ form, name, coid }) => {
        let FormField;
        switch (form) {
          case 'SELECT':
            FormField = (
              <div>
                <span>{name}</span>
                <select name={name} onChange={handleOnChange}>
                  {selectBook[coid || name]?.map(({ id, attributes, name }) => (
                    <option key={id} value={id}>
                      {attributes?.name || name}
                    </option>
                  ))}
                </select>
              </div>
            );
            break;
          case 'NUMBER':
            FormField = <input type="number" />;
            break;
          case 'PROJECTTASKADDFORM':
            FormField = (
              <ProjectTaskAddForm
                formTasksValue={formTasksValue}
                setFormTasksValue={setFormTasksValue}
                handleOnChange={handleOnChange}
              />
            );
            break;
          default:
            FormField = (
              <div>
                <span>{name}</span>
                <input
                  type="text"
                  name={name}
                  // value={formInputValue[name] || ''}
                  onChange={handleOnChange}
                />
              </div>
            );
            break;
        }
        return <div key={name}>{FormField}</div>;
      })}
      <input type="submit" value="Submit" />
    </form>
  );
};

export default FormItemTempProject;
