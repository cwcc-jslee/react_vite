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
import { displayBusinessNumber } from '../../../../shared/services/businessNumberUtils';
import { useEditableField } from '../../hooks/useEditableField';
import ModalRenderer from '../../../../shared/components/ui/modal/ModalRenderer';
import useModal from '../../../../shared/hooks/useModal';

/**
 * 섹션별 인라인 편집이 가능한 고객사 상세 정보 컴포넌트
 */
const EditableCustomerDetailTable = ({
  codebooks,
  isLoadingCodebook,
  data,
  editable = true,
}) => {
  // const {
  //   data: codebooks,
  //   isLoading: isLoadingCodebook,
  //   error,
  // } = useCodebook([
  //   'co_classification',
  //   'business_scale',
  //   'co_funnel',
  //   'employee',
  //   'business_type',
  //   'region',
  // ]);

  const {
    editingSection,
    editedData,
    startEditing,
    cancelEditing,
    saveEditing,
    handleChange,
    handleBusinessNumberChange,
    handleAddFunnel,
    handleRemoveFunnel,
    handleMultiSelectChange,
    handleDeleteCustomer,
    selectedFunnel,
    setSelectedFunnel,
    suffixInput,
    setSuffixInput,
  } = useEditableField(data);

  if (!data) return null;

  // useModal 훅 사용
  const {
    modalState,
    openDeleteModal,
    openSuccessModal,
    openErrorModal,
    closeModal,
    handleConfirm,
  } = useModal();

  // // 삭제 확인 모달 표시 처리
  const confirmDeleteCustomer = (customerInfo) => {
    // 삭제 전 사용자 확인을 위한 모달 표시
    openDeleteModal(
      '고객사 삭제 확인',
      <div className="space-y-4">
        <p>
          다음 고객사 정보를 정말 삭제하시겠습니까? 이 작업은 되돌릴 수
          없습니다.
        </p>
        <div className="bg-gray-50 p-3 rounded border border-gray-200">
          <p>
            <strong>고객사 ID:</strong> {customerInfo.id}
          </p>

          <p>
            <strong>고객명:</strong> {data.name}
          </p>
        </div>
      </div>,
      customerInfo,
      handleDeleteCustomer, // 확인 시 실행할 삭제 함수
    );
  };

  // 코드북 기반 Select 필드 렌더링
  const renderSelectField = (name, codebookKey) => (
    <Select name={name} value={editedData[name] || ''} onChange={handleChange}>
      <option value="">선택하세요</option>
      {codebooks?.[codebookKey]?.map((item) => (
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
            {codebooks?.co_funnel?.map((item) => (
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
                handleAddFunnel(codebooks);
              }
            }}
          />
        </div>
        <Button
          type="button"
          onClick={() => handleAddFunnel(codebooks)}
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
                  value={editedData?.name || ''}
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
                  {codebooks?.business_type?.map((type) => (
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
                  {codebooks?.support_program?.map((program) => (
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
