<template>
  <div class="pop-window">
    <div class="window-header">도메인 일괄등록</div>
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
                            ref="domainFileInput"
                          />
                          <a
                            :href="`${apiUrl}/api/v1/download/domain-template`"
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
                        >
                          등록
                        </button>
                        <button
                          id="upload-btn"
                          class="btn-s"
                          @click="onResetData"
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
          <button class="btn-m close" @click="onSaveConfirm">취소</button>
        </div>
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

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { ref, reactive, onMounted } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import { read, utils, write } from 'xlsx';
  import * as XLSX from 'xlsx';
  import { useAlert } from '@/composables/alert';
  import wordDivisionCellRender from '@/utils/wordDivisionCellRender.js';
  import RadioCellRenderer from '../../utils/RadioCellRenderer';
  import ButtonCellRenderer from '../../utils/ButtonCellRenderer';
  import AppWarningTooltip from '@/components/ui/AppWarningTooltip.vue';
  import StatusCellRenderer from '@/utils/StatusCellRenderer.js';
  import { getWordUploadFile } from '@/utils/mflexApi/dictionaryManagementApi.js';
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
        this.$refs.domainFileInput.click();
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
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '단어명',
          field: 'wordName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '단어유형',
          field: 'wordType',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '유사어구분',
          field: 'similarYn',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '단어영문약어명',
          field: 'wordAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '단어영문명',
          field: 'wordEnglishName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '도메인분류명',
          field: 'domainClassName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '단어설명',
          field: 'wordExplain',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '제정내용',
          field: 'enactContext',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '제개정일자',
          field: 'revisionData',
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
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '단어명',
          field: 'wordName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '단어유형',
          field: 'wordType',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '유사어구분',
          field: 'similarYn',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '단어영문약어명',
          field: 'wordAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '단어영문명',
          field: 'wordEnglishName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '도메인분류명',
          field: 'domainClassName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '단어설명',
          field: 'wordExplain',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '제정내용',
          field: 'enactContext',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '제개정일자',
          field: 'revisionData',
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
          width: 500,
          dragStatus: false,
        },
      ]);

      const uploadData = ref(null);

      const selectedFile = ref(null);

      const fileName = ref('');

      const wordFormData = ref();

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

          wordFormData.value = formData;

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

      const resultMessage = ref('');

      const errorDataBlob = ref(null); // Blob 데이터를 저장할 변수

      const resultCount = {
        total: 0,
        success: 0,
        fail: 0,
      };

      const onConfirm = async () => {
        console.log('wordFormData : ', wordFormData);
        console.log('wordFormData.value : ', wordFormData.value);

        const response = await getWordUploadFile(wordFormData.value);

        console.log('uploadResponse : ', response);

        const failRows = response.data.filter((item) => !item.isSuccess);

        resultCount.total = response.data.length;

        console.log('failRows : ', failRows);

        const file = wordFormData.value.get('file');
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
            return {
              jobType: row['작업구분'],
              wordName: row['단어명'],
              wordType: row['단어유형'],
              similarYn: row['유사어구분'],
              wordAbbreviationName: row['단어영문약어명'],
              wordEnglishName: row['단어영문명'],
              domainClassName: row['도메인분류명'],
              wordExplain: row['단어설명'],
              enactContext: row['제정내용'],
              revisionData: row['제개정일자'],
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

      const domainFileInput = ref(null);

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
        link.download = 'failed_rows_with_reasons.xlsx'; // 다운로드할 파일명 설정
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        console.log('오류 엑셀 파일 다운로드 완료');
      };

      onMounted(() => {
        console.log('WordFileUploadWindow mounted');
        console.log('onMounted domainFileInput : ', domainFileInput);
        console.log('onMounted agGrid : ', agGrid);
      });

      const onResetData = () => {
        console.log('초기화');
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
