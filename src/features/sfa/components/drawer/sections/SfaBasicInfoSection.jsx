/**
 * SFA 기본 정보 섹션 컴포넌트
 * - View/Edit 모드 전환
 * - 인라인 편집 기능 제공
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@shared/components/ui';
import SfaDetailTable from '../../tables/SfaDetailTable.jsx';
import EditableSfaDetail from '../../tables/EditableSfaDetail.jsx';

const SfaBasicInfoSection = ({
  data,
  isEditing,
  onStartEdit,
  onFinishEdit,
  onCancelEdit,
}) => {
  return (
    <section className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Section Header */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-base font-semibold text-gray-800">기본 정보</h2>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onFinishEdit}
              className="h-8 px-3 text-gray-600 hover:text-gray-900"
            >
              완료
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onStartEdit}
              className="h-8 px-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
            >
              수정하기
            </Button>
          )}
        </div>
      </div>

      {/* Section Content */}
      <div className="p-4">
        {isEditing ? (
          <EditableSfaDetail
            data={data}
            featureMode="editBase"
            onSaveComplete={onFinishEdit}
            onCancel={onCancelEdit}
          />
        ) : (
          <SfaDetailTable data={data} />
        )}
      </div>
    </section>
  );
};

SfaBasicInfoSection.propTypes = {
  data: PropTypes.object.isRequired,
  isEditing: PropTypes.bool.isRequired,
  onStartEdit: PropTypes.func.isRequired,
  onFinishEdit: PropTypes.func.isRequired,
  onCancelEdit: PropTypes.func.isRequired,
};

export default SfaBasicInfoSection;
