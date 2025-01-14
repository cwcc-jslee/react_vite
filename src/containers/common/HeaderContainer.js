import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Header from '../../components/common/Header';
import { logout } from '../../modules/auth';
import { getCodebook } from '../../modules/status';

const HeaderContainer = ({ title }) => {
  const { user } = useSelector(({ auth, common }) => ({
    user: auth.auth,
    // title: common.title,
  }));
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // 코드북 가져오기
  useEffect(() => {
    // dispatch(getCodebook());
  }, []);

  const onLogout = () => {
    dispatch(logout());
    try {
      sessionStorage.removeItem('user'); //세션 스토리지에서 user 제거
      navigate('/login'); //Login page 이동
    } catch (e) {
      console.log(e);
    }
  };
  return <Header user={user} title={title} onLogout={onLogout} />;
};

export default HeaderContainer;
