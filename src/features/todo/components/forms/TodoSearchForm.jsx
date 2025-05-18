import React, { useState } from 'react';
import { CustomerSearchInput } from '@shared/components/customer/CustomerSearchInput';
import {
  Form,
  FormItem,
  Group,
  Label,
  Select,
  Button,
  Stack,
} from '@shared/components/ui/index';
import { useTodoStore } from '../../hooks/useTodoStore';
import { useProjectStore } from '../../../project/hooks/useProjectStore';
import { projectApiService } from '../../../project/services/projectApiService';
import { todoApiService } from '../../services/todoApiService';
import { convertKeysToCamelCase } from '@shared/utils/transformUtils';

// 초기 폼 데이터
const INIT_FORM_DATA = {
  customer: '',
  project: '',
};

const TodoSearchForm = ({ onSearchResult }) => {
  //   const { actions } = useTodoStore();
  //   const { actions: projectActions } = useProjectStore();
  const [searchFormData, setSearchFormData] = useState({
    ...INIT_FORM_DATA,
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [projects, setProjects] = useState([]);
  const [isFetching, setIsFetching] = useState(false);

  // 고객사 선택 핸들러
  const handleCustomerSelect = async (customer) => {
    setSelectedCustomer(customer);
    setSearchFormData((prev) => ({
      ...prev,
      customer: customer?.id || '',
      project: '', // 프로젝트 선택 초기화
    }));

    if (customer) {
      try {
        // 필터 조건
        const filters = {
          $and: [
            {
              $or: [
                { customer: { id: { $eq: customer?.id } } },
                { sfa: { customer: { id: { $eq: customer?.id } } } },
              ],
            },
            {
              pjt_status: { $in: [87, 88, 89] }, // 대기,진행중,검수
            },
          ],
        };

        const pagination = {
          current: 1,
          pageSize: 50,
        };

        setIsFetching(true);
        // 고객사별 프로젝트 목록 조회
        const response = await projectApiService.getProjectListName({
          pagination,
          filters,
        });

        // 응답 데이터를 프로젝트 목록에 설정
        if (response?.data) {
          setProjects(response.data);
        } else {
          setProjects([]);
        }
      } catch (error) {
        console.error('프로젝트 목록 조회 실패:', error);
        setProjects([]);
      } finally {
        setIsFetching(false);
      }
    } else {
      setProjects([]);
    }
  };

  // 프로젝트 선택 핸들러
  const handleProjectChange = async (e) => {
    const selectedProjectId = e.target.value;
    setSearchFormData((prev) => ({
      ...prev,
      project: selectedProjectId,
    }));

    if (selectedProjectId) {
      try {
        setIsFetching(true);
        const response = await todoApiService.getTodoList({
          pagination: {
            current: 1,
            pageSize: 50,
          },
          filters: {
            project: { id: { $eq: selectedProjectId } },
          },
        });

        // 검색 결과를 부모 컴포넌트로 전달
        if (response?.data) {
          const convertedData = convertKeysToCamelCase(response.data);
          onSearchResult(convertedData);
        } else {
          onSearchResult([]);
        }
      } catch (error) {
        console.error('작업 목록 조회 실패:', error);
        onSearchResult([]);
      } finally {
        setIsFetching(false);
      }
    } else {
      onSearchResult([]);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 mb-5">
      <Stack direction="horizontal" spacing="lg">
        <FormItem>
          <Label>고객사</Label>
          <CustomerSearchInput
            onSelect={handleCustomerSelect}
            size="small"
            value={selectedCustomer?.name || ''}
          />
        </FormItem>
        <FormItem>
          <Label>프로젝트</Label>
          <Select
            name="project"
            value={searchFormData.project}
            onChange={handleProjectChange}
            disabled={!selectedCustomer || isFetching}
          >
            <option value="">선택하세요</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </FormItem>
      </Stack>
    </div>
  );
};

export default TodoSearchForm;
