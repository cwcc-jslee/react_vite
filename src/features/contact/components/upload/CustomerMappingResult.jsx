// src/features/contact/components/ExcelUpload/CustomerMappingResult.jsx
/**
 * 고객사 매핑 결과를 표시하는 컴포넌트
 * 고객사가 없는 담당자도 함께 표시
 */
import React, { useState } from 'react';
import { Group, Button, Badge } from '../../../../shared/components/ui';

const CustomerMappingResult = ({ mappingResult, className = '' }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!mappingResult) {
    return null;
  }

  const {
    totalCustomers,
    mappedCustomers,
    unmappedCustomers,
    mappingDetails,
    contactsWithoutCompany = 0,
  } = mappingResult;

  // 매핑 성공률 계산
  const successRate =
    totalCustomers > 0
      ? Math.round((mappedCustomers / totalCustomers) * 100)
      : 0;

  return (
    <Group className={`p-4 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800">고객사 매핑 결과</h3>
        <Button
          variant="ghost"
          size="small"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '간략히 보기' : '상세 보기'}
        </Button>
      </div>

      <div className="flex items-center gap-4 mb-3 flex-wrap">
        <div className="text-center">
          <p className="text-sm text-gray-500">총 고객사</p>
          <p className="text-xl font-bold">{totalCustomers}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">매핑 성공</p>
          <p className="text-xl font-bold text-green-600">{mappedCustomers}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">매핑 실패</p>
          <p className="text-xl font-bold text-red-500">{unmappedCustomers}</p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-500">성공률</p>
          <p className="text-xl font-bold">{successRate}%</p>
        </div>
        {contactsWithoutCompany > 0 && (
          <div className="text-center">
            <p className="text-sm text-gray-500">고객사 없는 담당자</p>
            <p className="text-xl font-bold text-blue-500">
              {contactsWithoutCompany}
            </p>
          </div>
        )}
      </div>

      {contactsWithoutCompany > 0 && (
        <div className="mb-3 p-2 bg-blue-50 rounded">
          <p className="text-sm">
            <span className="font-medium">참고:</span> 고객사 정보가 없는 담당자{' '}
            {contactsWithoutCompany}명은 고객사 연결 없이 등록됩니다.
          </p>
        </div>
      )}

      {showDetails && mappingDetails && mappingDetails.length > 0 && (
        <div className="mt-4">
          <h4 className="font-medium text-sm mb-2">상세 매핑 정보</h4>
          <div className="max-h-60 overflow-y-auto border rounded">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-xs text-gray-500 text-left">
                    회사명
                  </th>
                  <th className="px-4 py-2 text-xs text-gray-500 text-center">
                    매핑 상태
                  </th>
                  <th className="px-4 py-2 text-xs text-gray-500 text-center">
                    고객사 ID
                  </th>
                  <th className="px-4 py-2 text-xs text-gray-500 text-center">
                    데이터 출처
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {mappingDetails.map((item, index) => (
                  <tr
                    key={index}
                    className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                  >
                    <td className="px-4 py-2 text-sm">{item.companyName}</td>
                    <td className="px-4 py-2 text-sm text-center">
                      {item.mapped ? (
                        <Badge variant="success" className="text-xs">
                          매핑됨
                        </Badge>
                      ) : (
                        <Badge variant="error" className="text-xs">
                          미매핑
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-center">
                      {item.customerId || '-'}
                    </td>
                    <td className="px-4 py-2 text-sm text-center">
                      <span
                        className={`text-xs ${
                          item.source === '캐시됨'
                            ? 'text-blue-500'
                            : 'text-green-500'
                        }`}
                      >
                        {item.source}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Group>
  );
};

export default CustomerMappingResult;
