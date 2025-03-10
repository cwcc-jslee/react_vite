// src/features/contact/components/ExcelUpload/ContactExcelUpload.jsx
/**
 * 담당자 대량 등록을 위한 Excel 업로드 컴포넌트
 * Excel 파일 업로드, 파싱, 검증 및 배치 처리 기능 제공
 */

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';
import {
  Button,
  FormItem,
  Label,
  Group,
  Alert,
  List,
  ListItem,
} from '../../../../shared/components/ui';
import {
  uploadContactsInBatches,
  getCustomerCacheInfo,
  clearCustomerCache,
  mapCustomersToContacts,
} from '../../services/contactUploadService';
import { validateExcelData } from '../../utils/contactExcelValidation';
import UploadProgressBar from './UploadProgressBar';
import CustomerMappingResult from './CustomerMappingResult';
import ContactUploadResult from './ContactUploadResult';

const ContactExcelUpload = ({ onSuccess, onError }) => {
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [progressStats, setProgressStats] = useState(null);
  const [customerMapping, setCustomerMapping] = useState(null);
  const [cacheInfo, setCacheInfo] = useState(null);

  // 고객사 캐시 정보 로드
  const loadCacheInfo = () => {
    const info = getCustomerCacheInfo();
    setCacheInfo(info);
  };

  // 컴포넌트 마운트 시 캐시 정보 로드
  React.useEffect(() => {
    loadCacheInfo();
  }, []);

  // 캐시 초기화
  const handleClearCache = () => {
    clearCustomerCache();
    loadCacheInfo();
  };

  // 템플릿 다운로드
  const handleDownloadTemplate = () => {
    // 샘플 데이터 생성
    const sampleData = [
      {
        '이름(필수)': '홍길동',
        회사명: '샘플기업',
        직위: '부장',
        부서: '영업팀',
        이메일: 'sample@example.com',
        전화번호: '02-1234-5678',
        휴대폰: '010-1234-5678',
        관계유형: '고객',
        메모: '샘플 담당자 데이터',
      },
      {
        '이름(필수)': '김철수수',
        회사명: '테스트기업',
        직위: '과장',
        부서: '개발팀',
        이메일: 'test@example.com',
        전화번호: '02-2345-6789',
        휴대폰: '010-2345-6789',
        관계유형: '협력사',
        메모: '',
      },
    ];

    // 워크시트 생성
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // 워크북 생성
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '담당자 등록 템플릿');

    // 파일 저장
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    // saveAs(blob, '담당자_등록_템플릿.xlsx');
  };

  // 파일 선택 핸들러
  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setUploadResult(null);
      setValidationErrors([]);
      setUploadProgress(0);
      setProgressStats(null);
      setCustomerMapping(null);
    }
  };

  // 선택된 파일 삭제 핸들러
  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setValidationErrors([]);
    setUploadProgress(0);
    setProgressStats(null);
    setCustomerMapping(null);
    // 파일 입력 필드 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Excel 데이터 파싱
  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          // 첫 번째 시트 사용
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // JSON으로 변환
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Excel 파일 파싱 중 오류가 발생했습니다.'));
        }
      };

      reader.onerror = () => {
        reject(new Error('파일을 읽는 중 오류가 발생했습니다.'));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  // Excel 데이터 변환 (Excel 형식 → API 형식)
  const transformExcelData = (excelData) => {
    return excelData.map((row, index) => {
      // 전체 이름에서 성(lastName)과 이름(firstName) 추출
      const fullName = row['이름'] || '';
      let lastName = '';
      let firstName = '';

      if (fullName) {
        // 이름이 한글일 경우 (첫 글자가 성, 나머지가 이름)
        if (/^[가-힣]+$/.test(fullName)) {
          lastName = fullName.charAt(0); // 첫 글자를 성으로
          firstName = fullName.substring(1); // 나머지를 이름으로
        }
        // 영문이나 다른 형식일 경우 공백으로 분리 (John Doe -> lastName: John, firstName: Doe)
        else if (fullName.includes(' ')) {
          const parts = fullName.split(' ');
          lastName = parts[0];
          firstName = parts.slice(1).join(' ');
        }
        // 공백이 없는 경우 전체를 이름으로
        else {
          firstName = fullName;
        }
      }

      return {
        lastName,
        firstName,
        fullName,
        // customer: row['customerId'] || '',
        customer: row['회사명'] || '',
        position: row['직위'] || '',
        department: row['부서'] || '',
        email: row['이메일'] || '',
        phone: row['전화번호'] || '',
        mobile: row['휴대폰'] || '',
        contactType: row['관계유형'] || '',
        note: row['메모'] || '',
        // Excel 행 번호 저장 (에러 메시지 표시용)
        _rowIndex: index + 2, // 헤더를 고려하여 +2
      };
    });
  };

  // 진행 상황 업데이트 콜백
  const updateProgress = (progress, stats) => {
    setUploadProgress(progress);
    setProgressStats(stats);
  };

  // 파일 업로드 처리
  const handleUpload = async () => {
    if (!selectedFile) {
      return;
    }

    try {
      // 처리 시작 시간 기록
      const startTime = new Date(); // 이 줄을 추가

      setIsUploading(true);
      setValidationErrors([]);
      setUploadResult(null);
      setUploadProgress(0);
      setProgressStats(null);
      setCustomerMapping(null);

      // 1. Excel 파일 파싱 (전체 파일을 한 번에 파싱)
      const excelData = await parseExcelFile(selectedFile);

      // 2. 데이터 변환 (전체 데이터 변환)
      const contactsData = transformExcelData(excelData);
      console.log(`contactsData : `, contactsData);

      // 3. 데이터 검증 (전체 데이터 검증)
      const { valid, errors } = validateExcelData(contactsData);

      if (!valid) {
        setValidationErrors(errors);
        setIsUploading(false);
        return;
      }

      // 4. 고객사 매핑 수행
      const { mappedContacts, customerMappingResult } =
        await mapCustomersToContacts(contactsData);

      // 4-1. 고객사 매핑 결과 저장 (API 호출 전에 결과 표시)
      setCustomerMapping(customerMappingResult);

      // 4-2. 고객사 매핑 알림은 여기서 표시하지 않고 결과 컴포넌트에서 표시

      // 5. 배치 단위로 API 호출 처리 (진행 상황 콜백 포함)
      const result = await uploadContactsInBatches(
        contactsData,
        updateProgress,
      );

      // 6. 결과 객체에 고객사 매핑 정보 추가
      const enhancedResult = {
        ...result,
        customerMapping: customerMappingResult,
        totalCount: contactsData.length,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        processingTime: new Date() - startTime, // 이제 startTime이 정의됨

        // 결과 요약 메시지
        message: `${result.successCount}건의 담당자가 성공적으로 등록되었습니다.`,
        success: result.failCount === 0,
      };

      // 7. 최종 결과 저장 및 UI 업데이트
      setUploadProgress(100);
      setUploadResult(enhancedResult);

      // 8. 성공 콜백 호출
      if (onSuccess) {
        onSuccess(enhancedResult);
      }

      // 캐시 정보 새로고침
      loadCacheInfo();

      // 7. 성공 콜백 호출
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error('Upload failed:', error);

      setUploadResult({
        success: false,
        message: error.message || '업로드 중 오류가 발생했습니다.',
        totalCount: 0,
        successCount: 0,
        failCount: 0,
        error: error,
      });

      // 오류 콜백 호출
      if (onError) {
        onError(error);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // 다시 시도
  const handleRetry = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setValidationErrors([]);
    setUploadProgress(0);
    setProgressStats(null);
    setCustomerMapping(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Group className="p-6">
      <h2 className="text-xl font-bold mb-4">담당자 일괄 등록</h2>

      {/* 안내 메시지 */}
      <div className="mb-6">
        <p className="mb-2">
          Excel 파일을 이용하여 다수의 담당자를 한 번에 등록할 수 있습니다.
        </p>
        <p className="mb-2">
          아래 템플릿을 다운로드하여 작성 후 업로드해 주세요.
        </p>
        <Button
          variant="outline"
          size="small"
          onClick={handleDownloadTemplate}
          className="mt-2"
        >
          Excel 템플릿 다운로드
        </Button>
      </div>

      {/* 고객사 캐시 정보 */}
      {cacheInfo && cacheInfo.cacheSize > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded">
          <div className="flex justify-between items-center">
            <p className="text-sm">
              <span className="font-medium">고객사 캐시:</span>{' '}
              {cacheInfo.cacheSize}개 회사 정보가 캐시되어 있습니다.
              <span className="text-xs text-gray-500 ml-2">
                (캐시된 정보는 중복 API 호출을 줄여 성능을 향상시킵니다)
              </span>
            </p>
            <Button
              variant="ghost"
              size="small"
              onClick={handleClearCache}
              className="text-xs"
            >
              캐시 초기화
            </Button>
          </div>
        </div>
      )}

      {/* 파일 업로드 영역 */}
      <FormItem direction="vertical" className="mb-4">
        <Label>Excel 파일 선택</Label>
        <div className="flex items-center">
          <input
            type="file"
            ref={fileInputRef}
            accept=".xlsx, .xls"
            onChange={handleFileChange}
            disabled={isUploading}
            className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
          />
          {selectedFile && !isUploading && (
            <Button
              variant="ghost"
              size="small"
              onClick={handleRemoveFile}
              className="ml-2 text-red-500 hover:text-red-700"
              disabled={isUploading}
            >
              삭제
            </Button>
          )}
        </div>
      </FormItem>

      {/* 선택된 파일 정보 */}
      {selectedFile && (
        <div className="mb-4 p-3 bg-gray-50 rounded flex items-center justify-between">
          <div>
            <p className="text-sm">
              <span className="font-medium">선택된 파일:</span>{' '}
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500">
              크기: {(selectedFile.size / 1024).toFixed(2)} KB
            </p>
          </div>
          {!isUploading && (
            <Button
              variant="ghost"
              size="small"
              onClick={handleRemoveFile}
              className="text-red-500 hover:text-red-700"
            >
              ×
            </Button>
          )}
        </div>
      )}

      {/* 고객사 매핑 결과 */}
      {customerMapping && !uploadResult && (
        <CustomerMappingResult
          mappingResult={customerMapping}
          className="mb-4"
        />
      )}

      {/* 업로드 진행 상황 */}
      {isUploading && uploadProgress > 0 && (
        <UploadProgressBar progress={uploadProgress} stats={progressStats} />
      )}

      {/* 유효성 검사 오류 */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="mb-4">
          <h3 className="font-bold mb-2">데이터 오류가 발견되었습니다:</h3>
          <List className="max-h-40 overflow-y-auto">
            {validationErrors.map((error, index) => (
              <ListItem key={index} className="text-sm">
                {error.rowNumber}행: {error.message}
              </ListItem>
            ))}
          </List>
        </Alert>
      )}

      {/* 담당자 등록 결과 (통합 결과 컴포넌트 사용) */}
      {uploadResult && (
        <ContactUploadResult uploadResult={uploadResult} className="mb-4" />
      )}

      {/* 업로드 결과 */}
      {uploadResult && (
        <Alert
          variant={uploadResult.success ? 'success' : 'destructive'}
          className="mb-4"
        >
          <p className="font-medium">{uploadResult.message}</p>
          {uploadResult.success && (
            <p className="text-sm mt-1">
              총 {uploadResult.totalCount}건 중 {uploadResult.successCount}건
              성공,
              {uploadResult.failCount}건 실패
            </p>
          )}
        </Alert>
      )}

      {/* 액션 버튼 */}
      <Group direction="horizontal" className="justify-end space-x-2 mt-4">
        {uploadResult ? (
          <Button onClick={handleRetry} variant="outline">
            다시 시도
          </Button>
        ) : (
          <>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading}
              variant="primary"
            >
              {isUploading ? '업로드 중...' : '업로드'}
            </Button>
          </>
        )}
      </Group>
    </Group>
  );
};

export default ContactExcelUpload;
