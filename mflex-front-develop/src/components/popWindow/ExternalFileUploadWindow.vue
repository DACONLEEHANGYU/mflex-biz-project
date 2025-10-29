<template>
  <div class="pop-window">
    <div class="window-header">공식사전버전 파일업로드</div>
    <div class="window-body">
      <div class="window-content">
        <div class="tab-comtent__row h-450">
          <div id="file-container">
            <div class="custom-title">공식사전 기본 정보</div>
            <div class="inputs-wrap">
              <div class="input-form">
                <table class="input-table">
                  <colgroup>
                    <col width="15%" />
                    <col width="28%" />
                    <col width="15%" />
                    <col width="12%" />
                    <col width="15%" />
                    <col width="15%" />
                  </colgroup>
                  <tbody>
                    <tr>
                      <th>공식사전버전명</th>
                      <td>
                        {{ formData.versionName }}
                      </td>
                      <th>제정차수</th>
                      <td>
                        {{ formData.enactCycle }}
                      </td>
                      <th>제정일자</th>
                      <td>
                        {{ formData.enactDate }}
                      </td>
                    </tr>
                    <tr>
                      <th>공식사전파일명</th>
                      <td colspan="5">
                        <div class="file-upload-group">
                          <input
                            type="text"
                            class="input-text file-name"
                            readonly
                            v-model="fileName"
                            placeholder="업로드할 파일을 선택해주세요."
                          />
                          <div class="file-upload-buttons">
                            <label class="file-upload-label">
                              <input
                                type="file"
                                class="file-upload-input"
                                @change="handleFileUpload"
                                accept=".xlsx,.xls"
                                ref="fileInput"
                              />
                              파일찾기
                            </label>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="custom-title">공식사전 첨부파일 내역</div>
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
          <button
            class="btn-m confirm"
            @click="onConfirm"
            :disabled="!isFileUploaded"
          >
            저장
          </button>
          <button class="btn-m close" @click="onCloseConfirm">취소</button>
        </div>
      </div>
    </div>
  </div>
  <AppDialog
    v-model:view="closeConfirmState.view"
    :title="closeConfirmState.title"
    :message="closeConfirmState.message"
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
    onBeforeMount,
  } from 'vue';

  import { useAuthStore } from '@/stores/auth';
  import { useExternalDictionaryStore } from '@/stores/externalDictionary';
  import { uploadCommonDictionary } from '@/utils/mflexApi/systemMng/systemManagementApi';
  import { storeToRefs } from 'pinia';
  import { read, utils } from 'xlsx';
  import { useAlert } from '@/composables/alert';
  import wordDivisionCellRender from '@/utils/wordDivisionCellRender.js';
  import RadioCellRenderer from '@/utils/RadioCellRenderer';
  import ButtonCellRenderer from '@/utils/ButtonCellRenderer';
  import AppWarningTooltip from '@/components/ui/AppWarningTooltip.vue';
  import StatusCellRenderer from '@/utils/StatusCellRenderer.js';

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
    props: {
      selectVersion: {
        type: Object,
      },
      selectDictionary: {
        type: Object,
      },
      jobState: {
        type: String,
      },
    },
    setup(props, { emit }) {
      const apiUrl = import.meta.env.VITE_APP_API_URL;

      const authStore = useAuthStore();
      const externalDictionaryStore = useExternalDictionaryStore();
      const { userStngInfo } = storeToRefs(authStore);

      const { useMetaMngInstId, useDctnryId } = userStngInfo.value;

      const agGrid = ref(null);
      const rightAgGrid = ref(null);
      const gridApi = ref(null);
      const fileInput = ref(null);

      const { setAlertStatus } = useAlert();
      const { setTermData, setWordData, setDomainData, resetData } =
        externalDictionaryStore;
      const { externalDictionaryVersion } = storeToRefs(
        useExternalDictionaryStore()
      );

      // 파일 업로드 상태 추가
      const isFileUploaded = ref(false);

      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      const recommendedEngData = reactive({});

      const formData = reactive({
        versionName: '',
        enactCycle: '',
        enactDate: '',
      });

      const uploadData = ref(null);

      const selectedFile = ref(null);

      const domainGroupFileName = ref('');
      const domainClassFileName = ref('');
      const domainFileName = ref('');
      const fileName = ref('');

      const domainGroupFormData = ref();
      const domainClassFormData = ref();
      const domainNameFormData = ref();

      // 시트별 데이터 저장
      const termData = ref([]);
      const wordData = ref([]);
      const domainData = ref([]);

      // 시트별 데이터 카운트
      const termDataCount = ref(0);
      const wordDataCount = ref(0);
      const domainDataCount = ref(0);

      const domainGroupRowData = reactive({});
      const domainClassRowData = reactive({});
      const domainNameRowData = reactive({});

      provide('domainGroupRowData', domainGroupRowData);
      provide('domainClassRowData', domainClassRowData);
      provide('domainNameRowData', domainNameRowData);

      // 새로운 파일 업로드 핸들러
      const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        fileName.value = file.name;
        selectedFile.value = file;

        // 파일 읽기 시작
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = read(data, { type: 'array' });

            // 시트 이름 확인
            const sheetNames = workbook.SheetNames;
            console.log('발견된 시트:', sheetNames);

            // 각 시트별 데이터 처리
            processSheets(workbook, sheetNames);

            isFileUploaded.value = true;

            // 첫 번째 탭 활성화
            activeTab.value = 1;

            setAlertStatus({
              view: true,
              message: '파일이 성공적으로 로드되었습니다.',
            });
          } catch (error) {
            console.error('엑셀 파일 처리 중 오류 발생:', error);
            setAlertStatus({
              view: true,
              message: '엑셀 파일 처리 중 오류가 발생했습니다.',
            });
            resetFileUpload();
          }
        };

        reader.onerror = () => {
          setAlertStatus({
            view: true,
            message: '파일을 읽는 중 오류가 발생했습니다.',
          });
          resetFileUpload();
        };

        reader.readAsArrayBuffer(file);
      };

      // 시트 처리 함수
      const processSheets = (workbook, sheetNames) => {
        // 시트 데이터 저장
        const termSheet = getSheetByNamePattern(workbook, ['용어', 'term']);
        const wordSheet = getSheetByNamePattern(workbook, ['단어', 'word']);
        const domainSheet = getSheetByNamePattern(workbook, [
          '도메인',
          'domain',
        ]);

        if (termSheet) {
          const processedTermData = processTermSheet(termSheet);
          console.log('processedTermData : ', processedTermData);
          termData.value = processedTermData;
          termDataCount.value = processedTermData.length;
          // store에 저장
          setTermData(processedTermData);
        } else {
          termData.value = [];
          termDataCount.value = 0;
          setTermData([]);
        }

        if (wordSheet) {
          const processedWordData = processWordSheet(wordSheet);
          console.log('processedWordData : ', processedWordData);
          wordData.value = processedWordData;
          wordDataCount.value = processedWordData.length;
          // store에 저장
          setWordData(processedWordData);
        } else {
          wordData.value = [];
          wordDataCount.value = 0;
          setWordData([]);
        }

        if (domainSheet) {
          const processedDomainData = processDomainSheet(domainSheet);
          console.log('processedDomainData : ', processedDomainData);
          domainData.value = processedDomainData;
          domainDataCount.value = processedDomainData.length;
          // store에 저장
          setDomainData(processedDomainData);
        } else {
          domainData.value = [];
          domainDataCount.value = 0;
          setDomainData([]);
        }
      };

      // 시트 이름 패턴으로 찾기
      const getSheetByNamePattern = (workbook, patterns) => {
        const sheetNames = workbook.SheetNames;
        for (const pattern of patterns) {
          const matchingSheet = sheetNames.find((name) =>
            name.toLowerCase().includes(pattern.toLowerCase())
          );

          if (matchingSheet) {
            return workbook.Sheets[matchingSheet];
          }
        }
        return null;
      };

      // 용어 시트 처리
      const processTermSheet = (sheet) => {
        const jsonData = utils.sheet_to_json(sheet, { header: 1 });

        // 헤더 행 추출 및 데이터 행 시작
        const headerRow = jsonData[0];
        const dataRows = jsonData.slice(1).filter((row) => row.length > 0);

        return dataRows.map((row, index) => {
          const rowData = {};
          headerRow.forEach((header, colIndex) => {
            if (header) {
              rowData[header] = row[colIndex] || '';
            }
          });

          // 필수 필드 추가
          rowData.id = index + 1;
          rowData.no = index + 1;

          return rowData;
        });
      };

      // 단어 시트 처리
      const processWordSheet = (sheet) => {
        const jsonData = utils.sheet_to_json(sheet, { header: 1 });

        const headerRow = jsonData[0];
        const dataRows = jsonData.slice(1).filter((row) => row.length > 0);

        return dataRows.map((row, index) => {
          const rowData = {};
          headerRow.forEach((header, colIndex) => {
            if (header) {
              rowData[header] = row[colIndex] || '';
            }
          });

          // 필수 필드 추가
          rowData.id = index + 1;
          rowData.no = index + 1;

          return rowData;
        });
      };

      // 도메인 시트 처리
      const processDomainSheet = (sheet) => {
        const jsonData = utils.sheet_to_json(sheet, { header: 1 });

        const headerRow = jsonData[0];
        const dataRows = jsonData.slice(1).filter((row) => row.length > 0);

        return dataRows.map((row, index) => {
          const rowData = {};
          headerRow.forEach((header, colIndex) => {
            if (header) {
              rowData[header] = row[colIndex] || '';
            }
          });

          // 필수 필드 추가
          rowData.id = index + 1;
          rowData.no = index + 1;

          return rowData;
        });
      };

      // 파일 업로드 리셋
      const resetFileUpload = () => {
        fileName.value = '';
        selectedFile.value = null;
        isFileUploaded.value = false;
        if (fileInput.value) {
          fileInput.value.value = '';
        }
      };

      // 기존 파일 업로드 핸들러 (기존 코드와의 호환성 유지)
      const fileUpload = async (selectType, event) => {
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

      const closeConfirmState = reactive({
        view: false,
        title: '작업 취소',
        message: '작업이 취소됩니다. 정말 취소하시겠습니까?',
      });

      const onCloseConfirm = () => {
        closeConfirmState.view = true;
      };

      const onConfirm = async () => {
        console.log('formData : ', formData);

        if (!isFileUploaded.value) {
          setAlertStatus({
            view: true,
            message: '업로드할 파일을 선택해주세요.',
          });
          return;
        }

        try {
          // FormData 생성
          const formDataObj = new FormData();

          // 파일 추가 - 'file' 이름으로 추가
          formDataObj.append(
            'file',
            selectedFile.value,
            selectedFile.value.name
          );

          // 메타데이터를 JSON 객체로 추가
          const metaData = {
            dictionaryId: externalDictionaryVersion.value.dictionaryId,
            versionId: externalDictionaryVersion.value.versionId,
          };

          // 메타데이터를 JSON 문자열로 변환 후 Blob 객체로 생성
          const metaDataBlob = new Blob([JSON.stringify(metaData)], {
            type: 'application/json',
          });

          // 'metaData' 이름으로 Blob 객체 추가
          formDataObj.append('metaData', metaDataBlob, 'metadata.json');

          console.log('업로드 요청 데이터:', {
            formData: formDataObj,
            metaData: metaData,
          });

          const params = {
            dictionaryId: externalDictionaryVersion.value.dictionaryId,
            versionId: externalDictionaryVersion.value.versionId,
          };

          // 공식사전 업로드 API 호출
          const response = await uploadCommonDictionary(formDataObj, params);
          console.log('업로드 응답:', response);

          if (response.status === 200) {
            // 성공 메시지 표시
            setAlertStatus({
              view: true,
              message: '공식사전 파일이 성공적으로 업로드되었습니다.',
            });

            // 부모 컴포넌트에 완료 이벤트 전달
            emit('confirm');
            emit('close');
          }
        } catch (error) {
          console.error('파일 업로드 중 오류 발생:', error);

          // 에러 메시지 처리
          const errorMsg =
            error.response?.data?.message ||
            '파일 업로드 중 오류가 발생했습니다. 다시 시도해주세요.';

          setAlertStatus({
            view: true,
            message: errorMsg,
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
        resetData();
        emit('close');
      };

      const TermVersionTab = defineAsyncComponent(() =>
        import(
          '@/views/systemMng/components/ExternalDictionary/versionUploadTab/TermVersionTab.vue'
        )
      );

      const WordVersionTab = defineAsyncComponent(() =>
        import(
          '@/views/systemMng/components/ExternalDictionary/versionUploadTab/WordVersionTab.vue'
        )
      );

      const DomainVersionTab = defineAsyncComponent(() =>
        import(
          '@/views/systemMng/components/ExternalDictionary/versionUploadTab/DomainVersionTab.vue'
        )
      );

      const currentTab = shallowRef(TermVersionTab);
      const tabList = reactive(['용어', '단어', '도메인']);
      const activeTab = ref(1);

      onBeforeMount(() => {
        console.log(
          'externalDictionaryVersion : ',
          externalDictionaryVersion.value
        );

        console.log('selectVersion : ', props.selectVersion);
        formData.versionName = externalDictionaryVersion.value.versionName;
        formData.enactCycle = externalDictionaryVersion.value.enactCycle;
        formData.enactDate = externalDictionaryVersion.value.enactDate;
      });

      watch(activeTab, () => {
        if (activeTab.value == 1) {
          currentTab.value = TermVersionTab;
        } else if (activeTab.value == 2) {
          currentTab.value = WordVersionTab;
        } else {
          currentTab.value = DomainVersionTab;
        }
      });

      return {
        agGrid,
        recommendedEngData,
        rightAgGrid,
        gridApi,
        handleSetGridApi,
        handleFileUpload,
        fileUpload, // 기존 파일 업로드 함수 유지
        selectedFile,
        fileName,
        domainGroupFileName,
        domainClassFileName,
        domainFileName,
        onConfirm,
        onClose,
        uploadData,
        domainTempleteDownload,
        onCloseConfirm,
        closeConfirmState,
        tabList,
        activeTab,
        currentTab,
        apiUrl,
        formData,
        fileInput,
        isFileUploaded,
        termDataCount,
        wordDataCount,
        domainDataCount,
      };
    },
  };
</script>

<style lang="scss" scoped>
  .file-upload-group {
    display: flex;
    width: 100%;
    align-items: center;

    .file-name {
      flex: 1;
      margin-right: 10px;
    }

    .file-upload-buttons {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .file-upload-label {
      display: inline-block;
      padding: 6px 15px;
      background-color: #3c70b4;
      color: white;
      border-radius: 4px;
      cursor: pointer;
      white-space: nowrap;

      &:hover {
        background-color: #2c60a4;
      }

      .file-upload-input {
        display: none;
      }
    }
  }

  // 입력 테이블 스타일 개선
  .input-table {
    width: 100%;
    border-collapse: collapse;

    th,
    td {
      padding: 8px;
      border: 1px solid #ddd;
    }

    th {
      background-color: #f5f5f5;
      text-align: right;
      font-weight: 500;
      // color: #333;
    }

    td {
      font-size: 14px;
      vertical-align: middle;
    }

    .input-text {
      width: 100%;
      padding: 6px 8px;
      border: 1px solid #ccc;
      border-radius: 4px;

      &:focus {
        border-color: #3c70b4;
        outline: none;
      }
    }
  }
</style>
