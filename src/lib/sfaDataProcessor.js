// /src/lib/sfaDataProcessor.js

export const processSfaData = (responseData) => {
  const revenueByPercentage = {
    확정: 0,
    100: 0,
    90: 0,
    70: 0,
    50: 0,
  };

  responseData.data.forEach((item) => {
    const confirmed = item.attributes.confirmed;
    const code = confirmed
      ? '확정'
      : item.attributes.sfa_percentage.data.attributes.code;
    const revenue = item.attributes.sales_revenue;

    if (revenueByPercentage.hasOwnProperty(code)) {
      revenueByPercentage[code] += revenue;
    } else {
      console.warn(`Unexpected code encountered: ${code}`);
    }
  });

  // 각 코드별 합계를 정수로 반올림
  for (const code in revenueByPercentage) {
    revenueByPercentage[code] = Math.round(revenueByPercentage[code]);
  }

  //   console.log('Sales Revenue Summary by SFA Percentage Code:');
  //   console.log(JSON.stringify(revenueByPercentage));

  return revenueByPercentage;
};
