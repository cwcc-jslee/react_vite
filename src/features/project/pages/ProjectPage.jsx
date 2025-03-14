import React from 'react';
import { ProjectProvider } from '../context/ProjectProvider';
import ProjectContainer from '../containers/ProjectContainer';

const ProjectPage = () => {
  return (
    <ProjectProvider>
      <ProjectContainer />
    </ProjectProvider>
  );
};

export default ProjectPage;
