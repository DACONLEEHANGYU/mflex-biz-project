<template>
  <div class="grid-wrap job-term-gird">
    <div class="grid-top">
      <div class="title-top">
        <div class="title-s">
          <div class="title-s-left">
            작업 box
            <AppTooltip :htmlContent="getTooltipById('jobBox')"> </AppTooltip>
          </div>
          <div class="btns" style="display: flex">
            <button
              class="btn-s cancel-btn"
              title="작업취소"
              @click="onCancelConfirm"
              :disabled="termJobSelected.length < 1"
            >
              작업취소
            </button>
            <button
              class="btn-s apply-btn"
              title="작업완료"
              :disabled="termJobSelected.length < 1"
              @click="onApprovalPopup"
            >
              작업완료
            </button>
          </div>
        </div>
        <div class="title-btns__row_btween">
          <div class="btns">
            <button
              class="btn-s green"
              title="일괄 용어명 생성"
              @click="onOpenAllEngCreateWindow"
            >
              일괄 용어명 생성
            </button>
            <button
              class="btn-s blue"
              title="표준화 용어 추출"
              @click="onOpenExtractTermWindow"
            >
              표준화 용어추출
            </button>
          </div>
        </div>
      </div>
      <div class="top-row">
        <GridSearch
          :resultCount="resultCount"
          :columnFcDefs="columnDefs"
          :modelValue="searchInput"
          :gridDefs="gridInfoDefs"
          @search-type="handleChangeSearchType"
          @open-chatbot-window="onOpenChatbotWindow"
          @body-scroll="handleScrollChanged"
          @enter="onSearchEnter"
          @save="onSaveGridSettingWindow"
          @remove="onResetFilter"
          @filter-window-closed="onFilterWindowClosed"
          @column-state-changed="handleColumnStateChanged"
          @excel-download="handleExcelDownload"
          class="br-t"
        />
      </div>
    </div>
    <div class="grid-list term-job-grid">
      <AppGrid
        :rowData="workSearchData"
        :columnDefs="columnDefs"
        :context="context"
        rowSelection="multiple"
        @rowDoubleClicked="onRowDoubleClicked"
        @body-scroll="handleScrollChanged"
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
    @confirm="onCancel(0)"
  />
  <!-- 승인신청 알림창 -->
  <AppDialog
    v-model:view="approvalConfirmState.view"
    :title="approvalConfirmState.title"
    :message="approvalConfirmState.message"
    @confirm="onApproval()"
  />
  <!-- 필터 초기화 알림창-->
  <AppDialog
    v-model:view="resetFilterState.view"
    :title="resetFilterState.title"
    :message="resetFilterState.message"
    @confirm="onSearchRemove"
  />
  <AppDialog
    v-model:view="saveGridSettingView.view"
    :title="saveGridSettingView.title"
    :message="saveGridSettingView.message"
    @confirm="onSetUserGridSetting"
  />

  <!-- 일괄 영문 약어생성창 -->
  <AppWindow
    :view="allEngCreateWindowView"
    @close="onCloseAllEngCreateWindow"
    width="1400px"
    height="auto"
  >
    <AllTermCreateWindow
      :selectData="termJobSelected"
      @confirm="onAllEngCreateSave"
      @close="onCloseAllEngCreateWindow"
    />
  </AppWindow>

  <AppWindow
    :view="termFileUploadWindowView"
    @close="onCloseTermFileUploadWindow"
    width="1300px"
    height="700px"
  >
    <TermFileUploadWindow
      @confirm="onTermFileUploadSave"
      @close="onCloseTermFileUploadWindow"
    />
  </AppWindow>

  <AppWindow
    :view="chatbotWindowView"
    @close="onCloseChatbotWindow"
    :moveState="true"
    width="500px"
    height="auto"
  >
    <ChatbotWindow
      :gridId="termJobGridId"
      @bind-query="handleBindQuery"
      @confirm="onConfirmChatbot"
      @close="onCloseChatbotWindow"
    />
  </AppWindow>

  <!-- 표준화 용어추출-->
  <AppWindow
    :view="extractTermWindowView"
    @close="onCloseExtractTermWindow"
    width="700px"
    height="auto"
  >
    <ConfirmWindow
      :popInfo="popInfo"
      @confirm="onExtractTerm"
      @close="onCloseExtractTermWindow"
    />
  </AppWindow>

  <!-- 결재 팝업 -->
  <AppWindow
    :view="approvalPopupView"
    @close="onCloseWordSearchWindow"
    width="800px"
    height="auto"
  >
    <ApprovalRequestWindow
      :type="'term-synchronize'"
      :selectedData="selectTermGridData"
      @confirm="onApprovalRequestConfirm"
      @error="onApprovalRequestError"
      @close="onCloseApprovalPopup"
    />
  </AppWindow>

  <!-- 결재 완료 팝업 -->
  <AppWindow
    :view="confirmWindowView"
    @close="onCloseConfirmWindow"
    width="600px"
    height="auto"
  >
    <ConfirmWindow
      :popInfo="popInfo"
      @confirm="onRedirectApproval"
      @close="onCloseConfirmWindow"
    />
  </AppWindow>
</template>

<script>
  import {
    reactive,
    ref,
    inject,
    watch,
    watchEffect,
    nextTick,
    onActivated,
    onBeforeMount,
  } from 'vue';
  import { $vxHttp } from '@/api';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import { useActualizingStore } from '@/stores/actualizing';
  import { useRouter } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import RegTypeCellRenderer from '@/utils/RegTypeCellRenderer.js';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import AllTermCreateWindow from '@/components/popWindow/AllTermCreateWindow.vue';
  import MultiUploadWindow from '@/components/popWindow/MultiUploadWindow.vue';
  import TermFileUploadWindow from '@/components/popWindow/TermFileUploadWindow.vue';
  import ChatbotWindow from '@/components/popWindow/ChatbotWindow.vue';
  import ApprovalRequestWindow from '@/components/popWindow/approval/ApprovalRequestWindow.vue';
  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';
  import { useTabNaviStore } from '@/stores/tabNavi';

  import { useAlert } from '@/composables/alert';

  import { columnDefsUpdate } from '@/utils/js/searchModule';
  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import {
    getCompleteTermJob,
    jobTermSearchResultBinding,
  } from '@/utils/mflexApi/dictionaryManagementApi.js';

  import {
    getTermJobListV2, // 용어 작업 목록 조회
    getTermJobDetailsV2, // 용어 작업 상세 조회
    updateTermV2, // 용어 수정
    deleteTermV2, // 용어 삭제
    getTermCompliteJobV2, // 용어 작업 완료
    getJobTermDownload,
  } from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api.js';

  import {
    getExtractTerm, // 표준화용어 추출
    getTermPatch, // 작업용어 패치
  } from '@/utils/mflexApi/actualizing/actualizingApi.js';

  import {
    getUserGridSetting, // 사용자별 Grid 세팅 조회
    setUserGridSetting, // 사용자별 Grid 세팅 설정
    getGridDefaultData, // 그리드 기본값 조회
  } from '@/utils/mflexApi/common/commonApi'; // 공통 API 모듈
  export default {
    components: {
      TypeCellRenderer,
      RegTypeCellRenderer,
      GridSearch,
      AppTooltip,
      AppWindow,
      AllTermCreateWindow,
      TermFileUploadWindow,
      MultiUploadWindow,
      ChatbotWindow,
      ConfirmWindow,
      ApprovalRequestWindow,
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
      async onRowClicked(value) {
        this.setTermSourceCode('JOB');

        console.log('onRowClicked ', value);

        const selectedRow = document.querySelectorAll(
          '[class~="ag-row-selected"]'
        );
        // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        this.setIsTermJobUpdate(true);

        const selectTermJob = value;

        const termJobDetailQuery = {
          instituteId: selectTermJob.managementInstituteId,
          dictionaryId: selectTermJob.dictionaryId,
          jobTermId: selectTermJob.jobTermId,
        };

        const termJobDetail = await getTermJobDetailsV2(termJobDetailQuery);

        console.log('termJobDetail : ', termJobDetail.data);

        console.log('this.termDetailsData : ', this.termDetailsData);
        // this.onSelectReg(3);
        this.selectedRow = value;
        // this.jobUpdateYn = true;

        nextTick(() => {
          // TermJobUpdateComp에 props로 전달할 데이터
          this.termJobSelectData.value = termJobDetail.data;
          // this.setTermJobUpdateData(termJobDetail.data);
          this.setSelectTermJobData(termJobDetail.data);

          // select 효과 적용
          const clickNode = value.rowId;
          const clickedNode = document.querySelector(
            `.term-job-grid [row-id="${clickNode}"]`
          );

          console.log('clickedNode : ', clickedNode);

          clickedNode.classList.add('ag-row-selected');
        });

        this.termSelectTab1Data = null;
      },
      async onSearchEnter(value) {
        console.log('onSearchEnter', value);

        let sortQuery;

        console.log('this.sortStateQuery : ', this.sortStateQuery);

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
            gridId: this.termJobGridId,
            query: transformedQuery,
          };
          const llmAnswer = await getCreateQuery(searchInfo);

          await columnDefsUpdate(
            llmAnswer.data.sort,
            this.columnDefs,
            this.termJobGridId,
            this.gridApi
          );

          this.termJobQuery.query = llmAnswer.data.where;
          this.searchInput = transformedQuery;

          const termJobQuery = {
            instituteId: this.useMetaMngInstId,
            dictionaryId: this.useDctnryId,
            jobTypeCode: '',
            lastItem: {},
            query: llmAnswer.data.where,
            sort: llmAnswer.data.sort,
          };

          const termJobSearchResult = await getTermJobListV2(termJobQuery);
          console.log('searchResult : ', termJobSearchResult.data);

          if (termJobSearchResult) {
            const termJobData = jobTermSearchResultBinding(termJobSearchResult);

            console.log('termJobData : ', termJobData);

            this.workSearchData.value = termJobData;
            this.resultCount.total = termJobSearchResult.data.totalCount;
            nextTick(() => {
              const jobTermGrid = document.querySelector('.job-term-gird');
              console.log('jobTermGrid : ', jobTermGrid);
              const nodesWithRowId0 = jobTermGrid.querySelector('[row-id="0"]');
              console.log('nodesWithRowId0 : ', nodesWithRowId0);
              nodesWithRowId0.classList.add('ag-row-selected');
              nodesWithRowId0.classList.add('ag-row-focus');
              nodesWithRowId0.setAttribute('aria-selected', true);
            });
          } else {
            this.workSearchData.value = [];
            this.resultCount.total = 0;
          }
        } else {
          this.termJobQuery.query = transformedQuery;
          this.searchInput = transformedQuery;
          if (this.sortStateQuery != null) {
            sortQuery = this.sortStateQuery;
          } else {
            sortQuery = this.sortQuery;
          }

          const termJobQuery = {
            instituteId: this.useMetaMngInstId,
            dictionaryId: this.useDctnryId,
            jobTypeCode: 'CUR',
            query: transformedQuery,
            sort: sortQuery,
          };

          const termJobSearchResult = await getTermJobListV2(termJobQuery);
          console.log('searchResult : ', termJobSearchResult.data);

          if (termJobSearchResult) {
            const termJobData = jobTermSearchResultBinding(termJobSearchResult);

            console.log('termJobData : ', termJobData);

            this.workSearchData.value = termJobData;
            this.resultCount.count = termJobSearchResult.searchCount;
            this.resultCount.total = termJobSearchResult.totalCount;
            nextTick(() => {
              const jobTermGrid = document.querySelector('.job-term-gird');
              console.log('jobTermGrid : ', jobTermGrid);
              const nodesWithRowId0 = jobTermGrid.querySelector('[row-id="0"]');
              console.log('nodesWithRowId0 : ', nodesWithRowId0);
              nodesWithRowId0.classList.add('ag-row-selected');
              nodesWithRowId0.classList.add('ag-row-focus');
              nodesWithRowId0.setAttribute('aria-selected', true);
            });
          } else {
            this.workSearchData.value = [];
            this.resultCount.total = 0;
          }
        }
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    setup(props, { emit }) {
      const uiStore = useUiStore();
      const { setAlertStatus } = useAlert();

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      const { gridColumnDefs } = storeToRefs(uiStore);
      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);

      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      // 용어 작업 수정 및 조회상태 판별
      const jobUpdateYn = ref(false);

      const tabNaviStore = useTabNaviStore();
      const { setTabNaviData } = tabNaviStore;

      const dictionaryMngStore = useDictionaryMngStore();
      const { isTermJobSave, isTermJobApproval } =
        storeToRefs(dictionaryMngStore);
      const {
        setTermJobUpdateData,
        setIsTermJobUpdate,
        setIsTermJobSave,
        setIsTermJobApproval,
        setTermSourceCode,
      } = dictionaryMngStore;

      const actualizingStore = useActualizingStore();
      const { selectTermData, selectTermJobData } =
        storeToRefs(actualizingStore);
      const { setSelectTermJobData } = actualizingStore;

      const router = useRouter();

      // 현재 인덱스
      const currentRowIndex = ref(0);

      const agGrid = ref(null);
      const gridApi = ref(null);

      const termJobGridId = ref('MFGRD210');
      const gridInfoDefs = ref({
        scrnGridId: termJobGridId,
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
          // NO: 'no',
          JOB_DV_NM: 'applicationCategory',
          TRM_NM: 'termName',
          TRM_EABBR_NM: 'termEngAbbreviationName',
          DMN_NM: 'domainName',
          TRM_STD_YN_NM: 'termStandardYnName',
          TRM_NM_ERR_NM: 'termNameErrorName',
        };

        const specialConfig = {
          applicationCategory: {
            cellRenderer: 'RegTypeCellRenderer',
          },
          // domainName: {
          //   valueFormatter: '(params) => params.value',
          // },
        };

        return data
          .filter((item) => item.gridArticleName !== 'UPD_DTM')
          .map((item) => {
            const fieldName =
              fieldMapping[item.gridArticleName] ||
              item.gridArticleName.toLowerCase();
            const config = specialConfig[fieldName] || {};

            return {
              cellClass:
                fieldName === 'no' ||
                fieldName === 'applicationCategory' ||
                fieldName === 'termStandardYnName' ||
                fieldName === 'termNameErrorName'
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
          const userGridData = await getUserGridSetting('MFGRD210');

          console.log('termJobGridData  : ', userGridData);

          const transformedData = await transformGridData(userGridData);
          console.log('Transformed Grid Data:', transformedData);

          return { transformedData }; // transformedData를 반환
        } catch (error) {
          console.error('Error in getGridInfo:', error);
          throw error;
        }
      };

      const getSortQuery = () => {
        const sortedColumns = columnDefs.value
          .filter((col) => col.sort && col.sortIndex !== undefined)
          .sort((a, b) => a.sortIndex - b.sortIndex);

        const sortQuery =
          sortedColumns.length > 0
            ? sortedColumns
                .map((col) => `${col.headerName} ${col.sort}`)
                .join(', ')
            : '';

        return sortQuery;
      };

      onBeforeMount(async () => {
        console.log('termSearch beforeMount  ========================');

        const gridStorage = JSON.parse(getGridInfoFromStorage());

        if (!gridStorage[termJobGridId.value]) {
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

            console.log('newColumnDefs : ', newColumnDefs);

            // columnDefs 설정
            columnDefs.value = newColumnDefs;

            gridStorage[termJobGridId.value] = newColumnDefs;
            saveGridInfoToStorage(gridStorage);

            // columnDefs가 설정된 후에 실행
            uiStore.setGridColumnDefs('MFGRD210', columnDefs.value);

            // gridApi 설정이 유효한지 확인
            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', columnDefs.value);
            }
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          columnDefs.value = gridStorage[termJobGridId.value];
        }

        // 모든 설정이 완료된 후 용어 조회 실행
        researchQuery.sort = getSortQuery();

        await fetchData();
      });

      // gridApi 할당
      const onGridReady = (params) => {
        gridApi.value = params;
      };

      // 작업 용어 선택 항목
      const termJobSelected = ref([]);

      const onSelectionChanged = () => {
        const selectedNodes = gridApi.value.getSelectedNodes();

        // const standardNodes = selectedNodes.filter(
        //   (node) => node.data && node.data.termStandardYnName === '표준'
        // );

        termJobSelected.value = selectedNodes;
      };

      const workSearchData = reactive({});

      const sortStateQuery = ref('');

      const sortedColumns = columnDefs.value
        .filter((col) => col.sort && col.sortIndex !== undefined)
        .sort((a, b) => a.sortIndex - b.sortIndex);

      // 정렬 쿼리 문자열을 생성합니다.
      const sortQuery =
        sortedColumns.length > 0
          ? sortedColumns
              .map((col) => `${col.headerName} ${col.sort}`)
              .join(', ')
          : '';

      const termJobQuery = reactive({
        userId: userInfo.userId,
        managementInstituteId: useMetaMngInstId,
        query: '',
        sort: sortQuery,
      });

      const termJobSelectData = reactive({});

      //valueFormatter 함수 설정
      watchEffect(() => {
        const uiStore = useUiStore();
        const { gridColumnDefs } = storeToRefs(uiStore);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD210) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD210;

        // columnDefs.value = columnDefs.value.map((col) => {
        //   if (col.field === 'domainName') {
        //     return {
        //       ...col,
        //       valueFormatter: (params) => {
        //         if (
        //           params.value &&
        //           Array.isArray(params.value) &&
        //           params.value.length > 0
        //         ) {
        //           return params.value[0].excVal;
        //         }
        //         return '';
        //       },
        //       // cellRenderer: 'TypeCellRenderer',
        //       suppressSorting: true,
        //       comparator: () => 0,
        //     };
        //   } else {
        //     return col;
        //   }
        // });
      });

      const resultCount = ref({ count: '', total: '' });

      const researchQuery = {
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
        query: termJobQuery.query,
        sort: sortQuery,
        lastItem: {},
        jobTypeCode: 'CUR',
      };

      const fetchData = async () => {
        const termJobList = await getTermJobListV2(researchQuery);

        resultCount.value.count = termJobList.searchCount;
        resultCount.value.total = termJobList.totalCount;

        const termJobs = termJobList.items;

        console.log('termJobs : ', termJobs);

        const termJobData = [];

        let regType = '';

        // 조회된 데이터의 구분에 맞는 신청구분 표시
        for (let i = 0; termJobs.length > i; i++) {
          let category;

          if (termJobs[i].jobDivisionName === '신규등록') {
            category = '신규';
          } else if (termJobs[i].jobDivisionName === '변경등록') {
            category = '변경';
          } else if (termJobs[i].jobDivisionName === '폐기등록') {
            category = '폐기';
          } else if (termJobs[i].jobDivisionName === '복구등록') {
            category = '복구';
          } else if (termJobs[i].jobDivisionName === '삭제등록') {
            category = '삭제';
          } else {
            category = termJobs[i].jobDivisionName;
          }
          termJobData.push({
            rowId: i,
            no: i + 1,
            jobTermId: termJobs[i].jobTermId,
            id: termJobs[i].jobTermId,
            dictionaryId: termJobs[i].dictionaryId,
            applicationCategory: category,
            discardYn: termJobs[i].discardYn,
            managementInstituteId: termJobs[i].instituteId,
            termName: termJobs[i].termName,
            jobDivisionCode: termJobs[i].jobDivisionCode,
            jobDivisionName: termJobs[i].jobDivisionName,
            termEngAbbreviationName: termJobs[i].termAbbreviationName,
            domainName: termJobs[i].domainName,
            abbreviationYn: termJobs[i].abbreviationYn ? '완료' : '미완료',
            termErrorName: termJobs[i].termErrorName,
            termErrorYn: termJobs[i].termErrorYn,
            termStandardYn: termJobs[i].termStandardYn,
            termStandardYnName: termJobs[i].termStandardYnName,
            updateDateTime: termJobs[i].updateDateTime,
            termBasicErrorCode: termJobs[i].termBasicErrorCode,
            termNameErrorYn: termJobs[i].termNameErrorYn,
            termNameErrorName: termJobs[i].termNameErrorName,
            wordAbbreviationCombinationName:
              termJobs[i].wordAbbreviationCombinationName,
            wordAbbreviationErrorCode: termJobs[i].wordAbbreviationErrorCode,
            wordCombinationName: termJobs[i].wordCombinationName,
            wordErrorCode: termJobs[i].wordErrorCode,
            updater: termJobs[i].updater,
            userId: termJobs[i].userId,
          });
        }

        console.log('termJobData : ', termJobData);

        workSearchData.value = termJobData;
      };

      // const termSelectTab1Data = inject('selectedData');

      fetchData();

      // TermJobComp 컴포넌트에서 사용할 props 데이터
      const termData = reactive({});

      //작업 취소
      const cancelConfirmState = reactive({
        view: false,
        message:
          '선택한 항목이 작업목록에서 <span style="color: red;">삭제</span>됩니다. 계속하시겠습니까?',
      });
      const onCancelConfirm = () => {
        cancelConfirmState.view = true;
      };

      const onCancel = async (state) => {
        console.log('state :', state);
        const selectedData = agGrid.value.gridApi.getSelectedNodes();
        console.log('selectedData : ', selectedData);

        const termCancelParamData = selectedData.map((selectedItem) => ({
          managementInstituteId: selectedItem.data.managementInstituteId,
          userId: userInfo.value.userId,
          termDictionaryId: selectedItem.data.dictionaryId,
          jobTermId: selectedItem.data.id,
        }));

        const data = selectedData.map((selectedItem) => ({
          instituteId: selectedItem.data.managementInstituteId,
          dictionaryId: selectedItem.data.dictionaryId,
          jobTermId: selectedItem.data.jobTermId,
        }));

        console.log('termCancelParamData : ', termCancelParamData);

        if (state === 0) {
          await deleteTermV2(data);
          setIsTermJobApproval(true);
        } else if (state === 1) {
          const completeRes = await getCompleteTermJob(termCancelParamData);
          console.log('용어 작업완료 결과 : ', completeRes);

          setAlertStatus({
            view: true,
            message: '매핑된 시스템 및 사전이 없어 변경이 불가능 합니다.',
          });
        }

        fetchData();
      };

      // 작업 완료
      const approvalConfirmState = reactive({
        view: false,
        message: '작업저장이 완료되었습니다.',
      });

      const onApprovalConfirm = () => {
        approvalConfirmState.view = true;
        // 작업 완료 시 termView 로 전달 그리드 refresh
      };
      const onApproval = async () => {
        const selectedData = agGrid.value.gridApi.getSelectedNodes();

        const termCompleteParamData = selectedData.map((selectedItem) => ({
          instituteId: selectedItem.data.managementInstituteId,
          dictionaryId: selectedItem.data.dictionaryId,
          userId: userInfo.value.userId,
          jobTermId: selectedItem.data.jobTermId,
        }));

        const response = await getTermCompliteJobV2(termCompleteParamData);
        // 존재하지 않는 URL로 요청
        // const response = $vxHttp
        //   .get('/api/nonexistent-endpoint')
        //   .catch((error) => {
        //     console.log('404 에러 발생:', error);
        //   });
        console.log('용어 작업완료 결과 : ', response);

        const termApplyResult = {
          managementType: '용어',
          successList: [],
          failList: [],
        };

        // validation 오류
        if (response.status === 409) {
          setAlertStatus({
            view: true,
            message: response.data.message,
          });
          return;
        }

        // 성공 저장 항목 저장
        response.data.map((item) => {
          if (item.result) {
            console.log('성공');
            termApplyResult.successList.push(item);
          } else {
            termApplyResult.failList.push(item);
            console.log('실패');
          }
        });

        console.log('termApplyResult : ', termApplyResult);

        termApplyResult.successCount = termApplyResult.successList.length;
        termApplyResult.failCount = termApplyResult.failList.length;

        // // 용어 작업 결과 출력 메시지
        onApplyResultAlert(termApplyResult);

        setIsTermJobApproval(true);
        fetchData();
      };

      // 작업완료 결과 값 출력 함수
      const onApplyResultAlert = (result) => {
        const { managementType, successCount, failCount } = result;

        let applyResultMessage = `
          <div style="text-align: center;">
            <p style="font-size: 17px; margin-bottom: 10px;">작업저장이 완료되었습니다.</p>
            <p style="color: #379583; font-weight: bold; margin-bottom: 10px;">[ ${managementType} 작업완료 결과 ]</p>
            <div style="display: flex; justify-content: space-around; margin-top: 10px;">
              <span>성공: <strong style="color: #28a745;">${successCount} 건</strong></span>
              <span>실패: <strong style="color: #dc3545;">${failCount} 건</strong></span>
            </div>
          </div>
          `;

        setAlertStatus({
          view: true,
          message: applyResultMessage,
        });
      };

      //일괄 영문 약어생성
      const allEngCreateWindowView = ref(false);
      const onOpenAllEngCreateWindow = () => {
        if (termJobSelected.value.length === 0) {
          alert('선택된 용어가 없습니다.');
        } else {
          allEngCreateWindowView.value = true;
        }
      };
      const onCloseAllEngCreateWindow = async (params) => {
        console.log('params : ', params);
        allEngCreateWindowView.value = false;
        // console.log('workSearchData :', workSearchData);
        // for (let i = 0; i < workSearchData.value.length; i++) {
        //   const termDetailsQuery = {
        //     managementInstituteId: useMetaMngInstId,
        //     userId: userInfo.value.userId,
        //     termDictionaryId: workSearchData.value[i].dictionaryId,
        //     jobTermId: workSearchData.value[i].id,
        //   };
        //   const jobDetails = await getJobTermDetail(termDetailsQuery);

        //   const changeData = params.find(
        //     (item) => item.termName === workSearchData.value[i].termName
        //   );
        //   console.log('changeData : ', changeData);

        //   console.log('jobDetails : ', jobDetails);
        //   if (changeData != null) {
        //     jobDetails.data.termAbbreviationName =
        //       changeData.englishAbbreviationName;

        //     const jobTermUpdateQuery = {
        //       managementInstituteId: useMetaMngInstId,
        //       userId: userInfo.value.userId,
        //       termDictionaryId: jobDetails.data.term.dictionary.id,
        //       jobTermId: jobDetails.data.jobTermId,
        //       termName: jobDetails.data.term.name,
        //       termAbbreviationName: jobDetails.data.termAbbreviationName,
        //       termEnglishName: jobDetails.data.term.termEnglishName,
        //       termTypeCode: jobDetails.data.termTypeCode,
        //       termExplain: jobDetails.data.term.explain,
        //       domainClassDictionaryId: jobDetails.data.domainClassDictionaryId,
        //       domainClassName: jobDetails.data.domainClassName,
        //       domainDictionaryId: jobDetails.data.domain.dictionary.id,
        //       domainName: jobDetails.data.domain.name,
        //       logicalDataTypeCode: jobDetails.data.logicalDataTypeCode,
        //       dataLength: jobDetails.data.dataLength,
        //       dataDecimalPointLength: jobDetails.data.dataDecimalPointLength,
        //       codeTypeCode: jobDetails.data.codeTypeCode,
        //       individualCodeName: jobDetails.data.individualCodeName,
        //       unityCodeDictionaryId: jobDetails.data.unityCode.dictionary.id,
        //       unityCodeName: jobDetails.data.unityCode.name,
        //       dataUnitName: jobDetails.data.dataUnitName,
        //       dataPermissionValue: jobDetails.data.dataPermissionValue,
        //       storageFormatContext: jobDetails.data.storageFormatContext,
        //       expressionFormatContext: jobDetails.data.expressionFormatContext,
        //       managementDepartmentName:
        //         jobDetails.data.managementDepartmentName,
        //       taskFieldName: jobDetails.data.taskFieldName,
        //       enactContext: jobDetails.data.enactContext,
        //       enactCycle: jobDetails.data.enactCycle,
        //       enactDate: jobDetails.data.enactDate,
        //       revisionCycle: jobDetails.data.revisionCycle,
        //       revisionDate: jobDetails.data.revisionDate,
        //       userName: userInfo.value.userId,
        //     };

        //     console.log('jobTermUpdateQuery : ', jobTermUpdateQuery);
        //     await getUpdateJobTerm(jobTermUpdateQuery);
        //   }
        // }
        // await fetchData();
      };

      // const onAllEngCreateSave = async (params) => {
      //   console.log('일괄 영문 약어생성 저장');
      //   console.log('params : ', params);

      //   let jobTermDetailsQuery = {
      //     managementInstituteId: useMetaMngInstId,
      //     userId: userInfo.value.userId,
      //   };

      //   console.log('workSearchData :', workSearchData);
      //   for (let i = 0; i < params.length; i++) {
      //     const termDetailsQuery = {
      //       instituteId: useMetaMngInstId,
      //       dictionaryId: workSearchData.value[i].dictionaryId,
      //       termId: params[i].jobTermId,
      //     };
      //     const jobDetails = await getTermJobDetailsV2(termDetailsQuery);

      //     const changeData = params.find(
      //       (item) =>
      //         item.jobTermId ===
      //         workSearchData.value[i].termEngAbbreviationName
      //     );
      //     console.log('changeData : ', changeData);

      //     console.log('jobDetails : ', jobDetails);
      //     if (changeData != null) {
      //       jobDetails.data.termName = changeData.termName;

      //       // const jobTermUpdateQuery = {
      //       //   managementInstituteId: useMetaMngInstId,
      //       //   userId: userInfo.value.userId,
      //       //   termDictionaryId: jobDetails.data.dictionaryId,
      //       //   jobTermId: jobDetails.data.jobTermId,
      //       //   termName: jobDetails.data.term.name,
      //       //   termAbbreviationName: jobDetails.data.termAbbreviationName,
      //       //   termEnglishName: jobDetails.data.term.termEnglishName,
      //       //   termTypeCode: jobDetails.data.termTypeCode,
      //       //   termExplain: jobDetails.data.term.explain,
      //       //   domainClassDictionaryId: jobDetails.data.domainClassDictionaryId,
      //       //   domainClassName: jobDetails.data.domainClassName,
      //       //   domainDictionaryId: jobDetails.data.domain.dictionary.id,
      //       //   domainName: jobDetails.data.domain.name,
      //       //   logicalDataTypeCode: jobDetails.data.logicalDataTypeCode,
      //       //   dataLength: jobDetails.data.dataLength,
      //       //   dataDecimalPointLength: jobDetails.data.dataDecimalPointLength,
      //       //   codeTypeCode: jobDetails.data.codeTypeCode,
      //       //   individualCodeName: jobDetails.data.individualCodeName,
      //       //   unityCodeDictionaryId: jobDetails.data.unityCode.dictionary.id,
      //       //   unityCodeName: jobDetails.data.unityCode.name,
      //       //   dataUnitName: jobDetails.data.dataUnitName,
      //       //   dataPermissionValue: jobDetails.data.dataPermissionValue,
      //       //   storageFormatContext: jobDetails.data.storageFormatContext,
      //       //   expressionFormatContext: jobDetails.data.expressionFormatContext,
      //       //   managementDepartmentName:
      //       //     jobDetails.data.managementDepartmentName,
      //       //   taskFieldName: jobDetails.data.taskFieldName,
      //       //   enactContext: jobDetails.data.enactContext,
      //       //   enactCycle: jobDetails.data.enactCycle,
      //       //   enactDate: jobDetails.data.enactDate,
      //       //   revisionCycle: jobDetails.data.revisionCycle,
      //       //   revisionDate: jobDetails.data.revisionDate,
      //       //   userName: userInfo.value.userId,
      //       // };

      //       const termDetailsQuery = {
      //         instituteId: useMetaMngInstId,
      //         userId: userInfo.value.userId,
      //         dictionaryId: jobDetails.data.dictionaryId,
      //         termId: jobDetails.data.termId,
      //         termName: jobDetails.data.termName,
      //         termAbbreviationName: jobDetails.data.termAbbreviationName,
      //         termEnglishName: jobDetails.data.termEnglishName,
      //         termStandardYn:
      //           jobDetails.data.standardDivision === true ? true : false,
      //         termTypeCode:
      //           jobDetails.data.termType === '일반어' ? 'GENERAL' : 'SYNONYM',
      //         termExplain: jobDetails.data.termExplain,
      //         domainClassName: jobDetails.data.domainClassName,
      //         domainName: jobDetails.data.domainName,
      //         codeTypeCode:
      //           jobDetails.data.codeTypeName === '10'
      //             ? 'INDIVIDUAL_CODE'
      //             : 'UNITY_CODE',
      //         individualCodeName: jobDetails.data.individualCodeName,
      //         unityCodeName: jobDetails.data.unityCodeName,
      //         managementDepartmentName:
      //           jobDetails.data.managementDepartmentName,
      //         taskFieldName: jobDetails.data.taskFieldName,
      //         revisionCycle: jobDetails.data.revisionCycle,
      //         revisionDate: jobDetails.data.revisionDate,
      //       };

      //       console.log('termDetailsQuery : ', termDetailsQuery);
      //       // console.log('jobTermUpdateQuery : ', jobTermUpdateQuery);
      //       await updateTermV2(termDetailsQuery);
      //     }
      //   }
      //   await fetchData();

      //   // onCloseAllEngCreateWindow(params);
      // };

      const onAllEngCreateSave = async (params) => {
        console.log('일괄 영문 약어생성 저장');
        console.log('params : ', params);

        let jobTermDetailsQuery = {
          managementInstituteId: useMetaMngInstId,
          userId: userInfo.value.userId,
        };

        const compliteParams = params.filter(
          (node) => node.combinationStatus === '완료'
        );

        console.log('compliteParams :', compliteParams);

        console.log('workSearchData :', workSearchData);

        const transformedParams = compliteParams.map((params) => ({
          instituteId: params.instituteId,
          dictionaryId: params.dictionaryId,
          jobTermId: params.jobTermId,
          termName: params.termName,
          termAbbreviationName: params.englishAbbreviationName,
          jobTypeCode: params.jobTypeCode,
        }));

        console.log('transformedParams : ', transformedParams);

        const response = await getTermPatch(transformedParams);

        if (response.state === 400) {
          alert('영문 약어 생성에 실패하였습니다.');
        }
        await fetchData();
        // onCloseAllEngCreateWindow(params);
      };

      // 용어 일괄 업로드(엑셀)
      const multiUploadWindowView = ref(false);
      const multiUploadWindow = () => {
        multiUploadWindowView.value = true;
      };

      const onCloseMultiUploadWindow = () => {
        multiUploadWindowView.value = false;
      };
      const onMultiUploadSave = async () => {
        await fetchData();
      };

      const termFileUploadWindowView = ref(false);
      const termFileUploadWindow = () => {
        termFileUploadWindowView.value = true;
      };

      const onCloseTermFileUploadWindow = () => {
        termFileUploadWindowView.value = false;
      };
      const onTermFileUploadSave = async () => {
        await fetchData();
      };

      const onFilterWindowClosed = async (filterSet) => {
        // 필터 창이 닫힐 때 수행하고 싶은 로직
        console.log('필터 창이 닫혔습니다.');
        console.log('filterSet : ', filterSet);

        // 맞춤형 필터 설정이 있을 때
        if (filterSet) {
          console.log('columnDefs.value : ', columnDefs.value);

          // 정렬이 적용된 모든 열을 찾습니다.
          const sortedColumns = columnDefs.value
            .filter((col) => col.sortIndex !== null && col.sort !== null)
            .sort((a, b) => a.sortIndex - b.sortIndex)
            .map(
              (col) =>
                `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`
            );

          const sortQuery = sortedColumns.join(', ');

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

          const termJobFilterQuery = {
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            jobTypeCode: 'CUR',
            query: filterSet.searchQuery,
            sort: filterSortQuery,
          };

          termJobQuery.query = filterSet.searchQuery;
          sortStateQuery.value = filterSortQuery;
          const termJobFilterData = await getTermJobListV2(termJobFilterQuery);
          console.log('termJobFilterData =====: ', termJobFilterData);

          if (termJobFilterData.status != 200) {
            workSearchData.value = [];
            resultCount.value.total = 0;
            return;
          }

          // const filterSearchData = getTermRowData(termFilterData);
          const filterSearchData =
            jobTermSearchResultBinding(termJobFilterData);

          console.log('filterSearchData : ', filterSearchData);
          workSearchData.value = filterSearchData;
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());
          console.log('gridStorage.MFGRD017 : ', gridStorage.MFGRD210);
          columnDefs.value = gridStorage.MFGRD210;

          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD210);
        }
      };

      //그리드 칼럼 이동 및 사이즈 변경 등 이벤트 발생시 그리드 설정 값 업데이트
      function handleColumnStateChanged(newColumnState) {
        console.log('컬럼 이동 핸들러 동작 ====');

        console.log('newColumnState : ', newColumnState);

        //gridApi.value.setGridOption('columnDefs', newColumnState);

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
            if (colDef.field === 'domainName') {
              // valueFormatter = (params) => {
              //   if (
              //     params.value &&
              //     Array.isArray(params.value) &&
              //     params.value.length > 0
              //   ) {
              //     return params.value[0].excVal;
              //   }
              //   return '';
              // };
              // cellRenderer = 'TypeCellRenderer'; // 여기서 cellRenderer 설정
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
                colDef.field === 'domainName' ||
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

        // localStorage에 에서 gridData json 파싱, MFGRD210에 대한 값 변경
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage.MFGRD210 = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);
        // 스토어에 저장
        uiStore.setGridColumnDefs('MFGRD210', newColumnFcDefs);
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
        console.log('workSearchData.value:', workSearchData.value);
        console.log(
          'workSearchData.value.length:',
          workSearchData.value.length
        );

        const lastItem =
          workSearchData.value.length > 0
            ? workSearchData.value[workSearchData.value.length - 1]
            : null;
        console.log('lastItem ===', lastItem);

        console.log('sortState :', sortState);

        // sort의 결과가 초기화 상태일 때,
        if (sortState.value.length == 0) {
          const researchQuery = {
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            jobTypeCode: 'CUR',
            query: termJobQuery.query,
          };
          sortStateQuery.value = '';

          const termJobSearchResult = await getTermJobListV2(researchQuery);
          const termJobData = jobTermSearchResultBinding(termJobSearchResult);
          workSearchData.value = termJobData;
        } else {
          const sortParts = sortState.value.map(
            (column) => `${column.headerName} ${column.sort}`
          );
          sortQuery.value = sortParts.join(', ');
          sortStateQuery.value = sortQuery.value;

          console.log('sortQuery.value: ', sortQuery.value);
          console.log('sortStateQuery.value: ', sortStateQuery.value);

          const researchQuery = {
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            jobTypeCode: 'CUR',
            query: termJobQuery.query,
            sort: sortQuery.value,
          };

          const termJobSearchResult = await getTermJobListV2(researchQuery);
          const termJobData = jobTermSearchResultBinding(termJobSearchResult);
          workSearchData.value = termJobData;
        }

        //firstRowSelectedEvent();
      };

      // 용어 그리드 데이터 추가 함수
      const addGridRowData = async (termResearchQuery) => {
        try {
          // 추가 조회 전 데이터 저장
          let oldGridData = workSearchData.value;

          const lastRowIndex = oldGridData.length - 1;
          const lastRowNode =
            agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);
          console.log('마지막 node ===========', lastRowNode);

          console.log('termResearchQuery ===', termResearchQuery);

          const reLoadTermData = await getTermJobListV2(termResearchQuery);

          const terms = reLoadTermData.items;

          const newGridData = [];

          for (let i = 0; i < terms.length; i++) {
            newGridData.push({
              rowId: oldGridData.length + i,
              id: oldGridData.length + i,
              no: oldGridData.length + i + 1,
              jobTermId: terms[i].jobTermId,
              dictionaryId: terms[i].dictionaryId,
              applicationCategory: '신규',
              termName: terms[i].termName,
              managementInstituteId: terms[i].instituteId,
              termEngAbbreviationName: terms[i].termAbbreviationName,
              domainName: terms[i].domainName,
              abbreviationYn: terms[i].abbreviationYn ? '완료' : '미완료',
              termNameErrorName: terms[i].termNameErrorName,
              termNameErrorYn: terms[i].termNameErrorYn,
              termErrorName: terms[i].termErrorName,
              termErrorYn: terms[i].termErrorYn,
              termStandardYnName: terms[i].termStandardYnName,
              updateDateTime: terms[i].updateDateTime,
              updater: terms[i].updater,
              userId: terms[i].userId,
            });
          }

          // 재조회 후 rowData에 할당.
          workSearchData.value = [...oldGridData, ...newGridData];

          resultCount.value.count = Number(workSearchData.value.length);

          const lastVisibleRowIndex = lastRowNode ? lastRowNode.rowIndex : 0;
          console.log(
            'lastVisibleRowIndex =================',
            lastVisibleRowIndex
          );
          currentRowIndex.value = lastVisibleRowIndex;
          // 새로운 데이터 로드 후 마지막으로 보고 있던 행으로 스크롤
          agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
        } catch (error) {
          console.error(error);
        }
      };

      // 그리드 스크롤 이벤트 함수
      const handleScrollChanged = (endScrollStaus) => {
        // console.log('endScrollStaus ===', endScrollStaus);
        try {
          if (endScrollStaus === 'Y' && workSearchData.value != null) {
            const lastItem =
              workSearchData.value.length > 0
                ? workSearchData.value[workSearchData.value.length - 1]
                : null;
            console.log('lastItem ===', lastItem);

            const termResearchQuery = {
              instituteId: useMetaMngInstId,
              dictionaryId: useDctnryId,
              jobTypeCode: 'CUR',
              lastItem: {
                instituteId: lastItem.managementInstituteId,
                userId: lastItem.userId,
                dictionaryId: lastItem.dictionaryId,
                jobDivisionCode: lastItem.jobDivisionCode,
                jobDivisionName: lastItem.jobDivisionName,
                jobTermId: lastItem.jobTermId,
                termName: lastItem.termName,
                termStandardYnName: lastItem.termStandardYnName,
                termAbbreviationName: lastItem.termEngAbbreviationName,
                domainName: lastItem.domainName,
                discardYn: lastItem.discardYn,
                termNameErrorName: lastItem.termNameErrorName,
                termNameErrorYn: lastItem.termNameErrorYn,
                termErrorName: lastItem.termErrorName,
                termErrorYn: lastItem.termErrorYn,
                updater: lastItem.updater,
                updateDateTime: lastItem.updateDateTime,
              },
              query: termJobQuery.query,
              sort: getSortQuery(),
            };

            console.log('termResearchQuery : ,', termResearchQuery);

            addGridRowData(termResearchQuery);
          }
        } catch (error) {
          console.log('lastItem x 에러 발생 ==');
          console.error(error);
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
        const gridDefaultData = await getGridDefaultData(termJobGridId.value);

        console.log('gridDefaultData : ', gridDefaultData);

        // 기본값 설정
        await setUserGridSetting(termJobGridId.value, gridDefaultData);

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
        gridStorage[termJobGridId.value] = transformedData;

        saveGridInfoToStorage(gridStorage);

        uiStore.setGridColumnDefs(termJobGridId.value, columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        // await updateGridData(termQuery);

        termJobQuery.query = '';

        await fetchData();
      };

      // 용어 작업 저장
      const onTermJobSave = async () => {
        console.log('용어작업 저장 완 =');

        await fetchData();
      };

      // 용어작업 업데이트
      const onTermJobUpdate = async () => {
        console.log('용어작업 수정 완료');

        await fetchData();
      };

      // 용어 작업 저장 완료 시 데이터 조회
      watch(
        () => isTermJobSave.value,
        async (newVal) => {
          if (newVal) {
            await fetchData();
            setIsTermJobSave(false);
          }
        }
      );

      // 용어 작업 완료 & (표준화 추출) 시 데이터 조회
      watch(
        () => isTermJobApproval.value,
        async (newVal) => {
          if (newVal) {
            await fetchData();
            setIsTermJobApproval(false);
          }
        }
      );

      const popInfo = ref({
        state: 'confirm',
        popTitle: '에러 제목',
        popMessages: '에러 메시지',
      });

      // 표준화 용어추출  팝업상태
      const extractTermWindowView = ref(false);
      const onOpenExtractTermWindow = () => {
        popInfo.value.popTitle = '표준화 용어 추출 확인메시지';
        popInfo.value.popMessages =
          '표준화 대상 컬럼한글명에서 표준화 용어를 추출하는 단계입니다. 표준화용어를 다시 추출하시겠습니까?';
        extractTermWindowView.value = true;
      };
      const onCloseExtractTermWindow = () => {
        console.log('onCloseExtractTermWindow');
        extractTermWindowView.value = false;
      };

      // 표준화 용어추출
      const onExtractTerm = async () => {
        const data = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          informationSystemId: useInfoSysId,
        };

        const response = await getExtractTerm(data);
        console.log('onExtractTerm response : ', response);
        extractTermWindowView.value = false;

        if (response.status === 200) {
          await fetchData();
          setIsTermJobApproval(true);
        } else {
          alert('표준화 용어 추출 실패');
        }
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

        await columnDefsUpdate(
          llmAnswer.sort,
          columnDefs,
          termJobGridId.value,
          gridApi
        );

        termJobQuery.sort = llmAnswer.sort;
        termJobQuery.query = llmAnswer.where;
        searchInput.value = llmAnswer.where;

        await fetchData();
      };

      const onSetUserGridSetting = async () => {
        console.log('columnDefs.value : ', columnDefs.value);

        const gridStorage = JSON.parse(getGridInfoFromStorage());

        const fieldMapping = {
          no: 'NO',
          applicationCategory: 'JOB_DV_NM',
          termName: 'TRM_NM',
          termEngAbbreviationName: 'TRM_EABBR_NM',
          domainName: 'DMN_NM',
          termStandardYnName: 'TRM_STD_YN_NM',
          termNameErrorName: 'TRM_NM_ERR_NM',
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

        await setUserGridSetting(termJobGridId.value, newGridStting);

        // updateGridData(termQuery);
      };

      const saveGridSettingView = reactive({
        view: false,
        message: '그리드 설정 정보를 저장하시겠습니까?',
      });

      const onSaveGridSettingWindow = () => {
        saveGridSettingView.view = true;
      };

      const handleExcelDownload = async (state) => {
        console.log('state : ', state);

        try {
          if (state === 'all') {
            // 🔥 전체 다운로드 - API 응답을 엑셀 파일로 다운로드
            const params = {
              instituteId: useMetaMngInstId,
              dictionaryId: useDctnryId,
              dictionarySearchCode: 'INDIVIDUAL',
              jobTypeCode: 'CUR',
              query: termJobQuery.query,
              sort: getSortQuery(),
            };

            console.log('params : ', params);

            const response = await getJobTermDownload(params);
            console.log('response : ', response);

            // 🔥 API 응답 데이터를 Blob으로 변환하여 엑셀 파일 다운로드
            if (response && response.data) {
              const blob = new Blob([response.data], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              });

              // 🔥 파일 다운로드 실행
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `용어_작업목록_전체_${new Date()
                .toISOString()
                .slice(0, 10)}.xlsx`;

              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);

              console.log('전체 다운로드 완료');
            } else {
              console.error('API 응답 데이터가 없습니다.');
              alert('다운로드할 데이터가 없습니다.');
            }
          } else {
            // 🔥 조회 건 다운로드 (기존 방식 유지)
            console.log('조회건 다운로드 시작');
            console.log('rowData.value : ', workSearchData.value);

            if (!workSearchData.value || workSearchData.value.length === 0) {
              alert('조회된 데이터가 없습니다.');
              return;
            }

            // 🔥 rowData를 엑셀 다운로드 형식으로 변환
            const excelData = convertRowDataToExcelFormat(workSearchData.value);

            // 🔥 엑셀 파일 생성 및 다운로드
            await downloadExcelFromData(excelData, '조회건');
          }
        } catch (error) {
          console.error('엑셀 다운로드 실패:', error);

          // 🔥 에러 상세 정보 표시
          if (error.response && error.response.status) {
            alert(
              `엑셀 다운로드 중 오류가 발생했습니다. (${error.response.status})`
            );
          } else {
            alert('엑셀 다운로드 중 오류가 발생했습니다.');
          }
        }
      };

      // 🔥 rowData를 엑셀 다운로드용 데이터로 변환하는 함수
      const convertRowDataToExcelFormat = (data) => {
        return data.map((row, index) => {
          console.log('row : ', row);
          return {
            작업: row.jobDivisionName || '',
            용어명: row.termName || '',
            표준구분: row.termStandardYnName || '',
            용어영문약어명: row.termEngAbbreviationName || '',
            도메인명: row.domainName,
            상태: row.termNameErrorName || '',
            최종수정일시: row.updateDateTime || '',
          };
        });
      };

      // 🔥 셀 값 추출 함수 (복잡한 객체 구조에서 실제 값 추출)
      const extractCellValue = (cellData) => {
        if (!cellData) return '';

        // 배열 형태인 경우 (예: termName: [{label: "값"}])
        if (Array.isArray(cellData) && cellData.length > 0) {
          return cellData[0].label || cellData[0].value || cellData[0];
        }

        // 객체 형태인 경우
        if (typeof cellData === 'object' && cellData.label) {
          return cellData.label;
        }

        // 문자열이나 기본 값인 경우
        return String(cellData);
      };

      // 🔥 ExcelJS를 사용한 스타일 적용 가능한 엑셀 다운로드 함수
      const downloadExcelFromData = async (data, downloadType) => {
        try {
          // 🔥 ExcelJS 라이브러리 import
          const ExcelJS = await import('exceljs');

          // 워크북과 워크시트 생성
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('용어_작업목록');

          // 🔥 컬럼 정의 및 헤더 설정
          worksheet.columns = [
            { header: '작업', key: '작업', width: 20 },
            { header: '용어명', key: '용어명', width: 30 },
            { header: '표준구분', key: '표준구분', width: 25 },
            { header: '용어영문약어명', key: '용어영문약어명', width: 40 },
            { header: '도메인명', key: '도메인명', width: 20 },
            { header: '상태', key: '상태', width: 20 },
            { header: '최종수정일시', key: '최종수정일시', width: 20 },
          ];

          // 🔥 헤더 스타일 적용
          const headerRow = worksheet.getRow(1);
          headerRow.height = 20; // 행 높이 설정

          headerRow.eachCell((cell) => {
            cell.font = {
              bold: true,
              name: 'Arial',
              size: 11,
              color: { argb: 'FF000000' }, // 검은색
            };
            cell.alignment = {
              horizontal: 'center',
              vertical: 'middle',
            };
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFBFBFBF' }, // #BFBFBF 배경색
            };
            cell.border = {
              top: { style: 'thin', color: { argb: 'FF000000' } },
              left: { style: 'thin', color: { argb: 'FF000000' } },
              bottom: { style: 'thin', color: { argb: 'FF000000' } },
              right: { style: 'thin', color: { argb: 'FF000000' } },
            };
          });

          // 🔥 데이터 행 추가 및 스타일 적용
          data.forEach((rowData, index) => {
            const row = worksheet.addRow(rowData);
            row.height = 20; // 행 높이 설정

            // 각 셀에 스타일 적용
            row.eachCell((cell, colNumber) => {
              cell.font = {
                name: 'Arial',
                size: 10,
                color: { argb: 'FF000000' },
              };

              cell.alignment = {
                horizontal: 'left',
                vertical: 'middle',
              };

              // 모든 셀에 테두리 적용
              cell.border = {
                top: { style: 'thin', color: { argb: 'FF000000' } },
                left: { style: 'thin', color: { argb: 'FF000000' } },
                bottom: { style: 'thin', color: { argb: 'FF000000' } },
                right: { style: 'thin', color: { argb: 'FF000000' } },
              };

              // 🔥 데이터 타입별 추가 포맷팅
              if (colNumber === 1) {
                // 순번은 숫자 형식
                cell.numFmt = '0';
              } else if (colNumber >= 10) {
                // 날짜 컬럼들
                if (
                  cell.value &&
                  cell.value.toString().match(/\d{4}-\d{2}-\d{2}/)
                ) {
                  cell.numFmt = 'yyyy-mm-dd';
                }
              }
            });
          });

          // 🔥 워크시트 전체 설정
          worksheet.pageSetup = {
            paperSize: 9, // A4
            orientation: 'landscape', // 가로 방향
            fitToPage: true,
            fitToHeight: 0,
            fitToWidth: 1,
            margins: {
              left: 0.7,
              right: 0.7,
              top: 0.75,
              bottom: 0.75,
              header: 0.3,
              footer: 0.3,
            },
          };

          // 🔥 인쇄 제목 설정 (헤더 행 반복)
          worksheet.pageSetup.printTitlesRow = '1:1';

          // 🔥 자동 필터 설정
          worksheet.autoFilter = {
            from: 'A1',
            to: `G${data.length + 1}`,
          };

          // 🔥 셀 고정 (헤더 행 고정)
          worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

          // 🔥 파일 다운로드
          const fileName = `용어_작업목록_${downloadType}_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`;

          const buffer = await workbook.xlsx.writeBuffer();
          const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          console.log(`${downloadType} 스타일 적용 다운로드 완료:`, fileName);
        } catch (error) {
          console.error('ExcelJS 파일 생성 실패:', error);

          // 🔥 ExcelJS 실패 시 기본 XLSX 방식으로 폴백
          console.log('기본 XLSX 방식으로 재시도...');
          await downloadExcelFromDataFallback(data, downloadType);
        }
      };

      // 🔥 폴백용 기본 다운로드 함수
      const downloadExcelFromDataFallback = async (data, downloadType) => {
        try {
          const XLSX = await import('xlsx');

          const worksheet = XLSX.utils.json_to_sheet(data);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, '용어_작업목록');

          const columnWidths = [
            { wch: 8 },
            { wch: 15 },
            { wch: 25 },
            { wch: 20 },
            { wch: 20 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 20 },
            { wch: 15 },
            { wch: 20 },
            { wch: 20 },
          ];
          worksheet['!cols'] = columnWidths;

          const fileName = `용어_작업목록_${downloadType}_${new Date()
            .toISOString()
            .slice(0, 10)}.xlsx`;

          XLSX.writeFile(workbook, fileName);
          console.log(`${downloadType} 기본 다운로드 완료:`, fileName);
        } catch (error) {
          console.error('기본 XLSX 다운로드도 실패:', error);
          downloadCSVFromData(data, downloadType);
        }
      };

      // 🔥 XLSX 라이브러리가 없는 경우 CSV 다운로드 대안
      const downloadCSVFromData = (data, downloadType) => {
        try {
          if (data.length === 0) return;

          // CSV 헤더 생성
          const headers = Object.keys(data[0]);
          const csvContent = [
            headers.join(','), // 헤더 행
            ...data.map((row) =>
              headers
                .map((header) => `"${String(row[header]).replace(/"/g, '""')}"`)
                .join(',')
            ),
          ].join('\n');

          // BOM 추가 (한글 깨짐 방지)
          const BOM = '\uFEFF';
          const blob = new Blob([BOM + csvContent], {
            type: 'text/csv;charset=utf-8;',
          });

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `용어_작업목록_${downloadType}_${new Date()
            .toISOString()
            .slice(0, 10)}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);

          console.log(`${downloadType} CSV 다운로드 완료`);
        } catch (error) {
          console.error('CSV 파일 생성 실패:', error);
        }
      };

      onActivated(() => {
        nextTick(() => {
          agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
        });
      });

      const approvalPopupView = ref(false);

      const selectTermGridData = reactive({});

      const onApprovalPopup = () => {
        const selectedData = gridApi.value.getSelectedNodes();
        const termData = selectedData.map((item) => item.data);

        popInfo.value.state = 'redirect';
        popInfo.value.popTitle = '결재 요청 확인';
        popInfo.value.popMessages =
          '결재 요청이 완료되었습니다. 전자결재 페이지로 이동하여 결재항목을 확인하실 수 있습니다.';
        popInfo.value.confirmBtnText = '전자결재 이동';
        popInfo.value.cancelBtnText = '확인';

        console.log('onApprovalPopup 실행');
        console.log('selectTermData : ', termData);

        // 오류가 아닌 항목을 전달
        const filterTermData = termData.filter(
          (item) => item.termNameErrorName !== '오류'
        );

        selectTermGridData.value = filterTermData;
        approvalPopupView.value = true;
      };

      // 결재요청
      const onApprovalRequestConfirm = async () => {
        console.log('onApprovalRequestConfirm 실행');

        approvalPopupView.value = false;
        confirmWindowView.value = true;

        await fetchData();
      };

      const onApprovalRequestError = () => {
        console.log('onApprovalRequestError 실행');
        approvalPopupView.value = false;
        confirmWindowView.value = true;

        popInfo.value.state = 'error';
        popInfo.value.popTitle = '결재 요청 오류';
        popInfo.value.popMessages =
          '결재 요청 처리 중 <span style="font-weight : 900;">오류</span>가 발생하였습니다.';
        popInfo.value.confirmBtnText = '확인';
      };

      const onCloseApprovalPopup = () => {
        console.log('onCloseApprovalPopup 실행');
        approvalPopupView.value = false;
      };

      // const popInfo = ref({
      //   state: 'redirect',
      //   popTitle: '결재 요청 확인',
      //   popMessages: `<span style="font-weight : 900;">결재 요청이 완료되었습니다.</span>
      //   전자결재 페이지로 이동하여 결재항목을 확인하실 수 있습니다.`,
      //   confirmBtnText: '전자결재 이동',
      //   cancelBtnText: '확인',
      // });

      const confirmWindowView = ref(false);
      const onRedirectApproval = () => {
        setTabNaviData({ title: '전자결재', path: '/approval' });
        router.replace('/approval');
        confirmWindowView.value = false;
      };

      const onCloseConfirmWindow = () => {
        console.log('onCloseConfirmWindow');
        confirmWindowView.value = false;
      };

      return {
        agGrid,
        workSearchData,
        resultCount,
        cancelConfirmState,
        onCancelConfirm,
        onCancel,
        approvalConfirmState,
        onApprovalConfirm,
        onApproval,
        allEngCreateWindowView,
        onOpenAllEngCreateWindow,
        onCloseAllEngCreateWindow,
        onAllEngCreateSave,
        columnDefs,
        gridApi,
        onGridReady,
        onSelectionChanged,
        termJobSelected,
        useDctnryId,
        userInfo,
        useMetaMngInstId,
        multiUploadWindowView,
        multiUploadWindow,
        onCloseMultiUploadWindow,
        onMultiUploadSave,
        gridInfoDefs,
        onFilterWindowClosed,
        handleColumnStateChanged, // 컬럼 상태변화 함수
        handleSortChanged, // 정렬 함수
        onResetFilter, // 필터 리셋
        resetFilterState,
        onSearchRemove,
        termJobQuery,
        sortStateQuery,
        sortQuery,
        jobUpdateYn,
        termData,
        onTermJobSave,
        termJobSelectData,
        onTermJobUpdate,
        setTermJobUpdateData,
        setSelectTermJobData,
        setIsTermJobUpdate,
        termFileUploadWindow,
        termFileUploadWindowView,
        onCloseTermFileUploadWindow,
        onTermFileUploadSave,
        chatbotWindowView,
        onOpenChatbotWindow,
        onCloseChatbotWindow,
        handleBindQuery,
        termJobGridId,
        onSetUserGridSetting,
        saveGridSettingView,
        onSaveGridSettingWindow,
        handleChangeSearchType,
        searchInput,
        searchType,
        handleScrollChanged,
        setTermSourceCode,
        extractTermWindowView, // 표준화 용어 추출 상태
        onOpenExtractTermWindow, // 표준화 용어 추출 팝업창 열기
        onCloseExtractTermWindow, // 표준화 용어 추출 팝업창 닫기
        onExtractTerm, // 표준화 용어 추출
        getTooltipById,
        popInfo,
        handleExcelDownload,
        selectTermGridData,
        approvalPopupView,
        onApprovalPopup,
        onApprovalRequestConfirm,
        onApprovalRequestError,
        onCloseApprovalPopup,
        confirmWindowView,
        onRedirectApproval,
        onCloseConfirmWindow,
      };
    },
  };
</script>
