<template>
  <div class="pop-window">
    <div class="window-header">코드 일괄등록</div>
    <div class="window-body">
      <div class="section-container">
        <div class="left-section">
          <div class="window-content pt15">
            <div class="tab-comtent__row h-450">
              <div class="tab-inner grid-tab-height">
                <div class="upload-container">
                  <div class="top-area">
                    <div class="upload-area">
                      <!-- <div class="side-title">단어 일괄등록</div> -->
                      <div class="result-area">
                        <span
                          >등록결과 : 총 {{ resultCount.total }}건 / 성공 :
                          {{ resultCount.success }}건 / 실패 :
                          {{ resultCount.fail }}건
                        </span>
                      </div>
                      <div class="file-area">
                        <div>
                          <div class="file-name-div">
                            {{ fileName }}
                          </div>
                        </div>
                        <div class="btn-area">
                          <!-- <span>단어</span> -->

                          <label id="file-icon" for="input-file-group">
                            <span class="sr-only"></span>
                          </label>
                          <button
                            id="file-button"
                            class="btn-s btn-margin"
                            @click="triggerFileInput"
                          >
                            파일찾기
                          </button>
                          <input
                            type="file"
                            v-show="false"
                            id="input-file-group"
                            class="file-input"
                            @change="handleFileUpload($event)"
                            accept=".xlsx, .xls"
                            ref="codeFileInput"
                          />
                          <a
                            :href="`${apiUrl}/api/v1/download/code-template`"
                            class="btn-s"
                            >양식내려받기</a
                          >
                          <button
                            :disabled="!resultState"
                            class="btn-s btn-"
                            @click="downloadErrorFile"
                          >
                            오류 내려받기
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="grid-wrap word-grid-area">
                    <div class="grid-top"></div>
                    <AppGrid
                      v-if="!resultState"
                      :rowData="rowData"
                      :columnDefs="columnDefs"
                      :context="context"
                      rowSelection="single"
                      @gridApi="handleSetGridApi"
                      ref="agGrid"
                    />
                    <AppGrid
                      v-else
                      :rowData="errorData"
                      :columnDefs="resultColumnDefs"
                      :context="context"
                      rowSelection="single"
                      @gridApi="handleSetGridApi"
                      ref="agGrid"
                    />
                    <div class="grid-bottom">
                      <div class="btn-div">
                        <button
                          id="upload-btn"
                          class="btn-m confirm btn-margin"
                          @click="onConfirm"
                          :disabled="resultState"
                        >
                          등록
                        </button>
                        <button
                          id="upload-btn"
                          class="btn-s"
                          @click="onResetConfrim"
                        >
                          초기화
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- <div class="right-section"></div> -->
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m close" @click="onCancelConfirm">취소</button>
        </div>
      </div>
    </div>
  </div>
  <AppDialog
    v-model:view="cancelCofirmState.view"
    :title="cancelCofirmState.title"
    :message="cancelCofirmState.message"
    @confirm="onClose"
    @close="onClose"
  />

  <AppDialog
    v-model:view="resetConfirmState.view"
    :title="resetConfirmState.title"
    :message="resetConfirmState.message"
    @confirm="onResetData"
    @close="onClose"
  />
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { ref, reactive, onMounted } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import { read, utils, write } from 'xlsx';
  // import * as XLSX from 'xlsx';
  import XLSX from 'xlsx-js-style'; // xlsx 대신 xlsx-style 사용
  import { useAlert } from '@/composables/alert';
  import wordDivisionCellRender from '@/utils/wordDivisionCellRender.js';
  import RadioCellRenderer from '../../utils/RadioCellRenderer';
  import ButtonCellRenderer from '../../utils/ButtonCellRenderer';
  import AppWarningTooltip from '@/components/ui/AppWarningTooltip.vue';
  import StatusCellRenderer from '@/utils/StatusCellRenderer.js';
  import {
    getWordUploadFile,
    getCodeUploadFile,
  } from '@/utils/mflexApi/dictionaryManagementApi.js';
  // import { saveAs } from 'file-saver';
  export default {
    components: {
      AppWarningTooltip,
      StatusCellRenderer,
      wordDivisionCellRender,
      RadioCellRenderer,
      ButtonCellRenderer,
    },

    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },
    methods: {
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
        this.selectedRow = value;
      },
      onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedRow = value;
      },
      onSearchEnter(value) {
        console.log('onSearchEnter', value);
      },
      onSearchSave() {
        console.log('onSearchSave');
      },
      onSearchSetup() {
        console.log('onSearchSetup');
      },
      onSearchRemove() {
        console.log('onSearchRemove');
      },
      callDetailInfo(params) {
        // 필요한 로직 구현
      },
      triggerFileInput() {
        this.$refs.codeFileInput.click();
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props, { emit }) {
      // const uiStore = useUiStore();
      // const { setGridApis2 } = uiStore;

      const apiUrl = import.meta.env.VITE_APP_API_URL;

      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);

      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const agGrid = ref(null);
      const rightAgGrid = ref(null);
      const gridApi = ref(null);

      const { setAlertStatus } = useAlert();

      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      const selectedRowId = ref(null);
      const recommendedEngData = reactive({});

      const selectedRadioValues = ref({});

      const resultState = ref(false);

      const rowData = reactive({});
      rowData.value = [];

      const errorData = reactive({});
      errorData.value = [];

      const columnDefs = reactive([
        {
          headerName: '작업구분',
          field: 'jobType',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '통합코드명',
          field: 'unityCodeName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '통합코드한글명',
          field: 'unityCodeKoreanName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '코드유형',
          field: 'codeType',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '데이터타입',
          field: 'dataType',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '데이터길이',
          field: 'dataLength',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '통합코드설명',
          field: 'explain',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '관리부서명',
          field: 'manageDepartmentName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '코드값',
          field: 'codeValue',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '코드값명',
          field: 'codeValueName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '코드값설명',
          field: 'codeValueExplain',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '상위코드값',
          field: 'parentCodeValue',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '상위코드값명',
          field: 'parentCodeValueName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '참조코드값',
          field: 'referenceCodeValue',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '참조코드값명',
          field: 'referenceCodeValueName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '제개정일자',
          field: 'revisionDate',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '제개정차수',
          field: 'revisionCycle',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
      ]);

      const resultColumnDefs = reactive([
        {
          headerName: '작업구분',
          field: 'jobType',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '통합코드명',
          field: 'unityCodeName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '통합코드한글명',
          field: 'unityCodeKoreanName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '코드유형',
          field: 'codeType',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '데이터타입',
          field: 'dataType',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '데이터길이',
          field: 'dataLength',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '통합코드설명',
          field: 'explain',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '관리부서명',
          field: 'manageDepartmentName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '코드값',
          field: 'codeValue',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '코드값명',
          field: 'codeValueName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '코드값설명',
          field: 'codeValueExplain',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '상위코드값',
          field: 'parentCodeValue',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '상위코드값명',
          field: 'parentCodeValueName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '참조코드값',
          field: 'referenceCodeValue',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '참조코드값명',
          field: 'referenceCodeValueName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '제개정일자',
          field: 'revisionDate',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '제개정차수',
          field: 'revisionCycle',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '오류내역',
          field: 'errorReason',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
      ]);

      const uploadData = ref(null);

      const selectedFile = ref(null);

      const fileName = ref('');

      const codeFormData = ref();

      // 파일 업로드 핸들러
      const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
          selectedFile.value = file;
          fileName.value = file.name;

          // FormData 생성 및 설정
          const formData = new FormData();
          const metaData = JSON.stringify({
            managementInstituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
          });
          const metaDataBlob = new Blob([metaData], {
            type: 'application/json',
          });
          formData.append('metaData', metaDataBlob, 'metadata.json');
          formData.append('file', file);

          codeFormData.value = formData;

          // 엑셀파일을 읽는 부분
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

            // 헤더 행 제거
            const dataRows = jsonData.slice(1);

            // columnDefs의 field 순서대로 데이터 매핑
            const rows = dataRows.map((row) => {
              const obj = {};
              columnDefs.forEach((col, index) => {
                let value = row[index];
                obj[col.field] = value;
              });
              return obj;
            });

            // ag-Grid에 데이터 할당
            rowData.value = rows;
            console.log('rowData.value : ', rowData.value);
          };
          reader.readAsArrayBuffer(file);
        }
      };

      const saveConfirmState = reactive({
        view: false,
        message: '작업이 취소됩니다. 정말 취소하시겠습니까?',
      });
      const onSaveConfirm = () => {
        saveConfirmState.view = true;
      };

      const cancelCofirmState = reactive({
        view: false,
        message: '작업이 취소됩니다. 정말 취소하시겠습니까?',
      });

      const onCancelConfirm = () => {
        cancelCofirmState.view = true;
      };

      const resultMessage = ref('');

      const errorDataBlob = ref(null); // Blob 데이터를 저장할 변수

      const resultCount = {
        total: 0,
        success: 0,
        fail: 0,
      };

      const onConfirm = async () => {
        console.log('codeFormData : ', codeFormData);
        console.log('codeFormData.value : ', codeFormData.value);

        const response = await getCodeUploadFile(codeFormData.value);

        console.log('uploadResponse : ', response);

        const failRows = response.data.filter((item) => !item.isSuccess);

        resultCount.total = response.data.length;

        console.log('failRows : ', failRows);

        const file = codeFormData.value.get('file');
        console.log('file ========== ', file);

        const reader = new FileReader();

        // 파일 읽기 완료 후 처리
        reader.onload = (event) => {
          const data = event.target.result;

          // 엑셀 파일로 변환 (xlsx 라이브러리를 사용하여 파일 처리)
          const workbook = XLSX.read(data, { type: 'binary' });

          // 첫 번째 시트에서 데이터를 가져옴
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          console.log('worksheet : ', worksheet);

          // 시트에서 JSON 데이터 추출
          const excelData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

          console.log('excelData : ', excelData);

          // 실패한 행에 해당하는 데이터를 필터링하여 새로운 엑셀 데이터로 만듦
          const failExcelData = excelData
            .map((row, index) => {
              const failItem = failRows.find(
                (fail) => fail.rowNumber === index + 1
              );
              if (failItem) {
                // console.log('failItem : ', failItem);
                // errorData.value.push({
                //   wordName: row.wordName,
                //   errorReason: failItem.reason || '알 수 없는 오류',
                // });
                // 오류 사유 필드를 추가
                return {
                  ...row,
                  오류내역: failItem.reason || '알 수 없는 오류',
                };
              }
              return null;
            })
            .filter(Boolean);

          console.log('failExcelData : ', failExcelData);

          const errorResult = failExcelData.map((row, index) => {
            const revisionDateKey = Object.keys(row).find((key) =>
              key.includes('제개정일자')
            );

            return {
              jobType: row['*작업구분'],
              unityCodeName: row['*통합코드명'],
              unityCodeKoreanName: row['*통합코드한글명'],
              codeType: row['*코드유형'],
              dataType: row['*데이터타입'],
              dataLength: row['*데이터길이(정수)'],
              explain: row['통합코드설명'],
              manageDepartmentName: row['관리부서명'],
              codeValue: row['*코드값'],
              codeValueName: row['*코드값명'],
              codeValueExplain: row['코드값설명'],
              parentCodeValue: row['상위코드값'],
              parentCodeValueName: row['상위코드값명'],
              referenceCodeValue: row['참조코드값'],
              revisionDate: row[revisionDateKey],
              revisionCycle: row['제개정차수'],
              errorReason: row['오류내역'],
            };
          });

          // failExcelData.map((row, index) => {
          //   errorData.value.push({
          //     wordName: row['단어명'],
          //     errorReason: row['오류 사유'],
          //   });
          // });

          console.log('errorData.value : ', errorResult);
          errorData.value = errorResult;

          // 새로운 워크북 생성
          const newWorkbook = XLSX.utils.book_new();
          const newWorksheet = XLSX.utils.json_to_sheet(failExcelData);

          // 테두리 스타일 설정
          const borderStyle = {
            top: { style: 'thin', color: { rgb: '000000' } }, // 상단 테두리
            bottom: { style: 'thin', color: { rgb: '000000' } }, // 하단 테두리
            left: { style: 'thin', color: { rgb: '000000' } }, // 왼쪽 테두리
            right: { style: 'thin', color: { rgb: '000000' } }, // 오른쪽 테두리
          };

          // 헤더 스타일 설정 ()
          const headerStyle = {
            alignment: {
              horizontal: 'center',
              vertical: 'center',
            },
            fill: {
              fgColor: { rgb: '0D3512' },
            },
            font: {
              bold: true,
              color: { rgb: 'FFFFFF' }, // 흰색 폰트
            },
            border: {
              top: { style: 'thin', color: { rgb: '000000' } }, // 상단 테두리
              bottom: { style: 'thin', color: { rgb: '000000' } }, // 하단 테두리
              left: { style: 'thin', color: { rgb: '000000' } }, // 왼쪽 테두리
              right: { style: 'thin', color: { rgb: '000000' } }, // 오른쪽 테두리
            },
          };

          // 헤더 셀에 스타일 적용
          const range = XLSX.utils.decode_range(newWorksheet['!ref']);
          for (let C = range.s.c; C <= range.e.c; ++C) {
            const headerCell = XLSX.utils.encode_cell({ r: range.s.r, c: C });
            if (newWorksheet[headerCell]) {
              newWorksheet[headerCell].s = headerStyle;
            }
          }

          // 데이터 셀에 테두리 스타일 적용
          for (let R = range.s.r + 1; R <= range.e.r; ++R) {
            // 헤더 아래의 데이터 행 반복
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
              if (newWorksheet[cellAddress]) {
                if (!newWorksheet[cellAddress].s) {
                  newWorksheet[cellAddress].s = {}; // 셀 스타일이 없는 경우 초기화
                }
                newWorksheet[cellAddress].s.border = borderStyle; // 테두리 스타일 적용
              }
            }
          }

          newWorksheet['!rows'] = [];
          newWorksheet['!rows'][0] = { hpt: 30 };

          // 열 너비 자동 조정 (데이터 길이에 맞춰 설정)
          const maxLengths = [];
          failExcelData.forEach((row) => {
            Object.keys(row).forEach((key, i) => {
              const cellLength = row[key] ? row[key].toString().length : 0;
              if (!maxLengths[i] || cellLength > maxLengths[i]) {
                maxLengths[i] = cellLength;
              }
            });
          });

          // 헤더의 길이도 고려
          Object.keys(failExcelData[0]).forEach((key, i) => {
            const headerLength = key.length;
            if (headerLength > maxLengths[i]) {
              maxLengths[i] = headerLength;
            }
          });

          // // 열 너비 적용 (각 열의 길이를 셀 너비로 설정)
          // newWorksheet['!cols'] = maxLengths.map((len) => ({
          //   wch: len + 2, // 너비를 약간 여유 있게 설정 (2 추가)
          // }));

          // 열 너비 적용 (각 열의 길이를 셀 너비로 설정, 최소 너비는 10으로 설정)
          newWorksheet['!cols'] = maxLengths.map((len) => ({
            wch: Math.max(len + 2, 20), // 너비를 약간 여유 있게 설정하고, 최소 너비를 10으로 설정
          }));

          // 워크북에 시트 추가
          XLSX.utils.book_append_sheet(
            newWorkbook,
            newWorksheet,
            'Failed Rows'
          );

          // 새로운 엑셀 파일을 Blob 형태로 변환
          const wbout = XLSX.write(newWorkbook, {
            bookType: 'xlsx',
            type: 'array',
            cellStyles: true,
          });
          const blob = new Blob([wbout], { type: 'application/octet-stream' });

          errorDataBlob.value = blob;

          // 다운로드 링크 생성 및 클릭 트리거
          // const link = document.createElement('a');
          // link.href = URL.createObjectURL(blob);
          // link.download = 'failed_rows_with_reasons.xlsx'; // 파일명 설정
          // document.body.appendChild(link);
          // link.click();
          // document.body.removeChild(link);

          console.log('엑셀 파일 생성 완료');
        };

        // 엑셀 파일을 바이너리 형식으로 읽기
        reader.readAsBinaryString(file);

        console.log('failRows : ', failRows);

        const successCount = response.data.filter(
          (item) => item.isSuccess
        ).length;
        const failCount = response.data.length - successCount;

        resultCount.success = successCount;
        resultCount.fail = failCount;

        let message = `[ 일괄 업로드 결과 ] <br>성공: ${successCount}건\n실패: ${failCount}건`;

        resultMessage.value = message;

        emit('confirm');
        resultState.value = true;
      };

      // 업로드 결과를 처리하는 헬퍼 함수
      function processUploadResult(response) {
        const successCount = response.data.filter(
          (item) => item.isSuccess
        ).length;
        const failCount = response.data.length - successCount;
        return { successCount, failCount };
      }

      const onClose = () => {
        emit('close');
      };

      const codeFileInput = ref(null);

      const downloadErrorFile = () => {
        if (!errorDataBlob.value) {
          setAlertStatus({
            view: true,
            message: '다운로드할 오류 데이터가 없습니다.',
          });
          return;
        }

        // 다운로드 링크 생성 및 클릭 트리거
        const link = document.createElement('a');
        link.href = URL.createObjectURL(errorDataBlob.value);
        link.download = '코드업로드_오류내역.xlsx'; // 다운로드할 파일명 설정
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('오류 엑셀 파일 다운로드 완료');
      };

      onMounted(() => {
        console.log('WordFileUploadWindow mounted');
        console.log('onMounted codeFileInput : ', codeFileInput);
        console.log('onMounted agGrid : ', agGrid);
      });

      const resetConfirmState = reactive({
        view: false,
        message: '작업이 초기화 됩니다. 정말 초기화 하시겠습니까?',
      });

      const onResetConfrim = () => {
        resetConfirmState.view = true;
      };

      const onResetData = () => {
        console.log('초기화');

        // 데이터 초기화
        rowData.value = [];
        errorData.value = [];
        resultState.value = false;

        // 등록결과 초기화
        resultCount.total = 0;
        resultCount.success = 0;
        resultCount.fail = 0;
        // resetConfrimState.view = true;

        fileName.value = '';
      };

      return {
        agGrid,
        rowData,
        columnDefs,
        recommendedEngData,
        rightAgGrid,
        gridApi,
        handleSetGridApi,
        handleFileUpload,
        selectedFile,
        fileName,
        onConfirm,
        onClose,
        uploadData,
        onSaveConfirm,
        saveConfirmState,
        apiUrl,
        resultMessage,
        // triggerFileInput,
        resultState,
        resultColumnDefs,
        downloadErrorFile,
        errorData,
        resultCount,
        onResetData,
        onCancelConfirm,
        cancelCofirmState,
        resetConfirmState,
        onResetConfrim,
        codeFileInput,
      };
    },
  };
</script>

<style>
  .section-container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    height: 100%;
  }
  .left-section {
    width: 100%;
    /* height: 100%; */
  }

  .word-grid-area {
    height: 535px;
    position: relative;
    border: 1px solid #ccc;
  }
  .grid-bottom {
    display: flex;
    padding: 7px;
    /* background-color: aquamarine; */
    justify-content: flex-end;
  }

  .grid-tab-height {
    height: 600px;
  }
  .upload-container {
    display: flex;
    height: 100%;
    justify-content: space-between;
    flex-direction: column;
  }
  .upload-area {
    display: flex;
    width: 100%;
    flex-direction: row;
    /* height: 100px; */
    padding: 10px 0px 10px 0px;
    border-bottom: 1px solid #ccc;
  }
  .result-area {
    width: 100%;
    /* height: calc(100% - 220px); */
    /* padding: 20px; */
  }
  .top-area {
    display: flex;
    flex-direction: row;
    /* height: 20%; */
  }

  .file-area {
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: flex-end;
  }

  .file-name-div {
    width: 250px;
    height: 30px;
    padding: 1px 5px 1px 5px;
    border: 1px solid #ccc;
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    font-size: 16px;
    /* margin-right: 10px; */

    /* Text overflow handling */
    white-space: nowrap; /* Prevent the text from wrapping to a new line */
    overflow: hidden; /* Hide any overflowed text */
    text-overflow: ellipsis; /* Show ellipsis (...) when text overflows */
  }

  .btn-margin {
    margin-right: 5px;
  }
  #file-button {
    border-left: 0;
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
</style>
