// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
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

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // Strict Mode 활성화 상태
  // <React.StrictMode>
  //   <Provider store={store}>
  //     <BrowserRouter>
  //       <App />
  //     </BrowserRouter>
  //   </Provider>
  // </React.StrictMode>,

  //Strict Mode 비활성화 상태
  <Provider store={store}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </Provider>,
);
