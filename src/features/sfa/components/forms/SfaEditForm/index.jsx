import React, { useState, useEffect } from 'react';
import { CustomerSearchInput } from '../../../../../shared/components/customer/CustomerSearchInput';
import { Edit2, Check, X } from 'lucide-react';
import {
  Form,
  FormItem,
  Group,
  Label,
  Input,
  Select,
  Button,
  Checkbox,
  Switch,
} from '../../../../../shared/components/ui';

/**
 * SFA 상세정보 수정 폼 컴포넌트
 * @param {Object} props
 * @param {Object} props.data - 초기 데이터
 * @param {Object} props.formData - 폼 데이터
 * @param {Object} props.errors - 에러 상태
 * @param {boolean} props.isSubmitting - 제출 중 상태
 * @param {Object} props.sfaSalesTypeData - 매출유형 데이터
 * @param {Function} props.handleCustomerSelect - 고객사 선택 핸들러
 * @param {Function} props.handleChange - 입력값 변경 핸들러
 * @param {Function} props.processSubmit - 제출 처리 핸들러
 */
const SfaEditForm = ({
  data,
  formData,
  errors,
  isSubmitting,
  sfaSalesTypeData,
  handleCustomerSelect,
  handleChange,
  processSubmit,
}) => {
  // 수정 중인 필드 상태 관리
  const [editingField, setEditingField] = useState(null);

  // 개별 필드 상태 관리
  const [fieldValues, setFieldValues] = useState({
    name: data?.name || '',
    sfaSalesType: data?.sfa_sales_type?.id || '',
    hasPartner: data?.has_partner || false,
    isProject: data?.is_project || false,
    sellingPartner: data?.selling_partner?.id || '',
  });

  // 필드 수정 시작
  const startEditing = (fieldName) => {
    setEditingField(fieldName);
  };

  // 필드 수정 취소
  const cancelEditing = () => {
    setEditingField(null);
    // 원래 값으로 복구
    setFieldValues({
      name: data?.name || '',
      sfaSalesType: data?.sfa_sales_type?.id || '',
      hasPartner: data?.has_partner || false,
      isProject: data?.is_project || false,
      sellingPartner: data?.selling_partner?.id || '',
    });
  };

  // 단일 필드 저장
  const saveField = async (fieldName) => {
    try {
      await processSubmit({
        ...formData,
        [fieldName]: fieldValues[fieldName],
      });
      setEditingField(null);
    } catch (error) {
      console.error('Failed to save field:', error);
    }
  };

  // 필드 값 변경 핸들러
  const handleFieldChange = (name, value) => {
    setFieldValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 인라인 에디팅 필드 렌더링
  const renderEditableField = (fieldName, label, Component, props = {}) => {
    const isEditing = editingField === fieldName;

    return (
      <FormItem className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded">
        <Label className="w-32 text-gray-600">{label}</Label>
        <div className="flex-1 flex items-center justify-between">
          {isEditing ? (
            <div className="flex-1 flex items-center gap-2">
              <Component
                name={fieldName}
                value={fieldValues[fieldName]}
                onChange={handleFieldChange}
                {...props}
              />
              <Button
                type="button"
                variant="ghost"
                className="text-green-500"
                onClick={() => saveField(fieldName)}
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-red-500"
                onClick={cancelEditing}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-between group">
              <span>{fieldValues[fieldName]}</span>
              <Button
                type="button"
                variant="ghost"
                className="opacity-0 group-hover:opacity-100"
                onClick={() => startEditing(fieldName)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </FormItem>
    );
  };

  return (
    <Form className="space-y-2">
      {/* 매출 기본 정보 */}
      {renderEditableField('name', '건명', (props) => (
        <Input
          type="text"
          {...props}
          onChange={(e) => props.onChange(props.name, e.target.value)}
        />
      ))}

      {renderEditableField('sfaSalesType', '매출유형', (props) => (
        <Select
          {...props}
          onChange={(e) => props.onChange(props.name, e.target.value)}
        >
          <option value="">선택하세요</option>
          {sfaSalesTypeData?.data?.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </Select>
      ))}

      {/* 파트너 정보 */}
      <FormItem className="flex items-center gap-4 p-2">
        <Label className="w-32 text-gray-600">매출파트너</Label>
        <div className="flex-1">
          <Group direction="horizontal">
            <Checkbox
              id="hasPartner"
              checked={fieldValues.hasPartner}
              onChange={(e) =>
                handleFieldChange('hasPartner', e.target.checked)
              }
            />
            {fieldValues.hasPartner && (
              <CustomerSearchInput
                name="sellingPartner"
                onSelect={(partner) =>
                  handleFieldChange('sellingPartner', partner.id)
                }
                value={fieldValues.sellingPartner}
                size="small"
              />
            )}
          </Group>
        </div>
      </FormItem>

      {/* 프로젝트 여부 */}
      <FormItem className="flex items-center gap-4 p-2">
        <Label className="w-32 text-gray-600">프로젝트</Label>
        <Switch
          checked={fieldValues.isProject}
          onChange={() =>
            handleFieldChange('isProject', !fieldValues.isProject)
          }
        />
      </FormItem>
    </Form>
  );
};

export default SfaEditForm;
