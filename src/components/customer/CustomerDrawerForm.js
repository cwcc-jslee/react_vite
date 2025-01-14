import DescriptionItemTemp from '../templete/DescriptionItemTemp';
import FormItemTempCustomer from '../templete/FormItemTempCustomer';
import { Table, Divider } from 'antd';
import DrawerButton from '../drawer/DrawerButton';

const CustomerDrawerForm = (props) => {
  const {
    drawer,
    selectBook,
    drawerForms,
    handleOnChange,
    handleOnSubmit,
    handleButtonOnclick,
    CONF,
  } = props;
  const tableData = [{ key: 1, id: 1, revenue: 100 }];
  console.log('>>(tabledata)>>', tableData);
  console.log('>>(selectbook)>>', selectBook);
  return (
    <>
      {(drawer.action === 'add' || drawer.action === 'edit') && selectBook ? (
        <>
          <FormItemTempCustomer
            handleOnChange={handleOnChange}
            selectBook={selectBook}
            formItems={drawerForms.default}
            handleOnSubmit={handleOnSubmit}
            // action..edit
            initialValues={props.initialValues}
          />
          {/* formItems */}
        </>
      ) : (
        ''
      )}
      {drawer.action === 'view' && selectBook ? (
        <>
          {props.initialValues ? (
            <>
              <DescriptionItemTemp
                initialValues={props.initialValues}
                drawer={drawer}
              />
              <Divider />
              <DrawerButton
                items={CONF.drawerForms.submenubutton}
                handleButtonOnclick={handleButtonOnclick}
              />
              <Table
                columns={drawerForms.year_table_columns}
                dataSource={props.initialValues.customer_year_datas}
                size="small"
              />
            </>
          ) : (
            ''
          )}
        </>
      ) : (
        ''
      )}
      {drawer.action === 'add-sales' && selectBook ? (
        <>
          {props.initialValues ? (
            <>
              <FormItemTempCustomer
                handleOnChange={handleOnChange}
                selectBook={selectBook}
                formItems={drawerForms.salesForm}
                handleOnSubmit={handleOnSubmit}
                // action..edit
                // initialValues={props.initialValues}
              />
            </>
          ) : (
            ''
          )}
        </>
      ) : (
        ''
      )}
    </>
  );
};

export default CustomerDrawerForm;
