<template>
  <div class="pop-window">
    <div class="window-header">용어자료 일괄등록</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row h-450">
          <div id="file-container">
            <div class="custom-title">자료등록</div>
            <div id="file-input-area">
              <span>용어</span>
              <div class="dictionary_up_name_div">{{ fileName }}</div>
              <label id="file-icon" for="input-file">
                <font-awesome-icon :icon="['fas', 'folder-open']" />
                <span class="sr-only"></span>
              </label>
              <input
                v-show="false"
                type="file"
                id="input-file"
                @change="handleFileUpload"
                accept=".xlsx, .xls"
              />
              <a :href="`${apiUrl}/api/v1/download/term-template`" class="btn-s"
                >양식내려받기</a
              >
              <!-- <button class="btn-s" @click="termTempleteDownload">
                양식내려받기
              </button> -->
            </div>
          </div>
          <div class="grid-wrap file-grid-height">
            <div class="grid-top">
              <div class="title-s">미리보기</div>
            </div>
            <div class="grid-list">
              <AppGrid
                :rowData="rowData"
                :columnDefs="columnDefs"
                :context="context"
                rowSelection="single"
                @rowDoubleClicked="onRowDoubleClicked"
                @gridApi="handleSetGridApi"
                ref="agGrid"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m confirm" @click="onConfirm">저장</button>
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
  />
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { reactive, ref } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import { read, utils } from 'xlsx';
  import wordDivisionCellRender from '@/utils/wordDivisionCellRender.js';
  import RadioCellRenderer from '../../utils/RadioCellRenderer';
  import ButtonCellRenderer from '../../utils/ButtonCellRenderer';
  import AppWarningTooltip from '@/components/ui/AppWarningTooltip.vue';
  import StatusCellRenderer from '@/utils/StatusCellRenderer.js';
  import { useAlert } from '@/composables/alert';
  import {
    getTermUploadFile,
    getTermExcelDownload,
  } from '@/utils/mflexApi/dictionaryManagementApi.js';
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
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props, { emit }) {
      // const uiStore = useUiStore();
      // const { setGridApis2 } = uiStore;

      const apiUrl = import.meta.env.VITE_APP_API_URL;
      const defaultUrl = '/api/v1';

      const { setAlertStatus } = useAlert();

      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);

      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const agGrid = ref(null);
      const rightAgGrid = ref(null);
      const gridApi = ref(null);

      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      //추천 영문 약어
      const selectRecommendedEng = ref(0);

      const recommendedColumnDefs = reactive([
        {
          headerName: '용어영문약어명',
          field: 'termAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          cellRenderer: 'wordDivisionCellRender',
          valueFormatter: (params) => params.value,
          width: 380,
          dragStatus: false,
        },
        {
          headerName: '선택',
          field: 'radio',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'RadioCellRenderer',
          //tooltipField: 'termAbbreviationName', // 툴팁으로 표시할 필드 지정
          valueFormatter: (params) => params.value,
          // checkboxSelection: true,
          width: 70,
          dragStatus: false,
        },
      ]);

      const selectedRowId = ref(null);
      const recommendedEngData = reactive({});

      const selectJobTerm = ref('');
      const selectedRadioValues = ref({});

      //용어 목록
      const rowData = reactive({});
      rowData.value = [];
      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
          dragStatus: false,
        },
        {
          headerName: '용어명',
          field: 'termName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '용어유형',
          field: 'termType',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '용어영문약어명',
          field: 'termEngAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '용어영문명',
          field: 'termEnglishName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '도메인명',
          field: 'domainName',
          cellClass: 'ag-left-aligned-cell',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '용어설명',
          field: 'termExplain',
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
          headerName: '개별코드명',
          field: 'individualCodeName',
          cellClass: 'ag-left-aligned-cell',
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
          headerName: '데이터단위명',
          field: 'dataUnitName',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '데이터허용값',
          field: 'dataPermissionValue',
          cellClass: 'grid-cell-centered',
          width: 170,
          dragStatus: false,
        },
        {
          headerName: '관리부서명',
          field: 'manageDepartmentName',
          cellClass: 'grid-cell-centered',
          width: 230,
          dragStatus: false,
        },
        {
          headerName: '업무분야명',
          field: 'taskFieldName',
          cellClass: 'grid-cell-centered',
          width: 230,
          dragStatus: false,
        },
        {
          headerName: '저장형식',
          field: 'storageFormatContext',
          cellClass: 'ag-left-aligned-cell',
          width: 230,
          dragStatus: false,
        },
        {
          headerName: '표현방식',
          field: 'expressionFormatContext',
          cellClass: 'ag-left-aligned-cell',
          width: 230,
          dragStatus: false,
        },
        {
          headerName: '제개정일자',
          field: 'revisionDate',
          cellClass: 'grid-cell-centered',
          width: 230,
          dragStatus: false,
        },
        {
          headerName: '제개정차수',
          field: 'revisionCycle',
          cellClass: 'grid-cell-centered',
          width: 230,
          dragStatus: false,
        },
        {
          headerName: '제개정내용',
          field: 'enactContext',
          cellClass: 'grid-cell-centered',
          width: 100,
          dragStatus: false,
        },
      ]);

      const uploadData = ref(null);

      const selectedFile = ref(null);
      const fileName = ref('');

      const termFormData = ref();

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

          termFormData.value = formData;

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

      const termTempleteDownload = () => {
        // 양식 다운로드
        console.log('양식 다운로드');

        // 파일 다운로드 URL
        const downloadUrl =
          'http://220.76.216.228:9090/api/v1/download/term-template';

        // URL을 새 창이나 탭에서 열기
        window.open(downloadUrl, '_blank');

        //window.location.href = 'files/용어_일괄등록양식.xlsx';
        //window.location.href = '/downloads/용어_일괄등록양식.xlsx';
      };

      const saveConfirmState = reactive({
        view: false,
        message: '작업이 취소됩니다. 정말 취소하시겠습니까?',
      });
      const onSaveConfirm = () => {
        saveConfirmState.view = true;
      };

      // const onConfirm = async () => {
      //   const response = await getTermUploadFile(termFormData.value);

      //   console.log('용어일괄등록 결과 :', response);
      //   console.log('selectedFile.value : ', selectedFile.value);
      //   console.log('fileName.value : ', fileName.value);
      //   emit('confirm');
      //   emit('close');
      // };

      const onConfirm = async () => {
        try {
          const response = await getTermUploadFile(termFormData.value);
          console.log('용어일괄등록 결과 :', response);

          const successCount = response.data.filter(
            (item) => item.isSuccess
          ).length;
          const failCount = response.data.length - successCount;

          let message = `[ 일괄 업로드 결과 ] <br>성공: ${successCount}건\n실패: ${failCount}건`;

          // if (failCount > 0) {
          //   message += '\n\n실패한 항목:';
          //   response.data
          //     .filter((item) => !item.isSuccess)
          //     .forEach((item) => {
          //       message += `\n행 ${item.rowNumber}:\n  ${
          //         item.reason || '알 수 없는 오류'
          //       }`;
          //     });
          // }

          setAlertStatus({
            view: true,
            message: message,
          });

          console.log('selectedFile.value : ', selectedFile.value);
          console.log('fileName.value : ', fileName.value);
          emit('confirm');
          emit('close');
        } catch (error) {
          console.error('일괄 업로드 중 오류 발생:', error);
          setAlertStatus({
            view: true,
            message: '일괄 업로드 중 오류가 발생했습니다.',
          });
        }
      };

      const onClose = () => {
        emit('close');
      };

      return {
        agGrid,
        selectJobTerm,
        rowData,
        columnDefs,
        selectRecommendedEng,
        recommendedColumnDefs,
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
        termTempleteDownload,
        onSaveConfirm,
        saveConfirmState,
        apiUrl,
      };
    },
  };
</script>
