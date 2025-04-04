import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closeDrawer, setDrawer } from '../../../store/slices/uiSlice';
// import { transformSearchParams } from '../utils/transformSearchParams';
import dayjs from 'dayjs';

/**
 * SFA DRAWER 기능을 관리하는 훅
 */
export const useSfaDrawer = () => {
  const dispatch = useDispatch();

  const setDrawerClose = () => {
    dispatch(closeDrawer());
  };

  const handleSetDrawer = (payload) => {
    dispatch(setDrawer(payload));
  };

  return {
    setDrawerClose,
    handleSetDrawer,
  };
};
