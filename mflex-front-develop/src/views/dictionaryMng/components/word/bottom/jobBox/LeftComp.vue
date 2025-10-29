<template>
  <div class="grid-wrap">
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
              :disabled="
                !userWorkWordData ||
                !userWorkWordData.value ||
                userWorkWordData.value.length < 1 ||
                isJobCheckd
              "
              @click="onWorkJobCancelConfirm"
            >
              작업취소
            </button>
            <button
              class="btn-s dark-blue apply-btn"
              title="작업완료"
              :disabled="
                !userWorkWordData ||
                !userWorkWordData.value ||
                userWorkWordData.value.length < 1 ||
                isJobCheckd
              "
              @click="onApprovalPopup"
            >
              작업완료
            </button>
          </div>
        </div>
        <div class="title-btns__row_btween">
          <div class="btns">
            <button
              class="btn-s blue excle-btn"
              title="단어일괄등록"
              @click="wordUploadWindow"
            >
              단어 일괄 등록
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
          @enter="onSearchEnter"
          @save="onSaveGridSettingWindow"
          @setup="onSearchSetup"
          @remove="onResetFilter"
          @column-state-changed="handleColumnStateChanged"
          @filter-window-closed="onFilterWindowClosed"
          @excel-download="handleExcelDownload"
          class="br-t"
        />
      </div>
    </div>
    <div class="grid-list word-job-grid">
      <AppGrid
        :rowData="userWorkWordData"
        :columnDefs="columnDefs"
        :context="context"
        rowSelection="multiple"
        @rowDoubleClicked="onRowDoubleClicked"
        @rowClicked="onRowClicked"
        @gridApi="onGridReady"
        @column-state-changed="handleColumnStateChanged"
        @sort-changed="handleSortChanged"
        @body-scroll="handleScrollChanged"
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
    @confirm="onWorkJobCancel"
  />
  <!-- 승인신청 알림창 -->
  <AppDialog
    v-model:view="approvalConfirmState.view"
    :title="approvalConfirmState.title"
    :message="approvalConfirmState.message"
    @confirm="onWorkJobWordApproval"
  />

  <!-- 단어 일괄 등록 팝업-->
  <AppWindow
    :view="wordUploadWindowView"
    @close="onCloseWordUploadWindow"
    width="1300px"
    height="700px"
  >
    <!-- <WordUploadWindow
      @confirm="onWordUploadSave"
      @close="onCloseWordUploadWindow"
    /> -->

    <WordFileUploadWindow
      @confirm="onWordUploadSave"
      @close="onCloseWordUploadWindow"
    />
  </AppWindow>

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

  <AppWindow
    :view="chatbotWindowView"
    @close="onCloseChatbotWindow"
    :moveState="true"
    width="500px"
    height="auto"
  >
    <ChatbotWindow
      :gridId="wordJobGridId"
      @bind-query="handleBindQuery"
      @confirm="onConfirmChatbot"
      @close="onCloseChatbotWindow"
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
      :type="'word'"
      :selectedData="selectedWordData"
      @confirm="onApprovalRequestConfirm"
      @close="onCloseApprovalPopup"
      @error="onApprovalRequestError"
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
    watch,
    watchEffect,
    onActivated,
    nextTick,
    onBeforeMount,
  } from 'vue';
  import { useRoute } from 'vue-router';
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { useRouter } from 'vue-router';
  import { useUiStore } from '@/stores/ui';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useNoneDivideWordStore } from '@/stores/noneDivideWord';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import RegTypeCellRenderer from '@/utils/RegTypeCellRenderer.js';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import WordSearchWindow from '@/components/popWindow/WordSearchWindow.vue';
  import WordUploadWindow from '@/components/popWindow/WordUploadWindow.vue';
  import WordFileUploadWindow from '@/components/popWindow/WordFileUploadWindow.vue';
  import ChatbotWindow from '@/components/popWindow/ChatbotWindow.vue';
  import ApprovalRequestWindow from '@/components/popWindow/approval/ApprovalRequestWindow.vue';
  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';
  import {
    getWordJobListV2,
    getWordJobDetailsV2,
    deleteWordV2, // 단어관리 - 작업취소
    getWordCompliteJobV2, // 단어관리 - 작업완료
    getJobWordDownload, // 단어관리 - 작업목록 엑셀다운로드
  } from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api';
  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import { columnDefsUpdate } from '@/utils/js/searchModule';
  import RelatedTermsWindow from '@/components/popWindow/RelatedTermsWindow.vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { useAlert } from '@/composables/alert';

  import {
    getUserGridSetting, // 사용자별 Grid 세팅 조회
    setUserGridSetting, // 사용자별 Grid 세팅 설정
    getGridDefaultData, // 그리드 기본값 조회
  } from '@/utils/mflexApi/common/commonApi'; // 공통 API 모듈

  export default {
    props: ['data'],
    created() {
      console.log('this.$route.params.data : ', this.$route.params);
    },
    components: {
      TypeCellRenderer,
      GridSearch,
      AppTooltip,
      RegTypeCellRenderer,
      AppWindow,
      WordSearchWindow,
      RelatedTermsWindow,
      WordUploadWindow,
      WordFileUploadWindow,
      ApprovalRequestWindow,
      ChatbotWindow,
      ConfirmWindow,
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
        console.log('onRowClicked ', value);

        const wordJobDetailsQuery = {
          instituteId: value.instituteId,
          dictionaryId: value.dictionaryId,
          jobWordId: value.jobWordId,
        };

        const wordJobDetails = await getWordJobDetailsV2(wordJobDetailsQuery);
        wordJobDetails.data.wordSourceCode = 'JOB';

        const selectedRow = document.querySelectorAll(
          '[class~="ag-row-selected"]'
        );
        // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        const clickedNode = document.querySelector(
          `.word-job-grid [row-id="${clickNode}"]`
        );

        // 단어 작업 렌더링 컴포넌트 상태 설정
        this.setIsWordJobUpdate(true);

        nextTick(() => {
          // this.propsWordJobData.value = wordJobawait.data;
          this.setWordJobUpdateData(wordJobDetails.data);
          clickedNode.classList.add('ag-row-selected');
        });
      },
      async onSearchEnter(value) {
        console.log('onSearchEnter', value);

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
            gridId: this.wordJobGridId,
            query: transformedQuery,
          };
          const llmAnswer = await getCreateQuery(searchInfo);

          await columnDefsUpdate(
            llmAnswer.data.sort,
            this.columnDefs,
            this.wordJobGridId,
            this.gridApi
          );

          this.wordJobQuery.query = llmAnswer.data.where;
          this.searchInput = value;

          const wordJobQuery = {
            instituteId: this.useMetaMngInstId,
            dictionaryId: this.useDctnryId,
            userId: this.userId,
            query: llmAnswer.data.where,
            sort: llmAnswer.data.sort,
          };

          const researchWordJobData = await this.getWordJobData(wordJobQuery);
        } else {
          let sortQuery;
          if (this.sortStateQuery != null) {
            sortQuery = this.sortStateQuery;
          } else {
            sortQuery = this.sortQuery;
          }

          const wordJobQuery = {
            instituteId: this.useMetaMngInstId,
            dictionaryId: this.useDctnryId,
            jobTypeCode: 'STD',
            userId: this.userId,
            query: transformedQuery,
            sort: sortQuery,
          };
          this.wordJobQuery.query = transformedQuery;
          this.searchInput = transformedQuery;
          const researchWordJobData = await this.getWordJobData(wordJobQuery);
          console.log('researchWordJobData : ', researchWordJobData);
        }
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    computed: {
      isJobCheckd() {
        return this.wordJobSelected.length === 0;
      },
    },

    emits: ['wordwork-complete'],
    setup(props, { emit }) {
      const route = useRoute();
      const data = route.params;

      // 작업목록의 항목을 수정하는 경우
      const jobUpdateYn = ref(false);

      console.log('wordRouteParmas : ', data);

      const noneDivideStore = useNoneDivideWordStore();
      const { noneDivideWord } = storeToRefs(noneDivideStore);

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      const router = useRouter();
      const tabNaviStore = useTabNaviStore();
      const { setTabNaviData } = tabNaviStore;

      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      //사용자 아이디
      const { userId } = userInfo.value;
      //사용자 사용 시스템 정보
      const { useMetaMngInstId, useDctnryId } = userStngInfo.value;

      //Alert
      const { setAlertStatus } = useAlert();

      const dictionaryMngStore = useDictionaryMngStore();
      const {
        setWordJobUpdateData,
        getWordJobUpdateData,
        setIsWordJobUpdate,
        setIsWordJobSave,
        setIsWordJobApproval,
      } = dictionaryMngStore;
      const { isWordJobSave, isWordJobUpdate } =
        storeToRefs(dictionaryMngStore);

      const agGrid = ref(null);
      const gridApi = ref(null);

      const onGridReady = (params) => {
        console.log('params: ', params);
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);

        console.log('선택 노드 : ', gridApi.value.getSelectedNodes());
      };

      //Grid 아이디
      const wordMngGridId = ref('');

      const wordJobGridId = ref('MFGRD020');
      const gridInfoDefs = ref({
        scrnGridId: wordJobGridId,
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
          WRD_NM_ERR_NM: 'wordNameErrorName',
          WRD_TYPE_NM: 'wordTypeName',
          JOB_DV_NM: 'applicationCategory',
          WRD_NM: 'wordName',
          WRD_EABBR_NM: 'wordEngAbbreviationName',
          DMN_CLS_NM: 'domainClassName',
        };

        const specialConfig = {
          applicationCategory: {
            cellRenderer: 'RegTypeCellRenderer',
          },
          domainName: {
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
              fieldName === 'wordNameErrorName' ||
              fieldName === 'wordTypeName'
                ? 'grid-cell-centered'
                : 'ag-left-aligned-cell',
            cellRenderer: config.cellRenderer || null,
            field: fieldName,
            headerName: item.gridArticleKoreanName,
            hide: !item.articleDisplayYn,
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
          const userGridData = await getUserGridSetting('MFGRD020');

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

        if (!gridStorage[wordJobGridId.value]) {
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

            // columnDefs 설정
            columnDefs.value = [checkboxField, ...transformedData];

            // columnDefs가 설정된 후에 실행
            uiStore.setGridColumnDefs('MFGRD020', columnDefs.value);

            gridStorage[wordJobGridId.value] = columnDefs.value;
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
          columnDefs.value = gridStorage[wordJobGridId.value];
        }

        const wordJobQuery = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          jobTypeCode: 'STD',
          userId: userId,
          query: '', // 있으면 추가
          sort: getSortQuery(), // 있으면 추가
        };
        await getWordJobData(wordJobQuery);
      });

      const jobState = ref(false);

      const uiStore = useUiStore();
      const { alertInfos } = useAlert();
      const { gridColumnDefs } = storeToRefs(uiStore);

      //Grid Header 설정

      const columnUserJobWordMngFcDefs = ref([]);
      const columnUserJobWordMngHeadData = ref([]);

      const gridUserJobWordDefs = ref({
        scrnGridId: wordMngGridId,
        scrnId: '',
      });

      const sortedColumns = columnDefs.value
        .filter((col) => col.sort && col.sortIndex !== undefined)
        .sort((a, b) => a.sortIndex - b.sortIndex);

      const sortQuery =
        sortedColumns.length > 0
          ? sortedColumns
              .map((col) => `${col.headerName} ${col.sort}`)
              .join(', ')
          : '';

      const wordJobQuery = reactive({
        userId: userId,
        instituteId: useMetaMngInstId,
        jobTypeCode: 'STD',
        query: '', // 있으면 추가
        sort: sortQuery, // 있으면 추가
      });

      const updateDateTime = new Date().toISOString().split('T')[0];

      //사용자 작업 데이터
      const userWorkWordData = reactive([]);

      // 단어 작업목록 조회
      const getWordJobData = async (query) => {
        let wordJobList;

        const wordJobQuery = {
          dictionaryId: useDctnryId,
          instituteId: useMetaMngInstId,
          jobTypeCode: 'STD',
          query: '', // 있으면 추가
          sort: '', // 있으면 추가
        };

        if (query != null) {
          wordJobList = await getWordJobListV2(query);
        } else {
          wordJobList = await getWordJobListV2(wordJobQuery);
        }

        console.log('wordJobList ========================== : ', wordJobList);

        if (wordJobList.status === 409) {
          resultCount.value.total = 0;
          userWorkWordData.value = [];
        }

        const jobList = wordJobList.data.items;
        console.log('jobList : ', jobList);

        const wordJobdData = [];

        for (let i = 0; i < jobList.length; i++) {
          let category;

          console.log('jobList[i] : ', jobList[i]);

          if (jobList[i].jobDivisionName === '신규등록') {
            category = '신규';
          } else if (jobList[i].jobDivisionName === '변경등록') {
            category = '변경';
          } else if (jobList[i].jobDivisionName === '폐기등록') {
            category = '폐기';
          } else if (jobList[i].jobDivisionName === '복구등록') {
            category = '복구';
          } else if (jobList[i].jobDivisionName === '삭제등록') {
            category = '삭제';
          } else {
            category = jobList[i].jobDivisionName;
          }

          wordJobdData.push({
            id: i,
            instituteId: jobList[i].instituteId,
            dictionaryId: jobList[i].dictionaryId,
            jobWordId: jobList[i].jobWordId,
            userId: jobList[i].userId,
            jobDivisionName: jobList[i].jobDivisionName,
            jobDivisionCode: jobList[i].jobDivisionCode,
            applicationCategory: category,
            discardYn: jobList[i].discardYn,
            wordName: jobList[i].wordName,
            wordEngAbbreviationName: jobList[i].wordAbbreviationName,
            domainClassName: jobList[i].domainClassName,
            wordNameErrorName: jobList[i].wordNameErrorName,
            wordNameErrorYn: jobList[i].wordNameErrorYn,
            updateDateTime: jobList[i].updateDateTime,
            wordTypeName: jobList[i].wordTypeName,
          });
        }
        resultCount.value.total = wordJobList.data.totalCount;
        resultCount.value.count = wordJobList.data.searchCount;

        console.log('wordJobdData : ', wordJobdData);

        userWorkWordData.value = wordJobdData;
      };

      getWordJobData();

      // 체크된 작업 항목
      const wordJobSelected = ref([]);

      // 체크 변경 시 이벤트
      const onSelectionChanged = () => {
        const selectedNodes = gridApi.value.getSelectedNodes();
        wordJobSelected.value = selectedNodes;

        selectedWordData.value = selectedNodes.map((node) => node.data);
        // 선택된 행에 대한 추가 작업 수행
      };

      const userWorkCodeData = reactive([]);

      const resultCount = ref({
        total: 10,
        count: 0,
      });

      const wordJobData = reactive({});

      //단어 더블클릭 시 선택한 데이터
      const selectedWordData = reactive({});

      // watch(selectedWordData, async (newWordValue, oldWordValue) => {
      //   // selectedTab1Data의 변화가 있을 경우

      //   console.log('newWordValue : ', newWordValue);

      //   // 상단그리드의 조회된 데이터가 없는 경우
      //   if (newWordValue === null) {
      //     return;
      //   }

      //   const wordData = newWordValue.data ? newWordValue.data : newWordValue;

      //   if (newWordValue !== oldWordValue) {
      //     jobUpdateYn.value = false;
      //     console.log('selectedTab1Data changed:', newWordValue);
      //     let wordDetailsQuery = {
      //       wordDictionaryId: wordData.wordDictionaryId,
      //       wordName: wordData.wordName[0].label,
      //       wordAbbreviationName: wordData.wordAbbreviationName,
      //     };
      //     const wordDetailsDataInfo = await getWordDetailInfo(wordDetailsQuery);

      //     nextTick(() => {
      //       wordJobData.value = wordDetailsDataInfo;
      //     });
      //   }

      //   if (wordData.wordDictionaryId != useDctnryId) {
      //     jobState.value = true;
      //   } else {
      //     jobState.value = false;
      //   }
      // });

      //valueFormatter 함수 설정
      watchEffect(() => {
        const uiStore = useUiStore();
        const { gridColumnDefs } = storeToRefs(uiStore);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD020) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD020;

        // columnDefs.value = columnDefs.value.map((col) => {
        //   if (col.field === 'domainClassName') {
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
        //       cellRenderer: 'TypeCellRenderer',
        //       suppressSorting: true,
        //       comparator: () => 0,
        //     };
        //   } else {
        //     return col;
        //   }
        // });
      });

      //작업 취소
      const cancelConfirmState = reactive({
        view: false,
        message:
          '선택한 항목이 작업목록에서 <span style="color: red;">삭제</span>됩니다. 계속하시겠습니까?',
      });
      const onWorkJobCancelConfirm = () => {
        cancelConfirmState.view = true;
      };

      const onWorkJobCancel = async () => {
        const selectedData = agGrid.value.gridApi.getSelectedNodes();

        console.log('취소목록 selectedData : ', selectedData);

        const wordCancelParamData = selectedData.map((selectedItem) => ({
          instituteId: selectedItem.data.instituteId,
          dictionaryId: selectedItem.data.dictionaryId,
          jobTypeCode: 'STD',
          jobWordId: selectedItem.data.jobWordId,
        }));

        const response = await deleteWordV2(wordCancelParamData);

        await getWordJobData();
        setIsWordJobApproval(true);
        console.log('selectedData : ', selectedData);
      };

      //작업완료
      const approvalConfirmState = reactive({
        view: false,
        message: '승인신청이 완료되었습니다.',
      });

      const onApprovalConfirm = () => {
        approvalConfirmState.view = true;
      };

      const onWorkJobWordApproval = async () => {
        const selectedData = agGrid.value.gridApi.getSelectedNodes();

        const wordCompleteParamData = selectedData.map((selectedItem) => ({
          instituteId: selectedItem.data.instituteId,
          userId: userInfo.value.userId,
          dictionaryId: selectedItem.data.dictionaryId,
          jobWordId: selectedItem.data.jobWordId,
        }));

        const response = await getWordCompliteJobV2(wordCompleteParamData);

        const wordApplyResult = {
          managementType: '단어',
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
            wordApplyResult.successList.push(item);
          } else {
            wordApplyResult.failList.push(item);
            console.log('실패');
          }
        });

        wordApplyResult.successCount = wordApplyResult.successList.length;
        wordApplyResult.failCount = wordApplyResult.failList.length;

        onApplyResultAlert(wordApplyResult);

        setIsWordJobApproval(true);
        await getWordJobData();
      };

      // 작업완료 결과 값 출력 함수
      const onApplyResultAlert = (result) => {
        const { managementType, successCount, failCount } = result;

        // let applyResultMessage = `<span style="color : #379583;">[ ${managementType} 작업완료 결과 ]</span> <br><br>성공 : ${successCount} 건 <br>실패 : ${failCount} 건`;

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

      // 용어 일괄 업로드(엑셀)
      const wordUploadWindowView = ref(false);
      const wordUploadWindow = () => {
        wordUploadWindowView.value = true;
      };

      const onCloseWordUploadWindow = () => {
        wordUploadWindowView.value = false;
      };
      const onWordUploadSave = async () => {
        await getWordJobData();
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
            if (colDef.field === 'applicationCategory') {
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
                colDef.field === 'applicationCategory' ? cellRenderer : null,
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
        gridStorage.MFGRD020 = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);
        // 스토어에 저장
        uiStore.setGridColumnDefs('MFGRD020', newColumnFcDefs);
      }

      const sortStateQuery = ref('');

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

        const lastItem =
          userWorkWordData.value.length > 0
            ? userWorkWordData.value[userWorkWordData.value.length - 1]
            : null;
        console.log('lastItem ===', lastItem);

        console.log('sortState :', sortState);

        // sort의 결과가 초기화 상태일 때,
        if (sortState.value.length == 0) {
          const researchQuery = {
            userId: userInfo.value.userId,
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            query: wordJobQuery.query,
            jobTypeCode: 'STD',
          };
          sortStateQuery.value = '';

          await getWordJobData(researchQuery);
          //userWorkWordData.value = termJobData;
        } else {
          const sortParts = sortState.value.map(
            (column) => `${column.headerName} ${column.sort}`
          );
          sortQuery.value = sortParts.join(', ');
          sortStateQuery.value = sortQuery.value;

          console.log('sortQuery.value: ', sortQuery.value);
          console.log('sortStateQuery.value: ', sortStateQuery.value);

          const researchQuery = {
            userId: userInfo.value.userId,
            instituteId: useMetaMngInstId,
            query: wordJobQuery.query,
            dictionaryId: useDctnryId,
            sort: sortQuery.value,
            jobTypeCode: 'STD',
          };

          await getWordJobData(researchQuery);
        }
      };

      const currentRowIndex = ref(0);

      // 그리드 스크롤 이벤트 함수
      const handleScrollChanged = (endScrollStaus) => {
        if (endScrollStaus === 'Y' && userWorkWordData.value != null) {
          const lastRowNode =
            agGrid.value.gridApi.getRenderedNodes()[
              agGrid.value.gridApi.getRenderedNodes().length - 1
            ];

          currentRowIndex.value = lastRowNode.rowIndex;
          console.log(
            'currentRowIndex.value ================',
            currentRowIndex.value
          );

          const lastItem =
            userWorkWordData.value.length > 0
              ? userWorkWordData.value[userWorkWordData.value.length - 1]
              : null;

          let wordResearchQuery = {
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            jobTypeCode: 'STD',
            lastItem: {
              instituteId: lastItem.instituteId,
              dictionaryId: lastItem.dictionaryId,
              jobWordId: lastItem.jobWordId,
              userId: lastItem.userId,
              jobDivisionName: lastItem.jobDivisionName,
              jobDivisionCode: lastItem.jobDivisionCode,
              discardYn: lastItem.discardYn,
              wordName: lastItem.wordName,
              wordAbbreviationName: lastItem.wordEngAbbreviationName,
              domainClassName: lastItem.domainClassName,
              wordNameErrorName: lastItem.wordNameErrorName,
              wordNameErrorYn: lastItem.wordNameErrorYn,
              updateDateTime: lastItem.updateDateTime,
              wordTypeName: lastItem.wordTypeName,
            },
            query: wordJobQuery.query,
            sort: getSortQuery(),
          };

          // await getWordJobData(wordResearchQuery);
          addGridRowData(wordResearchQuery);
        }
      };

      // 단어 그리드 데이터 추가 함수
      const addGridRowData = async (wordResearchQuery) => {
        try {
          // 추가 조회 전 데이터 저장
          let oldGridData = userWorkWordData.value;

          const lastRowIndex = oldGridData.length - 1;
          const lastRowNode =
            agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);

          const lastItem =
            userWorkWordData.value.length > 0
              ? userWorkWordData.value[userWorkWordData.value.length - 1]
              : null;

          console.log('lastItem ====================', lastItem);

          wordResearchQuery.dictionaryId = useDctnryId;

          let reLoadWordData;

          if (wordResearchQuery.query) {
            // 검색 조회시 스크롤
            reLoadWordData = await getWordJobListV2(wordResearchQuery);
            console.log('reLoadWordData ===', reLoadWordData);
          } else {
            // 기본 스크롤
            reLoadWordData = await getWordJobListV2(wordResearchQuery);
          }

          console.log('reLoadWordData ====================', reLoadWordData);
          const words = reLoadWordData.data.items;

          const newGridData = [];

          for (let n = 0; n < words.length; n++) {
            let category;

            if (words[n].jobDivisionName === '신규등록') {
              category = '신규';
            } else if (words[n].jobDivisionName === '변경등록') {
              category = '변경';
            } else if (words[n].jobDivisionName === '폐기등록') {
              category = '폐기';
            } else if (words[n].jobDivisionName === '복구등록') {
              category = '복구';
            } else if (words[n].jobDivisionName === '삭제등록') {
              category = '삭제';
            } else {
              category = words[n].jobDivisionName;
            }

            newGridData.push({
              id: oldGridData.length + n,
              no: oldGridData.length + n + 1,
              instituteId: words[n].instituteId,
              dictionaryId: words[n].dictionaryId,
              jobWordId: words[n].jobWordId,
              userId: words[n].userId,
              jobDivisionName: words[n].jobDivisionName,
              jobDivisionCode: words[n].jobDivisionCode,
              applicationCategory: category,
              discardYn: words[n].discardYn,
              wordName: words[n].wordName,
              wordEngAbbreviationName: words[n].wordAbbreviationName,
              domainClassName: words[n].domainClassName,
              wordNameErrorName: words[n].wordNameErrorName,
              wordNameErrorYn: words[n].wordNameErrorYn,
              updateDateTime: words[n].updateDateTime,
              wordTypeName: words[n].wordTypeName,
            });
          }

          // 재조회 후 rowData에 할당.
          userWorkWordData.value = [...oldGridData, ...newGridData];

          resultCount.value.count = Number(userWorkWordData.value.length);

          // 새로운 데이터 로드 후 마지막으로 보고 있던 행으로 스크롤
          agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
        } catch (error) {
          console.error(error);
        }
      };

      const onFilterWindowClosed = async (filterSet) => {
        // 필터 창이 닫힐 때 수행하고 싶은 로직
        console.log('필터 창이 닫혔습니다.');
        console.log('filterSet : ', filterSet);

        // 맞춤형 필터 설정이 있을 때
        if (filterSet) {
          console.log('columnDefs.value : ', columnDefs.value);

          // 필터 설정에 따른 정렬 및 필터 쿼리 설정
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

          const termJobFilterQuery = {
            userId: userInfo.value.userId,
            managementInstituteId: useMetaMngInstId,
            termDictionaryId: useDctnryId,
            query: filterSet.searchQuery,
            sort: filterSortQuery,
          };

          wordJobQuery.query = filterSet.searchQuery;
          searchInput.value = filterSet.searchQuery;
          const termJobFilterData = await getWordJobData(termJobFilterQuery);
          // const filterSearchData = getTermRowData(termFilterData);
          // const filterSearchData = jobTermSearchResultBinding(
          //   termJobFilterData.data
          // );
          console.log('filterSet.searchQuery : ', filterSet.searchQuery);

          // workSearchData.value = filterSearchData;
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());
          console.log('gridStorage.MFGRD020 : ', gridStorage.MFGRD020);
          columnDefs.value = gridStorage.MFGRD020;

          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD020);
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
        const gridDefaultData = await getGridDefaultData(wordJobGridId.value);

        console.log('gridDefaultData : ', gridDefaultData);

        // 기본값 설정
        await setUserGridSetting(wordJobGridId.value, gridDefaultData);

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

        // columnDefs 설정
        columnDefs.value = [checkboxField, ...transformedData];

        // columnDefs.value = transformedData;

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage[wordJobGridId.value] = transformedData;

        saveGridInfoToStorage(gridStorage);

        uiStore.setGridColumnDefs(wordJobGridId.value, columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        // await updateGridData(termQuery);

        wordJobQuery.query = '';
        searchInput.value = '';

        await getWordJobData();
      };

      // onActivated(async () => {
      //   console.log('단어등록 - onActivated');
      //   await getWordJobData();
      // });

      // 정렬(소팅) 정보 반환 함수
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

      // 단어 작업 업데이트 props 데이터
      const propsWordJobData = reactive({});

      const onWordSave = async () => {
        console.log('단어 저장');
        await getWordJobData();
        emit('wordwork-complete');
      };

      const onWordJobUpdate = async () => {
        console.log('단어 작업 업데이트');
        await getWordJobData();
      };

      // RightComp => 작업 저장 완료 이벤트 발생 시 작업목록 재조회
      watch(
        () => isWordJobSave.value,
        async (newValue) => {
          if (newValue) {
            console.log('단어 작업 저장 완료');
            await onWordSave();
            setIsWordJobSave(false);
          }
        }
      );

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
        wordJobQuery.query = llmAnswer.where;
        searchInput.value = llmAnswer.where;

        await columnDefsUpdate(
          llmAnswer.sort,
          columnDefs,
          wordJobGridId.value,
          gridApi
        );

        wordJobQuery.query = llmAnswer.where;
        wordJobQuery.sort = llmAnswer.sort;

        await getWordJobData(wordJobQuery);
      };

      const onSetUserGridSetting = async () => {
        const gridStorage = JSON.parse(getGridInfoFromStorage());

        const fieldMapping = {
          no: 'NO',
          wordNameErrorName: 'WRD_NM_ERR_NM',
          wordTypeName: 'WRD_TYPE_NM',
          applicationCategory: 'JOB_DV_NM',
          wordName: 'WRD_NM',
          wordEngAbbreviationName: 'WRD_EABBR_NM',
          domainClassName: 'DMN_CLS_NM',
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

        await setUserGridSetting(wordJobGridId.value, newGridStting);

        await getWordJobData();
        // updateGridData(termQuery);
      };

      const saveGridSettingView = reactive({
        view: false,
        message: '그리드 설정 정보를 저장하시겠습니까?',
      });

      const onSaveGridSettingWindow = () => {
        saveGridSettingView.view = true;
      };

      // 결재
      const approvalPopupView = ref(false);

      const onApprovalPopup = () => {
        const selectedData = gridApi.value.getSelectedNodes();
        const selectedWordData = selectedData.map((item) => item.data);

        const filterWordData = selectedWordData.filter(
          (item) => item.wordErrorName !== '오류'
        );

        selectedWordData.value = filterWordData;

        approvalPopupView.value = true;
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

      // 결재요청
      const onApprovalRequestConfirm = async () => {
        console.log('onApprovalRequestConfirm 실행');
        approvalPopupView.value = false;
        confirmWindowView.value = true;

        await getWordJobData();
      };

      const onCloseApprovalPopup = () => {
        console.log('onCloseApprovalPopup 실행');
        approvalPopupView.value = false;
      };

      const popInfo = ref({
        state: 'redirect',
        popTitle: '결재 요청 확인',
        popMessages: `<span style="font-weight : 900;">결재 요청이 완료되었습니다.</span>
        전자결재 페이지로 이동하여 결재항목을 확인하실 수 있습니다.`,
        confirmBtnText: '전자결재 이동',
        cancelBtnText: '확인',
      });

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

      const handleExcelDownload = async (state) => {
        console.log('state : ', state);

        try {
          if (state === 'all') {
            // 🔥 전체 다운로드 - API 응답을 엑셀 파일로 다운로드
            const params = {
              instituteId: useMetaMngInstId,
              dictionaryId: useDctnryId,
              dictionarySearchCode: 'INDIVIDUAL',
              jobTypeCode: 'STD',
              query: wordJobQuery.query,
              sort: getSortQuery(),
            };

            console.log('params : ', params);

            const response = await getJobWordDownload(params);
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
              link.download = `단어_작업목록_전체_${new Date()
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

            if (
              !userWorkWordData.value ||
              userWorkWordData.value.length === 0
            ) {
              alert('조회된 데이터가 없습니다.');
              return;
            }
            // 🔥 rowData를 엑셀 다운로드 형식으로 변환
            const excelData = convertRowDataToExcelFormat(
              userWorkWordData.value
            );

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
            단어명: row.wordName || '',
            단어영문약어명: row.wordEngAbbreviationName || '',
            단어유형: row.wordTypeName || '',
            도메인분류명: row.domainClassName || '',
            상태: row.wordNameErrorName || '',
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
          const worksheet = workbook.addWorksheet('단어_작업목록');

          // 🔥 컬럼 정의 및 헤더 설정
          worksheet.columns = [
            { header: '작업', key: '작업', width: 15 },
            { header: '단어명', key: '단어명', width: 25 },
            { header: '단어영문약어명', key: '단어영문약어명', width: 40 },
            { header: '단어유형', key: '단어유형', width: 25 },
            { header: '도메인분류명', key: '도메인분류명', width: 20 },
            { header: '상태', key: '상태', width: 15 },
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

              // 순번 컬럼은 중앙 정렬, 나머지는 좌측 정렬
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
          const fileName = `단어_작업목록_${downloadType}_${new Date()
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
          XLSX.utils.book_append_sheet(workbook, worksheet, '단어_작업목록');

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

          const fileName = `단어_작업목록_${downloadType}_${new Date()
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
          link.download = `단어_작업목록_${downloadType}_${new Date()
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

      return {
        agGrid,
        gridApi,
        onGridReady,
        userWorkWordData,
        userWorkCodeData,
        resultCount,
        cancelConfirmState,
        onWorkJobCancelConfirm,
        onWorkJobCancel,
        approvalConfirmState,
        onApprovalConfirm,
        onWorkJobWordApproval,
        wordMngGridId,
        columnUserJobWordMngFcDefs,
        columnUserJobWordMngHeadData,
        gridUserJobWordDefs,
        columnDefs, // 단어 그리드 헤더
        getWordJobData, // 작업목록 조회
        handleColumnStateChanged, // 그리드 컬럼 이동 및 사이즈 변경
        wordJobQuery,
        gridInfoDefs,
        wordUploadWindowView,
        useMetaMngInstId,
        userId,
        wordUploadWindow,
        onCloseWordUploadWindow,
        onWordUploadSave,
        handleSortChanged,
        sortStateQuery,
        sortQuery,
        onFilterWindowClosed,
        onResetFilter,
        onSearchRemove,
        resetFilterState,
        updateDateTime,
        onSelectionChanged, // 체크박스 선택 시 이벤트
        wordJobSelected,
        jobUpdateYn,
        jobState,
        selectedWordData,
        wordJobData,
        onWordSave,
        propsWordJobData,
        onWordJobUpdate,
        setWordJobUpdateData, // 단어 작업 업데이트 데이터 설정
        getWordJobUpdateData, // 단어 작업 업데이트 데이터 가져오기
        setIsWordJobUpdate, // 단어 작업 렌더링 컴포넌트 설정
        chatbotWindowView,
        onOpenChatbotWindow,
        onCloseChatbotWindow,
        handleBindQuery,
        wordJobGridId,
        onSetUserGridSetting,
        saveGridSettingView,
        onSaveGridSettingWindow,
        searchInput,
        searchType,
        handleChangeSearchType,
        handleScrollChanged,
        useDctnryId,
        getTooltipById,
        approvalPopupView, // 결재 팝업 상태
        onApprovalPopup, // 결재 팝업 열기
        onCloseApprovalPopup, // 결재 팝업 닫기
        onApprovalRequestConfirm, // 결재 요청 확인
        popInfo,
        confirmWindowView,
        onRedirectApproval, // 결재 페이지로 이동
        onCloseConfirmWindow, // 결재 팝업 닫기
        onApprovalRequestError,
        handleExcelDownload, // 엑셀 다운로드
      };
    },
  };
</script>
