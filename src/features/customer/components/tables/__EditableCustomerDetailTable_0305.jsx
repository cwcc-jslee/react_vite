// src/features/customer/components/tables/EditableCustomerDetailTable.jsx
import React, { useState } from 'react';
import * as Icons from 'lucide-react';
import { useCodebook } from '../../../../shared/hooks/useCodebook';
import {
  Description,
  DescriptionRow,
  DescriptionItem,
  Badge,
  Input,
  Select,
  Button,
  TextArea,
  Checkbox,
  Group,
} from '../../../../shared/components/ui/index';
import {
  displayBusinessNumber,
  formatBusinessNumber,
  normalizeBusinessNumber,
} from '../../../../shared/services/businessNumberUtils';
import { isEqual } from '../../../../shared/utils/objectUtils';
import useFormValidation from '../../hooks/useFormValidation';
import { customerSubmitService } from '../../services/customerSubmitService';
import { useCustomer } from '../../context/CustomerProvider';
import ModalRenderer from '../../../../shared/components/ui/modal/ModalRenderer';
import useModal from '../../../../shared/hooks/useModal';

/**
 * 섹션별 인라인 편집이 가능한 고객사 상세 정보 컴포넌트
 */
const EditableCustomerDetailTable = ({ data, editable = true }) => {
  // // 수정 중인 섹션 상태 관리
  // const [editingSection, setEditingSection] = useState(null);
  // // 수정 중인 필드 데이터 관리
  // const [editedData, setEditedData] = useState({});
  // // 초기 데이터 백업 (변경점 비교용)
  // const [originalSectionData, setOriginalSectionData] = useState({});
  // // 유입경로 입력을 위한 상태
  // const [selectedFunnel, setSelectedFunnel] = useState('');
  // const [suffixInput, setSuffixInput] = useState('');

  const {
    data: codebooks,
    isLoading: isLoadingCodebook,
    error,
  } = useCodebook([
    'co_classification',
    'business_scale',
    'co_funnel',
    'employee',
    'business_type',
    'region',
  ]);

  const { validateSectionFields } = useFormValidation();
  const { setDrawerClose, fetchCustomerDetail, fetchCustomerList } =
    useCustomer();

  if (!data) return null;

  // 변경된 필드만 추출하는 함수
  const getChangedFields = () => {
    const changes = {};

    // 필드 매핑 (프론트엔드 필드명 -> 백엔드 필드명)
    const fieldMapping = {
      coClassification: 'co_classification',
      businessScale: 'business_scale',
      businessNumber: 'business_number',
      businessType: 'business_type',
      commencementDate: 'commencement_date',
      representativeName: 'representative_name',
      funnel: 'funnel',
      supportPrograms: 'support_program',
    };

    // 각 필드 비교
    Object.keys(editedData).forEach((key) => {
      const originalKey = fieldMapping[key] || key;
      const originalValue =
        key === 'coClassification' || key === 'businessScale'
          ? originalSectionData[key]
          : originalSectionData[originalKey];

      if (!isEqual(editedData[key], originalValue)) {
        // 변경된 필드만 추가
        if (key === 'coClassification' || key === 'businessScale') {
          // ID 형태로 저장된 필드는 객체 형태로 변환
          changes[originalKey] = { id: editedData[key] };
        } else {
          changes[originalKey] = editedData[key];
        }
      }
    });

    return changes;
  };

  // useModal 훅 사용
  const {
    modalState,
    openDeleteModal,
    openSuccessModal,
    openErrorModal,
    closeModal,
    handleConfirm,
  } = useModal();

  // 섹션 편집 시작
  // startEditing 함수 수정 부분

  // // 섹션 편집 시작
  // const startEditing = (section) => {
  //   // 초기 편집 데이터 설정 - 데이터 구조 맞추기
  //   const initialEditData = {
  //     // 기본 필드 추가
  //     name: data.name,
  //     email: data.email,
  //     phone: data.phone,
  //     address: data.address,
  //     city: data.city,
  //     homepage: data.homepage,
  //     description: data.description,

  //     // 필드명 일관성 유지 (API 형식과 폼 필드명 매칭)
  //     coClassification: data.co_classification?.id,
  //     businessScale: data.business_scale?.id,
  //     businessNumber: data.business_number,
  //     businessType: data.business_type || [],
  //     commencementDate: data.commencement_date,
  //     representativeName: data.representative_name,
  //     funnel: data.funnel || [],
  //     supportPrograms: data.support_program || [],
  //     employee: data.employee?.id,
  //     region: data.region?.id,
  //   };

  //   // 초기 데이터 백업 (변경점 비교용)
  //   const originalData = {
  //     name: data.name,
  //     email: data.email,
  //     phone: data.phone,
  //     address: data.address,
  //     city: data.city,
  //     homepage: data.homepage,
  //     description: data.description,

  //     coClassification: data.co_classification?.id,
  //     businessScale: data.business_scale?.id,
  //     business_number: data.business_number,
  //     business_type: data.business_type || [],
  //     commencement_date: data.commencement_date,
  //     representative_name: data.representative_name,
  //     funnel: data.funnel || [],
  //     support_program: data.support_program || [],
  //     employee: data.employee?.id,
  //     region: data.region?.id,
  //   };

  //   console.log('편집 시작 - 초기 데이터:', initialEditData);
  //   console.log('전달 받은 data', data);

  //   setEditedData(initialEditData);
  //   setOriginalSectionData(originalData);
  //   setEditingSection(section);

  //   // 입력 필드 초기화
  //   setSelectedFunnel('');
  //   setSuffixInput('');
  // };

  // // 편집 취소
  // const cancelEditing = () => {
  //   setEditingSection(null);
  //   setEditedData({});
  //   setOriginalSectionData({});

  //   // 입력 필드 초기화
  //   setSelectedFunnel('');
  //   setSuffixInput('');
  // };

  // // 편집 저장
  // const saveEditing = async () => {
  //   try {
  //     // 변경된 필드만 추출
  //     const changedFields = getChangedFields();
  //     // 현재 편집 중인 섹션의 필드 검증
  //     const validation = validateSectionFields(editedData, editingSection);
  //     console.log(`폼검증 결과 : `, validation);
  //     if (!validation.isValid) {
  //       // 검증 실패 처리
  //       console.log('폼 검증 실패:', validation.errors);
  //       // setValidationErrors(validation.errors);
  //       notification.error({
  //         message: '입력 오류',
  //         description: '입력한 내용을 확인해주세요.',
  //       });
  //       return;
  //     }

  //     // 변경된 필드가 있는 경우에만 업데이트
  //     if (Object.keys(changedFields).length > 0) {
  //       // 업데이트할 데이터 생성
  //       // const updateData = {
  //       //   id: data.id, // 항상 ID는 포함
  //       //   documentId: data.documentId,
  //       //   ...changedFields,
  //       // };
  //       // 업데이트트
  //       console.log('변경된 필드만 업데이트:', changedFields);
  //       // onUpdate(updateData);
  //       await customerSubmitService.updateCustomerBase(
  //         data.documentId,
  //         changedFields,
  //       );

  //       // 상태 초기화
  //       setEditingSection(null);
  //       setEditedData({});
  //       setOriginalSectionData({});
  //       const updateData = await fetchCustomerDetail(data.id);
  //       setDrawer({ controlMode: 'view', data: updateData.data[0] });
  //     } else {
  //       console.log('변경된 필드가 없습니다.');
  //     }
  //   } catch (error) {
  //     // 에러처리리
  //   }
  // };

  // // 필드 값 변경 처리
  // const handleChange = (e) => {
  //   const { name, value } = e.target;
  //   setEditedData((prev) => ({
  //     ...prev,
  //     [name]: value,
  //   }));
  // };

  // // 사업자번호 입력 처리
  // const handleBusinessNumberChange = (e) => {
  //   const formattedValue = formatBusinessNumber(e.target.value);
  //   // 화면에는 형식이 적용된 값을 표시
  //   e.target.value = formattedValue;
  //   // 저장을 위해 정규화된 값을 form 데이터에 업데이트
  //   const normalizedValue = normalizeBusinessNumber(formattedValue);
  //   setEditedData((prev) => ({
  //     ...prev,
  //     businessNumber: normalizedValue,
  //   }));
  // };

  // // 다중 선택 필드 변경 처리 (체크박스)
  // const handleMultiSelectChange = (fieldName, item, isChecked) => {
  //   // 현재 선택된 항목 배열 가져오기 (없으면 빈 배열)
  //   const currentItems = editedData[fieldName] || [];

  //   let updatedItems;
  //   if (isChecked) {
  //     // 체크된 경우: 이미 있는지 확인 후 추가
  //     const exists = currentItems.some(
  //       (existingItem) => existingItem.id === item.id,
  //     );
  //     updatedItems = exists
  //       ? currentItems
  //       : [...currentItems, { id: item.id, name: item.name }];
  //   } else {
  //     // 체크 해제된 경우: 배열에서 제거
  //     updatedItems = currentItems.filter(
  //       (existingItem) => existingItem.id !== item.id,
  //     );
  //   }

  //   // 상태 업데이트
  //   setEditedData((prev) => ({
  //     ...prev,
  //     [fieldName]: updatedItems,
  //   }));
  // };

  // // 유입경로 추가
  // const handleAddFunnel = () => {
  //   if (!selectedFunnel) return;

  //   // 선택된 유입경로 정보 가져오기
  //   const funnelItem = codebooks?.co_funnel?.data?.find(
  //     (item) => String(item.id) === String(selectedFunnel),
  //   );

  //   if (!funnelItem) return;

  //   // 추가할 유입경로 객체 생성
  //   const newFunnel = {
  //     // id: funnelItem.id,
  //     name: funnelItem.name,
  //     suffix: suffixInput.trim(), // 입력된 suffix 추가
  //   };

  //   // 현재 유입경로 배열 가져오기
  //   const currentFunnels = [...(editedData.funnel || [])];

  //   // 업데이트된 배열로 상태 갱신
  //   setEditedData((prev) => ({
  //     ...prev,
  //     funnel: [...currentFunnels, newFunnel],
  //   }));

  //   // 입력 필드 초기화
  //   setSelectedFunnel('');
  //   setSuffixInput('');
  // };

  // // 유입경로 제거
  // const handleRemoveFunnel = (index) => {
  //   const currentFunnels = [...(editedData.funnel || [])];
  //   currentFunnels.splice(index, 1);

  //   setEditedData((prev) => ({
  //     ...prev,
  //     funnel: currentFunnels,
  //   }));
  // };

  // // 삭제 확인 모달 표시 처리
  // const confirmDeleteCustomer = (customerInfo) => {
  //   // 삭제 전 사용자 확인을 위한 모달 표시
  //   openDeleteModal(
  //     '고객사 삭제 확인',
  //     <div className="space-y-4">
  //       <p>
  //         다음 고객사 정보를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수
  //         없습니다.
  //       </p>
  //       <div className="bg-gray-50 p-3 rounded border border-gray-200">
  //         <p>
  //           <strong>고객사 ID:</strong> {customerInfo.id}
  //         </p>

  //         <p>
  //           <strong>고객명:</strong> {data.name}
  //         </p>
  //       </div>
  //     </div>,
  //     customerInfo,
  //     handleDeleteCustomer, // 확인 시 실행할 삭제 함수
  //   );
  // };

  // // 결제 매출 정보 삭제
  // const handleDeleteCustomer = async (customerInfo) => {
  //   console.log(`>> handlepayment delete : `, customerInfo.id);
  //   // notification 실행

  //   try {
  //     await customerSubmitService.deleteCustomer(customerInfo.documentId);
  //     // 성공 알림 표시
  //     openSuccessModal('삭제 완료', '고객 정보가 성공적으로 삭제되었습니다.');
  //     // 고객사 정보 & Drawer close
  //     fetchCustomerList();
  //     setDrawerClose();
  //   } catch (error) {
  //     // 실패 알림 표시
  //     openErrorModal(
  //       '삭제 실패',
  //       `고객 정보 삭제 중 오류가 발생했습니다: ${
  //         error.message || '알 수 없는 오류'
  //       }`,
  //     );
  //   }
  // };

  // 코드북 기반 Select 필드 렌더링
  const renderSelectField = (name, codebookKey) => (
    <Select name={name} value={editedData[name] || ''} onChange={handleChange}>
      <option value="">선택하세요</option>
      {codebooks?.[codebookKey]?.data?.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </Select>
  );

  // 섹션 편집 버튼 렌더링
  const renderSectionEditButton = (section) => {
    if (!editable) return null;

    if (editingSection === section) {
      return (
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={saveEditing}
            className="flex items-center justify-center h-7 w-7 rounded-sm hover:bg-green-100"
            title="저장"
          >
            <Icons.Check className="h-4 w-4 text-green-600" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={cancelEditing}
            className="flex items-center justify-center h-7 w-7 rounded-sm hover:bg-red-100"
            title="취소"
          >
            <Icons.X className="h-4 w-4 text-red-600" strokeWidth={2.5} />
          </button>
        </div>
      );
    }

    return (
      <button
        type="button"
        onClick={() => startEditing(section)}
        className="invisible group-hover:visible flex items-center justify-center h-7 w-7 rounded-sm hover:bg-blue-100"
        title="편집"
      >
        <Icons.Edit className="h-4 w-4 text-blue-600" strokeWidth={2.5} />
      </button>
    );
  };

  // 유입경로 인라인 입력 폼 렌더링
  const renderFunnelInputForm = () => {
    return (
      <div className="flex gap-2">
        <div className="flex-1">
          <Select
            value={selectedFunnel}
            onChange={(e) => setSelectedFunnel(e.target.value)}
          >
            <option value="">유입경로 선택</option>
            {codebooks?.co_funnel?.data?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex-1">
          <Input
            type="text"
            placeholder="상세 정보 입력 (예: 39기, 김해)"
            value={suffixInput}
            onChange={(e) => setSuffixInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && selectedFunnel) {
                e.preventDefault();
                handleAddFunnel();
              }
            }}
          />
        </div>
        <Button
          type="button"
          onClick={handleAddFunnel}
          disabled={!selectedFunnel}
          variant="outline"
          className="whitespace-nowrap"
        >
          추가
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 기본 정보 섹션 */}
      <div className="group">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium">기본 정보</h3>
          {renderSectionEditButton('basic')}
        </div>

        <Description>
          {/* 1행: 고객명, 기업분류 */}
          <DescriptionRow equalItems>
            <DescriptionItem label width="w-[140px]">
              고객명
            </DescriptionItem>
            <DescriptionItem>
              {editingSection === 'basic' ? (
                <Input
                  name="name"
                  value={editedData.name || ''}
                  onChange={handleChange}
                  className="w-full"
                />
              ) : (
                data.name || '-'
              )}
            </DescriptionItem>
            <DescriptionItem label width="w-[140px]">
              기업분류
            </DescriptionItem>
            <DescriptionItem>
              {editingSection === 'basic'
                ? renderSelectField('coClassification', 'co_classification')
                : data.co_classification?.name || '-'}
            </DescriptionItem>
          </DescriptionRow>

          {/* 2행: 기업규모, 사업자번호 */}
          <DescriptionRow equalItems>
            <DescriptionItem label width="w-[140px]">
              기업규모
            </DescriptionItem>
            <DescriptionItem>
              {editingSection === 'basic'
                ? renderSelectField('businessScale', 'business_scale')
                : data.business_scale?.name || '-'}
            </DescriptionItem>
            <DescriptionItem label width="w-[140px]">
              사업자번호
            </DescriptionItem>
            <DescriptionItem>
              {editingSection === 'basic' ? (
                <Input
                  name="businessNumber"
                  value={displayBusinessNumber(editedData.businessNumber || '')}
                  onChange={handleBusinessNumberChange}
                  className="w-full"
                  placeholder="000-00-00000"
                  maxLength={12}
                />
              ) : data.business_number ? (
                displayBusinessNumber(data.business_number)
              ) : (
                '-'
              )}
            </DescriptionItem>
          </DescriptionRow>
        </Description>
      </div>

      {/* 유입경로 섹션 */}
      <div className="group">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium">유입경로</h3>
          {renderSectionEditButton('funnel')}
        </div>

        <Description>
          <DescriptionRow>
            <DescriptionItem label width="w-[140px]">
              유입경로
            </DescriptionItem>
            <DescriptionItem className="flex-1">
              {editingSection === 'funnel' ? (
                <div className="space-y-4">
                  {/* 유입경로 입력 폼 */}
                  {renderFunnelInputForm()}

                  {/* 선택된 유입경로 표시 (Badge) */}
                  {editedData.funnel && editedData.funnel.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {editedData.funnel.map((funnel, index) => (
                        <Badge
                          key={index}
                          variant="info"
                          size="md"
                          className="flex items-center gap-1 pl-3 pr-2 py-1.5"
                        >
                          <span className="font-medium">{funnel.name}</span>
                          {funnel.suffix && (
                            <span className="text-blue-700">
                              - {funnel.suffix}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveFunnel(index)}
                            className="ml-1 text-blue-500 hover:text-red-500 focus:outline-none"
                            aria-label={`${funnel.name} 삭제`}
                          >
                            <Icons.X size={14} />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm italic mt-2">
                      등록된 유입경로가 없습니다. 위 폼에서 유입경로를
                      추가해주세요.
                    </p>
                  )}
                </div>
              ) : data.funnel && data.funnel.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {data.funnel.map((funnel, index) => (
                    <Badge
                      key={index}
                      variant="info"
                      size="md"
                      className="flex items-center gap-1 pl-3 pr-2 py-1.5"
                    >
                      <span className="font-medium">{funnel.name}</span>
                      {funnel.suffix && (
                        <span className="text-blue-700">- {funnel.suffix}</span>
                      )}
                    </Badge>
                  ))}
                </div>
              ) : (
                '-'
              )}
            </DescriptionItem>
          </DescriptionRow>
        </Description>
      </div>

      {/* 업체 정보 섹션 */}
      <div className="group">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium">업체 정보</h3>
          {renderSectionEditButton('company')}
        </div>

        <Description>
          {/* 4행: 업태, 종업원 */}
          <DescriptionRow equalItems>
            <DescriptionItem label width="w-[140px]">
              업태
            </DescriptionItem>
            <DescriptionItem>
              {editingSection === 'company' ? (
                <div className="flex flex-wrap items-center gap-4">
                  {codebooks?.business_type?.data?.map((type) => (
                    <div key={type.id} className="flex items-center space-x-2">
                      <Checkbox
                        name={`businessType_${type.id}`}
                        checked={editedData.businessType?.some(
                          (item) => item.id === type.id,
                        )}
                        onChange={(e) =>
                          handleMultiSelectChange(
                            'businessType',
                            { id: type.id, name: type.name },
                            e.target.checked,
                          )
                        }
                      />
                      <span className="text-sm">{type.name}</span>
                    </div>
                  ))}
                </div>
              ) : data.business_type && data.business_type.length > 0 ? (
                data.business_type.map((type) => type.name).join(', ')
              ) : (
                '-'
              )}
            </DescriptionItem>
            <DescriptionItem label width="w-[140px]">
              종업원
            </DescriptionItem>
            <DescriptionItem>
              {editingSection === 'company'
                ? renderSelectField('employee', 'employee')
                : data.employee?.name || '-'}
            </DescriptionItem>
          </DescriptionRow>

          {/* 5행: 설립일, 대표자 */}
          <DescriptionRow equalItems>
            <DescriptionItem label width="w-[140px]">
              설립일
            </DescriptionItem>
            <DescriptionItem>
              {editingSection === 'company' ? (
                <Input
                  type="date"
                  name="commencementDate"
                  value={editedData.commencementDate || ''}
                  onChange={handleChange}
                  className="w-full"
                />
              ) : data.commencement_date ? (
                new Date(data.commencement_date).toLocaleDateString()
              ) : (
                '-'
              )}
            </DescriptionItem>
            <DescriptionItem label width="w-[140px]">
              대표자
            </DescriptionItem>
            <DescriptionItem>
              {editingSection === 'company' ? (
                <Input
                  name="representativeName"
                  value={editedData.representativeName || ''}
                  onChange={handleChange}
                  className="w-full"
                />
              ) : (
                data.representative_name || '-'
              )}
            </DescriptionItem>
          </DescriptionRow>
        </Description>
      </div>

      {/* 연락처 섹션 */}
      <div className="group">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium">연락처</h3>
          {renderSectionEditButton('contact')}
        </div>

        <Description>
          {/* 6행: 홈페이지, 지역 */}
          <DescriptionRow equalItems>
            <DescriptionItem label width="w-[140px]">
              홈페이지
            </DescriptionItem>
            <DescriptionItem>
              {editingSection === 'contact' ? (
                <Input
                  type="url"
                  name="homepage"
                  value={editedData.homepage || ''}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="https://example.com"
                />
              ) : data.homepage ? (
                <a
                  href={data.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {data.homepage}
                </a>
              ) : (
                '-'
              )}
            </DescriptionItem>
            <DescriptionItem label width="w-[140px]">
              지역
            </DescriptionItem>
            <DescriptionItem>
              {editingSection === 'contact'
                ? renderSelectField('region', 'region')
                : data.region?.name || '-'}
            </DescriptionItem>
          </DescriptionRow>

          {/* 7행: 시/군/구, 상세주소 */}
          <DescriptionRow equalItems>
            <DescriptionItem label width="w-[140px]">
              시/군/구
            </DescriptionItem>
            <DescriptionItem>
              {editingSection === 'contact' ? (
                <Input
                  name="city"
                  value={editedData.city || ''}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="시/군/구"
                />
              ) : (
                data.city || '-'
              )}
            </DescriptionItem>
            <DescriptionItem label width="w-[140px]">
              상세주소
            </DescriptionItem>
            <DescriptionItem>
              {editingSection === 'contact' ? (
                <Input
                  name="address"
                  value={editedData.address || ''}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="상세주소를 입력하세요"
                />
              ) : (
                data.address || '-'
              )}
            </DescriptionItem>
          </DescriptionRow>
        </Description>
      </div>

      {/* 지원사업 섹션 */}
      <div className="group">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium">지원사업</h3>
          {renderSectionEditButton('support')}
        </div>

        <Description>
          <DescriptionRow>
            <DescriptionItem label width="w-[140px]">
              지원사업
            </DescriptionItem>
            <DescriptionItem className="flex-1">
              {editingSection === 'support' ? (
                <div className="flex flex-wrap items-center gap-4">
                  {/* 지원사업 옵션 */}
                  {codebooks?.support_program?.data?.map((program) => (
                    <div
                      key={program.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        name={`supportProgram_${program.id}`}
                        checked={editedData.supportPrograms?.some(
                          (item) => item.id === program.id,
                        )}
                        onChange={(e) =>
                          handleMultiSelectChange(
                            'supportPrograms',
                            { id: program.id, name: program.name },
                            e.target.checked,
                          )
                        }
                      />
                      <span className="text-sm">{program.name}</span>
                    </div>
                  ))}
                </div>
              ) : data.support_program && data.support_program.length > 0 ? (
                data.support_program.map((program) => program.name).join(', ')
              ) : (
                '-'
              )}
            </DescriptionItem>
          </DescriptionRow>
        </Description>
      </div>

      {/* 비고 섹션 */}
      <div className="group">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-md font-medium">비고</h3>
          {renderSectionEditButton('note')}
        </div>

        <Description>
          <DescriptionRow>
            <DescriptionItem label width="w-[140px]">
              비고
            </DescriptionItem>
            <DescriptionItem className="flex-1">
              {editingSection === 'note' ? (
                <TextArea
                  name="description"
                  value={editedData.description || ''}
                  onChange={handleChange}
                  className="w-full"
                  placeholder="비고 사항을 입력하세요"
                />
              ) : (
                data.description || '-'
              )}
            </DescriptionItem>
          </DescriptionRow>
        </Description>
      </div>
      <Group>
        <Button
          type="button"
          variant="primary"
          className="w-[120px] h-8 text-base font-medium bg-indigo-500 hover:bg-fuchsia-500"
          onClick={() =>
            confirmDeleteCustomer?.({
              documentId: data.documentId,
              id: data.id,
            })
          }
        >
          삭제
        </Button>
      </Group>
      {/* 모달 렌더러 컴포넌트 */}
      <ModalRenderer
        modalState={modalState}
        closeModal={closeModal}
        handleConfirm={handleConfirm}
      />
    </div>
  );
};

export default EditableCustomerDetailTable;
