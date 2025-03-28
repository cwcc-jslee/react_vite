// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
// import { store } from './app/store';
import { store } from './store';
import App from './app/App';
import { restoreAuth } from './features/auth/store/authSlice';
import './index.css';

const restoreUserSession = () => {
  try {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      store.dispatch(restoreAuth(JSON.parse(storedUser)));
    }
  } catch (error) {
    console.error('Failed to restore user session:', error);
  }
};

restoreUserSession();

// RouterWrapper 컴포넌트 생성
const RouterWrapper = () => (
  // Strict Mode 활성화 상태
  // <React.StrictMode>
  //   <Provider store={store}>
  //     <BrowserRouter future={{ v7_startTransition: true }}>
  //       <App />
  //     </BrowserRouter>
  //   </Provider>
  // </React.StrictMode>,
  <Provider store={store}>
    <BrowserRouter future={{ v7_startTransition: true }}>
      <App />
    </BrowserRouter>
  </Provider>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<RouterWrapper />);
