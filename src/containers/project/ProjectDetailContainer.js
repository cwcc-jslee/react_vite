import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import fetchAllList from '../../lib/api/fetchAllList';
// import ProjectWorkListTable from '../../components/project/ProjectWorkListTable';
// import { qs_workallByPid, qs_changeallByPid } from '../../lib/api/queryProject';
import { Row, Col, Timeline, Button } from 'antd';
import { LeftSquareTwoTone } from '@ant-design/icons';
// import ProjectTimeline from '../../components/project/ProjectTimeline';
// import ProjectTaskTable from '../../components/project/ProjectTaskTable';
// import { changeSubMenu } from '../../modules/common';
import dayjs from 'dayjs';
import ProjectDetailDiscription from '../../components/project/ProjectDetailDiscription';
import * as qs from '../../lib/api/queryProject';
import * as api from '../../lib/api/api';
import jsonFormatOptimize from '../../modules/common/jsonFormatOptimize';
import { changeMode } from '../../modules/status';
import ProjectTaskTable from '../../components/project/ProjectTaskTable';

const Base = styled.div`
  width: 100%;
`;

const ProjectDetailContainer = ({ id }) => {
  // const arrno = pid_arrno.arrno;
  const dispatch = useDispatch();
  // const { id } = useParams();
  // 프로젝트 status 가져오기(진행중:2, 대기:5 ...)
  // const { pjt_status } = useSelector(({ project }) => ({
  //   pjt_status: project.status.id,
  // }));
  // const { project } = useSelector(({ project }) => ({
  //   project: project.data[pjt_status][arrno],
  // }));
  const [project, setProject] = useState();
  const [tasks, setTasks] = useState();
  const [works, setWorks] = useState();
  const [timeline, setTimeline] = useState();

  // console.log('999999999999999999>>projects', project);
  // console.log('999999999999999999>>pid', pid_arrno);

  // 프로젝트 정보, work list
  useEffect(() => {
    fetch_project(`api/projects/${id}`, qs.qs_projectdetail);
    // get_worklistall(`api/works`, qs_workallByPid, setWorks);
    // get_changelistall(`api/project-changes`, qs_changeallByPid, setTimeline);
  }, []);

  const fetch_project = async (path, query) => {
    const request = await api.getQueryString(path, query());
    const req_data = request.data.data;
    // console.log('999999999999999999>>tasks', request);
    const tasks = req_data.attributes.project_tasks.data;
    delete req_data.attributes.project_tasks;

    const opt_project = jsonFormatOptimize([req_data]);
    const opt_tasks = jsonFormatOptimize(tasks);
    // console.log('999999999999999999>>project', opt_project);
    // console.log('999999999999999999>>tasks', opt_tasks);
    setProject(opt_project[0]);
    setTasks(opt_tasks);
  };

  const get_worklistall = async (path, query, callback) => {
    try {
      const request = await fetchAllList({ path: path, qs: query, id: id });
      console.log(`<<<<< ${path} >>>>>>`, request);

      const work_array = request.map((v) => {
        const list = v.attributes;
        const _task = list.project_task.data.attributes.cus_task
          ? list.project_task.data.attributes.cus_task
          : list.project_task.data.attributes.code_task.data.attributes.name;
        return {
          key: v.id,
          id: v.id,
          task: _task,
          progress: list.code_progress.data.attributes.code,
          revision: list.revision ? list.revision : 0,
          workingDay: list.working_day,
          workingTime: list.working_time,
          otherTime: list.other_time,
          worker: list.users_permissions_user.data.attributes.username,
          description: list.description,
        };
      });

      callback(work_array);
    } catch (error) {
      console.error(error);
    }
  };

  const get_changelistall = async (path, query, callback) => {
    try {
      const request = await fetchAllList({ path: path, qs: query, id: id });
      console.log(`<<<<< ${path} >>>>>>`, request);
      const time_array = request.map((v) => {
        const list = v.attributes;
        let _type;
        let _color = 'green';
        let _change = list.change;
        const _date = list.date
          ? dayjs(list.date).format('YYYY-MM-DD').toString()
          : dayjs(list.createdAt).format('YYYY-MM-DD').toString();
        if (list.type === 'init') {
          _type = '생성';
          _color = 'red';
        }
        if (list.type === 'code_status') {
          _type = '상태';
          _color = 'red';
        }
        if (list.type === 'state_100') {
          _type = '작업';
        }
        if (
          list.type === 'plan_startdate' ||
          list.type === 'plan_enddate' ||
          list.type === 'startdate' ||
          list.type === 'enddate' ||
          list.type === 'description' ||
          list.type === 'price' ||
          list.type === 'contracted'
        ) {
          _type = '변경';
          _change = `${list.type}, ${list.change}`;
        }
        //
        return {
          id: v.id,
          color: _color,
          children: `[${_type}: ${_date}] ${_change}`,
        };
      });
      setTimeline(time_array);
    } catch (error) {
      console.error(error);
    }
  };

  // <-- tasks

  // tasks -->

  return (
    <Base>
      <div>
        <Row>
          <LeftSquareTwoTone
            onClick={() => dispatch(changeMode('default'))}
            style={{ fontSize: '30px', color: '#08c' }}
          />
          {project ? <ProjectDetailDiscription project={project} /> : ''}
        </Row>
        <Row gutter={16}>
          <Col span={18}>
            <ProjectTaskTable tasks={tasks} />
          </Col>
          {/* <Col span={6}>
            <h3>Time line</h3>
            {timeline ? <ProjectTimeline timeline={timeline} /> : ''}
          </Col> */}
        </Row>
      </div>
      {/* <ProjectWorkListTable dataSource={works} /> */}
    </Base>
  );
};

export default ProjectDetailContainer;
