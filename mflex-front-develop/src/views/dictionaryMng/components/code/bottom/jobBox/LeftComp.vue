<template>
  <div class="grid-wrap job-code-grid">
    <div class="grid-top">
      <div class="title-top">
        <div class="title-s">
          <div class="title-s-left">
            코드작업 box
            <AppTooltip>
              <div>
                작업 box에서는 우측에서 작업한 <br />
                모든 작업 목록을 조회할 수 있습니다.<br /><br />
                ‘작업취소’ 버튼을 클릭하여 목록 중<br />
                선택한 작업을 작업box에서 삭제합니다.<br /><br />
                ‘작업완료’버튼을 클릭하면 <br />
                작업 결과 검증 후 표준신청이 완료됩니다.
              </div>
            </AppTooltip>
          </div>
          <div class="btns">
            <button
              class="btn-s"
              @click="onCancelConfirm"
              :disabled="isJobCheckd"
            >
              작업취소
            </button>
            <button
              class="btn-s dark-blue"
              @click="isSelectDelete ? onWarnConfirm() : onApproval()"
              :disabled="isJobCheckd"
            >
              작업완료
            </button>
          </div>
        </div>
        <div class="title-btns__row_btween">
          <div class="btns">
            <button class="btn-s blue" @click="onOpenCodeFileUploadWindow">
              코드 일괄 등록
            </button>
          </div>
        </div>
      </div>
      <div class="top-row">
        <GridSearch
          :modelValue="searchInput"
          :columnFcDefs="columnDefs"
          :resultCount="resultCount"
          :gridDefs="gridInfoDefs"
          @search-type="handleChangeSearchType"
          @open-chatbot-window="onOpenChatbotWindow"
          @enter="onSearchEnter"
          @save="onSaveGridSettingWindow"
          @setup="onSearchSetup"
          @remove="onResetFilter"
          @filter-window-closed="onFilterWindowClosed"
          @column-state-changed="handleColumnStateChanged"
          class="br-t"
        />
      </div>
    </div>
    <div class="grid-list code-job-grid">
      <AppGrid
        :rowData="codeSearchData"
        :columnDefs="columnDefs"
        :context="context"
        rowSelection="multiple"
        @rowDoubleClicked="onRowDoubleClicked"
        @rowClicked="onRowClicked"
        @gridApi="onGridReady"
        @sort-changed="handleSortChanged"
        @column-state-changed="handleColumnStateChanged"
        @selectionChanged="onSelectionChanged"
        :rowSelectDisabled="true"
        ref="agGrid"
      />
    </div>
    <!-- <div class="grid-bottom"></div> -->
  </div>
  <!-- 작업취소 알림창 -->
  <AppDialog
    v-model:view="cancelConfirmState.view"
    :title="cancelConfirmState.title"
    :message="cancelConfirmState.message"
    @confirm="onCancel"
  />
  <!-- 승인신청 알림창 -->
  <AppDialog
    v-model:view="approvalConfirmState.view"
    :title="approvalConfirmState.title"
    :message="approvalConfirmState.message"
    @confirm="onApproval"
  />
  <!-- 필터 초기화 알림창-->
  <AppDialog
    v-model:view="resetFilterState.view"
    :title="resetFilterState.title"
    :message="resetFilterState.message"
    @confirm="onSearchRemove"
  />

  <!-- 통합코드값 삭제 경고창 -->
  <AppDialog
    v-model:view="warnUnityCodeValueState.view"
    :title="warnUnityCodeValueState.title"
    :message="warnUnityCodeValueState.message"
    :type="warnUnityCodeValueState.type"
    @confirm="onApproval"
  />
  <!-- 그리드세팅 저장 알림창 -->
  <AppDialog
    v-model:view="saveGridSettingView.view"
    :title="saveGridSettingView.title"
    :message="saveGridSettingView.message"
    @confirm="onSetUserGridSetting"
  />

  <!-- 코드 파일 업로드 팝업  -->
  <AppWindow
    :view="codeFileUploadWindowView"
    @close="onCloseCodeFileUploadWindow"
    width="1300px"
    height="700px"
  >
    <CodeFileUploadWindow
      @confirm="onConfirmCodeFileUploadWindow"
      @close="onCloseCodeUploadWindow"
    >
    </CodeFileUploadWindow>
  </AppWindow>

  <AppWindow
    :view="chatbotWindowView"
    :moveState="true"
    @close="onCloseChatbotWindow"
    width="500px"
    height="auto"
  >
    <ChatbotWindow
      :gridId="codeJobGridId"
      @bind-query="handleBindQuery"
      @confirm="onConfirmChatbot"
      @close="onCloseChatbotWindow"
    />
  </AppWindow>
</template>

<script>
  import { reactive, ref, inject, watch, nextTick, onBeforeMount } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import { useAlert } from '@/composables/alert';
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppTree from '@/components/ui/AppTree.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import RegTypeCellRenderer from '@/utils/RegTypeCellRenderer.js';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import ChatbotWindow from '@/components/popWindow/ChatbotWindow.vue';
  import CodeUploadWindow from '@/components/popWindow/CodeUploadWindow.vue';
  import CodeFileUploadWindow from '@/components/popWindow/CodeFileUploadWindow.vue';
  import {
    getResearchCodeJob, // 코드 작업목록 필터
    getCodeValueDetails, // 코드값 상세조회
    getCancelCodeNameJob,
    getApplyCodeNameJob, // 코드명 승인신청
    getCancelCodeValueJob, // 코드값 작업취소
    getApplyCodeValueJob,
    getCodeNameJobDetails, // 통합코드명 작업 상세조회`
  } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import { columnDefsUpdate } from '@/utils/js/searchModule';

  import {
    getUserGridSetting, // 사용자별 Grid 세팅 조회
    setUserGridSetting, // 사용자별 Grid 세팅 설정
    getGridDefaultData, // 그리드 기본값 조회
  } from '@/utils/mflexApi/common/commonApi'; // 공통 API 모듈

  export default {
    components: {
      TypeCellRenderer,
      GridSearch,
      AppTree,
      AppTooltip,
      RegTypeCellRenderer,
      AppWindow,
      CodeUploadWindow,
      CodeFileUploadWindow,
      ChatbotWindow,
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
      async onSearchEnter(value) {
        console.log('onSearchEnter', value);

        let sortQuery;

        // 쿼리 변환 함수
        function transformQuery(query) {
          // 정규표현식을 사용하여 컬럼명, 연산자, 검색 조건을 분리
          const regex =
            /(\S+)\s+((?:like|=|<|>|<=|>=))\s+'([^']+)'(\s+(?:and|or)\s+)?/gi;
          return query.replace(
            regex,
            (match, column, operator, searchTerm, logicalOperator) => {
              if (column === '최종수정자') {
                // 최종수정자는 검색어 유지, 연산자만 대문자로 변환
                return `${column} ${operator.toUpperCase()} '${searchTerm}'${
                  logicalOperator ? logicalOperator.toUpperCase() : ''
                }`;
              }
              // 다른 컬럼들의 경우 영문 검색어와 연산자를 대문자로 변환
              const transformedTerm = searchTerm.replace(/[a-zA-Z]+/g, (word) =>
                word.toUpperCase()
              );
              return `${column} ${operator.toUpperCase()} '${transformedTerm}'${
                logicalOperator ? logicalOperator.toUpperCase() : ''
              }`;
            }
          );
        }

        const transformedQuery = transformQuery(value);

        if (this.searchType === 'natural-query' && value !== '') {
          const searchInfo = {
            gridId: this.codeJobGridId,
            query: transformedQuery,
          };
          const llmAnswer = await getCreateQuery(searchInfo);

          await columnDefsUpdate(
            llmAnswer.data.sort,
            this.columnDefs,
            this.codeJobGridId,
            this.gridApi
          );

          const codeQuery = {
            userId: this.userId,
            managementInstituteId: this.useMetaMngInstId,
            query: llmAnswer.data.where,
            sort: llmAnswer.data.sort,
          };

          this.searchInput = transformedQuery;
          this.codeJobQuery.query = llmAnswer.data.where;

          const codeJobSearchResult = await getResearchCodeJob(codeQuery);

          console.log('searchResult : ', codeJobSearchResult);

          if (codeJobSearchResult.status === 409) {
            this.resultCount.total = 0;
            this.codeSearchData.value = [];
          }

          const codeJobData = this.jobCodeSearchResultBinding(
            codeJobSearchResult.data
          );

          console.log('codeJobData : ', codeJobData);

          this.codeSearchData.value = codeJobData;
          this.resultCount.total = codeJobSearchResult.data.totalCount;
          nextTick(() => {
            const jobCodeGrid = document.querySelector('.job-code-grid');
            console.log('jobCodeGrid : ', jobCodeGrid);
            const nodesWithRowId0 = jobCodeGrid.querySelector('[row-id="0"]');
            console.log('nodesWithRowId0 : ', nodesWithRowId0);
            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);
          });
        } else {
          console.log('this.sortStateQuery : ', this.sortStateQuery);

          this.codeJobQuery.query = transformedQuery;
          if (this.sortStateQuery != null) {
            sortQuery = this.sortStateQuery;
          } else {
            sortQuery = this.sortQuery;
          }
          //const sortQuery = this.sortStateQuery;
          //console.log('!!!sortQuery : ', sortQuery);

          const codeQuery = {
            userId: this.userId,
            managementInstituteId: this.useMetaMngInstId,
            query: transformedQuery,
            sort: sortQuery,
          };

          const codeJobSearchResult = await getResearchCodeJob(codeQuery);
          console.log('searchResult : ', codeJobSearchResult);

          if (codeJobSearchResult.status === 409) {
            this.resultCount.total = 0;
            this.codeSearchData.value = [];
          }

          const codeJobData = this.jobCodeSearchResultBinding(
            codeJobSearchResult.data
          );

          console.log('codeJobData : ', codeJobData);

          this.codeSearchData.value = codeJobData;
          this.resultCount.total = codeJobSearchResult.data.totalCount;
          nextTick(() => {
            const jobCodeGrid = document.querySelector('.job-code-grid');
            console.log('jobCodeGrid : ', jobCodeGrid);
            const nodesWithRowId0 = jobCodeGrid.querySelector('[row-id="0"]');
            console.log('nodesWithRowId0 : ', nodesWithRowId0);
            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);
          });
        }
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    computed: {
      isJobCheckd() {
        return this.codeJobSelected.length === 0;
      },
      isSelectDelete() {
        return this.codeJobSelected.some(
          (item) => item.data.applicationCategory === '삭제등록'
        );
      },
    },
    emits: ['code-work-apply'],
    setup(props, { emit }) {
      const uiStore = useUiStore();
      const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);
      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);

      const { setAlertStatus } = useAlert();

      const userId = userInfo.value.userId;

      const agGrid = ref(null);
      const gridApi = ref(null);

      const onGridReady = (params) => {
        console.log('params: ', params);
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);

        console.log('선택 노드 : ', gridApi.value.getSelectedNodes());
      };

      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const dictionaryMngStore = useDictionaryMngStore();

      const {
        setCodeNameJobUpdateData,
        setCodeValueJobUpdateData,
        setIsCodeJobType,
        setIsCodeJobSave,
        setIsCodeJobApproval,
        setCodeJobSelectData,
      } = dictionaryMngStore;

      const { isCodeJobSave, isCodeJobType } = storeToRefs(dictionaryMngStore);

      const codeJobSelected = ref([]);

      const onSelectionChanged = () => {
        const selectedNodes = gridApi.value.getSelectedNodes();
        codeJobSelected.value = selectedNodes;

        console.log('codeJobSelected.value:', codeJobSelected.value);
        console.log('선택된 행:', selectedNodes);
        // 선택된 행에 대한 추가 작업 수행
      };

      const codeSearchData = reactive({});

      const codeJobGridId = ref('MFGRD023');
      const gridInfoDefs = ref({
        scrnGridId: codeJobGridId,
        scrnId: '',
      });
      const columnDefs = ref([]);

      const searchType = ref('query');
      const searchInput = ref('');

      const handleChangeSearchType = (searchTypeData) => {
        console.log('handleChangeSearchType : ', searchTypeData);
        searchType.value = searchTypeData;
      };

      const transformGridData = (data) => {
        console.log('transformGridData-data : ', data);

        const fieldMapping = {
          NO: 'no',
          JOB_DV_NM: 'applicationCategory',
          UNTY_CD_DV_NM: 'codeTypeName',
          UNTY_CD_KORN_NM: 'unityCodeKoreanName',
          UNTY_CD_VL: 'unityCodeValue',
          UNTY_CD_VL_NM: 'unityCodeValueName',
        };

        const specialConfig = {
          applicationCategory: {
            cellRenderer: 'RegTypeCellRenderer',
          },
          unityCodeKoreanName: {
            cellRenderer: 'TypeCellRenderer',
            valueFormatter: '(params) => params.value',
          },
        };

        return data.map((item) => {
          const fieldName =
            fieldMapping[item.gridArticleName] ||
            item.gridArticleName.toLowerCase();
          const config = specialConfig[fieldName] || {};

          return {
            cellClass:
              fieldName === 'no' ||
              fieldName === 'applicationCategory' ||
              fieldName === 'codeTypeName'
                ? 'grid-cell-centered'
                : 'ag-left-aligned-cell',
            cellRenderer: config.cellRenderer || null,
            field: fieldName,
            headerName: item.gridArticleKoreanName,
            hide: fieldName === 'termEngName' ? true : !item.articleDisplayYn,
            minWidth: item.articleColumnWidth,
            pinned: item.articleFixedCode || '',
            sort: item.articleDataSortCode,
            sortIndex: item.articleDataSortOrder,
            sortable: item.articleDataSortYn,
            suppressSorting: !item.articleDataSortYn,
            valueFormatter:
              config.valueFormatter !== undefined
                ? config.valueFormatter
                : null,
            width: item.articleColumnWidth,
          };
        });
      };

      const getGridInfo = async () => {
        try {
          // 코드명 그리드
          const userGridData = await getUserGridSetting('MFGRD023');

          console.log('termJobGridData  : ', userGridData);

          const transformedData = await transformGridData(userGridData);
          console.log('Transformed Grid Data:', transformedData);

          return { transformedData }; // transformedData를 반환
        } catch (error) {
          console.error('Error in getGridInfo:', error);
          throw error;
        }
      };

      onBeforeMount(async () => {
        console.log('termSearch beforeMount  ========================');

        const gridStorage = JSON.parse(getGridInfoFromStorage());

        if (!gridStorage[codeJobGridId.value]) {
          try {
            // transformedData를 직접 받아서 처리
            const gridData = await getGridInfo();
            const transformedData = gridData.transformedData;

            const checkboxField = {
              headerName: '',
              field: 'checkbox',
              cellClass: 'grid-cell-centered',
              sort: null,
              sortIndex: null,
              hide: false,
              width: 30,
              headerCheckboxSelection: true,
              checkboxSelection: true,
              minWidth: 30,
            };

            const newColumnDefs = [checkboxField, ...transformedData];

            // columnDefs 설정
            columnDefs.value = newColumnDefs;

            // columnDefs가 설정된 후에 실행
            uiStore.setGridColumnDefs('MFGRD021', columnDefs.value);

            gridStorage[codeJobGridId.value] = newColumnDefs;
            saveGridInfoToStorage(gridStorage);

            // gridApi 설정이 유효한지 확인
            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', columnDefs.value);
            }

            // 모든 설정이 완료된 후 용어 조회 실행
            // await updateGridData(termQuery);
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          // columnDefs 설정
          columnDefs.value = gridStorage[codeJobGridId.value];
          // columnDefs가 설정된 후에 실행
        }
        codeJobQuery.sort = getSortQuery();

        await fetchData();
      });

      const resultCount = ref({ count: 0, total: 0 });

      const sortStateQuery = ref('');

      const sortedColumns = columnDefs.value
        .filter((col) => col.sort && col.sortIndex !== undefined)
        .sort((a, b) => a.sortIndex - b.sortIndex);

      console.log('sortedColumns : ', sortedColumns);

      // 정렬 쿼리 문자열을 생성합니다.
      const sortQuery =
        sortedColumns.length > 0
          ? sortedColumns
              .map((col) => `${col.headerName} ${col.sort}`)
              .join(', ')
          : '';

      const codeJobQuery = reactive({
        userId: userInfo.value.userId,
        managementInstituteId: useMetaMngInstId,
        query: '',
        sort: sortQuery,
      });

      const fetchData = async () => {
        const codeTempData = [];

        const codeJobList = await getResearchCodeJob(codeJobQuery);

        console.log('codeJobList : ', codeJobList);
        const list = codeJobList.data.cores;
        resultCount.value.total = codeJobList.data.totalCount;

        console.log('code - list : ', list);
        for (let i = 0; i < list.length; i++) {
          codeTempData.push({
            id: i,
            applicationCategory: list[i].jobDivisionName,
            codeTypeName: list[i].unityCodeDivisionName,
            unityCodeKoreanName: [
              {
                id: 0,
                label: list[i].unityCode.koreanName,
                type: list[i].unityCode.dictionary.type.name,
                color: list[i].unityCode.dictionary.type.fontColor,
                bgColor: list[i].unityCode.dictionary.type.backgroundColor,
                size: 60,
              },
            ],
            unityCodeValue: list[i].unityCode.value,
            unityCodeValueName: list[i].unityCode.valueName,
            unityCodeDictionaryId: list[i].unityCode.dictionary.id,
            unityCodeName: list[i].unityCode.name,
          });
        }
        console.log('codeJobList : ', codeJobList);

        codeSearchData.value = codeTempData;
      };

      fetchData();

      //작업 취소
      const cancelConfirmState = reactive({
        view: false,
        message:
          '선택한 항목이 작업목록에서 <span style="color: red;">삭제</span>됩니다. 계속하시겠습니까?',
      });
      const onCancelConfirm = () => {
        cancelConfirmState.view = true;
      };
      const onCancel = async () => {
        const selectedData = gridApi.value.getSelectedNodes();
        const selectCodeData = selectedData.map((item) => item.data);
        console.log('selectCodeData : ', selectCodeData);

        // 코드명, 코드값으로 분류
        const codeNameData = [];
        const codeValueData = [];

        selectCodeData.forEach((code) => {
          switch (code.codeTypeName) {
            case '코드명':
              codeNameData.push(code);
              break;
            case '코드값':
              codeValueData.push(code);
              break;
          }
        });

        if (codeNameData.length > 0) {
          const codeNameQuery = codeNameData.map((item) => {
            return {
              managementInstituteId: useMetaMngInstId,
              unityCodeDictionaryId: item.unityCodeDictionaryId,
              unityCodeName: item.unityCodeName,
              userId: userInfo.value.userId,
            };
          });

          const response = await getCancelCodeNameJob(codeNameQuery);
          console.log('코드명 작업취소 -- ', response);
        }

        if (codeValueData.length > 0) {
          const codeValueQuery = codeValueData.map((item) => {
            return {
              managementInstituteId: useMetaMngInstId,
              unityCodeDictionaryId: item.unityCodeDictionaryId,
              unityCodeName: item.unityCodeName,
              unityCodeValue: item.unityCodeValue,
              userId: userInfo.value.userId,
            };
          });

          const response = await getCancelCodeValueJob(codeValueQuery);
          console.log('코드값 작업취소 -- ', response);
        }

        await fetchData();

        // 작업완료(승인신청) 상태 변경
        setIsCodeJobApproval(true);
      };

      const onWarnConfirm = () => {
        warnUnityCodeValueState.view = true;
      };

      //승인 신청
      const approvalConfirmState = reactive({
        view: false,
        message: '작업저장이 완료되었습니다.',
      });
      const onApprovalConfirm = () => {
        approvalConfirmState.view = true;
      };

      const onApproval = async () => {
        try {
          const selectedData = gridApi.value.getSelectedNodes();
          const selectCodeData = selectedData.map((item) => item.data);

          const codeNameData = selectCodeData.filter(
            (code) => code.codeTypeName === '코드명'
          );
          const codeValueData = selectCodeData.filter(
            (code) => code.codeTypeName === '코드값'
          );

          let totalSuccessCount = 0;
          let totalFailCount = 0;
          let message = `
            <div style="text-align: center;">
              <p style="font-size: 17px; margin-bottom: 10px;">작업저장이 완료되었습니다.</p>
              <p style="color: #379583; font-weight: bold; margin-bottom: 10px;">[ 코드 작업완료 결과 ]</p>
              <div style="text-align: left; margin-top: 10px;">
          `;

          // 코드명 작업
          if (codeNameData.length > 0) {
            const codeNameQuery = codeNameData.map((item) => ({
              applicationCategory: item.applicationCategory,
              managementInstituteId: useMetaMngInstId,
              unityCodeDictionaryId: item.unityCodeDictionaryId,
              unityCodeName: item.unityCodeName,
              userId: userInfo.value.userId,
            }));

            const codeNameResponse = await getApplyCodeNameJob(codeNameQuery);
            const { successCount, failCount } =
              processApplyResult(codeNameResponse);
            totalSuccessCount += successCount;
            totalFailCount += failCount;
            message += `
              <p>코드명:
                <span style="color: #28a745;">성공 ${successCount}건</span>,
                <span style="color: #dc3545;">실패 ${failCount}건</span>
              </p>`;
          }

          // 코드값 작업
          if (codeValueData.length > 0) {
            const codeValueQuery = codeValueData.map((item) => ({
              applicationCategory: item.applicationCategory,
              managementInstituteId: useMetaMngInstId,
              unityCodeDictionaryId: item.unityCodeDictionaryId,
              unityCodeName: item.unityCodeName,
              unityCodeValue: item.unityCodeValue,
              userId: userInfo.value.userId,
            }));

            const codeValueResponse = await getApplyCodeValueJob(
              codeValueQuery
            );
            const { successCount, failCount } =
              processApplyResult(codeValueResponse);
            totalSuccessCount += successCount;
            totalFailCount += failCount;
            message += `
              <p>코드값:
                <span style="color: #28a745;">성공 ${successCount}건</span>,
                <span style="color: #dc3545;">실패 ${failCount}건</span>
              </p>`;
          }

          message += `
              </div>
              <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #ddd;">
                <strong>총 결과:</strong>
                <span style="color: #28a745; font-weight: bold;">성공 ${totalSuccessCount}건</span>,
                <span style="color: #dc3545; font-weight: bold;">실패 ${totalFailCount}건</span>
              </div>
            </div>
          `;

          setAlertStatus({
            view: true,
            message: message,
          });

          // 재조회
          await fetchData();
          // 상단 그리드 및 트리 재조회를 위한 emit
          setIsCodeJobApproval(true);
        } catch (error) {
          console.error('코드 작업 중 오류 발생:', error);
          setAlertStatus({
            view: true,
            message: '코드 작업 중 오류가 발생했습니다.',
          });
        }
      };

      // 작업 결과를 처리하는 헬퍼 함수
      function processApplyResult(response) {
        const successCount = response.data.successJob.length;
        const failCount = response.data.failedJob.length;
        return { successCount, failCount };
      }

      // 코드 업로드 팝업 상태
      const codeUploadWindowView = ref(false);
      // 코드 업로드 팝업 열기
      const onOpenCodeUploadWindow = () => {
        codeUploadWindowView.value = true;
      };
      // 코드 업로드 팝업 닫기
      const onCloseCodeUploadWindow = async () => {
        codeUploadWindowView.value = false;
        codeFileUploadWindowView.value = false;
        await fetchData();
      };

      // 코드 작업목록 조회 결과 바인딩
      const jobCodeSearchResultBinding = (codeJobSearchResult) => {
        console.log(
          'codeJobSearchResult - 조회된 데이터 : ',
          codeJobSearchResult
        );

        const codeJobList = codeJobSearchResult.cores;

        const tempData = [];

        for (let i = 0; i < codeJobList.length; i++) {
          tempData.push({
            id: i,
            applicationCategory: codeJobList[i].jobDivisionName,
            codeTypeName: codeJobList[i].unityCodeDivisionName,
            unityCodeKoreanName: [
              {
                id: 0,
                label: codeJobList[i].unityCode.koreanName,
                type: codeJobList[i].unityCode.dictionary.type.name,
                color: codeJobList[i].unityCode.dictionary.type.fontColor,
                bgColor:
                  codeJobList[i].unityCode.dictionary.type.backgroundColor,
                size: 60,
              },
            ],
            unityCodeValue: codeJobList[i].unityCode.value,
            unityCodeValueName: codeJobList[i].unityCode.valueName,
            unityCodeName: codeJobList[i].unityCode.name,
            unityCodeDictionaryId: codeJobList[i].unityCode.dictionary.id,
          });
        }

        //domainJobRowData.value = tempData;

        return tempData;
      };

      //그리드 칼럼 이동 및 사이즈 변경 등 이벤트 발생시 그리드 설정 값 업데이트
      function handleColumnStateChanged(newColumnState) {
        console.log('컬럼 이동 핸들러 동작 ====');

        console.log('newColumnState : ', newColumnState);

        // 새 컬럼 헤드 정의
        const newColumnFcDefs = newColumnState
          .map((colState) => {
            const colDef = columnDefs.value.find(
              (col) => col.field === colState.colId
            );
            if (!colDef) {
              console.error(
                `No column definition found for colId: ${colState.colId}`
              );
              return null;
            }

            // valueFormatter 및 cellRenderer 초기화
            let valueFormatter = null;
            let cellRenderer = null;

            // 필드 값에 따라 조건부로 valueFormatter 및 cellRenderer 설정
            if (colDef.field === 'unityCodeKoreanName') {
              valueFormatter = (params) => {
                if (
                  params.value &&
                  Array.isArray(params.value) &&
                  params.value.length > 0
                ) {
                  return params.value[0].excVal;
                }
                return '';
              };
              cellRenderer = 'TypeCellRenderer'; // 여기서 cellRenderer 설정
            } else if (colDef.field === 'applicationCategory') {
              valueFormatter = (params) => {
                const value = params.value;
                if (value && value.length === 8) {
                  return `${value.substring(0, 4)}-${value.substring(
                    4,
                    6
                  )}-${value.substring(6)}`;
                }
                return value;
              };
              cellRenderer = 'RegTypeCellRenderer';
            }

            return {
              ...colDef,
              width: colState.width,
              minWidth: colState.minWidth,
              hide: colState.hide,
              pinned: colState.pinned,
              sort: colState.sort,
              sortIndex: colState.sortIndex,
              suppressSorting: true,
              comparator: () => 0,
              valueFormatter: valueFormatter,
              cellRenderer:
                colDef.field === 'unityCodeKoreanName' ||
                colDef.field === 'applicationCategory'
                  ? cellRenderer
                  : null,
              headerCheckboxSelection:
                colDef.field === 'checkbox' ? true : false,
              checkboxSelection: colDef.field === 'checkbox' ? true : false,
            };
          })
          .filter((colDef) => colDef != null);

        //columnFcDefs.value = newColumnFcDefs; */

        console.log('newColumnFcDefs : ', newColumnFcDefs);

        gridApi.value.setGridOption('columnDefs', newColumnFcDefs);

        //newColumnDefs.value = newColumnFcDefs;

        columnDefs.value = newColumnFcDefs;

        // localStorage에 에서 gridData json 파싱, MFGRD017에 대한 값 변경
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage.MFGRD023 = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);
        // 스토어에 저장
        uiStore.setGridColumnDefs('MFGRD023', newColumnFcDefs);
      }

      // 정렬 핸들러
      const handleSortChanged = async (newSortedState) => {
        console.log('newSortedState : ', newSortedState);
        const sortQuery = ref('');
        const sortState = reactive({});

        //sortState.value = newSortedState;

        // newSortedState를 sortIndex를 기준으로 오름차순 정렬
        sortState.value = newSortedState
          .filter((state) => state.sort !== null) // sort가 null이 아닌 항목만 선택
          .sort((a, b) => {
            // sortIndex가 없는 경우 맨 뒤로 보냄
            if (a.sortIndex === undefined && b.sortIndex === undefined)
              return 0;
            if (a.sortIndex === undefined) return 1;
            if (b.sortIndex === undefined) return -1;
            // sortIndex를 기준으로 오름차순 정렬
            return a.sortIndex - b.sortIndex;
          });

        console.log('Sorted state:', sortState.value);
        console.log('domainJobRowData.value:', codeSearchData.value);
        console.log(
          'codeSearchData.value.length:',
          codeSearchData.value.length
        );

        const lastItem =
          codeSearchData.value.length > 0
            ? codeSearchData.value[codeSearchData.value.length - 1]
            : null;
        console.log('lastItem ===', lastItem);

        console.log('sortState :', sortState);

        // sort의 결과가 초기화 상태일 때,
        if (sortState.value.length == 0) {
          const codeSortQuery = {
            userId: userInfo.value.userId,
            managementInstituteId: useMetaMngInstId,
            query: '',
            sort: '',
          };
          sortStateQuery.value = '';

          const codeJobSearchResult = await getResearchCodeJob(codeSortQuery);
          const codeJobData = jobCodeSearchResultBinding(
            codeJobSearchResult.data
          );
          codeSearchData.value = codeJobData;
        } else {
          const sortParts = sortState.value.map(
            (column) => `${column.headerName} ${column.sort}`
          );
          sortQuery.value = sortParts.join(', ');
          sortStateQuery.value = sortQuery.value;

          console.log('sortQuery.value: ', sortQuery.value);
          console.log('sortStateQuery.value: ', sortStateQuery.value);

          const codeSortQuery = {
            userId: userInfo.value.userId,
            managementInstituteId: useMetaMngInstId,
            query: codeJobQuery.query,
            sort: sortQuery.value,
          };

          const codeJobSearchResult = await getResearchCodeJob(codeSortQuery);
          const codeJobData = jobCodeSearchResultBinding(
            codeJobSearchResult.data
          );
          codeSearchData.value = codeJobData;
        }

        //firstRowSelectedEvent();
      };

      // 필터창 종료 시 호출 함수
      const onFilterWindowClosed = async (filterSet) => {
        // 필터 창이 닫힐 때 수행하고 싶은 로직
        console.log('필터 창이 닫혔습니다.');
        console.log('filterSet : ', filterSet);

        // 맞춤형 필터 설정이 있을 때
        if (filterSet) {
          console.log('columnDefs.value : ', columnDefs.value);

          // 정렬이 적용된 모든 열을 찾습니다.
          const sortQuery = getSortQuery();

          // sortQuery 유무에 따른 정렬 및 필터 쿼리 설정
          let filterSortQuery;
          if (sortQuery != '') {
            filterSortQuery =
              filterSet.orderQuery != ''
                ? `${sortQuery}, ${filterSet.orderQuery}`
                : sortQuery;
          } else {
            filterSortQuery = filterSet.orderQuery;
          }

          const codeQuery = {
            userId: userId,
            managementInstituteId: useMetaMngInstId,

            query: filterSet.searchQuery,
            sort: filterSortQuery,
          };

          const codeJobFilterData = await getResearchCodeJob(codeQuery);

          if (codeJobFilterData.status === 409) {
            resultCount.value.total = 0;
            codeSearchData.value = [];
            codeJobQuery.query = filterSet.searchQuery;
            searchInput.value = filterSet.searchQuery;
            return;
          }

          // const filterSearchData = getTermRowData(termFilterData);
          const filterSearchData = jobCodeSearchResultBinding(
            codeJobFilterData.data
          );

          codeJobQuery.query = filterSet.searchQuery;
          searchInput.value = filterSet.searchQuery;

          console.log('filterSearchData : ', filterSearchData);
          codeSearchData.value = filterSearchData;
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());
          console.log('gridStorage.MFGRD023 : ', gridStorage.MFGRD023);
          columnDefs.value = gridStorage.MFGRD023;

          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD023);
        }
      };

      // 필터 초기화 confirm 팝업
      const resetFilterState = reactive({
        view: false,
        message:
          '그리드 설정 정보를 <strong style="color:red">초기화</strong> 하시겠습니까?',
      });

      const onResetFilter = () => {
        resetFilterState.view = true;
      };

      const onSearchRemove = async () => {
        console.log('onSearchRemove 함수 실행 ===');

        // 그리드 기본값 호출
        const gridDefaultData = await getGridDefaultData(codeJobGridId.value);

        console.log('gridDefaultData : ', gridDefaultData);

        // 기본값 설정
        await setUserGridSetting(codeJobGridId.value, gridDefaultData);

        const transformedData = transformGridData(gridDefaultData);

        console.log('transformedData : ', transformedData);

        const checkboxField = {
          headerName: '',
          field: 'checkbox',
          cellClass: 'grid-cell-centered',
          sort: null,
          sortIndex: null,
          hide: false,
          width: 30,
          headerCheckboxSelection: true,
          checkboxSelection: true,
          minWidth: 30,
        };

        columnDefs.value = [checkboxField, ...transformedData];

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage[codeJobGridId.value] = transformedData;

        saveGridInfoToStorage(gridStorage);

        uiStore.setGridColumnDefs(codeJobGridId.value, columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        // await updateGridData(termQuery);

        codeJobQuery.query = '';
        searchInput.value = '';

        await fetchData();
      };

      // 통합코드값 삭제 경고
      const warnUnityCodeValueState = reactive({
        value: false,
        title: '통합코드값 삭제 확인 메세지',
        message:
          '통합코드명을 삭제하면 연결된 통합코드값도 같이 삭제 됩니다. <br>통합코드명을 삭제 하시겠습니까?',
        type: 'warnCodeValue',
      });

      // 작업 목록 그리드 선택 시
      const onRowClicked = async (value) => {
        console.log('value : ', value);

        const selectedRow = document.querySelectorAll(
          '[class~="ag-row-selected"]'
        );
        // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        const clickedNode = document.querySelector(
          `.code-job-grid [row-id="${clickNode}"]`
        );

        // 통합코드명 그리드 선택 시
        if (!value.unityCodeValue) {
          console.log('통합코드명 항목 선택 ');
          const codeNameQuery = {
            managementInstituteId: useMetaMngInstId,
            userId: userInfo.value.userId,
            unityCodeDictionaryId: value.unityCodeDictionaryId,
            unityCodeName: value.unityCodeName,
          };
          const response = await getCodeNameJobDetails(codeNameQuery);

          console.log('codeBottom - response : ', response);

          setIsCodeJobType('jobCodeName');
          nextTick(() => {
            setCodeJobSelectData(response.data);
            clickedNode.classList.add('ag-row-selected');
          });
        } else {
          console.log('통합코드값 항목 선택 ');
          const getCodeValueJobDetails = {
            managementInstituteId: useMetaMngInstId,
            userId: userInfo.value.userId,
            unityCodeDictionaryId: value.unityCodeDictionaryId,
            unityCodeName: value.unityCodeName,
            unityCodeValue: value.unityCodeValue,
          };
          const response = await getCodeValueDetails(getCodeValueJobDetails);

          setIsCodeJobType('jobCodeValue');
          nextTick(() => {
            setCodeJobSelectData(response.data);
          });
        }

        // 통합코드값 그리드 선택 시
      };

      // 정렬(소팅) 데이터 문자열 반환 함수
      const getSortQuery = () => {
        const sortedColumns = columnDefs.value
          .filter((col) => col.sort && col.sortIndex !== undefined)
          .sort((a, b) => a.sortIndex - b.sortIndex);

        console.log('sortedColumns : ', sortedColumns);

        // 정렬 쿼리 문자열을 생성합니다.
        const sortQuery =
          sortedColumns.length > 0
            ? sortedColumns
                .map((col) => `${col.headerName} ${col.sort}`)
                .join(', ')
            : '';

        return sortQuery;
      };

      // 작업 저장 시
      watch(
        () => isCodeJobSave.value,
        async (value) => {
          console.log('LeftComp - isCodeJobType.value : ', isCodeJobType.value);
          console.log('LeftComp - isCodeJobSave : ', value);

          if (value === true) {
            await fetchData();
            setIsCodeJobSave(false);
          }
        }
      );

      const codeFileUploadWindowView = ref(false);

      const onOpenCodeFileUploadWindow = () => {
        codeFileUploadWindowView.value = true;
      };

      const onCloseCodeFileUploadWindow = () => {
        codeFileUploadWindowView.value = false;
      };

      const onConfirmCodeFileUploadWindow = async () => {
        await fetchData();
        // codeFileUploadWindowView.value = false;
      };

      // 챗봇 팝업창 열기
      const chatbotWindowView = ref(false);
      const onOpenChatbotWindow = () => {
        chatbotWindowView.value = true;
      };
      const onCloseChatbotWindow = () => {
        chatbotWindowView.value = false;
      };

      // 챗봇 팝업창에서 쿼리 바인딩
      const handleBindQuery = async (llmAnswer) => {
        chatbotWindowView.value = false;
        codeJobQuery.query = llmAnswer.where;
        searchInput.value = llmAnswer.where;

        await columnDefsUpdate(
          llmAnswer.sort,
          columnDefs,
          codeJobGridId.value,
          gridApi
        );

        codeJobQuery.sort = llmAnswer.sort;
        codeJobQuery.query = llmAnswer.where;

        await fetchData();
      };

      const onSetUserGridSetting = async () => {
        const gridStorage = JSON.parse(getGridInfoFromStorage());

        const fieldMapping = {
          no: 'NO',
          applicationCategory: 'JOB_DV_NM',
          codeTypeName: 'UNTY_CD_DV_NM',
          unityCodeKoreanName: 'UNTY_CD_KORN_NM',
          unityCodeValue: 'UNTY_CD_VL',
          unityCodeValueName: 'UNTY_CD_VL_NM',
        };

        const newGridStting = columnDefs.value
          .map((item, index) => {
            if (item.field !== 'checkbox') {
              const articleName = fieldMapping[item.field];
              return {
                gridArticleName: articleName,
                gridArticleKoreanName: item.headerName,
                articlePositionOrder: index + 1,
                articleColumnWidth: item.width,
                articleDisplayYn: !item.hide,
                articleFixedCode: item.pinned,
                articleDataSortYn: item.sortable,
                articleDataSortOrder: item.sortIndex,
                articleDataSortCode: item.sort,
              };
            }
          })
          .filter((item) => item !== undefined);

        console.log('newGridStting : ', newGridStting);

        await setUserGridSetting(codeJobGridId.value, newGridStting);

        // updateGridData(termQuery);
      };

      const saveGridSettingView = reactive({
        view: false,
        message: '그리드 설정 정보를 저장 하시겠습니까?',
      });

      const onSaveGridSettingWindow = () => {
        saveGridSettingView.view = true;
      };

      return {
        agGrid,
        codeSearchData,
        resultCount,
        cancelConfirmState,
        onCancelConfirm,
        onCancel,
        approvalConfirmState,
        onApprovalConfirm,
        onApproval,
        columnDefs, // 그리드 컬럼정보
        gridInfoDefs, // GridSearch 그리드 정보
        codeUploadWindowView,
        onOpenCodeUploadWindow,
        onCloseCodeUploadWindow,
        handleColumnStateChanged,
        onGridReady,
        codeJobQuery,
        handleSortChanged,
        sortStateQuery,
        userId,
        useMetaMngInstId,
        jobCodeSearchResultBinding,
        onFilterWindowClosed,
        resetFilterState,
        onResetFilter,
        onSearchRemove,
        codeJobSelected,
        onSelectionChanged,
        warnUnityCodeValueState,
        onWarnConfirm,
        onRowClicked,
        setCodeNameJobUpdateData,
        setCodeValueJobUpdateData,
        setIsCodeJobType,
        codeFileUploadWindowView,
        onOpenCodeFileUploadWindow,
        onCloseCodeFileUploadWindow,
        onConfirmCodeFileUploadWindow,
        codeJobGridId,
        chatbotWindowView,
        onOpenChatbotWindow,
        onCloseChatbotWindow,
        handleBindQuery,
        onSetUserGridSetting,
        saveGridSettingView,
        onSaveGridSettingWindow,
        handleChangeSearchType,
        searchType,
        searchInput,
        gridApi,
      };
    },
  };
</script>
