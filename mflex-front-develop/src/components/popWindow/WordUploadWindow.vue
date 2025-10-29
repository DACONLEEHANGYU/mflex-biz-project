<template>
  <div class="pop-window">
    <div class="window-header">단어자료 일괄등록</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row h-450">
          <div id="file-container">
            <div class="custom-title">자료등록</div>
            <div id="file-input-area">
              <span>단어</span>
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
              <a :href="`${apiUrl}/api/v1/download/word-template`" class="btn-s"
                >양식내려받기</a
              >
              <!-- <button class="btn-s" @click="wordTempleteDownload">
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
  import { getWordUploadFile } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import { useAlert } from '@/composables/alert';
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

      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);

      const { setAlertStatus } = useAlert();

      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const agGrid = ref(null);
      const rightAgGrid = ref(null);
      const gridApi = ref(null);

      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      const selectedRowId = ref(null);
      const recommendedEngData = reactive({});

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

      const wordTempleteDownload = () => {
        // 양식 다운로드
        console.log('양식 다운로드');
        window.location.href = 'files/단어_일괄등록양식.xlsx';
        //window.location.href = '/downloads/용어_일괄등록양식.xlsx';
      };

      const saveConfirmState = reactive({
        view: false,
        message: '작업이 취소됩니다. 정말 취소하시겠습니까?',
      });
      const onSaveConfirm = () => {
        saveConfirmState.view = true;
      };

      const onConfirm = async () => {
        const response = await getWordUploadFile(wordFormData.value);

        const successCount = response.data.filter(
          (item) => item.isSuccess
        ).length;
        const failCount = response.data.length - successCount;

        let message = `[ 일괄 업로드 결과 ] <br>성공: ${successCount}건\n실패: ${failCount}건`;

        setAlertStatus({
          view: true,
          message: message,
        });

        console.log('selectedFile.value : ', selectedFile.value);
        console.log('fileName.value : ', fileName.value);
        emit('confirm');
        emit('close');
      };

      const onClose = () => {
        emit('close');
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
        wordTempleteDownload,
        onSaveConfirm,
        saveConfirmState,
        apiUrl,
      };
    },
  };
</script>
