/**
 * 파일 경로: src/features/sfa/components/SalesRegistrationDrawer.jsx
 * 설명: 매출등록을 위한 드로우 컴포넌트 - 직관적인 UI/UX로 매출 정보 입력
 * 기능: 거래유형, 품목유형, 고객정보, 매출처 관리, 사업부 매출 등록 통합 인터페이스
 */

import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Building2,
  Users,
  CheckCircle,
  Briefcase,
} from 'lucide-react';

const SalesRegistrationDrawer = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    transactionType: '',
    itemType: '',
    projectName: '',
    hasProject: false,
    customerCompany: null,
    salesCustomers: [],
    isSameCustomer: true,
    businessUnits: [], // 사업부 매출 추가
  });

  const [customerOptions] = useState([
    { id: 1, name: '삼성전자', type: 'company' },
    { id: 2, name: 'LG전자', type: 'company' },
    { id: 3, name: 'SK하이닉스', type: 'company' },
  ]);

  // 사업부 옵션
  const [businessUnitOptions] = useState([
    {
      id: 'design',
      name: '디자인사업부',
      color: 'bg-purple-100 text-purple-700',
    },
    { id: 'video', name: '영상사업부', color: 'bg-blue-100 text-blue-700' },
    {
      id: 'marketing',
      name: '마케팅사업부',
      color: 'bg-green-100 text-green-700',
    },
    { id: 'web', name: '웹개발사업부', color: 'bg-orange-100 text-orange-700' },
    {
      id: 'consulting',
      name: '컨설팅사업부',
      color: 'bg-indigo-100 text-indigo-700',
    },
  ]);

  // 매출품목 옵션
  const [salesItemOptions] = useState([
    { id: 'homepage', name: '홈페이지', category: 'web' },
    { id: 'promotional_video', name: '홍보영상', category: 'video' },
    { id: 'brand_design', name: '브랜드디자인', category: 'design' },
    { id: 'marketing_strategy', name: '마케팅전략', category: 'marketing' },
    { id: 'mobile_app', name: '모바일앱', category: 'web' },
    { id: 'product_video', name: '제품영상', category: 'video' },
    { id: 'package_design', name: '패키지디자인', category: 'design' },
    { id: 'digital_marketing', name: '디지털마케팅', category: 'marketing' },
    { id: 'business_consulting', name: '경영컨설팅', category: 'consulting' },
  ]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCustomerTypeChange = (isSame) => {
    setFormData((prev) => ({
      ...prev,
      isSameCustomer: isSame,
      salesCustomers:
        isSame && prev.customerCompany
          ? [
              {
                ...prev.customerCompany,
                amount: '',
                ratio: 100,
                paymentType: '',
              },
            ]
          : [],
    }));
  };

  const addSalesCustomer = () => {
    if (!formData.customerCompany) return;

    setFormData((prev) => ({
      ...prev,
      salesCustomers: [
        ...prev.salesCustomers,
        formData.isSameCustomer
          ? {
              ...formData.customerCompany,
              amount: '',
              ratio: 0,
              paymentType: '',
              id: Date.now(), // 고유 ID 추가
            }
          : {
              id: Date.now(),
              name: '',
              amount: '',
              ratio: 0,
              paymentType: '',
            },
      ],
    }));
  };

  const updateSalesCustomer = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      salesCustomers: prev.salesCustomers.map((customer, i) =>
        i === index ? { ...customer, [field]: value } : customer,
      ),
    }));
  };

  const removeSalesCustomer = (index) => {
    setFormData((prev) => ({
      ...prev,
      salesCustomers: prev.salesCustomers.filter((_, i) => i !== index),
    }));
  };

  const addBusinessUnit = () => {
    setFormData((prev) => ({
      ...prev,
      businessUnits: [
        ...prev.businessUnits,
        {
          id: Date.now(),
          salesItem: '',
          businessUnit: '',
          amount: '',
          memo: '',
        },
      ],
    }));
  };

  const updateBusinessUnit = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      businessUnits: prev.businessUnits.map((unit, i) =>
        i === index ? { ...unit, [field]: value } : unit,
      ),
    }));
  };

  const removeBusinessUnit = (index) => {
    setFormData((prev) => ({
      ...prev,
      businessUnits: prev.businessUnits.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    console.log('매출 등록 데이터:', formData);
    // API 호출 로직
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      <div className="absolute right-0 top-0 h-full w-full max-w-4xl bg-white shadow-xl">
        <div className="flex h-full flex-col">
          {/* 헤더 */}
          <div className="flex items-center justify-between border-b px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">매출 등록</h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* 콘텐츠 */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-4 font-medium text-gray-900">기본 정보</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      거래유형 *
                    </label>
                    <select
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formData.transactionType}
                      onChange={(e) =>
                        handleInputChange('transactionType', e.target.value)
                      }
                    >
                      <option value="">선택하세요</option>
                      <option value="direct">직접판매</option>
                      <option value="partner">파트너판매</option>
                      <option value="reseller">리셀러판매</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      품목유형 *
                    </label>
                    <select
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formData.itemType}
                      onChange={(e) =>
                        handleInputChange('itemType', e.target.value)
                      }
                    >
                      <option value="">선택하세요</option>
                      <option value="product">제품</option>
                      <option value="service">서비스</option>
                      <option value="solution">솔루션</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      프로젝트 연동
                    </label>
                    <label className="flex items-center rounded-lg border border-gray-300 px-3 py-2">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={formData.hasProject}
                        onChange={(e) =>
                          handleInputChange('hasProject', e.target.checked)
                        }
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        프로젝트와 연동
                      </span>
                    </label>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    건명 *
                  </label>
                  <input
                    type="text"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="매출 건명을 입력하세요"
                    value={formData.projectName}
                    onChange={(e) =>
                      handleInputChange('projectName', e.target.value)
                    }
                  />
                </div>
              </div>

              {/* 고객 정보 */}
              <div className="rounded-lg border border-gray-200 p-4">
                <h3 className="mb-4 font-medium text-gray-900">고객 정보</h3>

                <div className="mb-4">
                  <label className="mb-2 block text-sm font-medium text-gray-700">
                    고객사 *
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.customerCompany?.id || ''}
                    onChange={(e) => {
                      const selected = customerOptions.find(
                        (c) => c.id === parseInt(e.target.value),
                      );
                      handleInputChange('customerCompany', selected);
                      if (formData.isSameCustomer && selected) {
                        setFormData((prev) => ({
                          ...prev,
                          salesCustomers: [
                            { ...selected, amount: '', ratio: 100 },
                          ],
                        }));
                      }
                    }}
                  >
                    <option value="">고객사를 선택하세요</option>
                    {customerOptions.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 매출처 유형 선택 */}
                <div className="mb-4">
                  <label className="mb-3 block text-sm font-medium text-gray-700">
                    매출처 설정
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="customerType"
                        className="text-blue-600 focus:ring-blue-500"
                        checked={formData.isSameCustomer}
                        onChange={() => handleCustomerTypeChange(true)}
                      />
                      <CheckCircle className="ml-2 h-4 w-4 text-green-500" />
                      <span className="ml-1 text-sm text-gray-700">
                        고객사와 동일
                      </span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="customerType"
                        className="text-blue-600 focus:ring-blue-500"
                        checked={!formData.isSameCustomer}
                        onChange={() => handleCustomerTypeChange(false)}
                      />
                      <Building2 className="ml-2 h-4 w-4 text-blue-500" />
                      <span className="ml-1 text-sm text-gray-700">
                        별도 매출처
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* 매출처 관리 */}
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">매출처 정보</h3>
                  <button
                    type="button"
                    onClick={addSalesCustomer}
                    className="flex items-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
                    disabled={!formData.customerCompany}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    {formData.isSameCustomer ? '결제구분 추가' : '매출처 추가'}
                  </button>
                </div>

                {formData.salesCustomers.length === 0 && (
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <Users className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {formData.customerCompany
                        ? formData.isSameCustomer
                          ? '결제구분을 추가해주세요'
                          : '매출처를 추가해주세요'
                        : '먼저 고객사를 선택해주세요'}
                    </p>
                  </div>
                )}
              </div>

              {/* 사업부 매출 등록 */}
              <div className="rounded-lg border border-gray-200 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">
                    사업부 매출 등록
                  </h3>
                  <button
                    type="button"
                    onClick={addBusinessUnit}
                    className="flex items-center rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    사업부 추가
                  </button>
                </div>

                {formData.businessUnits.length === 0 && (
                  <div className="rounded-lg bg-gray-50 p-4 text-center">
                    <Briefcase className="mx-auto mb-2 h-8 w-8 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      사업부 매출을 추가해주세요
                    </p>
                  </div>
                )}

                <div className="space-y-3">
                  {formData.businessUnits.map((unit, index) => (
                    <div
                      key={unit.id}
                      className="rounded-lg border border-gray-200 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-700">
                                매출품목 *
                              </label>
                              <select
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                value={unit.salesItem}
                                onChange={(e) => {
                                  updateBusinessUnit(
                                    index,
                                    'salesItem',
                                    e.target.value,
                                  );
                                  // 매출품목 선택 시 해당 카테고리의 사업부 자동 선택
                                  const selectedItem = salesItemOptions.find(
                                    (item) => item.id === e.target.value,
                                  );
                                  if (selectedItem) {
                                    updateBusinessUnit(
                                      index,
                                      'businessUnit',
                                      selectedItem.category,
                                    );
                                  }
                                }}
                              >
                                <option value="">매출품목 선택</option>
                                {salesItemOptions.map((item) => (
                                  <option key={item.id} value={item.id}>
                                    {item.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-700">
                                담당 사업부 *
                              </label>
                              <select
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                value={unit.businessUnit}
                                onChange={(e) =>
                                  updateBusinessUnit(
                                    index,
                                    'businessUnit',
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="">사업부 선택</option>
                                {businessUnitOptions.map((dept) => (
                                  <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-700">
                                매출금액 *
                              </label>
                              <input
                                type="text"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder="0"
                                value={unit.amount}
                                onChange={(e) =>
                                  updateBusinessUnit(
                                    index,
                                    'amount',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-700">
                                비고
                              </label>
                              <input
                                type="text"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                                placeholder="추가 설명"
                                value={unit.memo}
                                onChange={(e) =>
                                  updateBusinessUnit(
                                    index,
                                    'memo',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>

                          {/* 선택된 사업부 표시 */}
                          {unit.businessUnit && (
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">
                                담당사업부:
                              </span>
                              <span
                                className={`rounded-full px-2 py-1 text-xs font-medium ${
                                  businessUnitOptions.find(
                                    (dept) => dept.id === unit.businessUnit,
                                  )?.color || 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {
                                  businessUnitOptions.find(
                                    (dept) => dept.id === unit.businessUnit,
                                  )?.name
                                }
                              </span>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => removeBusinessUnit(index)}
                          className="ml-3 rounded-lg p-2 text-red-500 hover:bg-red-50"
                          title="사업부 매출 삭제"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 사업부 매출 요약 */}
                {formData.businessUnits.length > 0 && (
                  <div className="mt-3 rounded-lg bg-green-50 p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-700">
                        총 사업부 매출: {formData.businessUnits.length}건
                      </span>
                      <span className="text-green-700">
                        총 금액:{' '}
                        {formData.businessUnits
                          .reduce((sum, unit) => {
                            const amount = parseFloat(
                              String(unit.amount || 0).replace(/,/g, ''),
                            );
                            return sum + amount;
                          }, 0)
                          .toLocaleString()}
                        원
                      </span>
                    </div>

                    {/* 사업부별 요약 */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {businessUnitOptions.map((dept) => {
                        const deptUnits = formData.businessUnits.filter(
                          (unit) => unit.businessUnit === dept.id,
                        );
                        const deptTotal = deptUnits.reduce((sum, unit) => {
                          const amount = parseFloat(
                            String(unit.amount || 0).replace(/,/g, ''),
                          );
                          return sum + amount;
                        }, 0);

                        if (deptTotal > 0) {
                          return (
                            <span
                              key={dept.id}
                              className={`rounded-full px-2 py-1 text-xs font-medium ${dept.color}`}
                            >
                              {dept.name}: {deptTotal.toLocaleString()}원 (
                              {deptUnits.length}건)
                            </span>
                          );
                        }
                        return null;
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {formData.salesCustomers.map((customer, index) => (
                    <div
                      key={customer.id || index}
                      className="rounded-lg border border-gray-200 p-3"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-700">
                                매출처명
                              </label>
                              {formData.isSameCustomer ? (
                                <div className="flex items-center rounded-lg bg-green-50 px-3 py-2">
                                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                                  <span className="text-sm text-green-700">
                                    {customer.name}
                                  </span>
                                </div>
                              ) : (
                                <select
                                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  value={customer.id || ''}
                                  onChange={(e) => {
                                    const selected = customerOptions.find(
                                      (c) => c.id === parseInt(e.target.value),
                                    );
                                    updateSalesCustomer(
                                      index,
                                      'id',
                                      selected?.id,
                                    );
                                    updateSalesCustomer(
                                      index,
                                      'name',
                                      selected?.name,
                                    );
                                  }}
                                >
                                  <option value="">매출처 선택</option>
                                  {customerOptions.map((option) => (
                                    <option key={option.id} value={option.id}>
                                      {option.name}
                                    </option>
                                  ))}
                                </select>
                              )}
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-700">
                                매출금액
                              </label>
                              <input
                                type="text"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="0"
                                value={customer.amount}
                                onChange={(e) =>
                                  updateSalesCustomer(
                                    index,
                                    'amount',
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-700">
                                결제구분 *
                              </label>
                              <select
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                value={customer.paymentType || ''}
                                onChange={(e) =>
                                  updateSalesCustomer(
                                    index,
                                    'paymentType',
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="">선택하세요</option>
                                <option value="lump_sum">일시불</option>
                                <option value="advance">선금</option>
                                <option value="interim">중도금</option>
                                <option value="balance">잔금</option>
                              </select>
                            </div>
                          </div>
                          <div className="mt-3">
                            <div>
                              <label className="mb-1 block text-xs font-medium text-gray-700">
                                분담비율 (%)
                              </label>
                              <input
                                type="number"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="0"
                                min="0"
                                max="100"
                                value={customer.ratio}
                                onChange={(e) =>
                                  updateSalesCustomer(
                                    index,
                                    'ratio',
                                    parseInt(e.target.value) || 0,
                                  )
                                }
                                disabled={formData.isSameCustomer}
                              />
                              {formData.isSameCustomer && (
                                <p className="mt-1 text-xs text-gray-500">
                                  동일 고객사는 비율 설정 불필요
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {!formData.isSameCustomer &&
                          formData.salesCustomers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSalesCustomer(index)}
                              className="ml-3 rounded-lg p-2 text-red-500 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}

                        {formData.isSameCustomer &&
                          formData.salesCustomers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeSalesCustomer(index)}
                              className="ml-3 rounded-lg p-2 text-red-500 hover:bg-red-50"
                              title="결제구분 삭제"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                      </div>
                    </div>
                  ))}
                </div>

                {formData.salesCustomers.length > 0 && (
                  <div className="mt-3 rounded-lg bg-blue-50 p-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700">
                        {formData.isSameCustomer
                          ? '총 결제구분'
                          : '총 분담비율'}
                        :
                        {formData.isSameCustomer
                          ? ` ${formData.salesCustomers.length}건`
                          : ` ${formData.salesCustomers.reduce(
                              (sum, customer) => sum + (customer.ratio || 0),
                              0,
                            )}%`}
                      </span>
                      {formData.isSameCustomer && (
                        <span className="text-blue-700">
                          총 금액:{' '}
                          {formData.salesCustomers
                            .reduce((sum, customer) => {
                              const amount = parseFloat(
                                String(customer.amount || 0).replace(/,/g, ''),
                              );
                              return sum + amount;
                            }, 0)
                            .toLocaleString()}
                          원
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="border-t px-6 py-4">
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                등록
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 사용 예시 컴포넌트
const SalesManagement = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">매출 관리</h1>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          매출 등록
        </button>
      </div>

      <SalesRegistrationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
};

export default SalesManagement;
