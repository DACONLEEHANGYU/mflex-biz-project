<template>
  <div class="pop-window">
    <div class="window-header">오프라인 스키마 업로드</div>
    <div class="window-body">
      <div class="window-content pt15">
        <!-- 업로드 통계 정보 표시 섹션 -->
        <div class="upload-stats-container">
          <div class="stats-header">
            업로드 정보
            <div>
              <a
                :href="`${apiUrl}/api/v1/download/schema-template`"
                class="btn-s"
                >양식내려받기</a
              >
              <button
                class="btn-s error-download-btn"
                @click="downloadErrorExcel"
                :disabled="!isUploaded"
              >
                오류내려받기
              </button>
            </div>
          </div>
          <div class="stats-grid">
            <div class="stats-item">
              <div class="stats-label">테이블</div>
              <div class="stats-value">
                <template v-if="!isUploaded"
                  >{{ uploadStats.tables }} 건 예정</template
                >
                <template v-else>
                  <span class="success"
                    >{{ uploadStats.tablesSuccess }} 건 성공</span
                  >
                  <span v-if="uploadStats.tablesFailed > 0" class="failed">
                    / {{ uploadStats.tablesFailed }} 건 실패</span
                  >
                </template>
              </div>
            </div>
            <div class="stats-item">
              <div class="stats-label">컬럼</div>
              <div class="stats-value">
                <template v-if="!isUploaded"
                  >{{ uploadStats.columns }} 건 예정</template
                >
                <template v-else>
                  <span class="success"
                    >{{ uploadStats.columnsSuccess }} 건 성공</span
                  >
                  <span v-if="uploadStats.columnsFailed > 0" class="failed">
                    / {{ uploadStats.columnsFailed }} 건 실패</span
                  >
                </template>
              </div>
            </div>
            <div class="stats-item">
              <div class="stats-label">PK</div>
              <div class="stats-value">
                <template v-if="!isUploaded"
                  >{{ uploadStats.pks }} 건 예정</template
                >
                <template v-else>
                  <span class="success"
                    >{{ uploadStats.pksSuccess }} 건 성공</span
                  >
                  <span v-if="uploadStats.pksFailed > 0" class="failed">
                    / {{ uploadStats.pksFailed }} 건 실패</span
                  >
                </template>
              </div>
            </div>
          </div>
        </div>

        <div class="tab-comtent__row">
          <div
            class="upload-container"
            :class="{ 'drag-over': isDragOver }"
            @dragover.prevent="handleDragOver"
            @dragleave.prevent="handleDragLeave"
            @drop.prevent="handleDrop"
          >
            <div v-if="!selectedFile && !isUploaded" class="upload-content">
              <div class="upload-icon">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"
                  ></path>
                  <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
              </div>
              <div class="upload-text">
                <p>
                  <span class="text-primary">엑셀을 드래그 해주세요.</span>
                </p>
                <p class="text-secondary">
                  또는
                  <span class="browse-text" @click="triggerFileInput"
                    >파일 선택</span
                  >
                </p>
              </div>
              <input
                type="file"
                ref="fileInput"
                @change="handleFileUpload($event)"
                style="display: none"
              />
            </div>

            <div v-if="selectedFile && !isUploaded" class="selected-file">
              <div class="file-info">
                <!-- <img src="document-icon.svg" alt="File" class="file-icon" /> -->
                <div class="file-details">
                  <p class="file-name">{{ selectedFile.name }}</p>
                  <p class="file-size">
                    {{ formatFileSize(selectedFile.size) }} •
                    {{ selectedFile.type }}
                  </p>
                </div>
              </div>
              <button class="remove-button" @click="removeFile">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>

            <div v-if="isUploaded" class="upload-result">
              <div
                class="result-icon"
                :class="{
                  'success-icon': uploadSuccess,
                  'error-icon': !uploadSuccess,
                }"
              >
                <svg
                  v-if="uploadSuccess"
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <svg
                  v-else
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <div class="result-text">
                <p v-if="uploadSuccess" class="success-text">업로드 완료</p>
                <p v-else class="error-text">업로드 중 오류가 발생했습니다</p>
                <p class="file-name">{{ selectedFile.name }}</p>
              </div>
              <button class="upload-again-button" @click="resetUpload">
                다시 업로드
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <button class="pop-btns confirm" @click="uploadFile">업로드</button>
        <button class="pop-btns close" @click="onClose">취소</button>
      </div>
    </div>
  </div>
  <AppDialog
    v-model:view="saveConfirmState.view"
    :title="saveConfirmState.title"
    :message="saveConfirmState.message"
    @confirm="onClose"
    @close="onClose"
  />
</template>

<script setup>
  import { ref, reactive } from 'vue';
  import { useAuthStore } from '@/stores/auth';

  import { uploadOfflineSchema } from '@/utils/mflexApi/dataMng/schemaCollectionApi';
  import XLSX from 'xlsx-js-style'; // xlsx 대신 xlsx-style 사용
  import { read, utils, write } from 'xlsx';
  import { storeToRefs } from 'pinia';

  const emits = defineEmits(['close', 'confirm']);
  const props = defineProps({
    selectDbInfo: {
      type: Object,
    },
  });

  const apiUrl = import.meta.env.VITE_APP_API_URL;

  const authStore = useAuthStore();
  const { userInfo, userStngInfo } = storeToRefs(authStore);
  const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
    userStngInfo.value;

  const schemaFileData = ref('');
  const fileName = ref('');

  // 파일 업로드 핸들러
  const handleFileUpload = (event) => {
    console.log('props.selectDbInfo : ', props.selectDbInfo);

    const file = event.target.files[0];

    console.log('파일 읽기 : ', file);

    if (file) {
      selectedFile.value = file;
      fileName.value = file.name;

      // FormData 생성 및 설정
      const formData = new FormData();
      formData.append('instituteId', useMetaMngInstId); // 직접 form-data 필드로 추가
      formData.append('databaseLinkId', props.selectDbInfo.databaseLinkId); // 직접 form-data 필드로 추가

      formData.append('file', file);

      schemaFileData.value = formData;

      // 엑셀파일을 읽는 부분
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: 'array' });
        console.log('workbook : ', workbook);

        // 시트가 최소 3개 있는지 확인
        if (workbook.SheetNames.length >= 3) {
          // 각 시트 이름 가져오기
          const tableSheetName = workbook.SheetNames[0];
          const columnSheetName = workbook.SheetNames[1];
          const pkSheetName = workbook.SheetNames[2];

          // 각 시트의 데이터 가져오기
          const tableSheet = workbook.Sheets[tableSheetName];
          const columnSheet = workbook.Sheets[columnSheetName];
          const pkSheet = workbook.Sheets[pkSheetName];

          // 각 시트 데이터를 JSON으로 변환 - 헤더 포함
          const tableData = utils.sheet_to_json(tableSheet, { header: 1 });
          const columnData = utils.sheet_to_json(columnSheet, { header: 1 });
          const pkData = utils.sheet_to_json(pkSheet, { header: 1 });

          // 유효한 데이터 행만 카운트하는 함수
          const countValidRows = (data) => {
            // 첫 번째 행은 헤더로 간주
            if (data.length <= 1) return 0;

            let validCount = 0;

            // 헤더 다음 행부터 검사 (인덱스 1부터)
            for (let i = 1; i < data.length; i++) {
              const row = data[i];

              // 행이 비어있는지 확인
              if (!row || row.length === 0) continue;

              // 행의 모든 셀이 빈 값인지 확인
              const hasData = row.some((cell) => {
                // null, undefined, 빈 문자열, 공백 문자열이 아닌 값이 있는지 확인
                return (
                  cell !== null &&
                  cell !== undefined &&
                  String(cell).trim() !== ''
                );
              });

              if (hasData) {
                validCount++;
              }
            }

            return validCount;
          };

          // 유효한 데이터 행 수 계산
          const tableCount = countValidRows(tableData);
          const columnCount = countValidRows(columnData);
          const pkCount = countValidRows(pkData);

          console.log('유효한 테이블 개수:', tableCount);
          console.log('유효한 컬럼 개수:', columnCount);
          console.log('유효한 PK 개수:', pkCount);

          // 데이터 바인딩
          uploadStats.tables = tableCount;
          uploadStats.columns = columnCount;
          uploadStats.pks = pkCount;
        } else {
          console.error('엑셀 파일에는 최소 3개의 시트가 필요합니다.');
          alert(
            '엑셀 파일에는 최소 3개의 시트(테이블, 컬럼, PK)가 필요합니다.'
          );
          removeFile();
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const isDragOver = ref(false);
  const selectedFile = ref(null);
  const fileInput = ref(null);
  const isUploaded = ref(false);
  const uploadSuccess = ref(true);
  // API 응답 저장 변수 추가
  const uploadResponse = ref(null);

  const saveConfirmState = ref({
    view: false,
    title: '업로드 취소',
    message: '업로드를 취소하시겠습니까?',
  });

  // 업로드 통계 정보
  const uploadStats = reactive({
    // 업로드 전 예상 통계
    tables: 0,
    columns: 0,
    pks: 0,

    // 업로드 후 결과
    tablesSuccess: 0,
    tablesFailed: 0,
    columnsSuccess: 0,
    columnsFailed: 0,
    pksSuccess: 0,
    pksFailed: 0,
  });

  const handleDragOver = () => {
    isDragOver.value = true;
  };

  const handleDragLeave = () => {
    isDragOver.value = false;
  };

  const handleDrop = (event) => {
    isDragOver.value = false;
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      // analyzeFile 함수 대신 handleFileUpload 함수를 직접 호출하여 일관성 유지
      // 이벤트 객체를 적절히 변환하여 전달
      handleFileUpload({ target: { files: files } });
    }
  };

  const triggerFileInput = () => {
    fileInput.value.click();
  };

  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      // analyzeFile 대신 handleFileUpload 호출
      handleFileUpload(event);
    }
  };

  // 수정된 analyzeFile 함수
  const analyzeFile = (file) => {
    if (file) {
      selectedFile.value = file;
      fileName.value = file.name;

      // FormData 생성 및 설정
      const formData = new FormData();
      formData.append('instituteId', useMetaMngInstId);
      formData.append('databaseLinkId', props.selectDbInfo.databaseLinkId);
      formData.append('file', file);

      schemaFileData.value = formData;

      // 엑셀파일을 읽는 부분
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = read(data, { type: 'array' });
        console.log('workbook : ', workbook);

        // 시트가 최소 3개 있는지 확인
        if (workbook.SheetNames.length >= 3) {
          // 각 시트 이름 가져오기
          const tableSheetName = workbook.SheetNames[0];
          const columnSheetName = workbook.SheetNames[1];
          const pkSheetName = workbook.SheetNames[2];

          // 각 시트의 데이터 가져오기
          const tableSheet = workbook.Sheets[tableSheetName];
          const columnSheet = workbook.Sheets[columnSheetName];
          const pkSheet = workbook.Sheets[pkSheetName];

          // 각 시트 데이터를 JSON으로 변환
          const tableData = utils.sheet_to_json(tableSheet, { header: 1 });
          const columnData = utils.sheet_to_json(columnSheet, { header: 1 });
          const pkData = utils.sheet_to_json(pkSheet, { header: 1 });

          // 헤더 행을 제외한 데이터 행 수 계산
          const tableCount = tableData.length > 1 ? tableData.length - 1 : 0;
          const columnCount = columnData.length > 1 ? columnData.length - 1 : 0;
          const pkCount = pkData.length > 1 ? pkData.length - 1 : 0;

          console.log('테이블 개수:', tableCount);
          console.log('컬럼 개수:', columnCount);
          console.log('PK 개수:', pkCount);

          // 데이터 바인딩
          uploadStats.tables = tableCount;
          uploadStats.columns = columnCount;
          uploadStats.pks = pkCount;
        } else {
          console.error('엑셀 파일에는 최소 3개의 시트가 필요합니다.');
          alert(
            '엑셀 파일에는 최소 3개의 시트(테이블, 컬럼, PK)가 필요합니다.'
          );
          removeFile(); // 파일 제거
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const removeFile = () => {
    selectedFile.value = null;
    resetStats();
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };

  const resetStats = () => {
    uploadStats.tables = 0;
    uploadStats.columns = 0;
    uploadStats.pks = 0;
    uploadStats.tablesSuccess = 0;
    uploadStats.tablesFailed = 0;
    uploadStats.columnsSuccess = 0;
    uploadStats.columnsFailed = 0;
    uploadStats.pksSuccess = 0;
    uploadStats.pksFailed = 0;
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  // API 응답 결과를 처리하는 함수
  const processUploadResults = (results) => {
    // 시트별 결과 카운터 초기화
    const stats = {
      TABLE: { success: 0, failed: 0 },
      COLUMN: { success: 0, failed: 0 },
      PK: { success: 0, failed: 0 },
    };

    // 결과 배열 순회
    results.forEach((item) => {
      const sheetName = item.sheetName;

      // 해당 시트 카운터가 있는지 확인 (시트 이름이 다를 수 있음)
      if (stats[sheetName]) {
        // success 필드 값에 따라 성공/실패 카운트 증가
        if (item.success) {
          stats[sheetName].success++;
        } else {
          stats[sheetName].failed++;
        }
      }
    });

    console.log('업로드 결과 통계:', stats);

    // UI에 통계 바인딩
    uploadStats.tablesSuccess = stats.TABLE.success;
    uploadStats.tablesFailed = stats.TABLE.failed;
    uploadStats.columnsSuccess = stats.COLUMN.success;
    uploadStats.columnsFailed = stats.COLUMN.failed;
    uploadStats.pksSuccess = stats.PK.success;
    uploadStats.pksFailed = stats.PK.failed;

    // 업로드 상태 업데이트
    isUploaded.value = true;

    // 전체 성공 여부 결정 (하나라도 실패가 있으면 실패로 간주)
    uploadSuccess.value =
      stats.TABLE.failed === 0 &&
      stats.COLUMN.failed === 0 &&
      stats.PK.failed === 0;
  };

  const resetUpload = () => {
    isUploaded.value = false;
    selectedFile.value = null;
    resetStats();
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };

  // 오류 항목만 포함하는 엑셀 다운로드 함수
  const downloadErrorExcel = async () => {
    if (!selectedFile.value || !uploadResponse.value) return;

    try {
      // 원본 파일 읽기
      const arrayBuffer = await selectedFile.value.arrayBuffer();
      const data = new Uint8Array(arrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });

      // API 응답에서 오류 항목 추출
      const errorItems = uploadResponse.value.results.filter(
        (item) => !item.success
      );

      console.log('오류 항목:', errorItems);

      // 새 워크북 생성
      const newWorkbook = XLSX.utils.book_new();

      // 필요한 시트 이름 (처음 3개 시트만 처리)
      const requiredSheetNames = workbook.SheetNames.slice(0, 3);

      console.log('필요한 시트:', requiredSheetNames);

      // 각 시트별로 처리 (처음 3개 시트만)
      for (const sheetName of requiredSheetNames) {
        const worksheet = workbook.Sheets[sheetName];

        // 워크시트의 범위 가져오기
        const range = XLSX.utils.decode_range(worksheet['!ref']);

        // 헤더 행 가져오기 (첫 번째 행)
        const headers = [];
        for (let C = range.s.c; C <= range.e.c; C++) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
          if (worksheet[cellAddress]) {
            headers.push(worksheet[cellAddress].v);
          } else {
            headers.push(''); // 빈 헤더 처리
          }
        }

        // 헤더에 '오류사항' 추가
        headers.push('오류사항');

        // 현재 시트에 관련된 오류 항목 필터링
        const currentSheetErrors = errorItems.filter((item) => {
          console.log(
            `비교: 시트명 ${sheetName}, 항목 sheetName ${item.sheetName}`
          );

          // 시트명과 항목 sheetName 매핑 확인
          if (sheetName.includes('테이블') && item.sheetName === 'TABLE')
            return true;
          if (sheetName.includes('컬럼') && item.sheetName === 'COLUMN')
            return true;
          if (sheetName.includes('PK') && item.sheetName === 'PK') return true;

          // 기존 로직도 유지 (정확한 매칭 또는 포함 관계 검사)
          return (
            item.sheetName.toUpperCase() === sheetName.toUpperCase() ||
            sheetName.toUpperCase().includes(item.sheetName.toUpperCase())
          );
        });

        console.log(
          `시트: ${sheetName}, 오류 항목:`,
          currentSheetErrors.map((item) => ({
            rowNumber: item.rowNumber,
            errors: item.errors,
          }))
        );

        // 모든 시트에 대해 헤더만 포함하는 데이터 배열 생성
        const errorRows = [headers]; // 첫 번째 행은 헤더

        // 오류 항목이 있는 경우에만 데이터 추가
        if (currentSheetErrors.length > 0) {
          // 각 오류 항목에 대해 원본 행 데이터 추출 및 오류 정보 추가
          for (const errorItem of currentSheetErrors) {
            const { rowNumber, errors } = errorItem;

            // 원본 데이터 행 가져오기 (rowNumber는 1부터 시작하는 것으로 가정, 헤더를 포함한 인덱스)
            const originalRowData = [];
            for (let C = 0; C <= range.e.c; C++) {
              const cellAddress = XLSX.utils.encode_cell({
                r: rowNumber,
                c: C,
              });
              if (worksheet[cellAddress]) {
                originalRowData.push(worksheet[cellAddress].v);
              } else {
                originalRowData.push(''); // 빈 셀 처리
              }
            }

            // 오류 메시지 생성
            const errorMessages = errors
              .map((err) => `${err.field}: ${err.message}`)
              .join('\n');

            // 원본 데이터에 오류 메시지 추가
            originalRowData.push(errorMessages);

            // 결과 배열에 추가
            errorRows.push(originalRowData);
          }
        }

        // 새 워크시트 생성
        const newWorksheet = XLSX.utils.aoa_to_sheet(errorRows);

        // 스타일 설정 (헤더 스타일)
        const headerRow =
          newWorksheet['!ref'].split(':')[0].replace(/[0-9]/g, '') + '1';
        const lastCol = XLSX.utils.encode_col(headers.length - 1);

        for (let i = 0; i < headers.length; i++) {
          const cellAddress = XLSX.utils.encode_cell({ r: 0, c: i });
          if (!newWorksheet[cellAddress]) continue;

          newWorksheet[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: 'FFEFEFEF' } },
            border: {
              top: { style: 'thin' },
              bottom: { style: 'thin' },
              left: { style: 'thin' },
              right: { style: 'thin' },
            },
          };
        }

        // 오류 메시지 셀 스타일 설정
        for (let i = 1; i < errorRows.length; i++) {
          const errorCellAddress = XLSX.utils.encode_cell({
            r: i,
            c: headers.length - 1,
          });
          if (!newWorksheet[errorCellAddress]) continue;

          newWorksheet[errorCellAddress].s = {
            font: { color: { rgb: 'FFFF0000' } }, // 빨간색 텍스트
            alignment: { wrapText: true }, // 텍스트 줄바꿈
          };
        }

        // 열 너비 설정
        const colWidth = [];
        for (let i = 0; i < headers.length - 1; i++) {
          colWidth.push({ wch: 15 }); // 기본 열 너비
        }
        colWidth.push({ wch: 40 }); // 오류사항 열은 더 넓게
        newWorksheet['!cols'] = colWidth;

        // 워크북에 시트 추가
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, sheetName);
      }

      // 워크북이 비어있는지 확인
      if (newWorkbook.SheetNames.length === 0) {
        console.warn('오류 항목이 없습니다.');
        return;
      }

      // 워크북을 Blob으로 변환
      const wbout = XLSX.write(newWorkbook, {
        bookType: 'xlsx',
        type: 'array',
        bookSST: false,
      });

      const blob = new Blob([wbout], { type: 'application/octet-stream' });

      // 다운로드 링크 생성 및 클릭
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `오류_${selectedFile.value.name}`;
      document.body.appendChild(a);
      a.click();

      // 정리
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 0);
    } catch (error) {
      console.error('오류 엑셀 생성 중 오류 발생:', error);
      // 오류 처리 로직 추가
    }
  };

  const uploadFile = async () => {
    try {
      console.log('업로드 시작');
      console.log('schemaFileData : ', schemaFileData.value);

      const response = await uploadOfflineSchema(schemaFileData.value);

      console.log('업로드 응답 : ', uploadResponse);

      // 응답 데이터 저장
      uploadResponse.value = response.data;

      // 응답에서 results 배열 추출
      const { results } = response.data;

      // 결과 처리
      processUploadResults(results);

      emits('confirm');
    } catch (error) {
      console.error('업로드 중 오류 발생:', error);

      // 오류 발생 시 모든 항목 실패로 처리
      uploadStats.tablesSuccess = 0;
      uploadStats.tablesFailed = uploadStats.tables;
      uploadStats.columnsSuccess = 0;
      uploadStats.columnsFailed = uploadStats.columns;
      uploadStats.pksSuccess = 0;
      uploadStats.pksFailed = uploadStats.pks;

      isUploaded.value = true;
      uploadSuccess.value = false;
    }
  };

  const onConfirm = () => {
    // 저장 버튼 로직
  };

  const onSaveConfirm = () => {
    saveConfirmState.value.view = true;
  };

  const onClose = () => {
    emits('close');
  };
</script>

<style scoped>
  .tab-comtent__row {
    margin-bottom: 20px;
  }

  .upload-stats-container {
    background-color: #f5f7fa;
    border-radius: 8px;
    padding: 15px;
    margin-bottom: 20px;

    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  }

  .stats-header {
    font-size: 16px;
    font-weight: 600;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    color: #333;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }

  .stats-item {
    background-color: white;
    border-radius: 6px;
    padding: 10px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  .stats-label {
    font-size: 13px;
    color: #666;
    margin-bottom: 5px;
  }

  .stats-value {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .success {
    color: #10b981;
  }

  .failed {
    color: #ef4444;
  }

  .upload-container {
    border: 2px dashed #ccc;
    border-radius: 10px;
    /* padding: 20px; */
    width: 100%;
    min-height: 170px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    background-color: #f9f9f9;
    cursor: pointer;
    position: relative;
  }

  .drag-over {
    border-color: #379583;
    background-color: rgba(124, 93, 250, 0.05);
    box-shadow: 0 0 10px rgba(124, 93, 250, 0.3);
  }

  .upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .upload-icon {
    margin-bottom: 10px;
    color: #379583;
  }

  .upload-text {
    font-size: 14px;
    line-height: 1.5;
    color: #666;
  }

  .text-primary {
    color: #379583;
    font-weight: 500;
  }

  .text-secondary {
    font-size: 12px;
    margin-top: 5px;
  }

  .browse-text {
    color: #379583;
    text-decoration: underline;
    cursor: pointer;
  }

  .selected-file {
    width: 90%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: white;
    border-radius: 8px;
    /* padding: 10px; */
    margin-top: 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .file-info {
    display: flex;
    align-items: center;
  }

  .file-icon {
    width: 32px;
    height: 32px;
    margin-right: 10px;
  }

  .file-details {
    display: flex;
    flex-direction: column;
  }

  .file-name {
    font-size: 14px;
    font-weight: 500;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 200px;
  }

  .file-size {
    font-size: 12px;
    color: #666;
    margin: 0;
  }

  .remove-button {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
  }

  .remove-button:hover {
    background-color: #f1f1f1;
    color: #ff5470;
  }

  .upload-button {
    background-color: #379583;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 8px 16px;
    margin-top: 15px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
  }

  .upload-button:hover {
    background-color: #6a4fd8;
  }

  .upload-result {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    width: 100%;
  }

  .result-icon {
    margin-bottom: 10px;
  }

  .success-icon {
    color: #10b981;
  }

  .error-icon {
    color: #ef4444;
  }

  .result-text {
    margin-bottom: 15px;
  }

  .success-text {
    font-size: 16px;
    font-weight: 600;
    color: #10b981;
    margin: 0 0 5px 0;
  }

  .error-text {
    font-size: 16px;
    font-weight: 600;
    color: #ef4444;
    margin: 0 0 5px 0;
  }

  .upload-again-button {
    background-color: #f3f4f6;
    color: #333;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    padding: 8px 16px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }

  .upload-again-button:hover {
    background-color: #e5e7eb;
  }

  .pop-btns {
    width: 114px;
    height: 56px;
    border-radius: 6px;
    padding: 8px 16px;
    font-size: 17px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
    margin-right: 10px;
  }

  .pop-btns:hover {
    background-color: #f3f4f6;
  }

  /* confirm 상태일 때 적용되는 스타일 */
  .pop-btns.confirm {
    background-color: #36c270;
    color: white;
    border: none;
  }

  .pop-btns.confirm:hover {
    background-color: #2da35f; /* 어두운 녹색으로 hover 효과 */
  }

  /* close 상태일 때 적용되는 스타일 */
  .pop-btns.close {
    background-color: #ffffff;
    color: #7e7e7e;
    border: 1px solid #d1d5db;
  }

  .pop-btns.close:hover {
    background-color: #f3f4f6;
  }

  .error-download-btn {
    background-color: #d34c43;
    color: #ffffff;
    border: 1px solid #d34c43;
    border-radius: 6px;

    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
  }
  .error-download-btn:hover {
    background-color: #b03c3a;
  }

  .inputs-btns {
    justify-content: center;
    padding-bottom: 20px;
  }
</style>
