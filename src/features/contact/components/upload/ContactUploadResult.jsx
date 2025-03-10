// src/features/contact/components/ExcelUpload/ContactUploadResult.jsx
/**
 * 담당자 일괄 등록 결과를 표시하는 컴포넌트
 * 등록 성공/실패 및 고객사 매핑 통계 표시
 */
import React, { useState } from 'react';
import {
  Card,
  Button,
  Badge,
  List,
  ListItem,
} from '../../../../shared/components/ui';

const ContactUploadResult = ({ uploadResult, className = '' }) => {
  const [showDetails, setShowDetails] = useState(false);

  if (!uploadResult || !uploadResult.customerMapping) {
    return null;
  }

  const {
    totalCount,
    successCount,
    failCount,
    emptyCustomerCount = 0,
    successItems = [],
    failedItems = [],
  } = uploadResult;

  const {
    mappedCustomers,
    unmappedCustomers,
    contactsWithoutCompany = 0,
  } = uploadResult.customerMapping;

  // 고객사 매핑 성공률 (고객사 정보가 있는 담당자 중에서)
  const customerMappingRate =
    mappedCustomers + unmappedCustomers > 0
      ? Math.round(
          (mappedCustomers / (mappedCustomers + unmappedCustomers)) * 100,
        )
      : 0;

  // 전체 등록 성공률
  const successRate =
    totalCount > 0 ? Math.round((successCount / totalCount) * 100) : 0;

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold text-gray-800">담당자 등록 결과</h3>
        <Button
          variant="ghost"
          size="small"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? '간략히 보기' : '상세 보기'}
        </Button>
      </div>

      {/* 요약 통계 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="bg-gray-50 p-3 rounded">
          <p className="text-sm text-gray-500">전체 등록</p>
          <div className="flex justify-between items-center">
            <p className="text-xl font-bold">{totalCount}건</p>
            <Badge
              variant={
                successRate > 90
                  ? 'success'
                  : successRate > 70
                  ? 'warning'
                  : 'error'
              }
            >
              {successRate}%
            </Badge>
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded">
          <p className="text-sm text-gray-500">등록 성공</p>
          <div className="flex justify-between items-center">
            <p className="text-xl font-bold text-green-600">{successCount}건</p>
            <span className="text-sm text-gray-500">{successRate}%</span>
          </div>
        </div>

        {failCount > 0 && (
          <div className="bg-red-50 p-3 rounded">
            <p className="text-sm text-gray-500">등록 실패</p>
            <div className="flex justify-between items-center">
              <p className="text-xl font-bold text-red-600">{failCount}건</p>
              <span className="text-sm text-gray-500">
                {Math.round((failCount / totalCount) * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 고객사 매핑 요약 */}
      <div className="bg-blue-50 p-3 rounded mb-4">
        <p className="font-medium text-sm mb-2">고객사 매핑 요약</p>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center">
            <p className="text-xs text-gray-500">매핑 성공</p>
            <p className="font-bold text-green-600">{mappedCustomers}건</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">매핑 실패</p>
            <p className="font-bold text-red-600">{unmappedCustomers}건</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">정보 없음</p>
            <p className="font-bold text-blue-600">
              {contactsWithoutCompany}건
            </p>
          </div>
        </div>
      </div>

      {/* 상세 정보 */}
      {showDetails && (
        <div className="space-y-4">
          {/* 실패 항목 세부 정보 */}
          {failedItems.length > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2 text-red-600">
                등록 실패 항목
              </h4>
              <List className="max-h-40 overflow-y-auto bg-red-50 rounded p-2">
                {failedItems.map((item, index) => (
                  <ListItem
                    key={index}
                    className="py-1 border-b border-red-100 last:border-0"
                  >
                    <div className="flex justify-between">
                      <span className="font-medium">
                        {item.fullName || `행 ${item.rowIndex}`}
                      </span>
                      <span className="text-red-600 text-sm">{item.error}</span>
                    </div>
                  </ListItem>
                ))}
              </List>
            </div>
          )}

          {/* 성공 항목 통계 */}
          {successCount > 0 && (
            <div>
              <h4 className="font-medium text-sm mb-2 text-green-600">
                등록 성공 항목
              </h4>
              <div className="grid grid-cols-2 gap-2 bg-green-50 p-3 rounded">
                <div>
                  <p className="text-xs text-gray-500">고객사 연결 성공</p>
                  <p className="font-medium">
                    {successItems.filter((item) => item.hasCustomer).length}건
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">고객사 없이 등록</p>
                  <p className="font-medium">
                    {successItems.filter((item) => !item.hasCustomer).length}건
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ContactUploadResult;
