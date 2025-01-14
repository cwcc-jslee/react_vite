import React from 'react';
import { Table, Descriptions, Badge, Space, Divider, Button } from 'antd';

const ProjectTaskTable = ({ tasks }) => {
  console.log('>>>>>>>tasks', tasks);
  const dataSource = tasks
    ? tasks.map((task, index) => {
        return {
          key: task.id,
          no: index + 1,
          name: task.name,
          input_person: task.input_person,
          // plan_day: task.attributes.plan_day,
          // man_plan: (
          //   task.attributes.manpower * task.attributes.plan_day
          // ).toFixed(1),
          // total_day: task.attributes.total_time
          //   ? (
          //       (task.attributes.total_time + task.attributes.other_totaltime) /
          //       8
          //     ).toFixed(1)
          //   : 0,
          pjt_progress: task.pjt_progress ? task.pjt_progress : '시작전',
          last_workupdate: task.last_workupdate_date,
          revision: task.revision ? task.revision : 0,
          start_date: task.start_date
            ? task.start_date
            : `${task.plan_start_date}(계획)`,
          end_date: task.end_date
            ? task.end_date
            : `${task.plan_end_date}(계획)`,
        };
      })
    : '';
  const columns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
    },
    {
      title: 'task name',
      key: 'name',
      dataIndex: 'name',
    },
    {
      title: '시작일',
      key: 'start_date',
      dataIndex: 'start_date',
    },
    {
      title: '종료일',
      key: 'end_date',
      dataIndex: 'end_date',
    },
    {
      title: 'update',
      key: 'last_workupdate_date',
      dataIndex: 'last_workupdate_date',
    },
    {
      title: '참여인원',
      key: 'input_person',
      dataIndex: 'input_person',
    },
    {
      title: '계획',
      key: 'total_planning_time',
      dataIndex: 'total_planning_time',
    },
    {
      title: '작업시간',
      key: 'work_time',
      dataIndex: 'work_time',
    },
    // 2가지 type. 계획대비 작업..work progress
    {
      title: '진행률',
      key: 'pjt_progress',
      dataIndex: 'pjt_progress',
    },
    {
      title: 'Rev',
      key: 'revision',
      dataIndex: 'revision',
    },
  ];

  return (
    <>
      <h3>task</h3>
      <Table columns={columns} dataSource={dataSource} />
    </>
  );
};

export default ProjectTaskTable;
