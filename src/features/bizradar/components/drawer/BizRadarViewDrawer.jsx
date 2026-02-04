/**
 * BizRadar 상세 보기 드로어
 * 공고의 전체 정보를 표시하고 수정 기능 제공
 */
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import {
  FaTimes,
  FaExternalLinkAlt,
  FaEdit,
  FaSave,
  FaUndo,
} from 'react-icons/fa';
import { setDrawer } from '@/store/slices/uiSlice';
import { useBizRadarStore } from '../../hooks/useBizRadarStore';
import {
  SUPPORT_TYPES,
  SUPPORT_TYPE_COLORS,
  CONFIDENCE_LEVELS,
  SUBMISSION_STATUS,
} from '../../constants/initialState';

// 정보 행 컴포넌트
const InfoRow = ({ label, value, children }) => (
  <div className="py-2 border-b border-gray-100">
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className="mt-1 text-sm text-gray-900">{children || value || '-'}</dd>
  </div>
);

// 뱃지 컴포넌트
const Badge = ({ colorClass, children }) => (
  <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
    {children}
  </span>
);

// 태그 표시 컴포넌트
const TagList = ({ tags }) => {
  if (!tags || tags.length === 0) return <span className="text-gray-400">없음</span>;

  const tagArray = Array.isArray(tags) ? tags : JSON.parse(tags);

  return (
    <div className="flex flex-wrap gap-1">
      {tagArray.map((tag, index) => (
        <span
          key={index}
          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
        >
          {tag}
        </span>
      ))}
    </div>
  );
};

const BizRadarViewDrawer = ({ visible, mode, data, onClose }) => {
  const dispatch = useDispatch();
  const { actions, form } = useBizRadarStore();
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [editData, setEditData] = useState({});

  // 데이터 초기화
  useEffect(() => {
    if (data) {
      setEditData({
        tags: data.tags || [],
        summary: data.summary || '',
        submission_status: data.submission_status || '',
        final_support_type: data.final_support_type || '',
      });
    }
  }, [data]);

  // 모드 변경 시 편집 상태 업데이트
  useEffect(() => {
    setIsEditing(mode === 'edit');
  }, [mode]);

  if (!visible || !data) return null;

  // 편집 모드 전환
  const handleToggleEdit = () => {
    if (isEditing) {
      // 취소 - 원본 데이터로 복원
      setEditData({
        tags: data.tags || [],
        summary: data.summary || '',
        submission_status: data.submission_status || '',
        final_support_type: data.final_support_type || '',
      });
    }
    setIsEditing(!isEditing);
    dispatch(
      setDrawer({
        visible: true,
        type: 'bizradar',
        mode: isEditing ? 'view' : 'edit',
        data: data,
        width: 'lg',
      })
    );
  };

  // 필드 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  // 태그 변경
  const handleTagsChange = (e) => {
    const value = e.target.value;
    // 쉼표로 구분된 문자열을 배열로 변환
    const tagsArray = value
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag);
    setEditData((prev) => ({ ...prev, tags: tagsArray }));
  };

  // 저장
  const handleSave = async () => {
    try {
      await actions.data.update(data.id, editData);
      setIsEditing(false);
      dispatch(
        setDrawer({
          visible: true,
          type: 'bizradar',
          mode: 'view',
          data: { ...data, ...editData },
          width: 'lg',
        })
      );
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  // URL 열기
  const handleOpenUrl = () => {
    if (data.url) {
      window.open(data.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* 드로어 패널 */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-2xl">
          <div className="flex h-full flex-col bg-white shadow-xl">
            {/* 헤더 */}
            <div className="flex items-center justify-between px-4 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-medium text-gray-900">공고 상세</h2>
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleToggleEdit}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      <FaUndo className="h-4 w-4" />
                      취소
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={form.isSubmitting}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <FaSave className="h-4 w-4" />
                      저장
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleToggleEdit}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <FaEdit className="h-4 w-4" />
                    수정
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* 본문 */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* 제목 */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {data.title}
                </h3>
                {data.url && (
                  <button
                    onClick={handleOpenUrl}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <FaExternalLinkAlt className="h-3 w-3" />
                    원본 페이지 열기
                  </button>
                )}
              </div>

              {/* 기본 정보 */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                  기본 정보
                </h4>
                <dl className="grid grid-cols-2 gap-x-4">
                  <InfoRow label="ID" value={data.id} />
                  <InfoRow label="출처" value={data.source} />
                  <InfoRow label="출처 ID" value={data.source_id} />
                  <InfoRow label="게시일" value={data.published_date} />
                  <InfoRow label="신청 시작일" value={data.start_date} />
                  <InfoRow label="신청 마감일" value={data.end_date} />
                  <InfoRow label="접수 상태">
                    {isEditing ? (
                      <select
                        name="submission_status"
                        value={editData.submission_status}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border rounded text-sm"
                      >
                        <option value="">선택</option>
                        <option value="접수중">접수중</option>
                        <option value="마감">마감</option>
                        <option value="예정">예정</option>
                      </select>
                    ) : (
                      data.submission_status && (
                        <Badge
                          colorClass={
                            SUBMISSION_STATUS[data.submission_status]?.color ||
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {data.submission_status}
                        </Badge>
                      )
                    )}
                  </InfoRow>
                </dl>
              </div>

              {/* 분석 결과 */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                  분석 결과
                </h4>
                <dl className="grid grid-cols-2 gap-x-4">
                  <InfoRow label="리드 유형">
                    {isEditing ? (
                      <select
                        name="final_support_type"
                        value={editData.final_support_type}
                        onChange={handleChange}
                        className="w-full px-2 py-1 border rounded text-sm"
                      >
                        <option value="">선택</option>
                        {Object.entries(SUPPORT_TYPES).map(([key, value]) => (
                          <option key={key} value={key}>
                            {key} - {value.description} ({value.detail})
                          </option>
                        ))}
                      </select>
                    ) : (
                      data.final_support_type && (
                        <div className="flex items-center gap-2">
                          <Badge
                            colorClass={
                              SUPPORT_TYPE_COLORS[data.final_support_type] ||
                              'bg-gray-100 text-gray-800'
                            }
                          >
                            {data.final_support_type}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {SUPPORT_TYPES[data.final_support_type]?.description}
                          </span>
                        </div>
                      )
                    )}
                  </InfoRow>
                  <InfoRow label="지역" value={data.region} />
                  <InfoRow label="신뢰도">
                    {data.confidence && (
                      <Badge
                        colorClass={
                          CONFIDENCE_LEVELS[data.confidence]?.color ||
                          'bg-gray-100 text-gray-800'
                        }
                      >
                        {CONFIDENCE_LEVELS[data.confidence]?.label ||
                          data.confidence}
                      </Badge>
                    )}
                  </InfoRow>
                  <InfoRow label="분석 모델" value={data.model} />
                  <InfoRow label="분석 단계" value={data.final_stage} />
                  <InfoRow label="분석 완료" value={data.final_analyzed_at} />
                </dl>
              </div>

              {/* 태그 */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                  태그
                </h4>
                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      name="tags"
                      value={
                        Array.isArray(editData.tags)
                          ? editData.tags.join(', ')
                          : editData.tags
                      }
                      onChange={handleTagsChange}
                      placeholder="쉼표로 구분하여 입력"
                      className="w-full px-3 py-2 border rounded text-sm"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      쉼표(,)로 구분하여 입력하세요
                    </p>
                  </div>
                ) : (
                  <TagList tags={data.tags} />
                )}
              </div>

              {/* 요약 */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wider">
                  요약
                </h4>
                {isEditing ? (
                  <textarea
                    name="summary"
                    value={editData.summary}
                    onChange={handleChange}
                    rows={5}
                    className="w-full px-3 py-2 border rounded text-sm"
                    placeholder="공고 내용 요약"
                  />
                ) : (
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {data.summary || '요약 정보가 없습니다.'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BizRadarViewDrawer;
