/**
 * 기본 정보 섹션 컴포넌트
 * - View/Edit 모드 전환
 * - 인라인 편집 기능 제공
 */

import React from 'react';
import PropTypes from 'prop-types';
import { FileText } from 'lucide-react';
import { Button } from '@shared/components/ui';
import SfaDetailTable from '../../tables/SfaDetailTable.jsx';
import EditableSfaDetail from '../../tables/EditableSfaDetail.jsx';

const BasicInfoSection = ({
  data,
  isEditing,
  onStartEdit,
  onFinishEdit,
  onCancelEdit,
  onSaveField,
  showBox = true,
}) => {
  // 박스 제거 모드
  if (!showBox) {
    return (
      <div>
        {/* Section Title */}
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-5 w-5 text-gray-700" />
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">기본 정보</h2>
            <span className="px-2 py-0.5 text-xs font-mono font-medium bg-gray-100 text-gray-500 rounded border border-gray-200">
              ID: {data?.id || '-'}
            </span>
          </div>
          {isEditing && (
            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 rounded border border-blue-300">
              수정중
            </span>
          )}
        </div>

        {/* Section Content */}
        {isEditing ? (
          <EditableSfaDetail
            data={data}
            featureMode="editBase"
            onSaveComplete={onFinishEdit}
            onCancel={onCancelEdit}
            onSaveField={onSaveField}
          />
        ) : (
          <SfaDetailTable data={data} />
        )}
      </div>
    );
  }

  // 기존 박스 모드
  return (
    <section className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
      {/* Section Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200">
        <div className="flex items-center justify-between">
          {/* Left: Icon + Title */}
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-gray-600" />
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">기본 정보</h2>
              <span className="px-2 py-0.5 text-[10px] font-mono font-medium bg-gray-100 text-gray-500 rounded border border-gray-200">
                ID: {data?.id || '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Section Content */}
      <div className="p-6">
        {isEditing ? (
          <EditableSfaDetail
            data={data}
            featureMode="editBase"
            onSaveComplete={onFinishEdit}
            onCancel={onCancelEdit}
            onSaveField={onSaveField}
          />
        ) : (
          <SfaDetailTable data={data} />
        )}
      </div>
    </section>
  );
};

BasicInfoSection.propTypes = {
  data: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onStartEdit: PropTypes.func.isRequired,
  onFinishEdit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
  onSaveField: PropTypes.func,
  showBox: PropTypes.bool,
};

export default BasicInfoSection;
