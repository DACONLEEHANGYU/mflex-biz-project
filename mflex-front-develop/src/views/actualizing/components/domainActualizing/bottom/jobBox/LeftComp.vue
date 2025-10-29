<template>
  <div class="grid-wrap job-domain-grid">
    <div class="grid-top">
      <div class="title-top">
        <div class="title-s">
          <div class="title-s-left">
            작업 box
            <AppTooltip :htmlContent="getTooltipById('jobBox')"> </AppTooltip>
          </div>
          <div class="btns" style="display: flex">
            <button
              :disabled="isJobCheckd"
              class="btn-s cancel-btn"
              title="작업취소"
              @click="onCancelConfirm"
            >
              작업취소
            </button>
            <button
              :disabled="isJobCheckd"
              class="btn-s apply-btn"
              title="작업완료"
              @click="onApprovalPopup"
            >
              작업완료
            </button>
          </div>
        </div>
        d
        <div class="title-btns__row_btween">
          <div class="btns">
            <button
              class="btn-s blue"
              title="표준화 도메인 추출"
              @click="onOpenExtractDomainWindow"
            >
              표준화 도메인 추출
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
          @excel-download="handleExcelDownload"
          class="br-t"
        />
      </div>
    </div>
    <div class="grid-list domain-job-grid">
      <AppGrid
        :rowData="domainJobRowData"
        :columnDefs="columnDefs"
        :context="context"
        rowSelection="multiple"
        @body-scroll="handleScrollChanged"
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
  </div>

  <!-- 작업취소 알림창 -->
  <AppDialog
    v-model:view="cancelConfirmState.view"
    :title="cancelConfirmState.title"
    :message="cancelConfirmState.message"
    @confirm="onCancel"
  />
  <!-- 작업완료 알림창 -->
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

  <!-- 그리드세팅 저장 알림창 -->
  <AppDialog
    v-model:view="saveGridSettingView.view"
    :title="saveGridSettingView.title"
    :message="saveGridSettingView.message"
    @confirm="onSetUserGridSetting"
  />

  <!-- 도메인 그룹 및 분류 검색창 -->
  <AppWindow
    :view="domainNameSearchWindowView"
    @close="onCloseDomainNameSearchWindow"
    width="800px"
    height="auto"
  >
    <DomainGroupTypeSearchWindow
      @confirm="onDomainNameSearchSave"
      @close="onCloseDomainNameSearchWindow"
    />
  </AppWindow>

  <!-- 도메인엑셀 업로드 팝업 -->
  <AppWindow
    :view="domainUploadWindowView"
    @close="onCloseDomainUploadWindow"
    width="1400px"
    height="700px"
  >
    <DomainFileUploadWindow
      @confirm="onDomainGroupSearchSave"
      @close="onCloseDomainUploadWindow"
    />
  </AppWindow>

  <AppWindow
    :view="chatbotWindowView"
    :moveState="true"
    @close="onCloseChatbotWindow"
    width="500px"
    height="auto"
  >
    <ChatbotWindow
      :gridId="domainJobGridId"
      @bind-query="handleBindQuery"
      @confirm="onConfirmChatbot"
      @close="onCloseChatbotWindow"
    />
  </AppWindow>

  <!-- 표준화 도메인추출-->
  <AppWindow
    :view="extractDomainWindowView"
    @close="onCloseExtractDomainWindow"
    width="700px"
    height="auto"
  >
    <ConfirmWindow
      :popInfo="popInfo"
      @confirm="onExtractDomain"
      @close="onCloseExtractDomainWindow"
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
      :type="'domain-synchronize'"
      :selectedData="selectDomainGridData"
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

<!-- eslint-disable vue/no-unused-components -->
<script>
  import {
    reactive,
    ref,
    watch,
    nextTick,
    onBeforeMount,
    onActivated,
  } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import { useAlert } from '@/composables/alert';
  import { useAuthStore } from '@/stores/auth';
  import { useActualizingStore } from '@/stores/actualizing';
  import { useDictionaryMngStore } from '@/stores/dictionaryMng';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { storeToRefs } from 'pinia';
  import { useRouter } from 'vue-router';
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
  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';
  import WordSearchWindow from '@/components/popWindow/WordSearchWindow.vue';
  import DomainGroupTypeSearchWindow from '@/components/popWindow/DomainGroupTypeSearchWindow.vue';
  import DomainUploadWindow from '@/components/popWindow/DomainUploadWindow.vue';
  import ChatbotWindow from '@/components/popWindow/ChatbotWindow.vue';
  import DomainFileUploadWindow from '@/components/popWindow/DomainFileUploadWindow.vue';
  import { getResearchDomainJob } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import ApprovalRequestWindow from '@/components/popWindow/approval/ApprovalRequestWindow.vue';
  import { useTabNaviStore } from '@/stores/tabNavi';

  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import {
    approveDomainV2, // 도메인 승인
    getDomainJobListV2, // 도메인 작업 목록 조회
    deleteDomainV2, // 도메인 관리 - 작업 도메인 삭제
    manageDomainV2, // 도메인 관리 - 작업 도메인 등록
    getJobDomainDownload,
  } from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api.js';
  import {
    getUserGridSetting, // 사용자별 Grid 세팅 조회
    setUserGridSetting, // 사용자별 Grid 세팅 설정
    getGridDefaultData, // 그리드 기본값 조회
  } from '@/utils/mflexApi/common/commonApi'; // 공통 API 모듈

  import { getExtractDomain } from '@/utils/mflexApi/actualizing/actualizingApi';
  import { columnDefsUpdate } from '@/utils/js/searchModule';

  export default {
    components: {
      TypeCellRenderer,
      GridSearch,
      AppTree,
      AppTooltip,
      RegTypeCellRenderer,
      AppWindow,
      WordSearchWindow,
      DomainGroupTypeSearchWindow,
      DomainUploadWindow,
      DomainFileUploadWindow,
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
        console.log('onRowClicked ', value);

        let jobRemoveYn = false;

        const selectedRow = document.querySelectorAll(
          '[class~="ag-row-selected"]'
        );
        // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        const clickedNode = document.querySelector(
          `.domain-job-grid [row-id="${clickNode}"]`
        );
        clickedNode.classList.add('ag-row-selected');

        this.setSelectDomainJobData(null);
        this.setSelectDomainJobData(value);
        this.domainSelectData = null;
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
            gridId: this.domainJobGridId,
            query: transformedQuery,
          };
          const llmAnswer = await getCreateQuery(searchInfo);

          await columnDefsUpdate(
            llmAnswer.data.sort,
            this.columnDefs,
            this.domainJobGridId,
            this.gridApi
          );

          this.domainJobQuery.query = llmAnswer.data.where;
          this.searchInput = value;

          const domainQuery = {
            userId: this.userId,
            managementInstituteId: this.useMetaMngInstId,
            query: llmAnswer.data.where,
            sort: llmAnswer.data.sort,
          };

          const domainJobSearchResult = await getResearchDomainJob(domainQuery);
          console.log('searchResult : ', domainJobSearchResult);

          // 조회된 결과가 없을 경우
          if (domainJobSearchResult.status === 409) {
            this.domainJobRowData.value = [];
            this.resultCount.total = 0;
            return;
          }

          const domainJobData = this.jobDomainSearchResultBinding(
            domainJobSearchResult.data
          );

          console.log('domainJobData : ', domainJobData);

          this.domainJobRowData.value = domainJobData;
          this.resultCount.total = domainJobSearchResult.data.totalCount;
          nextTick(() => {
            const jobDomainGrid = document.querySelector('.job-domain-grid');
            console.log('jobDomainGrid : ', jobDomainGrid);
            const nodesWithRowId0 = jobDomainGrid.querySelector('[row-id="0"]');
            console.log('nodesWithRowId0 : ', nodesWithRowId0);
            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);
          });
        } else {
          this.domainJobQuery.query = transformedQuery;
          this.searchInput = value;
          if (this.sortStateQuery != null) {
            sortQuery = this.sortStateQuery;
          } else {
            sortQuery = this.sortQuery;
          }

          const domainQuery = {
            instituteId: this.useMetaMngInstId,
            dictionaryId: this.useDctnryId,
            jobTypeCode: 'CUR',
            query: transformedQuery,
            sort: this.getSortQuery(),
          };

          const domainJobSearchResult = await getDomainJobListV2(domainQuery);

          console.log('searchResult : ', domainJobSearchResult);

          // 조회된 결과가 없을 경우
          if (domainJobSearchResult.status === 409) {
            this.domainJobRowData.value = [];
            this.resultCount.total = 0;
            return;
          }

          const domainJobData = this.jobDomainSearchResultBinding(
            domainJobSearchResult.data
          );

          console.log('domainJobData : ', domainJobData);

          this.domainJobRowData.value = domainJobData;
          this.resultCount.total = domainJobSearchResult.data.totalCount;
          nextTick(() => {
            const jobDomainGrid = document.querySelector('.job-domain-grid');
            console.log('jobDomainGrid : ', jobDomainGrid);
            const nodesWithRowId0 = jobDomainGrid.querySelector('[row-id="0"]');
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
        return this.domainJobSelected.length === 0;
      },
    },
    emits: ['domainGroupSave', 'domain-work-apply'],
    setup(props, { emit }) {
      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      const uiStore = useUiStore();
      const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);
      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);

      const { alertInfos, setAlertStatus } = useAlert();

      //사용자 아이디
      const { userId, userNm } = userInfo.value;
      //사용자 사용 시스템 정보
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const dictionaryMngStore = useDictionaryMngStore();
      const { isDomainJobSave } = storeToRefs(dictionaryMngStore);
      const { setIsDomainJobType, setIsDomainJobSave, setIsDomainJobApproval } =
        dictionaryMngStore;

      const actualizingStore = useActualizingStore();
      const { setSelectDomainJobData } = actualizingStore;

      const agGrid = ref(null);
      const gridApi = ref(null);

      const jobRemoveYn = ref(false);

      const tabNaviStore = useTabNaviStore();
      const { setTabNaviData } = tabNaviStore;

      const router = useRouter();

      const domainJobGridId = ref('MFGRD250');
      const gridInfoDefs = ref({
        scrnGridId: domainJobGridId,
        scrnId: '',
      });

      // 현재 인덱스
      const currentRowIndex = ref(0);

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
          DMN_TYPE_NM: 'domainTypeName',
          DMN_GRP_NM: 'domainGroupName',
          DMN_CLS_NM: 'domainClassName',
          DMN_NM: 'domainName',
          DMN_ERR_NM: 'domainErrorName',
        };

        const specialConfig = {
          applicationCategory: {
            cellRenderer: 'RegTypeCellRenderer',
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
              fieldName === 'domainTypeName' ||
              fieldName === 'domainErrorName'
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
          const userGridData = await getUserGridSetting('MFGRD250');
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
        // const sortedColumns = columnDefs.value
        //   .filter((col) => col.sortIndex !== null && col.sort !== null)
        //   .sort((a, b) => a.sortIndex - b.sortIndex)
        //   .map(
        //     (col) => `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`
        //   );

        // return sortedColumns.join(', ');

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

        if (!gridStorage[domainJobGridId.value]) {
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

            gridStorage[domainJobGridId.value] = newColumnDefs;
            saveGridInfoToStorage(gridStorage);

            // columnDefs가 설정된 후에 실행
            uiStore.setGridColumnDefs('MFGRD250', columnDefs.value);

            // gridApi 설정이 유효한지 확인
            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', columnDefs.value);
            }
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          columnDefs.value = gridStorage[domainJobGridId.value];
        }
        domainJobQuery.sort = getSortQuery();
        await fetchData();
      });

      const onGridReady = (params) => {
        console.log('params: ', params);
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);

        console.log('선택 노드 : ', gridApi.value.getSelectedNodes());
      };

      const domainJobSelected = ref([]);

      const onSelectionChanged = () => {
        const selectedNodes = gridApi.value.getSelectedNodes();
        domainJobSelected.value = selectedNodes;

        console.log('termJobSelected.value:', domainJobSelected.value);
        console.log('선택된 행:', selectedNodes);
        // 선택된 행에 대한 추가 작업 수행
      };

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

      const domainJobQuery = reactive({
        instituteId: useMetaMngInstId,
        dictionaryId: useDctnryId,
        jobTypeCode: 'CUR',
        query: '',
        sort: sortQuery,
      });

      const domainJobRowData = reactive({});

      const resultCount = ref({ count: 0, total: 0 });

      const fetchData = async (resaechQuery) => {
        let jobDomainList;

        if (resaechQuery) {
          jobDomainList = await getDomainJobListV2(resaechQuery);
        } else {
          jobDomainList = await getDomainJobListV2(domainJobQuery);
        }
        resultCount.value.total = jobDomainList.data.totalCount;
        resultCount.value.count = jobDomainList.data.searchCount;

        const domainJobList = jobDomainList.data.items;

        const tempData = [];

        for (let i = 0; i < domainJobList.length; i++) {
          tempData.push({
            id: i,
            no: i + 1,
            instituteId: domainJobList[i].instituteId,
            dictionaryId: domainJobList[i].dictionaryId,
            jobDomainId: domainJobList[i].jobDomainId,
            jobDivisionCode: domainJobList[i].jobDivisionCode,
            jobDivisionName: domainJobList[i].jobDivisionName,
            applicationCategory: domainJobList[i].jobDivisionName.slice(0, -2),
            domainGroupName: domainJobList[i].domainGroupName,
            domainClassName: domainJobList[i].domainClassName,
            domainName: domainJobList[i].domainName,
            domainId: domainJobList[i].domainId,
            jobTypeCode: domainJobList[i].jobTypeCode,
            domainErrorName: domainJobList[i].domainErrorName,
            domainErrorYn: domainJobList[i].domainErrorYn,
            discardYn: domainJobList[i].discardYn,
            updateDateTime: domainJobList[i].updateDateTime,
            userId: domainJobList[i].userId,
          });
        }

        domainJobRowData.value = tempData;

        console.log('domainJobRowData : ', domainJobRowData.value);
      };

      fetchData();

      // 선택 도메인그룹 데이터
      const selectDomainData = reactive({});

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
        console.log('selectedData : ', selectedData);

        const selectDomainData = selectedData.map((item) => item.data);
        console.log('selectDomainName : ', selectDomainData);

        const deleteDomain = selectDomainData.map((item) => {
          return {
            instituteId: item.instituteId,
            dictionaryId: item.dictionaryId,
            jobTypeCode: 'CUR',
            jobDomainId: item.jobDomainId,
          };
        });

        const deleteResponse = await deleteDomainV2(deleteDomain);

        console.log('deleteResponse : ', deleteResponse);
        // 재조회
        fetchData();
        setIsDomainJobApproval(true);
      };

      //승인 신청
      const approvalConfirmState = reactive({
        view: false,
        message: '작업이 완료되었습니다.',
      });
      const onApprovalConfirm = () => {
        approvalConfirmState.view = true;
      };

      const onApproval = async () => {
        try {
          const selectedData = gridApi.value.getSelectedNodes();
          const selectDomainData = selectedData.map((item) => item.data);

          const domainApprove = selectDomainData.map((item) => {
            return {
              instituteId: item.instituteId,
              dictionaryId: item.dictionaryId,
              userId: item.userId,
              jobTypeCode: 'CUR',
              jobDomainId: item.jobDomainId,
            };
          });

          const response = await approveDomainV2(domainApprove);

          const domainApplyResult = {
            managementType: '도메인',
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
              domainApplyResult.successList.push(item);
            } else {
              domainApplyResult.failList.push(item);
              console.log('실패');
            }
          });

          domainApplyResult.successCount = domainApplyResult.successList.length;
          domainApplyResult.failCount = domainApplyResult.failList.length;

          let totalSuccessCount = 0;
          let totalFailCount = 0;
          let message = `<div style="text-align: center;">              
              <p style="color: #379583; font-weight: bold; margin-bottom: 10px;">[ 도메인 작업완료 결과 ]</p>
               <div style="display: flex; justify-content: space-around; margin-top: 10px;">
              <span>성공: <strong style="color: #28a745;">${domainApplyResult.successCount} 건</strong></span>
              <span>실패: <strong style="color: #dc3545;">${domainApplyResult.failCount} 건</strong></span>
            </div>`;

          setAlertStatus({
            view: true,
            message: message,
          });

          // 재조회
          fetchData();

          // 작업완료(승인신청) 상태값 변경
          setIsDomainJobApproval(true);
        } catch (error) {
          console.error('도메인 작업 중 오류 발생:', error);
          setAlertStatus({
            view: true,
            message: '도메인 작업 중 오류가 발생했습니다.',
          });
        }
      };

      // 작업 결과를 처리하는 헬퍼 함수
      function processApplyResult(response) {
        const successCount = response.data.successJob.length;
        const failCount = response.data.failedJob.length;
        return { successCount, failCount };
      }

      //도메인명 검색
      const domainNameSearchWindowView = ref(false);

      const onOpenDomainNameSearchWindow = () => {
        domainNameSearchWindowView.value = true;
      };
      const onCloseDomainNameSearchWindow = () => {
        domainNameSearchWindowView.value = false;
      };
      const onDomainNameSearchSave = () => {
        console.log('일괄 영문 약어생성 저장');
        onCloseDomainNameSearchWindow();
      };

      // 도메인 작업 조회결과 그리드 데이터 생성
      const jobDomainSearchResultBinding = (domainJobSearchResult) => {
        const domainJobList = domainJobSearchResult.items;

        resultCount.value.total = domainJobSearchResult.totalCount;
        resultCount.value.count = domainJobSearchResult.searchCount;

        const tempData = [];

        let applicationCategory;

        for (let i = 0; i < domainJobList.length; i++) {
          if (domainJobList[i].jobDivisionCode === 'C') {
            applicationCategory = '신규';
          } else if (domainJobList[i].jobDivisionCode === 'U') {
            applicationCategory = '변경';
          } else if (domainJobList[i].jobDivisionCode === 'X') {
            applicationCategory = '폐기';
          } else if (domainJobList[i].jobDivisionCode === 'D') {
            applicationCategory = '삭제';
          } else if (domainJobList[i].jobDivisionCode === 'V') {
            applicationCategory = '복구';
          }
          tempData.push({
            id: i,
            applicationCategory: applicationCategory,
            instituteId: domainJobList[i].instituteId,
            dictionaryId: domainJobList[i].dictionaryId,
            jobDomainId: domainJobList[i].jobDomainId,
            domainTypeName: domainJobList[i].domainTypeName,
            domainTypeCode: domainJobList[i].domainTypeCode,
            domainGroupName: domainJobList[i].domainGroupName,
            domainClassName: domainJobList[i].domainClassName,
            domainName: domainJobList[i].domainName,
            discardYn: domainJobList[i].discardYn,
            domainErrorName: domainJobList[i].domainErrorName,
            domainErrorYn: domainJobList[i].domainErrorYn,
            jobDivisionCode: domainJobList[i].jobDivisionCode,
            jobDivisionName: domainJobList[i].jobDivisionName,
            jobTypeCode: domainJobList[i].jobTypeCode,
            updateDateTime: domainJobList[i].updateDateTime,
            userId: domainJobList[i].userId,
          });
        }

        return tempData;
      };

      // 정렬 핸들러
      const handleSortChanged = async (newSortedState) => {
        console.log('newSortedState : ', newSortedState);
        const sortQuery = ref('');
        const sortState = reactive({});

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
        console.log('domainJobRowData.value:', domainJobRowData.value);
        console.log(
          'domainJobRowData.value.length:',
          domainJobRowData.value.length
        );

        const lastItem =
          domainJobRowData.value.length > 0
            ? domainJobRowData.value[domainJobRowData.value.length - 1]
            : null;
        console.log('lastItem ===', lastItem);

        console.log('sortState :', sortState);

        // sort의 결과가 초기화 상태일 때,
        if (sortState.value.length == 0) {
          const domainQuery = {
            userId: userId,
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            jobTypeCode: 'CUR',
            query: domainJobQuery.query,
            sort: getSortQuery(),
          };
          sortStateQuery.value = '';

          const domainJobSearchResult = await getDomainJobListV2(domainQuery);
          const domainJobData = jobDomainSearchResultBinding(
            domainJobSearchResult.data
          );
          domainJobRowData.value = domainJobData;
        } else {
          const sortParts = sortState.value.map(
            (column) => `${column.headerName} ${column.sort}`
          );
          sortQuery.value = sortParts.join(', ');
          sortStateQuery.value = sortQuery.value;

          console.log('sortQuery.value: ', sortQuery.value);
          console.log('sortStateQuery.value: ', sortStateQuery.value);

          const domainQuery = {
            userId: userId,
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            jobTypeCode: 'CUR',
            query: domainJobQuery.query,
            sort: getSortQuery(),
          };

          const domainJobSearchResult = await getDomainJobListV2(domainQuery);
          const domainJobData = jobDomainSearchResultBinding(
            domainJobSearchResult.data
          );
          domainJobRowData.value = domainJobData;
        }
      };

      // 그리드 스크롤 이벤트 함수
      const handleScrollChanged = async (endScrollStaus) => {
        console.log('endScrollStaus ===', endScrollStaus);
        try {
          if (endScrollStaus === 'Y' && domainJobRowData.value != null) {
            const lastItem =
              domainJobRowData.value.length > 0
                ? domainJobRowData.value[domainJobRowData.value.length - 1]
                : null;
            console.log('lastItem ===', lastItem);

            const termResearchQuery = {
              instituteId: useMetaMngInstId,
              dictionaryId: useDctnryId,
              jobTypeCode: 'CUR',
              userId: userId,
              lastItem: {
                instituteId: lastItem.instituteId,
                dictionaryId: lastItem.dictionaryId,
                jobDomainId: lastItem.jobDomainId,
                jobDivisionCode: lastItem.jobDivisionCode,
                jobDivisionName: lastItem.jobDivisionName,
                applicationCategory: lastItem.applicationCategory,
                domainGroupName: lastItem.domainGroupName,
                domainClassName: lastItem.domainClassName,
                domainName: lastItem.domainName,
                domainId: lastItem.domainId,
                jobTypeCode: lastItem.jobTypeCode,
                domainErrorName: lastItem.domainErrorName,
                domainErrorYn: lastItem.domainErrorYn,
                discardYn: lastItem.discardYn,
                updateDateTime: lastItem.updateDateTime,
                userId: lastItem.userId,
              },
              query: domainJobQuery.query,
              sort: getSortQuery(),
            };

            await addGridRowData(termResearchQuery);
          }
        } catch (error) {
          console.log('lastItem x 에러 발생 ==');
          console.error(error);
        }
      };

      // 그리드 데이터 추가 조회 함수
      const addGridRowData = async (termResearchQuery) => {
        try {
          // 추가 조회 전 데이터 저장
          let oldGridData = domainJobRowData.value;

          const lastRowIndex = oldGridData.length - 1;
          const lastRowNode =
            agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);
          console.log('마지막 node ===========', lastRowNode);

          console.log('termResearchQuery ===', termResearchQuery);

          const reLoadDomainData = await getDomainJobListV2(termResearchQuery);

          const domains = reLoadDomainData.data.items;

          console.log('domains : ', domains);

          const newGridData = [];

          let applicationCategory;

          for (let i = 0; i < domains.length; i++) {
            if (domains[i].jobDivisionCode === 'C') {
              applicationCategory = '신규';
            } else if (domains[i].jobDivisionCode === 'U') {
              applicationCategory = '변경';
            } else if (domains[i].jobDivisionCode === 'X') {
              applicationCategory = '폐기';
            } else if (domains[i].jobDivisionCode === 'D') {
              applicationCategory = '삭제';
            } else if (domains[i].jobDivisionCode === 'V') {
              applicationCategory = '복구';
            }

            newGridData.push({
              rowId: oldGridData.length + i,
              id: oldGridData.length + i,
              no: oldGridData.length + i + 1,
              instituteId: domains[i].instituteId,
              dictionaryId: domains[i].dictionaryId,
              domainId: domains[i].domainId,
              jobTermId: domains[i].jobTermId,
              applicationCategory: applicationCategory,
              domainTypeName: domains[i].domainTypeName,
              domainGroupName: domains[i].domainGroupName,
              domainClassName: domains[i].domainClassName,
              domainName: domains[i].domainName,
              domainErrorName: domains[i].domainErrorName,
              discardYn: domains[i].discardYn,
              jobDivisionCode: domains[i].jobDivisionCode,
              jobDivisionName: domains[i].jobDivisionName,
              updateDateTime: domains[i].updateDateTime,
              userId: domains[i].userId,
            });
          }
          // 재조회 후 rowData에 할당.
          domainJobRowData.value = [...oldGridData, ...newGridData];

          resultCount.value.count = Number(domainJobRowData.value.length);

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

      // 필터창 종료 시 호출 함수
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

          const domainQuery = {
            userId: userId,
            managementInstituteId: useMetaMngInstId,

            query: filterSet.searchQuery,
            sort: filterSortQuery,
          };

          const termJobFilterData = await getResearchDomainJob(domainQuery);

          console.log('termJobFilterData ===== ', termJobFilterData);

          if (termJobFilterData.status === 409) {
            domainJobQuery.query = filterSet.searchQuery;
            searchInput.value = filterSet.searchQuery;

            resultCount.value.total = 0;
            domainJobRowData.value = [];
            return;
          }
          const filterSearchData = jobDomainSearchResultBinding(
            termJobFilterData.data
          );
          domainJobQuery.query = filterSet.searchQuery;
          searchInput.value = filterSet.searchQuery;

          console.log('filterSearchData : ', filterSearchData);
          domainJobRowData.value = filterSearchData;
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());
          console.log('gridStorage.MFGRD250 : ', gridStorage.MFGRD250);
          columnDefs.value = gridStorage.MFGRD250;

          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD250);
        }
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
                colDef.field === 'domainName' ||
                colDef.field === 'domainGroupName' ||
                colDef.field === 'domainClassName' ||
                colDef.field === 'applicationCategory'
                  ? cellRenderer
                  : null,
              headerCheckboxSelection:
                colDef.field === 'checkbox' ? true : false,
              checkboxSelection: colDef.field === 'checkbox' ? true : false,
            };
          })
          .filter((colDef) => colDef != null);

        console.log('newColumnFcDefs : ', newColumnFcDefs);

        gridApi.value.setGridOption('columnDefs', newColumnFcDefs);

        columnDefs.value = newColumnFcDefs;

        // localStorage에 에서 gridData json 파싱, MFGRD017에 대한 값 변경
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage.MFGRD250 = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);
        // 스토어에 저장
        uiStore.setGridColumnDefs('MFGRD250', newColumnFcDefs);
      }

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
        const gridDefaultData = await getGridDefaultData(domainJobGridId.value);

        console.log('gridDefaultData : ', gridDefaultData);

        // 기본값 설정
        await setUserGridSetting(domainJobGridId.value, gridDefaultData);

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
        gridStorage[domainJobGridId.value] = transformedData;

        saveGridInfoToStorage(gridStorage);

        uiStore.setGridColumnDefs(domainJobGridId.value, columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        // await updateGridData(termQuery);

        domainJobQuery.query = '';
        searchInput.value = '';

        await fetchData();
      };

      // 도메인업로드 팝업 상태
      const domainUploadWindowView = ref(false);
      // 도메인업로드 팝업 오픈
      const onOpenDomainUploadWindow = () => {
        domainUploadWindowView.value = true;
      };
      const onCloseDomainUploadWindow = () => {
        domainUploadWindowView.value = false;
      };

      const onDomainGroupSearchSave = () => {
        fetchData();
        // domainUploadWindowView.value = false;
      };

      const onDomainClassSearchSave = () => {
        domainUploadWindowView.value = false;
      };

      const popInfo = ref({
        state: 'confirm',
        popTitle: '에러 제목',
        popMessages: '에러 메시지',
      });

      // 표준화 단어추출  팝업상태
      const extractDomainWindowView = ref(false);
      const onOpenExtractDomainWindow = () => {
        popInfo.value.state = 'confirm';
        popInfo.value.confirmBtnText = '도메인추출';
        popInfo.value.cancelBtnText = '취소';
        popInfo.value.popTitle = '표준화 도메인 추출 확인메시지';
        popInfo.value.popMessages =
          '표준화 대상 용어에서 표준화 도메인을 추출하는 단계입니다. 표준화 도메인을 다시 추출하시겠습니까?';
        extractDomainWindowView.value = true;
      };
      const onCloseExtractDomainWindow = () => {
        console.log('onCloseExtractWordWindow');
        extractDomainWindowView.value = false;
      };

      const onExtractDomain = async () => {
        console.log('표준화 단어 추출');

        const data = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          informationSystemId: useInfoSysId,
        };

        const response = await getExtractDomain(data);
        console.log('response : ', response);
        extractDomainWindowView.value = false;

        if (response.status === 200) {
          const domainQuery = {
            userId: userId,
            instituteId: useMetaMngInstId,
            dictionaryId: useDctnryId,
            jobTypeCode: 'CUR',
            query: domainJobQuery.query,
            sort: getSortQuery(),
          };
          await fetchData();
        } else {
          alert('표준화 단어 추출에 실패하였습니다.');
        }
      };

      // 작업저장 상태 감지
      watch(
        () => isDomainJobSave.value,
        (newVal) => {
          if (newVal) {
            console.log('isDomainJobSave watch : ', newVal);
            fetchData();
            setIsDomainJobSave(false);
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
        domainJobQuery.query = llmAnswer.where;

        await columnDefsUpdate(
          llmAnswer.sort,
          columnDefs,
          domainJobGridId.value,
          gridApi
        );

        domainJobQuery.sort = llmAnswer.sort;
        domainJobQuery.query = llmAnswer.where;

        await fetchData();
      };

      const onSetUserGridSetting = async () => {
        const gridStorage = JSON.parse(getGridInfoFromStorage());

        const fieldMapping = {
          no: 'NO',
          applicationCategory: 'JOB_DV_NM',
          domainTypeName: 'DMN_TYPE_NM',
          domainGroupName: 'DMN_GRP_NM',
          domainClassName: 'DMN_CLS_NM',
          domainName: 'DMN_NM',
          domainErrorName: 'DMN_ERR_NM',
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

        await setUserGridSetting(domainJobGridId.value, newGridStting);
      };

      const saveGridSettingView = reactive({
        view: false,
        message:
          '그리드 설정 정보를 <strong style="color:red">초기화</strong> 하시겠습니까?',
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
              query: domainJobQuery.query,
              sort: getSortQuery(),
            };

            console.log('params : ', params);

            const response = await getJobDomainDownload(params);
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
              link.download = `도메인_작업목록_전체_${new Date()
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
              !domainJobRowData.value ||
              domainJobRowData.value.length === 0
            ) {
              alert('조회된 데이터가 없습니다.');
              return;
            }
            // 🔥 rowData를 엑셀 다운로드 형식으로 변환
            const excelData = convertRowDataToExcelFormat(
              domainJobRowData.value
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
            작업구분명: row.jobDivisionName || '',
            도메인명: row.domainName || '',
            도메인분류명: row.domainClassName || '',
            도메인그룹명: row.domainGroupName || '',
            상태: row.domainErrorName || '',
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
          const worksheet = workbook.addWorksheet('도메인_작업목록');

          // 🔥 컬럼 정의 및 헤더 설정
          worksheet.columns = [
            { header: '작업구분명', key: '작업구분명', width: 15 },
            { header: '도메인명', key: '도메인명', width: 40 },
            { header: '도메인분류명', key: '도메인분류명', width: 25 },
            { header: '도메인그룹명', key: '도메인그룹명', width: 25 },
            { header: '상태', key: '상태', width: 20 },
            { header: '최종수정일시', key: '최종수정일시', width: 25 },
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
              // if (colNumber === 1) {
              //   cell.alignment = {
              //     horizontal: 'center',
              //     vertical: 'middle',
              //   };
              // } else {
              //   cell.alignment = {
              //     horizontal: 'left',
              //     vertical: 'middle',
              //   };
              // }

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
            to: `F${data.length + 1}`,
          };

          // 🔥 셀 고정 (헤더 행 고정)
          worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

          // 🔥 파일 다운로드
          const fileName = `도메인_작업목록_${downloadType}_${new Date()
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
          XLSX.utils.book_append_sheet(workbook, worksheet, '도메인_작업목록');

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

          const fileName = `도메인_작업목록_${downloadType}_${new Date()
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
          link.download = `도메인_작업목록_${downloadType}_${new Date()
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

      // 결재
      const approvalPopupView = ref(false);

      const selectDomainGridData = reactive({});

      const onApprovalPopup = () => {
        const selectedData = gridApi.value.getSelectedNodes();
        const selectDomainData = selectedData.map((item) => item.data);

        popInfo.value.state = 'redirect';
        popInfo.value.popTitle = '결재 요청 확인';
        popInfo.value.popMessages =
          '결재 요청이 완료되었습니다. 전자결재 페이지로 이동하여 결재항목을 확인하실 수 있습니다.';
        popInfo.value.cancelBtnText = '확인';
        popInfo.value.confirmBtnText = '전자결재 이동';

        const filterDomainData = selectDomainData.filter(
          (item) => item.domainErrorName !== '오류'
        );

        selectDomainGridData.value = filterDomainData;
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

        await fetchData();
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
        resultCount,
        cancelConfirmState,
        onCancelConfirm,
        onCancel,
        approvalConfirmState,
        onApprovalConfirm,
        onApproval,
        domainNameSearchWindowView,
        onOpenDomainNameSearchWindow,
        onCloseDomainNameSearchWindow,
        onDomainNameSearchSave,
        selectDomainData, // 선택 도메인 그룹 데이터
        columnDefs, // 도메인 작업 그리드 컬럼 정의
        domainJobRowData, // 도메인 작업 데이터
        useMetaMngInstId, // 기관 ID
        useDctnryId, // 사전 ID
        userId, // 사용자 ID
        onGridReady, // 그리드 API 전달
        onSelectionChanged, // 그리드 체크박스 선택 변경 이벤트
        handleSortChanged, // 그리드 정렬 변경 이벤트
        domainJobQuery, // 도메인 작업 조회 쿼리
        handleColumnStateChanged, // 그리드 컬럼 상태 변경 이벤트
        jobDomainSearchResultBinding, // 도메인 작업 조회 결과 데이터 생성
        getResearchDomainJob, // 도메인 작업 조회 API
        gridInfoDefs, // 그리드 정보 정의
        onFilterWindowClosed, // 필터창 종료 이벤트
        resetFilterState,
        onSearchRemove,
        onResetFilter,
        domainJobSelected,
        domainUploadWindowView, // 도메인업로드 팝업 상태
        onOpenDomainUploadWindow, // 도메인업로드 팝업 오픈
        onCloseDomainUploadWindow,
        onDomainGroupSearchSave,
        onDomainClassSearchSave,
        jobRemoveYn,
        setIsDomainJobType,
        setSelectDomainJobData,
        onOpenChatbotWindow,
        chatbotWindowView,
        onCloseChatbotWindow,
        handleBindQuery,
        domainJobGridId,
        onSetUserGridSetting,
        saveGridSettingView,
        onSaveGridSettingWindow,
        searchType,
        searchInput,
        handleChangeSearchType,
        gridApi,
        getSortQuery,
        handleScrollChanged,
        extractDomainWindowView,
        onOpenExtractDomainWindow,
        onCloseExtractDomainWindow,
        onExtractDomain,
        popInfo,
        tooltipList,
        getTooltipById,
        handleExcelDownload,
        approvalPopupView,
        onApprovalPopup,
        onCloseApprovalPopup,
        onApprovalRequestConfirm,
        onApprovalRequestError,
        confirmWindowView,
        onRedirectApproval,
        onCloseConfirmWindow,
        selectDomainGridData,
      };
    },
  };
</script>
