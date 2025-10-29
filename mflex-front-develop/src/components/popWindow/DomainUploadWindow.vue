<template>
  <div class="pop-window">
    <div class="window-header">도메인자료 일괄등록</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row h-450">
          <div id="file-container">
            <div class="custom-title">자료등록</div>
            <div id="file-input-area">
              <span>도메인그룹</span>
              <div class="dictionary_up_name_div">
                {{ domainGroupFileName }}
              </div>
              <label id="file-icon" for="input-file-group">
                <font-awesome-icon :icon="['fas', 'folder-open']" />
                <span class="sr-only"></span>
              </label>
              <input
                v-show="false"
                type="file"
                id="input-file-group"
                @change="handleFileUpload(0, $event)"
                accept=".xlsx, .xls"
              />
              <a
                :href="`${apiUrl}/api/v1/download/domain-group-template`"
                class="btn-s"
                >양식내려받기</a
              >
              <!-- <button class="btn-s" @click="domainTempleteDownload('group')">
                양식내려받기
              </button> -->
            </div>
            <div id="file-input-area">
              <span>도메인분류</span>
              <div class="dictionary_up_name_div">
                {{ domainClassFileName }}
              </div>
              <label id="file-icon" for="input-file-class">
                <font-awesome-icon :icon="['fas', 'folder-open']" />
                <span class="sr-only"></span>
              </label>
              <input
                v-show="false"
                type="file"
                id="input-file-class"
                @change="handleFileUpload(1, $event)"
                accept=".xlsx, .xls"
              />
              <a
                :href="`${apiUrl}/api/v1/download/domain-class-template`"
                class="btn-s"
                >양식내려받기</a
              >
            </div>
            <div id="file-input-area">
              <span style="padding-left: 35px; padding-right: 35px"
                >도메인</span
              >
              <div class="dictionary_up_name_div">{{ domainFileName }}</div>
              <label id="file-icon" for="input-file-plain">
                <font-awesome-icon :icon="['fas', 'folder-open']" />
                <span class="sr-only"></span>
              </label>
              <input
                v-show="false"
                type="file"
                id="input-file-plain"
                @change="handleFileUpload(2, $event)"
                accept=".xlsx, .xls"
              />
              <a
                :href="`${apiUrl}/api/v1/download/domain-plain-template`"
                class="btn-s"
                >양식내려받기</a
              >
            </div>
          </div>
          <div class="custom-title">미리보기</div>
          <section class="row-wrap">
            <AppTab :tabList="tabList" v-model="activeTab" mode="if"> </AppTab>
            <div class="tab-comtent__row">
              <keep-alive>
                <component :is="currentTab" />
              </keep-alive>
            </div>
          </section>
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
    @close="onClose"
  />
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import {
    ref,
    reactive,
    defineAsyncComponent,
    shallowRef,
    watch,
    provide,
  } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import { read, utils } from 'xlsx';
  import { useAlert } from '@/composables/alert';
  import wordDivisionCellRender from '@/utils/wordDivisionCellRender.js';
  import RadioCellRenderer from '../../utils/RadioCellRenderer';
  import ButtonCellRenderer from '../../utils/ButtonCellRenderer';
  import AppWarningTooltip from '@/components/ui/AppWarningTooltip.vue';
  import StatusCellRenderer from '@/utils/StatusCellRenderer.js';
  import {
    getDomainGroupUploadFile,
    getDomainClassUploadFile,
    getDomainNameUploadFile,
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

      const domainGroupFileName = ref('');
      const domainClassFileName = ref('');
      const domainFileName = ref('');
      const fileName = ref('');

      const domainGroupFormData = ref();
      const domainClassFormData = ref();
      const domainNameFormData = ref();

      const domainGroupRowData = reactive({});
      const domainClassRowData = reactive({});
      const domainNameRowData = reactive({});

      provide('domainGroupRowData', domainGroupRowData);
      provide('domainClassRowData', domainClassRowData);
      provide('domainNameRowData', domainNameRowData);

      // 파일 업로드 핸들러
      const handleFileUpload = (selectType, event) => {
        console.log('selectType : ', selectType);
        if (selectType === 0) {
          console.log('도메인그룹 업로드');
          fileUpload(selectType, event);
        } else if (selectType === 1) {
          console.log('도메인분류 업로드');
          fileUpload(selectType, event);
        } else {
          console.log('도메인 업로드');
          fileUpload(selectType, event);
        }
      };

      // 파일 업로드 함수 분리
      const fileUpload = async (selectType, evnet) => {
        const file = event.target.files[0];
        if (file) {
          selectedFile.value = file;
          if (selectType === 0) {
            domainGroupFileName.value = file.name;
          } else if (selectType === 1) {
            domainClassFileName.value = file.name;
          } else {
            domainFileName.value = file.name;
          }
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

          if (selectType === 0) {
            domainGroupFormData.value = formData;
            console.log(
              'domainGroupFormData.value : ',
              domainGroupFormData.value
            );
          } else if (selectType === 1) {
            domainClassFormData.value = formData;
            console.log(
              'domainClassFormData.value : ',
              domainClassFormData.value
            );
          } else {
            domainNameFormData.value = formData;
            console.log(
              'domainNameFormData.value : ',
              domainNameFormData.value
            );
          }

          // 파일 데이터 리딩
          const reader = new FileReader();
          reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = utils.sheet_to_json(worksheet, { header: 1 });

            // 헤더 행 제거
            const dataRows = jsonData.slice(1);

            if (selectType === 0) {
              activeTab.value = 1;
              domainGroupRowData.value = dataRows;
            } else if (selectType === 1) {
              activeTab.value = 2;
              domainClassRowData.value = dataRows;
            } else {
              activeTab.value = 3;
              domainNameRowData.value = dataRows;
            }

            console.log('dataRows : ', dataRows);
            // columnDefs의 field 순서대로 데이터 매핑
            // const rows = dataRows.map((row) => {
            //   const obj = {};
            //   columnDefs.forEach((col, index) => {
            //     let value = row[index];
            //     obj[col.field] = value;
            //   });
            //   return obj;
            // });

            // ag-Grid에 데이터 할당
            // if (selectType === 0) {
            //   domainGroupRowData.value = rows;
            //   console.log(
            //     'domainGroupRowData.value : ',
            //     domainGroupRowData.value
            //   );
            // } else if (selectType === 1) {
            //   domainClassRowData.value = rows;
            //   console.log(
            //     'domainClassRowData.value : ',
            //     domainClassRowData.value
            //   );
            // } else {
            //   domainNameRowData.value = rows;
            //   console.log(
            //     'domainNameRowData.value : ',
            //     domainNameRowData.value
            //   );
            // }

            // ag-Grid에 데이터 할당
            // rowData.value = rows;
            console.log('rowData.value : ', rowData.value);
          };
          reader.readAsArrayBuffer(file);
        }
      };

      const domainTempleteDownload = (type) => {
        if (type === 'group') {
          console.log('도메인그룹 양식 다운로드');
          window.location.href = 'files/도메인그룹_일괄등록양식..xlsx';
        } else if (type === 'class') {
          console.log('도메인분류 양식 다운로드');
          window.location.href = 'files/도메인분류_일괄등록양식.xlsx';
        } else {
          console.log('도메인 양식 다운로드');
          window.location.href = 'files/도메인_일괄등록양식.xlsx';
        }
      };

      const saveConfirmState = reactive({
        view: false,
        message: '작업이 취소됩니다. 정말 취소하시겠습니까?',
      });
      const onSaveConfirm = () => {
        saveConfirmState.view = true;
      };

      // const onConfirm = async () => {
      //   console.log('domainGroupFormData.value : ', domainGroupFormData.value);

      //   // 도메인 그룹 업로드
      //   if (domainGroupFormData.value != null) {
      //     const domainGroupResponse = await getDomainGroupUploadFile(
      //       domainGroupFormData.value
      //     );
      //   }
      //   // 도메인 분류 업로드
      //   if (domainClassFormData.value != null) {
      //     const doaminClassResponse = await getDomainClassUploadFile(
      //       domainClassFormData.value
      //     );
      //   }
      //   // 도메인 업로드
      //   if (domainNameFormData.value != null) {
      //     const domainNameResponse = await getDomainNameUploadFile(
      //       domainNameFormData.value
      //     );
      //   }
      //   console.log('selectedFile.value : ', selectedFile.value);
      //   //console.log('fileName.value : ', fileName.value);
      //   emit('confirm');
      //   emit('close');
      // };

      const onConfirm = async () => {
        try {
          console.log(
            'domainGroupFormData.value : ',
            domainGroupFormData.value
          );

          let totalSuccessCount = 0;
          let totalFailCount = 0;
          let message = '[ 일괄 업로드 결과 ]';

          // 도메인 그룹 업로드
          if (domainGroupFormData.value != null) {
            const domainGroupResponse = await getDomainGroupUploadFile(
              domainGroupFormData.value
            );
            const { successCount, failCount } =
              processUploadResult(domainGroupResponse);
            totalSuccessCount += successCount;
            totalFailCount += failCount;
            message += `<br><br>도메인 그룹 - 성공: ${successCount}건, 실패: ${failCount}건\n`;
          }

          // 도메인 분류 업로드
          if (domainClassFormData.value != null) {
            const domainClassResponse = await getDomainClassUploadFile(
              domainClassFormData.value
            );
            const { successCount, failCount } =
              processUploadResult(domainClassResponse);
            totalSuccessCount += successCount;
            totalFailCount += failCount;
            message += `<br><br>도메인 분류 - 성공: ${successCount}건, 실패: ${failCount}건\n`;
          }

          // 도메인 업로드
          if (domainNameFormData.value != null) {
            const domainNameResponse = await getDomainNameUploadFile(
              domainNameFormData.value
            );
            const { successCount, failCount } =
              processUploadResult(domainNameResponse);
            totalSuccessCount += successCount;
            totalFailCount += failCount;
            message += `<br><br>도메인 - 성공: ${successCount}건, 실패: ${failCount}건\n`;
          }

          message += `<br><br>총 결과 - 성공: ${totalSuccessCount}건, 실패: ${totalFailCount}건`;

          setAlertStatus({
            view: true,
            message: message,
          });

          console.log('selectedFile.value : ', selectedFile.value);
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

      const DomainUploadGroupTab = defineAsyncComponent(() =>
        import(
          '@/views/dictionaryMng/components/domain/bottom/DomainUploadGroupTab.vue'
        )
      );

      const DomainUploadClassTab = defineAsyncComponent(() =>
        import(
          '@/views/dictionaryMng/components/domain/bottom/DomainUploadClassTab.vue'
        )
      );

      const DomainUploadNameTab = defineAsyncComponent(() =>
        import(
          '@/views/dictionaryMng/components/domain/bottom/DomainUploadNameTab.vue'
        )
      );

      const currentTab = shallowRef(DomainUploadGroupTab);
      const tabList = reactive(['도메인그룹', '도메인분류', '도메인']);
      const activeTab = ref(1);

      watch(activeTab, () => {
        if (activeTab.value == 1) {
          currentTab.value = DomainUploadGroupTab;
        } else if (activeTab.value == 2) {
          currentTab.value = DomainUploadClassTab;
        } else {
          currentTab.value = DomainUploadNameTab;
        }
      });

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
        domainGroupFileName,
        domainClassFileName,
        domainFileName,
        onConfirm,
        onClose,
        uploadData,
        domainTempleteDownload,
        onSaveConfirm,
        saveConfirmState,
        tabList,
        activeTab,
        currentTab,
        apiUrl,
      };
    },
  };
</script>
