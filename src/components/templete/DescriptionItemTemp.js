import { Descriptions } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const DescriptionItemTemp = (args) => {
  const { initialValues, editmode } = args;
  if (args.drawer.path === 'sfas') {
    return (
      <>
        <Descriptions bordered size={'middle'}>
          <Descriptions.Item label="매출유형">
            {initialValues.sfa_sales_type}
          </Descriptions.Item>
          <Descriptions.Item label="지원프로그램" span={2}>
            {/* {sales_profit.attributes.profit_margin} */}
          </Descriptions.Item>
          <Descriptions.Item label="고객사/매출처" span={2}>
            {initialValues.customer}
          </Descriptions.Item>
          <Descriptions.Item label="매출확정여부">
            Yes
            {/* {salesList.confirmed ? 'Yes' : 'No'} */}
          </Descriptions.Item>
          <Descriptions.Item label="건 명" span={2}>
            {initialValues.name}
          </Descriptions.Item>
          <Descriptions.Item label="프로젝트">
            {initialValues.isProject}
          </Descriptions.Item>
          <Descriptions.Item label="매출구분">
            {initialValues.sfa_classification}
          </Descriptions.Item>
          <Descriptions.Item label="매출품목/사업부" span={2}>
            {initialValues.sfa_item_price}
          </Descriptions.Item>
          <Descriptions.Item label="매 출">
            ----
            {/* {sales_profit.attributes.sales.toLocaleString('ko-KR')} */}
          </Descriptions.Item>
          <Descriptions.Item label="매출이익">
            ----
            {/* {sales_profit.attributes.sales_profit.toLocaleString('ko-KR')} */}
          </Descriptions.Item>
          <Descriptions.Item label="마진">
            {/* {sales_profit.attributes.profit_margin} */}
            --%
          </Descriptions.Item>

          <Descriptions.Item label="비 고">
            {initialValues.description}
          </Descriptions.Item>
        </Descriptions>
      </>
    );
  }
  if (args.drawer.path === 'programs') {
    if (initialValues.in_out === '내부') {
      return (
        <>
          <Descriptions bordered size={'middle'}>
            <Descriptions.Item label="ID">{initialValues.id}</Descriptions.Item>
            <Descriptions.Item label="내/외부">
              {initialValues.in_out}
            </Descriptions.Item>
            <Descriptions.Item label="프로그램명">
              {initialValues.name}
            </Descriptions.Item>
            <Descriptions.Item label="FY">{initialValues.fy}</Descriptions.Item>
            <Descriptions.Item label="상태">
              {initialValues.pgm_status}
            </Descriptions.Item>
            <Descriptions.Item label="서비스">
              {initialValues.service}
            </Descriptions.Item>
            <Descriptions.Item label="공고일">
              {initialValues.announcement_date}
            </Descriptions.Item>
            <Descriptions.Item label="신청기간">
              {initialValues.application_date}
            </Descriptions.Item>
            <Descriptions.Item label="사업기간">
              {initialValues.business_date}
            </Descriptions.Item>
            <Descriptions.Item label="결과발표">
              {initialValues.expected_result_date}
            </Descriptions.Item>
            <Descriptions.Item label="비 고">
              {initialValues.description}
            </Descriptions.Item>
          </Descriptions>
        </>
      );
    } else if (initialValues.in_out === '외부') {
      return (
        <>
          <Descriptions bordered size={'middle'}>
            <Descriptions.Item label="ID">{initialValues.id}</Descriptions.Item>
            <Descriptions.Item label="내/외부">
              {initialValues.in_out}
            </Descriptions.Item>
            <Descriptions.Item label="상위프로그램" span={2}>
              {initialValues.top_program}
            </Descriptions.Item>
            <Descriptions.Item label="프로그램명">
              {initialValues.name}
            </Descriptions.Item>
            <Descriptions.Item label="상세프로그램">
              {initialValues.name}
            </Descriptions.Item>
            <Descriptions.Item label="FY">{initialValues.fy}</Descriptions.Item>
            <Descriptions.Item label="상태">
              {initialValues.pgm_status}
            </Descriptions.Item>
            <Descriptions.Item label="서비스">
              {initialValues.service}
            </Descriptions.Item>
            <Descriptions.Item label="주무부처">
              {initialValues.lead_agency}
            </Descriptions.Item>
            <Descriptions.Item label="운영기관">
              {initialValues.operation_org}
            </Descriptions.Item>
            <Descriptions.Item label="공고일">
              {initialValues.announcement_date}
            </Descriptions.Item>
            <Descriptions.Item label="신청기간">
              {initialValues.application_date}
            </Descriptions.Item>
            <Descriptions.Item label="사업기간">
              {initialValues.business_date}
            </Descriptions.Item>
            <Descriptions.Item label="결과발표">
              {initialValues.expected_result_date}
            </Descriptions.Item>
            <Descriptions.Item label="비 고">
              {initialValues.description}
            </Descriptions.Item>
          </Descriptions>
        </>
      );
    }
  }
  if (args.drawer.path === 'customers') {
    return (
      <>
        <Descriptions bordered size={'middle'}>
          <Descriptions.Item label="고객명">
            {initialValues.name}
          </Descriptions.Item>
          <Descriptions.Item label="기업분류" span={2}>
            {initialValues.co_classification}
          </Descriptions.Item>
          <Descriptions.Item label="Business_number" span={2}>
            {initialValues.business_number}
          </Descriptions.Item>
          <Descriptions.Item label="유입경로" span={2}>
            {initialValues.funnel}
          </Descriptions.Item>

          <Descriptions.Item></Descriptions.Item>
          <Descriptions.Item label="홈페이지">
            {initialValues.homepage}
          </Descriptions.Item>
          <Descriptions.Item label="업태">
            {initialValues.business_type}
          </Descriptions.Item>
          <Descriptions.Item label="업종">
            {initialValues.business_item}
          </Descriptions.Item>
          <Descriptions.Item label="설립일">
            {initialValues.commencement_date}
          </Descriptions.Item>
          <Descriptions.Item label="대표자">
            {initialValues.representative_name}
          </Descriptions.Item>
          <Descriptions.Item label="종업원">
            {initialValues.employee}
          </Descriptions.Item>
          <Descriptions.Item label="지역">
            {initialValues.region}
          </Descriptions.Item>
          <Descriptions.Item label="시/군/구">
            {initialValues.city}
          </Descriptions.Item>
          <Descriptions.Item label="상세주소">
            {initialValues.address}
          </Descriptions.Item>
          <Descriptions.Item label="비 고">
            {initialValues.description}
          </Descriptions.Item>
        </Descriptions>
      </>
    );
  }
};

export default DescriptionItemTemp;
