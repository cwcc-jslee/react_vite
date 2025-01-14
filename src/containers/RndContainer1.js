import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as api from '../lib/api/api';
import qs from 'qs';

const RndContainer = () => {
  const { cb, commonData } = useSelector(({ status }) => ({
    cb: status.cb,
    commonData: status.commonData,
  }));
  console.log('>>(service)>>', commonData.service);
  const services = commonData.service;

  const handleOnSubmit = async (e) => {
    e.preventDefault();
    console.log(`>>(handle on submit proxy)>>`, e);
    const path = 'api/test-tesses';
    // const query = 'populate=%2a';
    const query = qs.stringify(
      {
        filters: {
          json2: {
            $contains: 'jslee1',
          },
        },
      },
      {
        encodeValuesOnly: true, // prettify URL
      },
    );
    const request = await api.getQueryString(path, query);
    console.log(`>>(request))>>`, request);
  };

  const handleOnChange = (e, key) => {
    //
    console.log(`>>(handle on change)>>`, e.target.checked);
    // console.log(`>>(handle on change-key)>>`, key);
  };

  return (
    <>
      <form onSubmit={handleOnSubmit}>
        <div>
          {services.map((list) => {
            return (
              <>
                <input
                  type="checkbox"
                  key={list.id}
                  value={list.attributes.name}
                  onChange={(e, key) => handleOnChange(e, list.id)}
                />
                <label>{list.attributes.name}</label>
              </>
            );
          })}
        </div>
        <input type="submit" value="Submit" />
      </form>
    </>
  );
};

export default RndContainer;
