// /src/lib/sfaQueryUtils.js
import qs from 'qs';
import { getMonthDateRange } from '../modules/timeRangeUtils';

export const createSfaQuery = (year, month, start = 0, limit = 100) => {
  const { start: startDate, end: endDate } = getMonthDateRange(year, month);

  const query = qs.stringify(
    {
      filters: {
        $and: [
          {
            deleted: {
              $eq: false,
            },
          },
          {
            sales_rec_date: {
              $gte: startDate,
            },
          },
          {
            sales_rec_date: {
              $lte: endDate,
            },
          },
        ],
      },
      sort: ['id:asc'],
      fields: [
        'confirmed',
        'sales_revenue',
        'sales_profit',
        'sales_rec_date',
        'payment_date',
        'profitMargin_value',
      ],
      populate: {
        sfa_percentage: {
          fields: ['code', 'name'],
        },
      },
      pagination: {
        start: start,
        limit: limit,
      },
    },
    {
      encodeValuesOnly: true,
    },
  );

  return query;
};
