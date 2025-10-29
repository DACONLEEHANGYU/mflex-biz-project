<template>
  <div class="tab-inner">
    <!-- <ChatbotBtn @open-chatbot-window="onOpenChatbotWindow" /> -->
    <div class="grid-wrap">
      <div class="grid-top">
        <div class="top-row">
          <GridSearch
            :gridDefs="gridInfoDefs"
            :modelValue="termQuery.query"
            :resultCount="resultCount"
            :columnFcDefs="columnDefs"
            @save="onSaveGridSettingWindow"
            @enter="onSearchEnter"
            @remove="onDeleteGridSettingWindow"
            @search-type="handleChangeSearchType"
            @open-chatbot-window="onOpenChatbotWindow"
            @filter-window-closed="onFilterWindowClosed"
            @column-state-changed="handleColumnStateChanged"
            @excel-download="handleExcelDownload"
          />
        </div>
      </div>
      <div class="grid-list">
        <AppGrid
          :rowData="rowData"
          :columnDefs="columnDefs"
          :context="context"
          :resultCount="resultCount"
          rowSelection="single"
          @gridApi="handleSetGridApi"
          @rowClicked="onRowClicked"
          @body-scroll="handleScrollChanged"
          @sort-changed="handleSortChanged"
          @rowDoubleClicked="onRowDoubleClicked"
          @column-state-changed="handleColumnStateChanged"
          ref="agGrid"
        />
      </div>
      <!-- <div class="grid-bottom"></div> -->
      <AppDialog
        v-model:view="confirmDeleteDctnrySrchTab2State.view"
        :title="confirmDeleteDctnrySrchTab2State.title"
        :message="confirmDeleteDctnrySrchTab2State.message"
        @confirm="onSearchRemove"
      />
      <AppDialog
        v-model:view="saveGridSettingView.view"
        :title="saveGridSettingView.title"
        :message="saveGridSettingView.message"
        @confirm="onSetUserGridSetting"
      />
    </div>
  </div>

  <AppWindow
    :view="chatbotWindowView"
    :moveState="true"
    @close="onCloseChatbotWindow"
    width="500px"
    height="auto"
  >
    <ChatbotWindow
      :gridId="tab1GridId"
      @bind-query="handleBindQuery"
      @confirm="onConfirmChatbot"
      @close="onCloseChatbotWindow"
    />
  </AppWindow>
</template>

<script>
  // ============================
  // IMPORTS
  // ============================
  import {
    ref,
    watch,
    computed,
    reactive,
    watchEffect,
    onBeforeMount,
    onMounted,
    onActivated,
  } from 'vue';

  // Stores
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch.js';

  // Composables
  import { useGridIds } from '@/composables/useGridIds.js';
  import { storeToRefs } from 'pinia';

  // Utils - Storage
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';

  // Utils - API
  import { getTermViewSearch } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2.js';
  import { getTermViewDownload } from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api.js';
  import {
    setUserGridSetting,
    getGridDefaultData,
  } from '@/utils/mflexApi/common/commonApi';

  // Utils - Search & Transform
  import { columnDefsUpdate } from '@/utils/js/searchModule';

  // Composables - Term Search
  import {
    getSortQuery,
    addTermGridData,
    newGridSettingFuc,
    pushTermSearchData,
    transformTermGridData,
  } from '@/composables/dictionarySearch/useTermSearch.js';

  // Composables - Term Grid
  import {
    getGridInfo,
    handleSortChange,
    getMapColumnDefs,
    getResearchQuery,
    getNewColumnState,
    firstRowSelectedEvent,
    resetGridSelection,
  } from '@/composables/dictionarySearch/termSearch/useTermGrid.js';

  // Composables - Term Grid Search
  import {
    getLlmResearchQuery,
    getResearchResult,
    filterSeearchResult,
  } from '@/composables/dictionarySearch/termSearch/useTermGridSearch.js';

  // Components
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import ChatbotBtn from '@/components/common/ChatbotBtn.vue';
  import ChatbotWindow from '@/components/popWindow/ChatbotWindow.vue';

  export default {
    // ============================
    // COMPONENT DEFINITION
    // ============================
    components: {
      TypeCellRenderer,
      GridSearch,
      AppWindow,
      ChatbotBtn,
      ChatbotWindow,
    },

    emits: ['first-row-selected', 'row-selected', 'open-filter-window'],

    // ============================
    // DATA & CONTEXT
    // ============================
    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },

    beforeMount() {
      this.context = { componentParent: this };
      console.log('term beforeMount  ========================');
    },

    // ============================
    // METHODS (Options API)
    // ============================
    methods: {
      // Row Event Handlers
      onRowDoubleClicked(value) {
        this.selectedRow = value;
      },

      onRowClicked(value) {
        this.selectedRow = value;
        resetGridSelection(value);
        this.setTermViewSelectData(value);
      },

      // Search Handler
      async onSearchEnter(value) {
        console.log('onSearchEnter', value);
        if (this.searchType === 'natural-query' && value !== '') {
          // LLM 자연어 검색
          const llmAnswer = await getLlmResearchQuery(
            value,
            this.gridApi,
            this.termQuery,
            this.columnDefs,
            this.tab1GridId,
            this.searchInput
          );
          this.termQuery.query = llmAnswer;
          this.searchInput = value;
          await this.updateGridData(this.termQuery);
        } else {
          // 일반 쿼리 검색
          const result = await getResearchResult(
            value,
            this.useMetaMngInstId,
            this.useDctnryId,
            this.termDictionarySearchCode,
            this.columnDefs
          );
          if (result.success) {
            this.termQuery.query = result.transformedQuery;
            console.log('termQuery.query ========', this.termQuery.query);
            this.rowData.value = [];
            this.serarchDataBinding(result.termResearchResult);
          } else {
            console.error('검색 실패:', result.error);
          }
        }
      },
    },

    // ============================
    // COMPOSITION API SETUP
    // ============================
    setup(props, { emit }) {
      // ============================
      // STORES & AUTH
      // ============================
      const uiStore = useUiStore();
      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);
      const { useDctnryId, useMetaMngInstId } = userStngInfo.value;

      const { termDictionarySearchCode } = storeToRefs(
        useDictionarySearchStore()
      );
      const { setTermViewSelectData } = useDictionarySearchStore();

      // ============================
      // GRID CONFIGURATION
      // ============================
      const { getGridId } = useGridIds();
      const termSearchTopGridId = computed(() =>
        getGridId('dictionarySearch', 'termSearchTopGrid')
      );

      const tab1GridId = termSearchTopGridId;
      const gridInfoDefs = ref({
        scrnGridId: tab1GridId,
        scrnId: '',
      });

      // ============================
      // REACTIVE DATA
      // ============================
      const rowData = reactive({});
      const newSetColumnDefs = reactive([]);
      const columnDefs = ref([]);

      const agGrid = ref(null);
      const gridApi = ref(null);
      const currentRowIndex = ref(0);

      const searchType = ref('query');
      const searchInput = ref('');

      const resultCount = ref({
        count: '',
        total: '',
      });

      const termQuery = reactive({
        dictionaryId: useDctnryId,
        domainName: '',
        termName: '',
        termAbbreviationName: '',
        termDictionaryId: '',
        query: '',
        sort: '',
      });

      // ============================
      // POPUP STATES
      // ============================
      const chatbotWindowView = ref(false);

      const confirmDeleteDctnrySrchTab2State = reactive({
        view: false,
        message:
          '그리드 설정 정보를 <strong style="color:red">초기화</strong> 하시겠습니까?',
      });

      const saveGridSettingView = reactive({
        view: false,
        message: '그리드 설정 정보를 저장하시겠습니까?',
      });

      // ============================
      // GRID EVENT HANDLERS
      // ============================
      const handleSetGridApi = (params) => {
        gridApi.value = params;
      };

      const handleChangeSearchType = (searchTypeData) => {
        console.log('handleChangeSearchType : ', searchTypeData);
        searchType.value = searchTypeData;
      };

      const handleColumnStateChanged = (newColumnState) => {
        console.log('컬럼 이동 핸들러 동작 ====');
        const newColumnFcDefs = getNewColumnState(columnDefs, newColumnState);
        gridApi.value.setGridOption('columnDefs', newColumnFcDefs);
        columnDefs.value = newColumnFcDefs;

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage.MFGRD017 = newColumnFcDefs;
        saveGridInfoToStorage(gridStorage);
        uiStore.setGridColumnDefs('MFGRD017', newColumnFcDefs);
      };

      const handleSortChanged = async (newSortedState) => {
        try {
          const sortParams = {
            useMetaMngInstId,
            useDctnryId,
            termDictionarySearchCode: termDictionarySearchCode.value,
            termQuery,
            columnDefs: columnDefs.value,
          };

          const result = await handleSortChange(
            newSortedState,
            sortParams,
            resultCount
          );

          if (result.success) {
            rowData.value = result.data;
            firstRowSelectedEvent(rowData, agGrid);
            console.log('Sort applied successfully:', result.sortQuery);
          } else {
            console.error('Sort operation failed:', result.error);
          }
        } catch (error) {
          console.error('Error in handleSortChanged:', error);
        }
      };

      const handleScrollChanged = (endScrollStaus) => {
        try {
          if (endScrollStaus === 'Y' && rowData.value != null) {
            const termResearchQuery = getResearchQuery(
              useMetaMngInstId,
              useDctnryId,
              columnDefs.value,
              rowData,
              termQuery,
              termDictionarySearchCode
            );
            addGridRowData(termResearchQuery);
          }
        } catch (error) {
          console.error(error);
        }
      };

      // ============================
      // DATA PROCESSING FUNCTIONS
      // ============================
      const getTermRowData = (getTermSearchResult) => {
        try {
          console.log(
            'getTermRowData ===================',
            getTermSearchResult
          );
          const terms = getTermSearchResult.data.items;
          resultCount.value.count = Number(
            getTermSearchResult.data.searchCount
          );
          resultCount.value.total = Number(getTermSearchResult.data.totalCount);
          return pushTermSearchData(terms);
        } catch (error) {
          console.error(error);
        }
      };

      const updateGridData = async (termQuery) => {
        const termResearchQuery = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          dictionarySearchCode: termDictionarySearchCode.value,
          query: termQuery.query,
          sort: getSortQuery(columnDefs.value),
        };

        const getTermSearchResult = await getTermViewSearch(termResearchQuery);
        const initTermRowData = getTermRowData(getTermSearchResult);
        rowData.value = initTermRowData;
        firstRowSelectedEvent(rowData, agGrid);
      };

      const addGridRowData = async (termResearchQuery) => {
        try {
          let oldGridData = rowData.value;
          const lastRowIndex = oldGridData.length - 1;
          const lastRowNode =
            agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);
          console.log('마지막 node ===========', lastRowNode);

          const lastItem =
            rowData.value.length > 0
              ? rowData.value[rowData.value.length - 1]
              : null;

          termQuery.dictionaryId = useDctnryId;
          termQuery.domainName = lastItem.domainName[0].label;
          termQuery.termName = lastItem.termName[0].label;
          termQuery.termAbbreviationName = lastItem.termEngAbbreviationName;
          termQuery.termDictionaryId = lastItem.dctnryId;

          console.log('termResearchQuery ===', termResearchQuery);

          const reLoadTermData = await getTermViewSearch(termResearchQuery);
          const terms = reLoadTermData.data.items;
          const newGridData = addTermGridData(terms, oldGridData.length);

          rowData.value = [...oldGridData, ...newGridData];
          resultCount.value.count = Number(rowData.value.length);

          const lastVisibleRowIndex = lastRowNode ? lastRowNode.rowIndex : 0;
          currentRowIndex.value = lastVisibleRowIndex;
          agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
        } catch (error) {
          console.error(error);
        }
      };

      const serarchDataBinding = (termResearchResultData) => {
        console.log('serarchDataBinding 실행 ====');
        if (termResearchResultData.status != 200) {
          resultCount.value.count = 0;
          resultCount.value.total = 0;
          emit('row-selected', null);
          setTermViewSelectData(null);
        } else {
          resultCount.value.count = Number(
            termResearchResultData.data.searchCount
          );
          resultCount.value.total = Number(
            termResearchResultData.data.totalCount
          );
        }
        const terms = termResearchResultData.data.items;
        const termSearchGridData = pushTermSearchData(terms);
        rowData.value = termSearchGridData;
        firstRowSelectedEvent(rowData, agGrid);
      };

      // ============================
      // FILTER & SEARCH HANDLERS
      // ============================
      const onFilterWindowClosed = async (filterSet) => {
        if (filterSet) {
          const termFilterData = await filterSeearchResult(
            filterSet,
            columnDefs,
            useDctnryId,
            useMetaMngInstId,
            termDictionarySearchCode
          );

          if (termFilterData.status != 200) {
            resultCount.value.count = 0;
            resultCount.value.total = 0;
            rowData.value = [];
            setTermViewSelectData(null);
            return;
          }

          const filterSearchData = getTermRowData(termFilterData);
          termQuery.query = filterSet.searchQuery;
          console.log('filterSearchData : ', filterSearchData);
          rowData.value = filterSearchData;
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());
          console.log('gridStorage.MFGRD017 : ', gridStorage.MFGRD017);
          columnDefs.value = gridStorage.MFGRD017;
          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD017);
        }
      };

      // ============================
      // POPUP HANDLERS
      // ============================
      const onDeleteGridSettingWindow = () => {
        confirmDeleteDctnrySrchTab2State.view = true;
      };

      const onSearchRemove = async () => {
        const gridDefaultData = await getGridDefaultData(tab1GridId.value);
        const transformGrid = await transformTermGridData(gridDefaultData);
        console.log('초기 데이터 gridDefaultData : ', gridDefaultData);

        await setUserGridSetting(tab1GridId.value, gridDefaultData);
        columnDefs.value = transformGrid;

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage[tab1GridId.value] = transformGrid;
        saveGridInfoToStorage(gridStorage);

        uiStore.setGridColumnDefs('MFGRD017', columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        termQuery.query = '';
        await updateGridData(termQuery);
      };

      const onSaveGridSettingWindow = () => {
        saveGridSettingView.view = true;
      };

      const onSetUserGridSetting = async () => {
        const newGridSetting = newGridSettingFuc(columnDefs);
        await setUserGridSetting(tab1GridId.value, newGridSetting);
        updateGridData(termQuery);
      };

      // ============================
      // CHATBOT HANDLERS
      // ============================
      const onOpenChatbotWindow = () => {
        chatbotWindowView.value = true;
      };

      const onCloseChatbotWindow = () => {
        chatbotWindowView.value = false;
      };

      const handleBindQuery = async (llmAnswer) => {
        termQuery.query = llmAnswer.where;
        await columnDefsUpdate(
          llmAnswer.sort,
          columnDefs,
          tab1GridId.value,
          gridApi
        );
        await updateGridData(termQuery);
        chatbotWindowView.value = false;
      };

      const handleExcelDownload = async (state) => {
        console.log('state : ', state);

        try {
          if (state === 'all') {
            // 🔥 전체 다운로드 - API 응답을 엑셀 파일로 다운로드
            const params = {
              instituteId: useMetaMngInstId,
              dictionaryId: useDctnryId,
              dictionarySearchCode: termDictionarySearchCode.value,
              query: termQuery.query,
              sort: getSortQuery(columnDefs.value),
            };

            console.log('params : ', params);

            const response = await getTermViewDownload(params);
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
              link.download = `용어목록_전체_${new Date()
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
            console.log('rowData.value : ', rowData.value);

            if (!rowData.value || rowData.value.length === 0) {
              alert('조회된 데이터가 없습니다.');
              return;
            }

            // 🔥 rowData를 엑셀 다운로드 형식으로 변환
            const excelData = convertRowDataToExcelFormat(rowData.value);

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
            사전명: row.dictionaryName || '',
            사전유형: row.termName[0].type || '',
            용어명: extractCellValue(row.termName),
            용어영문약어명: row.termEngAbbreviationName || '',
            표준구분: row.termStandardYnName || '',
            용어유형: row.termType || '',
            도메인명: extractCellValue(row.domainName),
            // 용어설명: row.termExplain || '',
            코드유형: row.codeTypeName || '',
            코드명: row.relationCodeName || '',
            폐기여부: row.discardYn === true ? 'Y' : 'N',
            제개정일자: row.revisionDate || '',
            최종수정자: row.lastChangeInfo || '',
            최종수정일시: row.lastChangeDate || '',
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

      // 🔥 날짜 포맷팅 함수
      const formatDate = (dateValue) => {
        if (!dateValue) return '';

        try {
          const date = new Date(dateValue);
          return date.toISOString().slice(0, 10); // YYYY-MM-DD 형식
        } catch (error) {
          return String(dateValue);
        }
      };

      // 🔥 ExcelJS를 사용한 스타일 적용 가능한 엑셀 다운로드 함수
      const downloadExcelFromData = async (data, downloadType) => {
        try {
          // 🔥 ExcelJS 라이브러리 import
          const ExcelJS = await import('exceljs');

          // 워크북과 워크시트 생성
          const workbook = new ExcelJS.Workbook();
          const worksheet = workbook.addWorksheet('용어목록');

          // 🔥 컬럼 정의 및 헤더 설정
          worksheet.columns = [
            { header: '사전명', key: '사전명', width: 25 },
            { header: '사전유형', key: '사전유형', width: 15 },
            { header: '용어명', key: '용어명', width: 25 },
            { header: '용어영문약어명', key: '용어영문약어명', width: 40 },
            { header: '표준구분', key: '표준구분', width: 15 },
            { header: '용어유형', key: '용어유형', width: 15 },
            { header: '도메인명', key: '도메인명', width: 20 },
            { header: '코드유형', key: '코드유형', width: 15 },
            { header: '코드명', key: '코드명', width: 25 },
            { header: '폐기여부', key: '폐기여부', width: 15 },
            { header: '제개정일자', key: '제개정일자', width: 15 },
            { header: '최종수정자', key: '최종수정자', width: 20 },
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
            to: `L${data.length + 1}`,
          };

          // 🔥 셀 고정 (헤더 행 고정)
          worksheet.views = [{ state: 'frozen', xSplit: 0, ySplit: 1 }];

          // 🔥 파일 다운로드
          const fileName = `용어목록_${downloadType}_${new Date()
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
          XLSX.utils.book_append_sheet(workbook, worksheet, '용어목록');

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

          const fileName = `용어목록_${downloadType}_${new Date()
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
          link.download = `용어목록_${downloadType}_${new Date()
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

      // ============================
      // LIFECYCLE HOOKS
      // ============================
      onBeforeMount(async () => {
        console.log('termSearch beforeMount  ========================');
        const gridStorage = JSON.parse(getGridInfoFromStorage());

        if (!gridStorage[tab1GridId.value]) {
          console.log(
            'gridStorage[tab1GridId.value] : ',
            gridStorage[tab1GridId.value]
          );
          try {
            const transformedData = await getGridInfo();
            columnDefs.value = transformedData;
            uiStore.setGridColumnDefs('MFGRD017', columnDefs.value);
            gridStorage.MFGRD017 = transformedData;
            saveGridInfoToStorage(gridStorage);
            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', columnDefs.value);
            }
            // await updateGridData(termQuery);
            await updateGridData(termQuery);
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          columnDefs.value = gridStorage[tab1GridId.value];
          console.log('columnDefs.value : ', columnDefs.value);
          // await updateGridData(termQuery);
          await updateGridData(termQuery);
        }
      });

      // ============================
      // WATCHERS
      // ============================
      watchEffect(() => {
        const uiStore = useUiStore();
        const { gridColumnDefs } = storeToRefs(uiStore);
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD017) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD017;
        getMapColumnDefs(columnDefs);
      });

      watch(termDictionarySearchCode, async (newVal) => {
        console.log('termDictionarySearchCode : ', newVal);
        // await updateGridData(termQuery);
        await updateGridData(termQuery);
      });

      onMounted(() => {
        console.log('termSearch mounted  ========================');
      });

      onActivated(async () => {
        console.log('termSearch activated  ========================');
        agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
        // await updateGridData(termQuery);
      });

      // ============================
      // RETURN
      // ============================
      return {
        // Grid References
        agGrid,
        gridApi,
        tab1GridId,

        // Data
        rowData,
        columnDefs,
        newSetColumnDefs,
        resultCount,
        termQuery,

        // Configuration
        gridInfoDefs,
        searchType,
        searchInput,

        // Store References
        useDctnryId,
        useMetaMngInstId,
        termDictionarySearchCode,

        // Event Handlers
        handleSetGridApi,
        handleScrollChanged,
        handleColumnStateChanged,
        handleSortChanged,
        handleChangeSearchType,

        // Data Functions
        updateGridData,
        serarchDataBinding,

        // Filter Functions
        onFilterWindowClosed,

        // Popup States & Handlers
        confirmDeleteDctnrySrchTab2State,
        onDeleteGridSettingWindow,
        onSearchRemove,
        saveGridSettingView,
        onSaveGridSettingWindow,
        onSetUserGridSetting,
        handleExcelDownload,

        // Chatbot
        chatbotWindowView,
        onOpenChatbotWindow,
        onCloseChatbotWindow,
        handleBindQuery,

        // Utilities
        columnDefsUpdate,
        setTermViewSelectData,
      };
    },
  };
</script>
