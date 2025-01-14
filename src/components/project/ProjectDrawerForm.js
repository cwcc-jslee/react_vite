import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import ProjectTaskAddForm from '../project/ProjectTaskAddForm';

const ProjectDrawerForm = ({
  formItems,
  selectBook,
  handleOnSubmit,
  handleSelectOnChange,
}) => {
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
      handleSelectOnChange('customer', Number(value));
    }
  };

  const handleOnSubmitProxy = (e) => {
    e.preventDefault();
    const prject_task = { 'project-tasks': formTasksValue };
    const value = { ...formInputValue, ...prject_task };
    handleOnSubmit({ value });
    console.log(`>>(handle on submit proxy)>>`, formInputValue);
    console.log(`>>(handle on submit proxy)>>`, formTasksValue);
  };

  return (
    <form onSubmit={handleOnSubmitProxy}>
      {formItems.map(({ form, name, coid, req }) => {
        let FormField;
        const required = req ? req : false;
        switch (form) {
          case 'SELECT':
            FormField = (
              <div>
                <span>{name}</span>
                <select
                  name={name}
                  onChange={handleOnChange}
                  required={required}
                >
                  <option value="">-----</option>
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
            FormField = <input type="number" required={required} />;
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
                  required={required}
                />
              </div>
            );
            break;
        }
        return <div key={name}>{FormField}</div>;
      })}
      <input type="submit" value="Submit" />
      {/* <button onClick={handleOnSubmitProxy}>SUBMIT</button> */}
    </form>
  );
};

export default ProjectDrawerForm;
