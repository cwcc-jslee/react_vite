import React, { useState } from 'react';
import { Button, Table, Space, Spin, Row, Col, Descriptions } from 'antd';

const ProjectDetailDiscription = ({ project }) => {
  console.log('1111111>>>>>>>>>>>>>1111111', project);
  // const $ = project.attributes;

  return (
    <>
      <Row>
        <Descriptions
          title={`${project.id} - ${project.sfa.customer.data.attributes.name} > (sfa)${project.sfa.name} > ${project.name}`}
          bordered
          column={7}
          labelStyle={{ backgroundColor: '#d6e4ff' }}
          contentStyle={{ backgroundColor: '#f0f5ff' }}
        >
          <Descriptions.Item label="계획시작">
            {project.plan_start_date}
          </Descriptions.Item>
          <Descriptions.Item label="기준(일)">
            {/* {project.base_day} */}
          </Descriptions.Item>
          <Descriptions.Item label="계획(일)">
            {/* {project.total_plan} */}
          </Descriptions.Item>
          <Descriptions.Item label="상태">
            {/* {$.code_status.data.attributes.name} */}
          </Descriptions.Item>
          <Descriptions.Item label="issue">0</Descriptions.Item>
          <Descriptions.Item label="외주작업">NO</Descriptions.Item>
          <Descriptions.Item label="계약">
            {/* {$.contracted === true ? 'YES' : 'NO'} */}
          </Descriptions.Item>
          {/* <Descriptions.Item label="risk">10</Descriptions.Item>
           */}
          <Descriptions.Item label="시작일">
            {project.start_date}
          </Descriptions.Item>
          <Descriptions.Item label="최근작업">
            {project.last_workupdate_date}
          </Descriptions.Item>
          <Descriptions.Item label="작업(일)">
            {/* {project.total_work} */}
          </Descriptions.Item>
          <Descriptions.Item label="진행률">{`${project.project_progress} %`}</Descriptions.Item>
          <Descriptions.Item label="risk">0</Descriptions.Item>
          <Descriptions.Item label="외주비용"></Descriptions.Item>
          <Descriptions.Item label="금액"></Descriptions.Item>
          {/* <Descriptions.Item label="risk">10</Descriptions.Item>
           */}
          <Descriptions.Item label="완료예정">
            {project.plan_end_date}
          </Descriptions.Item>
          <Descriptions.Item label="완료일"></Descriptions.Item>
          <Descriptions.Item label="경과"></Descriptions.Item>
          <Descriptions.Item label="비 고" span={4}>
            {project.description}
          </Descriptions.Item>
        </Descriptions>
      </Row>
    </>
  );
};

export default ProjectDetailDiscription;
