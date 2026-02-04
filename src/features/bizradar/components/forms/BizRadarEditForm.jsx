/**
 * BizRadar 수정 폼
 * 공고 정보 수정을 위한 폼 컴포넌트
 */
import React from 'react';
import { FaSave, FaUndo } from 'react-icons/fa';
import { useBizRadarStore } from '../../hooks/useBizRadarStore';
import { SUPPORT_TYPES } from '../../constants/initialState';

const BizRadarEditForm = ({ data, onSave, onCancel }) => {
  const { form, actions } = useBizRadarStore();

  // 필드 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    actions.form.updateField(name, value);
  };

  // 태그 변경 핸들러
  const handleTagsChange = (e) => {
    const value = e.target.value;
    const tagsArray = value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    actions.form.updateField('tags', tagsArray);
  };

  // 저장
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (onSave) {
      onSave(form.data);
    }
  };

  // 취소
  const handleCancel = () => {
    actions.form.reset();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 지원 유형 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          지원 유형
        </label>
        <select
          name="final_support_type"
          value={form.data.final_support_type || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">선택</option>
          {Object.entries(SUPPORT_TYPES).map(([key, value]) => (
            <option key={key} value={key}>
              {value.label} - {value.description}
            </option>
          ))}
        </select>
      </div>

      {/* 접수 상태 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          접수 상태
        </label>
        <select
          name="submission_status"
          value={form.data.submission_status || ''}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">선택</option>
          <option value="접수중">접수중</option>
          <option value="마감">마감</option>
          <option value="예정">예정</option>
        </select>
      </div>

      {/* 태그 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          태그
        </label>
        <input
          type="text"
          name="tags"
          value={
            Array.isArray(form.data.tags)
              ? form.data.tags.join(', ')
              : form.data.tags || ''
          }
          onChange={handleTagsChange}
          placeholder="쉼표로 구분하여 입력"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="mt-1 text-xs text-gray-500">쉼표(,)로 구분하여 입력하세요</p>
      </div>

      {/* 요약 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          요약
        </label>
        <textarea
          name="summary"
          value={form.data.summary || ''}
          onChange={handleChange}
          rows={5}
          placeholder="공고 내용 요약"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      {/* 에러 메시지 */}
      {form.errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
          {form.errors.submit}
        </div>
      )}

      {/* 버튼 */}
      <div className="flex justify-end gap-2 pt-4 border-t">
        <button
          type="button"
          onClick={handleCancel}
          disabled={form.isSubmitting}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FaUndo className="h-4 w-4" />
          취소
        </button>
        <button
          type="submit"
          disabled={form.isSubmitting || !form.isDirty}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <FaSave className="h-4 w-4" />
          {form.isSubmitting ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  );
};

export default BizRadarEditForm;
