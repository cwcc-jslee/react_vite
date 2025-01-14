// /src/modules/timeRangeUtils.js
export const getMonthRange = (count = 12) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript의 월은 0부터 시작합니다.

  const monthsRange = [];

  for (let i = 0; i < count; i++) {
    let targetMonth = currentMonth - 1 + i; // 전월부터 시작
    let targetYear = currentYear;

    if (targetMonth > 12) {
      targetMonth -= 12;
      targetYear += 1;
    }
    if (targetMonth < 1) {
      targetMonth += 12;
      targetYear -= 1;
    }

    monthsRange.push({ year: targetYear, month: targetMonth });
  }

  return monthsRange;
};

export const formatMonthHeader = (year, month) => {
  const date = new Date(year, month - 1);
  return date.toLocaleString('ko-KR', { year: 'numeric', month: 'long' });
};

export const getQuarterRange = (count = 4) => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentQuarter = Math.floor((currentDate.getMonth() + 3) / 3);

  const quarterRange = [];

  for (let i = 0; i < count; i++) {
    let targetQuarter = currentQuarter + i;
    let targetYear = currentYear;

    if (targetQuarter > 4) {
      targetQuarter -= 4;
      targetYear += 1;
    }

    quarterRange.push({ year: targetYear, quarter: targetQuarter });
  }

  return quarterRange;
};

export const formatQuarterHeader = (year, quarter) => {
  return `${year}년 ${quarter}분기`;
};

export const getMonthDateRange = (year, month) => {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  return {
    start: formatDate(startDate),
    end: formatDate(endDate),
  };
};
