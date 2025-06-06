import React from 'react';
import { Trash2 } from 'lucide-react';
import { CustomerSearchInput } from '@shared/components/customer/CustomerSearchInput';
import {
  formatDisplayNumber,
  ensureNumericAmount,
} from '@shared/utils/format/number';
import { Group, Input, Button } from '@shared/components/ui';

const RevenueSource = ({
  items = [],
  onChange,
  onRemove,
  isSubmitting,
  errors,
}) => {
  // 2열로 나누기 위한 배열 생성
  const rows = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  return (
    <div className="space-y-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {row.map((item, colIndex) => {
            const index = rowIndex * 2 + colIndex;
            return (
              <div key={index} className="flex-1 p-0 rounded-lg bg-white">
                <Group direction="horizontal" className="gap-4">
                  <div className="w-20 flex items-center justify-center text-gray-500">
                    {`매출처 ${index + 1}`}
                  </div>
                  <div className="flex-1">
                    <CustomerSearchInput
                      onSelect={(customer) =>
                        onChange(index, 'endCustomer', customer)
                      }
                      value={item.endCustomer}
                      error={errors?.[`revenues.${index}.endCustomer`]}
                      disabled={isSubmitting}
                      size="small"
                      placeholder="매출처 선택"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onRemove(index)}
                    disabled={isSubmitting}
                    className="p-2"
                  >
                    <Trash2 className="w-4 h-4 text-gray-500" />
                  </Button>
                </Group>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default RevenueSource;
