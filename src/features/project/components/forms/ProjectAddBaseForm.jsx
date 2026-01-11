// src/features/project/components/forms/ProjectAddBaseForm.jsx
// 프로젝트 정보 입력을 위한 폼 컴포넌트 (XL 사이즈 최적화)

import React, { useState, useMemo, useEffect } from 'react';
import dayjs from 'dayjs';
import { apiCommon } from '../../../../shared/api/apiCommon';
import { CustomerSearchInput } from '../../../../shared/components/customer/CustomerSearchInput';
import { useSelectData } from '../../../../shared/hooks/useSelectData';
import { CREATABLE_PROJECT_STATUSES } from '../../constants/projectStatusConstants';
import { PROJECT_COST_CONSTANTS } from '../../constants/projectCostConstants';
import {
  FormItem,
  Label,
  Input,
  Select,
} from '../../../../shared/components/ui';

// 섹션 헤더 컴포넌트
const SectionTitle = ({ children }) => (
  <h3 className="col-span-12 text-lg font-bold text-indigo-800 mt-4 mb-2 border-b-2 border-indigo-50 pb-2">
    {children}
  </h3>
);

const ProjectAddBaseForm = ({ codebooks, formData, updateField }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [divisionProfitOptions, setDivisionProfitOptions] = useState([]);
  const [profitSummary, setProfitSummary] = useState({ total: 0, rate: 0 });
  const [localProfitSelectValue, setLocalProfitSelectValue] = useState('');
  const [isProfitAutoSelected, setIsProfitAutoSelected] = useState(false);

  // API 데이터 조회
  const { data: sfaData, isLoading: isSfaLoading } = useSelectData(
    apiCommon.getSfasByCustomer,
    selectedCustomerId,
  );
  const { data: teamsData } = useSelectData(apiCommon.getTeams);
  const { data: serviceData } = useSelectData(
    apiCommon.getCodebookItems,
    '서비스',
  );

  // 코드북 로드 완료 시 기본값(fy, importanceLevel) 자동 매핑 처리
  useEffect(() => {
    if (!codebooks) return;

    // 1. 사업년도(fy) 자동 설정 (SFA 로직 참조)
    if (codebooks.fy && (!formData.fy || !formData.fy.id)) {
      const currentYear = dayjs().year(); // 2026
      const fyCode = String(currentYear % 100); // "26"

      const matchingFy = codebooks.fy.find(
        (item) => item.code === fyCode
      );

      if (matchingFy) {
        updateField('fy', matchingFy);
      }
    }

    // 2. 중요도(importanceLevel) 자동 설정
    // ID가 121로 하드코딩 되어있으나 실제 DB값과 다를 수 있으므로, '중간'이라는 이름으로 찾아서 설정
    if (codebooks.importanceLevel && (!formData.importanceLevel || !formData.importanceLevel.id || formData.importanceLevel.name !== '중간')) {
       const mediumImportance = codebooks.importanceLevel.find(
         (item) => item.name === '중간' || item.code === 'medium'
       );
       
       if (mediumImportance) {
          // 현재 설정된 값과 다를 경우에만 업데이트
          if (!formData.importanceLevel || formData.importanceLevel.id !== mediumImportance.id) {
            updateField('importanceLevel', mediumImportance);
          }
       }
    }
  }, [codebooks, formData.fy, formData.importanceLevel, updateField]);

  // 컴포넌트 마운트 시 formData 기반 초기화 (이전 단계에서 돌아왔을 때)
  useEffect(() => {
    if (formData.customer?.id && !selectedCustomerId) {
      setSelectedCustomerId(formData.customer.id);
    }
  }, [formData.customer, selectedCustomerId]);

  // SFA 데이터 로드 시 초기화 로직 (이전 단계 복귀 시)
  useEffect(() => {
    if (sfaData?.data && formData.sfa && divisionProfitOptions.length === 0) {
      const selectedSfa = sfaData.data.find(s => s.id.toString() === formData.sfa.toString());
      if (selectedSfa) {
        processSfaData(selectedSfa);
      }
    }
  }, [sfaData, formData.sfa]);

  const processSfaData = (selectedSfa) => {
    if (selectedSfa && selectedSfa.sfa_by_payments) {
      let totalAmount = 0;
      let totalProfit = 0;
      const allocationMap = new Map();

      selectedSfa.sfa_by_payments.forEach(payment => {
        const amount = Number(payment.amount) || 0;
        const profit = Number(payment.profit_amount) || 0;
        totalAmount += amount;
        totalProfit += profit;

        if (payment.team_allocations) {
          try {
            const allocations = typeof payment.team_allocations === 'string' 
              ? JSON.parse(payment.team_allocations) 
              : payment.team_allocations;
            
            if (Array.isArray(allocations)) {
              allocations.forEach(alloc => {
                const key = `${alloc.team_name} (${alloc.item_name || '기타'})`;
                let ratio = Number(alloc.ratio || alloc.allocation_ratio || alloc.percent || 0);
                const allocatedAmount = Number(alloc.allocated_amount) || 0;

                if (ratio === 0 && amount > 0 && allocatedAmount > 0) {
                    ratio = (allocatedAmount / amount) * 100;
                }

                let allocProfit = Number(alloc.allocated_profit_amount) || 0;
                if (allocProfit === 0 && profit > 0 && ratio > 0) {
                    allocProfit = Math.round(profit * (ratio / 100));
                }
                
                if (allocationMap.has(key)) {
                  const current = allocationMap.get(key);
                  allocationMap.set(key, { 
                    profit: current.profit + allocProfit, 
                    amount: current.amount + allocatedAmount 
                  });
                } else {
                  allocationMap.set(key, { profit: allocProfit, amount: allocatedAmount });
                }
              });
            }
          } catch (err) {
            console.error('JSON Parse Error:', err);
          }
        }
      });

      const rate = totalAmount > 0 ? ((totalProfit / totalAmount) * 100).toFixed(1) : 0;
      setProfitSummary({ total: totalProfit, rate });

      const options = Array.from(allocationMap.entries()).map(([label, data]) => ({
        label: `${label} : ${data.profit.toLocaleString()}원`,
        value: `team|${data.profit}`,
        rawProfit: data.profit,
        rawAmount: data.amount
      }));
      
      options.unshift({ 
        label: `전체 합계 : ${totalProfit.toLocaleString()}원`, 
        value: `total|${totalProfit}`,
        rawProfit: totalProfit,
        rawAmount: totalAmount
      });

      setDivisionProfitOptions(options);
      
      // 복원 로직
      if (formData.revenueProfit) {
        // 정확한 매칭을 위해 rawProfit으로 찾음
        const matchingOption = options.find(opt => opt.rawProfit === Number(formData.revenueProfit));
        if (matchingOption) {
          setLocalProfitSelectValue(matchingOption.value);
        }
      }
    }
  };

  const sfaOptions = [
    { value: '', label: '선택하세요' },
    ...(sfaData?.data || []).map((sfa) => ({
      value: sfa?.id?.toString() || '',
      label: sfa?.fy?.name
        ? `(${sfa.fy.name})${sfa?.name || '이름 없음'}`
        : sfa?.name || '이름 없음',
    })),
  ];

  const teamOptions = [
    { id: '', name: '선택하세요' },
    ...(teamsData?.data || []).map((team) => ({
      id: team?.id?.toString() || '',
      code: team?.code?.toString() || '',
      name: team?.name || '이름 없음',
    })),
  ];

  const serviceOptions = [
    { id: '', name: '선택하세요' },
    ...(serviceData?.data?.[0]?.structure || []).map((item) => ({
      id: item?.id?.toString() || '',
      name: item?.name || '이름 없음',
    })),
  ];

  const projectTypeOptions = [
    { value: 'revenue', label: '매출' },
    { value: 'investment', label: '투자' },
  ];

  const workTypeOptions = [
    { value: '', label: '선택하세요' },
    { value: 'project', label: '프로젝트' },
    { value: 'task', label: '단순작업' },
    { value: 'maintenance', label: '유지보수' },
  ];

  const creatableStatuses = useMemo(() => {
    if (!codebooks?.pjtStatus) return [];
    return codebooks.pjtStatus.filter((status) =>
      CREATABLE_PROJECT_STATUSES.includes(status.name),
    );
  }, [codebooks?.pjtStatus]);

  const handleSfaChange = (e) => {
    const val = e.target.value;
    updateField('sfa', val);
    setIsProfitAutoSelected(false);

    const selectedSfa = sfaData?.data?.find(s => s.id.toString() === val);
    
    if (selectedSfa) {
      // 옵션 생성 및 데이터 처리
      // processSfaData는 상태 업데이트를 포함하므로, 여기서는 로직을 중복 호출하거나
      // processSfaData가 반환값을 주도록 해야 하지만, 상태 기반 설계를 유지하기 위해
      // 여기서는 processSfaData를 호출하고, 별도로 초기값을 설정함.
      
      // processSfaData 로직을 직접 수행하여 즉시 값 설정 (중복 방지 위해 함수 분리 고려 가능하나 일단 인라인 처리)
      if (selectedSfa.sfa_by_payments) {
        let totalAmount = 0;
        let totalProfit = 0;
        const allocationMap = new Map();

        selectedSfa.sfa_by_payments.forEach(payment => {
          const amount = Number(payment.amount) || 0;
          const profit = Number(payment.profit_amount) || 0;
          totalAmount += amount;
          totalProfit += profit;

          if (payment.team_allocations) {
            try {
              const allocations = typeof payment.team_allocations === 'string' 
                ? JSON.parse(payment.team_allocations) 
                : payment.team_allocations;
              
              if (Array.isArray(allocations)) {
                allocations.forEach(alloc => {
                  const key = `${alloc.team_name} (${alloc.item_name || '기타'})`;
                  let ratio = Number(alloc.ratio || alloc.allocation_ratio || alloc.percent || 0);
                  const allocatedAmount = Number(alloc.allocated_amount) || 0;

                  if (ratio === 0 && amount > 0 && allocatedAmount > 0) {
                      ratio = (allocatedAmount / amount) * 100;
                  }

                  let allocProfit = Number(alloc.allocated_profit_amount) || 0;
                  if (allocProfit === 0 && profit > 0 && ratio > 0) {
                      allocProfit = Math.round(profit * (ratio / 100));
                  }
                  
                  if (allocationMap.has(key)) {
                    const current = allocationMap.get(key);
                    allocationMap.set(key, { 
                      profit: current.profit + allocProfit, 
                      amount: current.amount + allocatedAmount 
                    });
                  } else {
                    allocationMap.set(key, { profit: allocProfit, amount: allocatedAmount });
                  }
                });
              }
            } catch (err) {
              console.error('JSON Parse Error:', err);
            }
          }
        });

        const rate = totalAmount > 0 ? ((totalProfit / totalAmount) * 100).toFixed(1) : 0;
        setProfitSummary({ total: totalProfit, rate });

        const options = Array.from(allocationMap.entries()).map(([label, data]) => ({
          label: `${label} : ${data.profit.toLocaleString()}원`,
          value: `team|${data.profit}`,
          rawProfit: data.profit,
          rawAmount: data.amount
        }));
        
        options.unshift({ 
          label: `전체 합계 : ${totalProfit.toLocaleString()}원`, 
          value: `total|${totalProfit}`,
          rawProfit: totalProfit,
          rawAmount: totalAmount
        });

        setDivisionProfitOptions(options);
        
        // 기본값 설정
        let defaultOption = options.length > 0 ? options[0] : null;
        
        if (formData.team?.name) {
          const match = options.find(opt => 
            opt.label.includes(formData.team.name) && !opt.label.startsWith('전체 합계')
          );
          if (match) {
              defaultOption = match;
              setIsProfitAutoSelected(true);
          }
        }
        
        if (defaultOption) {
          setLocalProfitSelectValue(defaultOption.value);
          updateField('revenueProfit', defaultOption.rawProfit);
          updateField('revenueAmount', defaultOption.rawAmount);
        }
      }
    } else {
      setDivisionProfitOptions([]);
      setProfitSummary({ total: 0, rate: 0 });
      setLocalProfitSelectValue('');
      setIsProfitAutoSelected(false);
      updateField('revenueProfit', '');
      updateField('revenueAmount', '');
    }
  };

  useEffect(() => {
    if (formData.team?.name && divisionProfitOptions.length > 0) {
      const selectedTeamName = formData.team.name;
      
      const matchingOption = divisionProfitOptions.find(opt => 
        opt.label.includes(selectedTeamName) && !opt.label.startsWith('전체 합계')
      );

      if (matchingOption) {
        if (localProfitSelectValue !== matchingOption.value) {
            setLocalProfitSelectValue(matchingOption.value);
            updateField('revenueProfit', matchingOption.rawProfit);
            updateField('revenueAmount', matchingOption.rawAmount);
            setIsProfitAutoSelected(true);
        }
      } else {
        setIsProfitAutoSelected(false);
      }
    }
  }, [formData.team, divisionProfitOptions]);

  const handleProfitChange = (e) => {
    const selectedValue = e.target.value;
    setLocalProfitSelectValue(selectedValue);
    
    const selectedOption = divisionProfitOptions.find(opt => opt.value === selectedValue);
    if (selectedOption) {
        updateField('revenueProfit', selectedOption.rawProfit);
        updateField('revenueAmount', selectedOption.rawAmount);
    }
  };

  return (
    <div className="w-full px-2">
      <div className="grid grid-cols-12 gap-x-6 gap-y-6">
        {/* ================= 섹션 1: 프로젝트 실행 정보 ================= */}
        <SectionTitle>1. 프로젝트 실행 정보</SectionTitle>

        <div className="col-span-6">
          <FormItem direction="vertical">
            <Label required>프로젝트명</Label>
            <Input
              name="name"
              value={formData.name || ''}
              onChange={updateField}
              placeholder="예: 프로젝트 관리 시스템 구축"
              className="font-bold"
            />
          </FormItem>
        </div>

        <div className="col-span-3">
          <FormItem direction="vertical">
            <Label required>작업 유형</Label>
            <Select
              name="workType"
              value={formData.workType || ''}
              onChange={(e) => updateField('workType', e.target.value)}
            >
              {workTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        <div className="col-span-3">
          <FormItem direction="vertical">
            <Label>상태</Label>
            <Select
              name="pjtStatus"
              value={formData.pjtStatus?.id}
              onChange={(e) => {
                const val = e.target.value;
                updateField(
                  'pjtStatus',
                  creatableStatuses?.find((i) => i.id == val),
                );
              }}
            >
              {creatableStatuses?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        <div className="col-span-3">
          <FormItem direction="vertical">
            <Label required>사업부</Label>
            <Select
              name="team"
              value={formData.team?.id || ''}
              onChange={(e) => {
                const val = e.target.value;
                updateField(
                  'team',
                  teamOptions?.find((i) => i.id == val),
                );
              }}
            >
              {teamOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        <div className="col-span-3">
          <FormItem direction="vertical">
            <Label required>서비스</Label>
            <Select
              name="service"
              value={formData.service?.id || ''}
              onChange={(e) => {
                const val = e.target.value;
                updateField(
                  'service',
                  serviceOptions?.find((i) => i.id == val),
                );
              }}
            >
              {serviceOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        <div className="col-span-3">
          <FormItem direction="vertical">
            <Label required>사업년도</Label>
            <Select
              name="fy"
              value={formData.fy?.id}
              onChange={(e) => {
                const val = e.target.value;
                updateField(
                  'fy',
                  codebooks?.fy?.find((i) => i.id == val),
                );
              }}
            >
              <option value="">선택</option>
              {codebooks?.fy?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        <div className="col-span-3">
          <FormItem direction="vertical">
            <Label>중요도</Label>
            <Select
              name="importanceLevel"
              value={formData.importanceLevel?.id}
              onChange={(e) => {
                const val = e.target.value;
                updateField(
                  'importanceLevel',
                  codebooks?.importanceLevel?.find((i) => i.id == val),
                );
              }}
            >
              {codebooks?.importanceLevel?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        {/* ================= 섹션 2: 매출 및 고객 정보 ================= */}
        <SectionTitle>2. 매출 및 고객 정보</SectionTitle>

        <div className="col-span-6">
          <FormItem direction="vertical">
            <Label required>매출유형</Label>
            <Select
              name="projectType"
              value={formData.projectType || 'revenue'}
              onChange={(e) => {
                const value = e.target.value;
                updateField('projectType', value);
                updateField('sfa', '');
                updateField('revenueProfit', '');
                updateField('revenueAmount', '');
                setLocalProfitSelectValue('');
                setDivisionProfitOptions([]);
                setProfitSummary({ total: 0, rate: 0 });
                setIsProfitAutoSelected(false);
              }}
            >
              {projectTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        <div className="col-span-6">
          <FormItem direction="vertical">
            <Label required>고객사</Label>
            <CustomerSearchInput
              onSelect={(customer) => {
                setSelectedCustomerId(customer.id);
                updateField('customer', customer);
              }}
              size="small"
              initialValue={formData.customer?.name || ''} 
            />
          </FormItem>
        </div>

        <div className="col-span-4">
          <FormItem direction="vertical">
            <Label required={formData.projectType === 'revenue'}>
              SFA (매출기회)
            </Label>
            <Select
              name="sfa"
              value={formData.sfa || ''}
              onChange={handleSfaChange}
              disabled={formData.projectType === 'investment'}
            >
              {sfaOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {isSfaLoading && opt.value === '' ? '로딩 중...' : opt.label}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        <div className="col-span-4">
          <FormItem direction="vertical">
            <Label>매출액 (Amount)</Label>
            <Input
              value={formData.revenueAmount ? Number(formData.revenueAmount).toLocaleString() : ''}
              readOnly
              placeholder="0"
              className="bg-gray-50 text-right h-9"
            />
          </FormItem>
        </div>

        <div className="col-span-4">
          <FormItem direction="vertical">
            <Label required={formData.projectType === 'revenue'}>
              매출 이익 (Profit) 
              {profitSummary.total > 0 && (
                <span className="ml-2 text-xs">
                  <span className="text-blue-600 font-bold">{profitSummary.rate}%</span>
                  <span className="text-gray-400 mx-1">|</span>
                  <span className="text-green-600 font-bold">
                    {Math.floor(Number(formData.revenueProfit || 0) / PROJECT_COST_CONSTANTS.STANDARD_HOURLY_RATE).toLocaleString()}h 가용
                  </span>
                </span>
              )}
            </Label>
            <Select
              name="revenueProfit"
              value={localProfitSelectValue}
              onChange={handleProfitChange}
              disabled={formData.projectType === 'investment' || divisionProfitOptions.length === 0 || isProfitAutoSelected}
            >
              <option value="">선택하세요</option>
              {divisionProfitOptions.map((opt, idx) => (
                <option key={idx} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </FormItem>
        </div>

        {/* ================= 섹션 3: 기타 설정 ================= */}
        <SectionTitle>3. 기타 설정</SectionTitle>

        <div className="col-span-12">
          <FormItem direction="vertical">
            <Label>비고</Label>
            <Input
              name="remarks"
              value={formData.remarks || ''}
              onChange={updateField}
              placeholder="프로젝트 관련 특이사항이나 메모를 입력하세요."
            />
          </FormItem>
        </div>
      </div>
    </div>
  );
};

export default ProjectAddBaseForm;