import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Table, Space, Row, Col } from 'antd';
// import moment from 'moment';
import dayjs from 'dayjs';

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  th,
  td {
    border: 1px solid black;
    padding: 10px;
  }
  td {
    text-align: right;
  }
`;

const SfaDashboardTable = ({ salesData }) => {
  console.log('>>(data1)>>', salesData);
  const salesData1 = {
    확정: [
      12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 21000,
      22000, 23000,
    ],
    '100%': [
      11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000,
      21000, 22000,
    ],
    '90%': [
      10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000,
      20000, 21000,
    ],
    '70%': [
      9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000,
      19000, 20000,
    ],
    '50%': [
      8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000,
      19000,
    ],
  };
  console.log('>>(salesData)>>', salesData);

  return (
    <StyledTable>
      <thead>
        <tr>
          <th></th>
          {Array.from({ length: 12 }, (_, i) => (
            <th key={i}>{i + 1}월</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.keys(salesData).map((key) => (
          <tr key={key}>
            <td>{key}</td>
            {salesData[key].map((data, i) => (
              <td key={i}>{data.toLocaleString()}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </StyledTable>
  );
};

export default SfaDashboardTable;
