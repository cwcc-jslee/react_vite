import * as XLSX from 'xlsx';
import dayjs from 'dayjs';

/**
 * 데이터를 엑셀 파일로 내보내는 함수
 * @param {Array} data - 엑셀로 변환할 데이터 배열
 * @param {string} fileName - 저장할 파일명 (확장자 제외)
 */
export const exportToExcel = (data, fileName) => {
  // 1. 워크시트 생성
  const ws = XLSX.utils.json_to_sheet(data);

  // 2. 컬럼 너비 자동 조정 (선택사항 - 데이터 길이에 따라 조정 가능)
  // const wscols = [{wch: 20}, {wch: 15}, ...];
  // ws['!cols'] = wscols;

  // 3. 워크북 생성 및 시트 추가
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  // 4. 파일 저장
  const fileExtension = '.xlsx';
  const timestamp = dayjs().format('YYYYMMDD_HHmmss');
  XLSX.writeFile(wb, `${fileName}_${timestamp}${fileExtension}`);
};
