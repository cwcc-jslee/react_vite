// src/features/work/pages/WorkPage.jsx
import React from 'react';
import { TodoProvider } from '../context/TodoProvider';
import TodoContainer from '../containers/TodoContainer';

const TodoPage = () => {
  return (
    <TodoProvider>
      <TodoContainer />
    </TodoProvider>
  );
};

export default TodoPage;
