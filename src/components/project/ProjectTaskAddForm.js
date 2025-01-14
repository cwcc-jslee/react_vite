import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { qs_coodbookTask } from '../../lib/api/queryProject';
import fetchAllListR1 from '../../lib/api/fetchAllListR1';

const TaskFormContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const TaskControls = styled.div`
  display: flex;
  gap: 12px;
  margin: 12px 0;

  button {
    padding: 8px 16px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: white;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: #f5f5f5;
      border-color: #999;
    }
  }
`;

const CustomTaskInput = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 4px;
  margin: 12px 0;

  span {
    min-width: 60px;
  }

  input {
    padding: 6px;
    border: 1px solid #ddd;
    border-radius: 4px;
    flex: 1;
    max-width: 300px;
  }

  .add-button .cancel-button {
    padding: 6px 12px;
    background: #666;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;

    &:hover {
      background: #555;
    }
  }
`;

const TaskItem = styled.div`
  padding: 8px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 1px 0;
  touch-action: none;

  .task-header {
    display: flex;
    align-items: center;
    padding-bottom: 6px;
    cursor: move;

    .taskName {
      font-weight: 500;
      margin-right: 12px;
    }
  }

  .task-inputs {
    display: flex;
    align-items: center;
    gap: 8px;

    label {
      display: flex;
      align-items: center;
      gap: 4px;
      white-space: nowrap;

      input[type='number'] {
        width: 80px;
        padding: 6px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }

      input[type='date'] {
        width: 150px;
        padding: 6px;
        border: 1px solid #ddd;
        border-radius: 4px;
      }
    }
  }

  &:hover {
    background: #f5f5f5;
  }
`;

const DeleteButton = styled.button`
  padding: 6px 12px;
  background: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
  min-width: 50px;
  height: 32px;

  &:hover {
    background: #ff0000;
  }
`;

const TaskList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 4px;

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 12px;
    background: white;
    border-radius: 4px;
    cursor: pointer;

    &:hover {
      background: #f0f0f0;
    }
  }
`;

const SortableTaskItem = ({ task, handleOnChange, onRemove }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: task.key.toString(),
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative',
    zIndex: transform ? 1 : 0,
  };

  return (
    <TaskItem ref={setNodeRef} style={style}>
      <div className="task-header" {...attributes} {...listeners}>
        <span className="taskName">{`${task.name}`}</span>
        <span>{`${task.sort}`}</span>
      </div>
      <div className="task-inputs">
        <label>
          인원:
          <input
            type="number"
            name="input_person"
            value={task.input_person || ''}
            data-task={task.name}
            required
            onChange={handleOnChange}
          />
        </label>
        <label>
          작업일:
          <input
            type="number"
            name="planning_day"
            value={task.planning_day || ''}
            data-task={task.name}
            required
            onChange={handleOnChange}
          />
        </label>
        <label>
          시작일:
          <input
            type="date"
            name="plan_start_date"
            value={task.plan_start_date || ''}
            data-task={task.name}
            required
            onChange={handleOnChange}
          />
        </label>
        <label>
          종료일:
          <input
            type="date"
            name="plan_end_date"
            value={task.plan_end_date || ''}
            data-task={task.name}
            required
            onChange={handleOnChange}
          />
        </label>
        <DeleteButton onClick={() => onRemove(task.key)}>삭제</DeleteButton>
      </div>
    </TaskItem>
  );
};

const ProjectTaskAddForm = (props) => {
  const { formTasksValue, setFormTasksValue, handleOnChange } = props;
  const [taskLists, setTaskLists] = useState([]);
  const [isCustomTask, setIsCustomTask] = useState(false);
  const tempTaskLists = useRef({});
  const tempAddCustomTaskObject = useRef({ sort: 999 });
  const [lastIndex, setLastIndex] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      setFormTasksValue((items) => {
        const oldIndex = items.findIndex(
          (item) => item.key.toString() === active.id,
        );
        const newIndex = items.findIndex(
          (item) => item.key.toString() === over.id,
        );

        if (oldIndex !== -1 && newIndex !== -1) {
          const newItems = arrayMove(items, oldIndex, newIndex);
          return newItems.map((item, index) => ({
            ...item,
            sort: index * 10 + 100,
          }));
        }
        return items;
      });
    }
  };

  const taskRemove = (key) => {
    const updatedTasks = formTasksValue.filter((arr) => arr.key !== key);
    setFormTasksValue(updatedTasks);
  };

  const handleOnclick = async (e) => {
    const query = qs_coodbookTask;
    const path = `api/codebook-tasks`;
    const get_codebook_tasks = await fetchAllListR1({
      qs: query,
      path: path,
      filter: { service: e.target.innerHTML },
    });
    setIsCustomTask(false);
    setTaskLists(get_codebook_tasks);
  };

  const handleAddTaskOnclick = () => {
    if (!tempAddCustomTaskObject.current.name) {
      alert('작업명을 입력해주세요.');
      return;
    }

    const newIndex = lastIndex + 1;
    const maxSort = Math.max(
      ...formTasksValue.map((task) => task.sort || 0),
      90,
    );

    const newTask = {
      ...tempAddCustomTaskObject.current,
      key: newIndex,
      sort: maxSort + 10,
    };

    setFormTasksValue([...formTasksValue, newTask]);
    setLastIndex(newIndex);

    // Reset
    tempAddCustomTaskObject.current = { sort: 999 };
    setIsCustomTask(false);
  };

  const handleCustomChange = (key, value) => {
    tempAddCustomTaskObject.current[key] = value;
  };

  const TaskLists = () => {
    const handleInputOnchange = (checked, value) => {
      if (checked) {
        tempTaskLists.current[value.name] = value;
      } else {
        delete tempTaskLists.current[value.name];
      }
    };

    return (
      <TaskList>
        {taskLists.map((list) => (
          <label key={list.id}>
            <input
              type="checkbox"
              name={list.attributes.name}
              value={list.attributes}
              onChange={(e) =>
                handleInputOnchange(e.target.checked, {
                  ...list.attributes,
                })
              }
            />
            {list.attributes.name}
          </label>
        ))}
      </TaskList>
    );
  };

  const CustomTask = () => {
    if (!isCustomTask) return null;

    const handleCancel = () => {
      setIsCustomTask(false);
      tempAddCustomTaskObject.current = { sort: 999 };
    };

    return (
      <CustomTaskInput>
        <span>작업명</span>
        <input
          onChange={(e) => handleCustomChange('name', e.target.value)}
          placeholder="작업명을 입력하세요"
          required
        />
        <button className="add-button" onClick={handleAddTaskOnclick}>
          추가
        </button>
        <button className="cancel-button" onClick={handleCancel}>
          취소
        </button>
      </CustomTaskInput>
    );
  };

  const TaskButton = () => (
    <TaskControls>
      <button type="button" onClick={handleOnclick}>
        디자인
      </button>
      <button type="button" onClick={handleOnclick}>
        영상
      </button>
      <button
        type="button"
        onClick={() => {
          setTaskLists([]);
          setIsCustomTask(true);
        }}
      >
        기타
      </button>
    </TaskControls>
  );

  return (
    <TaskFormContainer>
      <TaskButton />
      <hr />
      <TaskLists />
      <CustomTask />
      <hr />
      {formTasksValue.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={formTasksValue.map((task) => task.key.toString())}
            strategy={verticalListSortingStrategy}
          >
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {formTasksValue.map((task) => (
                <SortableTaskItem
                  key={task.key}
                  task={task}
                  handleOnChange={handleOnChange}
                  onRemove={taskRemove}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <h2>작업을 추가해주세요...</h2>
      )}
    </TaskFormContainer>
  );
};

export default ProjectTaskAddForm;
