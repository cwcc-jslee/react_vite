// /src/containers/SfaContainer/SalesForecastContainer/components/SalesForecastTable.js
import React from 'react';
import { formatMonthHeader } from '../../../../modules/timeRangeUtils';

const SalesForecastTable = ({ data }) => {
  const probabilities = ['확정', '100', '90', '70', '50'];

  const formatRevenue = (value) => {
    return value ? value.toLocaleString() : '-';
  };

  return (
    <table style={tableStyle}>
      <thead>
        <tr>
          <th style={{ ...tableHeaderStyle, width: '100px' }}>확률</th>
          {data.map(({ year, month }, index) => (
            <th key={index} style={tableHeaderStyle}>
              {formatMonthHeader(year, month)}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {probabilities.map((prob, probIndex) => (
          <tr key={probIndex}>
            <td style={{ ...tableCellStyle, textAlign: 'center' }}>{prob}</td>
            {data.map(({ data: monthData }, monthIndex) => (
              <td key={monthIndex} style={tableCellStyle}>
                {formatRevenue(monthData[prob])}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
};

const tableHeaderStyle = {
  backgroundColor: '#f2f2f2',
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'center',
};

const tableCellStyle = {
  border: '1px solid #ddd',
  padding: '8px',
  textAlign: 'right',
};

export default SalesForecastTable;
