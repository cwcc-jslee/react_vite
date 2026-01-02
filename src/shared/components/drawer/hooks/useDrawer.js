/**
 * useDrawer Hook
 * Drawer 상태 관리를 위한 전용 Hook (useUiStore의 drawer 특화 버전)
 */

import { useSelector, useDispatch } from 'react-redux';
import { setDrawer, closeDrawer } from '../../../../store/slices/uiSlice';
import { useMemo, useCallback } from 'react';

/**
 * @typedef {import('../types/drawer.types').UseDrawerReturn} UseDrawerReturn
 */

/**
 * Drawer 상태와 액션을 관리하는 Hook
 *
 * @returns {UseDrawerReturn}
 *
 * @example
 * const { drawer, open, close, update, setMode } = useDrawer();
 *
 * // Drawer 열기
 * open({ mode: 'add', data: null });
 *
 * // Drawer 닫기
 * close();
 *
 * // 모드만 변경
 * setMode('edit');
 */
export const useDrawer = () => {
  const dispatch = useDispatch();

  // Redux에서 drawer 상태 조회
  const drawer = useSelector((state) => state.ui.drawer);

  // ==================== Actions ====================

  /**
   * Drawer 열기
   * @param {Object} config - Drawer 설정
   * @param {string} config.mode - Drawer 모드 (add, view, edit 등)
   * @param {*} [config.data] - Drawer에 전달할 데이터
   * @param {string} [config.type] - Drawer 타입
   * @param {Object} [config.options] - 추가 옵션
   * @param {string} [config.width] - Drawer 너비
   */
  const open = useCallback(
    (config) => {
      dispatch(
        setDrawer({
          visible: true,
          ...config,
        }),
      );
    },
    [dispatch],
  );

  /**
   * Drawer 닫기
   */
  const close = useCallback(() => {
    dispatch(closeDrawer());
  }, [dispatch]);

  /**
   * Drawer 상태 업데이트 (부분 업데이트)
   * @param {Object} config - 업데이트할 속성
   */
  const update = useCallback(
    (config) => {
      dispatch(setDrawer(config));
    },
    [dispatch],
  );

  /**
   * Drawer 모드 변경
   * @param {string} mode - 새로운 모드
   */
  const setMode = useCallback(
    (mode) => {
      dispatch(setDrawer({ mode }));
    },
    [dispatch],
  );

  /**
   * Drawer 데이터 설정
   * @param {*} data - 새로운 데이터
   */
  const setData = useCallback(
    (data) => {
      dispatch(setDrawer({ data }));
    },
    [dispatch],
  );

  /**
   * Drawer 너비 변경
   * @param {string} width - 새로운 너비
   */
  const setWidth = useCallback(
    (width) => {
      dispatch(setDrawer({ width }));
    },
    [dispatch],
  );

  /**
   * Drawer 타입 설정
   * @param {string} type - Drawer 타입
   */
  const setType = useCallback(
    (type) => {
      dispatch(setDrawer({ type }));
    },
    [dispatch],
  );

  /**
   * Drawer 옵션 설정
   * @param {Object} options - 추가 옵션
   */
  const setOptions = useCallback(
    (options) => {
      dispatch(setDrawer({ options }));
    },
    [dispatch],
  );

  // ==================== Memoized Actions ====================
  const actions = useMemo(
    () => ({
      open,
      close,
      update,
      setMode,
      setData,
      setWidth,
      setType,
      setOptions,
    }),
    [open, close, update, setMode, setData, setWidth, setType, setOptions],
  );

  // ==================== Return ====================
  return {
    drawer,
    ...actions, // actions를 직접 펼쳐서 반환 (편의성)
    actions,    // actions 객체도 함께 제공 (호환성)
  };
};

export default useDrawer;
