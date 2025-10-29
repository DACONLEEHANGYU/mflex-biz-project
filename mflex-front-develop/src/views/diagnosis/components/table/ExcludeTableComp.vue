<template>
  <div class="tab-inner">
    <div class="content-top pt5">
      <div
        class="title-s"
        style="
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
        "
      >
        <div style="display: flex">
          진단제외테이블
          <AppTooltip
            :htmlContent="getTooltipById('diagnosisExcludeTable')"
          ></AppTooltip>
        </div>
        <div>
          <div>
            <button
              class="btn-s"
              style="background-color: #30b678; color: white"
              @click="onOpenDiagnosisExcludeWindow"
              :disabled="selectExcludeTables.length === 0"
            >
              진단제외 사유등록 <i class="inscription-icon"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-wrap" style="height: 94%">
      <div class="grid-top">
        <div class="top-row">
          <GridSearch
            ref="gridSearchComponent"
            :resultCount="resultCount"
            :modelValue="searchInput"
            :columnFcDefs="columnDefs"
            :gridDefs="gridInfoDefs"
            @save="onSaveGridSettingWindow"
            @search-type="handleChangeSearchType"
            @open-chatbot-window="onOpenChatbotWindow"
            @enter="onSearchEnter"
            @remove="onDeleteDctnrySrchWrdGridUserStng"
            @filter-window-closed="onFilterWindowClosed"
            @column-state-changed="handleColumnStateChanged"
          />
        </div>
      </div>
      <div class="grid-list">
        <AppGrid
          :rowData="rowData"
          :columnDefs="columnDefs"
          :context="context"
          :resultCount="resultCount"
          rowSelection="multiple"
          @rowDoubleClicked="onRowDoubleClicked"
          @selectionChanged="onSelectionChanged"
          @rowClicked="onRowClicked"
          @body-scroll="handleScrollChanged"
          @sort-changed="handleSortChanged"
          @column-state-changed="handleColumnStateChanged"
          @gridApi="handleSetGridApi"
          :rowSelectDisabled="true"
          ref="excludeAgGrid"
        />
      </div>
      <!-- <div class="grid-bottom"></div> -->
      <AppDialog
        v-model:view="deleteGridSetState.view"
        :title="deleteGridSetState.title"
        :message="deleteGridSetState.message"
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

  <!-- 진단제외사유 등록 -->
  <AppWindow
    v-model:view="diagnosisExcludeState"
    @close="onCloseDiagnosisExcludeWindow"
    width="500px"
    height="auto"
  >
    <DiagnosisExcludeWindow
      :codeSearchInfo="codeSearchInfo"
      :selectData="selectExcludeTables"
      @confirm="onConfirmDiagnosisExclude"
      @close="onCloseDiagnosisExcludeWindow"
    />
  </AppWindow>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import {
    reactive,
    ref,
    nextTick,
    watch,
    watchEffect,
    onBeforeMount,
    onActivated,
  } from 'vue';

  import { useUiStore } from '@/stores/ui';

  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import { useDiagnosisStore } from '@/stores/diagnosis.js';
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';

  import { getTableExclude } from '@/utils/mflexApi/diagnosis/diagnosisApi.js';
  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import { columnDefsUpdate } from '@/utils/js/searchModule';
  import { useSpinnerStore } from '@/stores/spinner.js';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch.js';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import ChatbotBtn from '@/components/common/ChatbotBtn.vue';
  import ChatbotWindow from '@/components/popWindow/ChatbotWindow.vue';

  import {
    getUserGridSetting, // 사용자별 Grid 세팅 조회
    setUserGridSetting, // 사용자별 Grid 세팅 설정
    getGridDefaultData, // 그리드 기본값 조회
  } from '@/utils/mflexApi/common/commonApi'; // 공통 API 모듈
  import DiagnosisExcludeWindow from '@/components/popWindow/DiagnosisExcludeWindow.vue';

  export default {
    components: {
      TypeCellRenderer,
      GridSearch,
      AppWindow,
      AppTooltip,
      ChatbotBtn,
      ChatbotWindow,
      DiagnosisExcludeWindow,
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
        const selectedRow = document.querySelectorAll(
          '[class~="ag-row-selected"]'
        );
        // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        const clickedNode = document.querySelector(`[row-id="${clickNode}"]`);
        clickedNode.classList.add('ag-row-selected');
        this.$emit('row-selected', value);
        this.setTermViewSelectData(value);
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

        if (this.searchType === 'natural-query' && value !== '') {
          const searhInfo = {
            gridId: this.tab1GridId,
            query: value,
          };
          const llmAnswer = await getCreateQuery(searhInfo);

          // 컬럼 업데이트
          await this.columnDefsUpdate(
            llmAnswer.data.sort,
            this.columnDefs,
            this.tab1GridId,
            this.gridApi
          );

          // 쿼리 바인딩
          this.searchInput = value;

          await this.updateGridData();
        } else {
          const transformedQuery = transformQuery(value);

          const researchQuery = {
            instituteId: this.useMetaMngInstId,
            databaseId: this.selectDataBaseInfo,
            query: transformedQuery,
            sort: this.getSortQuery(),
          };

          this.rowData.value = [];
          const tableResearchResult = await getTableExclude(researchQuery);
          console.log('tableResearchResult : ', tableResearchResult);

          this.rowData.value = this.getTableRowData(tableResearchResult);
        }
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
      console.log('term beforeMount  ========================');
    },
    emits: ['first-row-selected', 'row-selected', 'open-filter-window'],
    setup(props, { emit }) {
      const uiStore = useUiStore();
      const { gridColumnDefs } = storeToRefs(uiStore);
      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);
      const rowData = reactive({});
      const newSetColumnDefs = reactive([]);
      const { useDctnryId, useMetaMngInstId } = userStngInfo.value;

      const { setSpinnerStatus } = useSpinnerStore();

      const gridApi = ref(null);

      // 사전조회 사전표시 범위 상태
      const { termDictionarySearchCode } = storeToRefs(
        useDictionarySearchStore()
      );
      const { setTermViewSelectData } = useDictionarySearchStore();

      const {
        setSelectExcludeTable,
        setTableIncludeStatus,
        setTableExcludeStatus,
      } = useDiagnosisStore();
      const { selectDataBaseInfo, tableExcludeStatus, tableIncludeStatus } =
        storeToRefs(useDiagnosisStore());

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      // AG 그리드가 생성될 때 gridApi 에 params 를 할당
      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      const searchType = ref('query');
      const searchInput = ref('');

      const handleChangeSearchType = (searchTypeData) => {
        console.log('handleChangeSearchType : ', searchTypeData);
        searchType.value = searchTypeData;
      };

      const tab1GridId = ref('MFGRD310');
      const gridInfoDefs = ref({
        scrnGridId: tab1GridId,
        scrnId: '',
      });

      //정렬 쿼리
      const sortStateQuery = ref('');

      const columnDefs = ref([]);

      // 데이터 변환 함수
      const transformGridData = (data) => {
        console.log('transformGridData-data : ', data);

        const fieldMapping = {
          NO: 'no',
          SCHM_NM: 'schemaName',
          TBL_NM: 'tableName',
          TBL_KORN_NM: 'tableKoreanName',
          DGNS_EXCL_RSN_CN: 'excludeReasonContent',
        };

        // Create a checkbox column as the first item
        const checkboxColumn = {
          field: 'checkbox',
          headerName: '',
          headerCheckboxSelection: true,
          checkboxSelection: true,
          width: 30,
          minWidth: 30,
          maxWidth: 30,
          sortable: false,
          suppressSorting: true,
        };

        // Map the rest of the columns normally
        const columnDefs = data.map((item) => {
          const fieldName =
            fieldMapping[item.gridArticleName] ||
            item.gridArticleName.toLowerCase();

          console.log('transformGridData-fieldName : ', fieldName);

          return {
            cellClass:
              fieldName === 'no'
                ? 'grid-cell-centered'
                : 'ag-left-aligned-cell',
            field: fieldName,
            headerName: item.gridArticleKoreanName,
            hide: !item.articleDisplayYn,
            minWidth: item.articleColumnWidth,
            pinned: item.articleFixedCode || '',
            sort: item.articleDataSortCode,
            sortIndex: item.articleDataSortOrder,
            sortable: item.articleDataSortYn,
            suppressSorting: !item.articleDataSortYn,
            valueFormatter: (params) => true,
            width: item.articleColumnWidth,
          };
        });

        // Return array with checkbox column as the first item
        return [checkboxColumn, ...columnDefs];
      };

      const getGridInfo = async () => {
        try {
          const userGridData = await getUserGridSetting(tab1GridId.value);
          const transformedData = await transformGridData(userGridData);
          console.log('Transformed Grid Data:', transformedData);
          return transformedData; // transformedData를 반환
        } catch (error) {
          console.error('Error in getGridInfo:', error);
          throw error;
        }
      };

      onBeforeMount(async () => {
        console.log('termSearch beforeMount  ========================');

        // 재 렌더링 시 그리드 정보가 있는 경우 메모리의 그리드 정보 사용
        const gridStorage = JSON.parse(getGridInfoFromStorage());

        if (!gridStorage[tab1GridId.value]) {
          console.log(
            'gridStorage[tab1GridId.value] : ',
            gridStorage[tab1GridId.value]
          );

          try {
            // transformedData를 직접 받아서 처리
            const transformedData = await getGridInfo();

            // columnDefs 설정
            columnDefs.value = transformedData;

            // columnDefs가 설정된 후에 실행
            uiStore.setGridColumnDefs('MFGRD310', columnDefs.value);
            // localStorage에 gridData json 파싱, MFGRD310에 대한 값 변경
            gridStorage.MFGRD310 = transformedData;
            saveGridInfoToStorage(gridStorage);

            // gridApi 설정이 유효한지 확인
            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', columnDefs.value);
            }

            console.log(
              '그리드데이터 할당 =============== : ',
              columnDefs.value
            );

            // await updateGridData();
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          columnDefs.value = gridStorage[tab1GridId.value];
          console.log('columnDefs.value : ', columnDefs.value);
          // await updateGridData();
        }
      });

      const resultCount = ref({
        count: '',
        total: '',
      });

      // 데이터 조회 결과값 바인딩 함수
      const getTableRowData = (tableResultData) => {
        const tableGridData = [];

        try {
          // console.log('termRowData ===================', researchQuery);

          const tables = tableResultData.items;
          resultCount.value.count = Number(tableResultData.searchCount);
          resultCount.value.total = Number(tableResultData.totalCount);

          for (let t = 0; t < tables.length; t++) {
            tableGridData.push({
              id: t,
              no: t + 1,
              instituteId: tables[t].instituteId,
              databaseId: tables[t].databaseId,
              schemaName: tables[t].schemaName,
              tableName: tables[t].tableName,
              tableKoreanName: tables[t].tableKoreanName,
            });
          }

          return tableGridData;

          // 조회 결과
        } catch (error) {
          console.error(error);
        }
      };

      const currentRowIndex = ref(0);

      const updateGridData = async (termQuery) => {
        console.log('updateGridData  실행');

        console.log('updateGridData - columnDefs.value : ', columnDefs.value);

        // 정렬이 적용된 모든 열을 찾습니다.
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

        console.log('sortQuery : ', sortQuery);

        const researchQuery = {
          instituteId: useMetaMngInstId,
          databaseId: selectDataBaseInfo.value,
          query: '',
          sort: sortQuery,
        };

        console.log('updateGridData 실행여부 확인 ======================');

        const tempData = [];

        console.log('excludeList-researchQuery : ', researchQuery);

        if (researchQuery.databaseId === '') {
          return;
        }

        const excludeList = await getTableExclude(researchQuery);

        resultCount.value.count = Number(excludeList.searchCount);
        resultCount.value.total = Number(excludeList.totalCount);

        const list = excludeList.items;

        for (let i = 0; i < list.length; i++) {
          tempData.push({
            id: i,
            no: i + 1,
            instituteId: list[i].instituteId,
            databaseId: list[i].databaseId,
            schemaName: list[i].schemaName,
            tableName: list[i].tableName,
            tableKoreanName: list[i].tableKoreanName,
            excludeReasonCode: list[i].excludeReasonCode,
            excludeReasonContent: list[i].excludeReasonContent,
          });
        }
        rowData.value = tempData;

        if (rowData.value.length > 0) {
          nextTick(() => {
            // const firstRowData = excludeAgGrid.value.gridApi.getDisplayedRowAtIndex(0);
            // 첫 행 select 효과
            // const nodesWithRowId0 = document.querySelector('[row-id="0"]');
            // // .ag-row-selected 클래스를 추가합니다.
            // nodesWithRowId0.classList.add('ag-row-selected');
            // nodesWithRowId0.classList.add('ag-row-focus');
            // nodesWithRowId0.setAttribute('aria-selected', true);
          });
        } else {
          // setTermViewSelectData(null);
        }
      };

      // 그리드 스크롤 이벤트 함수
      const handleScrollChanged = (endScrollStaus) => {
        try {
          if (endScrollStaus === 'Y' && rowData.value != null) {
            const lastItem =
              rowData.value.length > 0
                ? rowData.value[rowData.value.length - 1]
                : null;
            console.log('lastItem ===', lastItem);

            const sortedColumns = columnDefs.value
              .filter(
                (col) =>
                  col.sortIndex !== null &&
                  col.sort !== null &&
                  col.headerName !== ''
              )
              .sort((a, b) => a.sortIndex - b.sortIndex)
              .map(
                (col) =>
                  `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`
              );

            const sortQuery = sortedColumns.join(', ');

            const researchQuery = {
              instituteId: useMetaMngInstId,
              databaseId: selectDataBaseInfo.value,
              lastItem: {
                instituteId: lastItem.instituteId,
                databaseId: lastItem.databaseId,
                schemaName: lastItem.schemaName,
                tableName: lastItem.tableName,
                tableKoreanName: lastItem.tableKoreanName,
                excludeReasonContent: lastItem.excludeReasonContent,
              },
              sort: sortQuery,
            };

            addGridRowData(researchQuery);
          }
        } catch (error) {
          console.error(error);
        }
      };

      // 용어 그리드 데이터 추가 함수
      const addGridRowData = async (researchQuery) => {
        try {
          // 추가 조회 전 데이터 저장
          let oldGridData = rowData.value;

          // 인덱스로 핀별하므로 길이에서 -1
          const lastRowIndex = oldGridData.length - 1;
          const lastRowNode =
            excludeAgGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);
          console.log('마지막 node ===========', lastRowNode);

          const reLoadTermData = await getTableExclude(researchQuery);

          const tables = reLoadTermData.items;

          const newGridData = [];

          for (let n = 0; n < tables.length; n++) {
            let revisionInfo = '';
            if (
              tables[n].revisionCycle === null ||
              tables[n].revisionCycle === ''
            ) {
              revisionInfo = `${tables[n].revisionDate}`;
            } else {
              revisionInfo = `${tables[n].revisionDate}(${tables[n].revisionCycle})`;
            }

            newGridData.push({
              id: oldGridData.length + n,
              no: oldGridData.length + n + 1,
              instituteId: tables[n].instituteId,
              databaseId: tables[n].databaseId,
              schemaName: tables[n].schemaName,
              tableName: tables[n].tableName,
              tableKoreanName: tables[n].tableKoreanName,
              excludeReasonCode: tables[n].excludeReasonCode,
              excludeReasonContent: tables[n].excludeReasonContent,
            });
          }
          // 재조회 후 rowData에 할당.
          rowData.value = [...oldGridData, ...newGridData];

          resultCount.value.count = Number(rowData.value.length);

          const lastVisibleRowIndex = lastRowNode ? lastRowNode.rowIndex : 0;
          console.log(
            'lastVisibleRowIndex =================',
            lastVisibleRowIndex
          );
          currentRowIndex.value = lastVisibleRowIndex;
          // 새로운 데이터 로드 후 마지막으로 보고 있던 행으로 스크롤
          excludeAgGrid.value.gridApi.ensureIndexVisible(
            currentRowIndex.value,
            'top'
          );
        } catch (error) {
          console.error(error);
        }
      };

      const excludeAgGrid = ref(null);

      // keep-alive로 살아있을때,
      onActivated(() => {
        console.log('term search onActivated ========================');
      });

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
        console.log('rowData.value:', rowData.value);

        // sort의 결과가 초기화 상태일 때,
        if (sortState.value.length == 0) {
          const researchQuery = {
            instituteId: useMetaMngInstId,
            databaseId: selectDataBaseInfo.value,
            query: '',
            sort: getSortQuery(),
          };

          const termSortData = await getTableExclude(researchQuery);

          // 정렬 조회결과 바인딩 및 rowData 할당
          const sortTermGridData = getTableRowData(termSortData);
          rowData.value = sortTermGridData;
        } else {
          // 정렬 순서 배열 생성
          const sortParts = sortState.value.map(
            (column) => `${column.headerName} ${column.sort}`
          );

          // 배열의 원소를 문자열로 병합
          sortQuery.value = sortParts.join(', ');
          sortStateQuery.value = sortQuery.value;

          const researchQuery = {
            instituteId: useMetaMngInstId,
            databaseId: selectDataBaseInfo.value,
            query: searchInput.value,
            sort: sortQuery.value,
          };

          const termSortData = await getTableExclude(researchQuery);
          const sortTermGridData = getTableRowData(termSortData);

          rowData.value = sortTermGridData;
        }
        firstRowSelectedEvent();
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
            };
          })
          .filter((colDef) => colDef != null);

        //columnFcDefs.value = newColumnFcDefs; */

        console.log('newColumnFcDefs : ', newColumnFcDefs);

        gridApi.value.setGridOption('columnDefs', newColumnFcDefs);

        columnDefs.value = newColumnFcDefs;

        // localStorage에 에서 gridData json 파싱, MFGRD310에 대한 값 변경
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage.MFGRD310 = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);
        // 스토어에 저장
        uiStore.setGridColumnDefs('MFGRD310', newColumnFcDefs);
      }

      //valueFormatter 함수 설정
      watchEffect(() => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD310) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD310;

        columnDefs.value = columnDefs.value.map((col) => {
          let valueFormatter = null;
          let cellRenderer = null;
          // 필드 값에 따라 조건부로 valueFormatter 설정
          if (col.field === 'checkbox') {
            col.field = 'checkbox';
            col.headerCheckboxSelection = true;
          }

          return {
            headerName: col.headerName,
            field: col.field,
            hide: col.hide,
            pinned: col.pinned,
            sortable: col.sortable,
            cellClass: col.cellClass,
            width: col.width,
            sort: col.sort,
            sortIndex: col.sortIndex,
            minWidth: col.minWidth,
            headerCheckboxSelection: col.headerCheckboxSelection,
            checkboxSelection: col.checkboxSelection,
            suppressSorting: true,
            comparator: () => 0,
            valueFormatter: valueFormatter,
            cellRenderer: cellRenderer,
          };
        });

        console.log('watchEffect 정상동작');
      });

      // 용어 조회 ( 필터 리서치 )
      const serarchDataBinding = (termResearchResultData) => {
        console.log(
          'serarchDataBinding - termResearchResultData : ',
          termResearchResultData
        );
        // API 호출 결과에 따른 조회결과 수정
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

        const termSearchGridData = [];
        const terms = termResearchResultData.data.items;

        for (let t = 0; t < terms.length; t++) {
          termSearchGridData.push({
            no: t + 1,
            id: t,
            instituteId: terms[t].instituteId,
            dictionaryId: terms[t].dictionaryId,
            termName: [
              {
                id: 0,
                type: terms[t].dictionaryTypeName,
                label: terms[t].termName,
                color: terms[t].dictionaryTypeForegroundColorName,
                bgColor: terms[t].dictionaryTypeBackgroundColorName,
                size: 60,
              },
            ],
            termEngAbbreviationName: terms[t].termAbbreviationName,
            termType: terms[t].termTypeName,
            domainName: terms[t].domainName,
            codeTypeName: terms[t].codeTypeName,
            relationCodeName: terms[t].relationCodeName,
            logicalDataTypeName: terms[t].logicalDataTypeName,
            revisionInfo: terms[t].revisionInfo,
            lastChangeInfo: terms[t].updater,
            lastChangeDate: terms[t].updateDateTime,
          });
        }

        rowData.value = termSearchGridData;

        if (rowData.value.length > 0) {
          nextTick(() => {
            const firstRowData =
              excludeAgGrid.value.gridApi.getDisplayedRowAtIndex(0);
            console.log('firstRowData =============', firstRowData);

            // 첫 행 select 효과
            const nodesWithRowId0 = document.querySelector('[row-id="0"]');
            console.log('nodeWithRowId0 ========', nodesWithRowId0);

            // .ag-row-selected 클래스를 추가합니다.
            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);
            if (firstRowData) {
              console.log('emit first-row-selected 실행 ====');
              //emit('first-row-selected', firstRowData);
              emit('row-selected', firstRowData);
              setTermViewSelectData(firstRowData.data);
            }
          });
        }
      };

      // 상단 row
      const firstRowSelectedEvent = () => {
        if (rowData.value.length > 0) {
          nextTick(() => {
            const firstRowData =
              excludeAgGrid.value.gridApi.getDisplayedRowAtIndex(0);
            console.log('firstRowData =============', firstRowData);

            // 첫 행 select 효과
            const nodesWithRowId0 = document.querySelector('[row-id="0"]');
            console.log('nodeWithRowId0 ========', nodesWithRowId0);

            // .ag-row-selected 클래스를 추가합니다.
            if (nodesWithRowId0) {
              nodesWithRowId0.classList.add('ag-row-selected');
              nodesWithRowId0.classList.add('ag-row-focus');
              nodesWithRowId0.setAttribute('aria-selected', true);
            }

            if (firstRowData) {
              console.log('emit first-row-selected 실행 ====');
              //emit('first-row-selected', firstRowData);
              emit('row-selected', firstRowData);
              setTermViewSelectData(firstRowData.data);
            }
          });
        }
      };

      // 팝업 필터 저장 핸들러
      const onFilterWindowClosed = async (filterSet) => {
        // 필터 창이 닫힐 때 수행하고 싶은 로직
        console.log('필터 창이 닫혔습니다.');
        console.log('filterSet : ', filterSet);

        // 맞춤형 필터 설정이 있을 때
        if (filterSet) {
          // 정렬이 적용된 모든 열을 찾습니다.
          const sortedColumns = columnDefs.value
            .filter(
              (col) =>
                col.sortIndex !== null &&
                col.sort !== null &&
                col.headerName === ''
            )
            .sort((a, b) => a.sortIndex - b.sortIndex)
            .map(
              (col) =>
                `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`
            );

          console.log('sortedColumns : ', sortedColumns);
          const sortQuery = sortedColumns.join(', ');
          console.log('sortQuery : ', sortQuery);

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
          console.log('filterSet.orderQuery : ', filterSet.orderQuery);
          const researchQuery = {
            instituteId: useMetaMngInstId,
            databaseId: selectDataBaseInfo.value,
            query: filterSet.searchQuery,
            sort: filterSortQuery,
          };

          const tableFilterData = await getTableExclude(researchQuery);
          console.log('termFilterData =================== : ', tableFilterData);

          if (tableFilterData.items.length === 0) {
            resultCount.value.count = 0;
            resultCount.value.total = 0;
            rowData.value = [];
            return;
          }

          const filterSearchData = getTableRowData(tableFilterData);
          searchInput.value = filterSet.searchQuery;

          rowData.value = filterSearchData;
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());
          console.log('gridStorage.MFGRD310 : ', gridStorage.MFGRD310);
          columnDefs.value = gridStorage.MFGRD310;

          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD310);
        }
      };

      // 필터 초기화 confirm 팝업
      const deleteGridSetState = reactive({
        view: false,
        message:
          '그리드 설정 정보를 <strong style="color:red">초기화</strong> 하시겠습니까?',
      });

      const onDeleteDctnrySrchWrdGridUserStng = () => {
        deleteGridSetState.view = true;
      };

      // 필터 및 정렬 삭제
      const onSearchRemove = async () => {
        console.log('onSearchRemove');
        console.log('정렬 초기화');

        const gridDefaultData = await getGridDefaultData(tab1GridId.value);

        const transformGrid = await transformGridData(gridDefaultData);

        console.log('초기 데이터 gridDefaultData : ', gridDefaultData);

        // 그리드 기본값 사용자 세팅
        await setUserGridSetting(tab1GridId.value, gridDefaultData);

        columnDefs.value = transformGrid;

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage[tab1GridId.value] = transformGrid;
        saveGridInfoToStorage(gridStorage);

        uiStore.setGridColumnDefs('MFGRD310', columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        // 필터 초기화 시 검색 쿼리 초기화 추가 24/06/14

        await updateGridData();
      };

      const getSortQuery = () => {
        // 정렬이 적용된 모든 열을 찾습니다.
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

        // 쿼리 바인딩하여 조회
        console.log('llmAnswer : ', llmAnswer);

        await columnDefsUpdate(
          llmAnswer.sort,
          columnDefs,
          tab1GridId.value,
          gridApi
        );

        await updateGridData();
      };

      const onSetUserGridSetting = async () => {
        console.log('columnDefs.value : ', columnDefs.value);

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log(
          'gridStorage[tab1GridId.value] : ',
          gridStorage[tab1GridId.value]
        );

        const fieldMapping = {
          no: 'NO',
          schemaName: 'SCHM_NM',
          tableName: 'TBL_NM',
          tableKoreanName: 'TBL_KORN_NM',
          excludeReasonCode: 'EXCL_RSN_CD',
          excludeReasonContent: 'DGNS_EXCL_RSN_CN',
        };
        const newGridStting = columnDefs.value
          .filter((item) => fieldMapping[item.field] !== undefined) // undefined인 항목 필터링
          .map((item, index) => {
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
          });

        console.log('newGridStting : ', newGridStting);

        await setUserGridSetting(tab1GridId.value, newGridStting);
        updateGridData();
      };

      const saveGridSettingView = reactive({
        view: false,
        message: '그리드 설정 정보를 저장하시겠습니까?',
      });

      const onSaveGridSettingWindow = () => {
        saveGridSettingView.view = true;
      };

      const codeSearchInfo = ref({
        instituteId: useMetaMngInstId,
        databaseId: selectDataBaseInfo.value,
      });
      const selectExcludeTables = ref([]);

      const onSelectionChanged = (selectRow) => {
        const selectedRows = gridApi.value.getSelectedRows();
        console.log('selectedRows : ', selectedRows);

        selectExcludeTables.value = selectedRows;

        console.log('selectExcludeTables : ', selectExcludeTables.value);

        setSelectExcludeTable(selectedRows);
      };

      const diagnosisExcludeState = ref(false);

      const onCloseDiagnosisExcludeWindow = () => {
        console.log('onCloseDiagnosisExcludeWindow 실행');
        diagnosisExcludeState.value = false;
      };
      const onOpenDiagnosisExcludeWindow = () => {
        console.log('onOpenDiagnosisExcludeWindow 실행');
        diagnosisExcludeState.value = true;
      };

      const onConfirmDiagnosisExclude = async () => {
        console.log('onConfirmDiagnosisExcludeWindow 실행');
        diagnosisExcludeState.value = false;
        await updateGridData();
      };

      watch(tableIncludeStatus, async (value) => {
        console.log('tableExcludeStatus : ', value);

        // 재조회
        await updateGridData();
        setTableIncludeStatus(false);
      });

      // 제외 시
      watch(tableExcludeStatus, async (value) => {
        console.log('tableExcludeStatus : ', value);

        // 재조회
        await updateGridData();
        setTableExcludeStatus(false);
      });

      watch(
        selectDataBaseInfo,
        async (newVal) => {
          console.log('selectDataBaseInfo : ', newVal);
          if (newVal) {
            await updateGridData();
          }
        },
        { immediate: true }
      );

      onActivated(() => {
        nextTick(() => {
          excludeAgGrid.value.gridApi.ensureIndexVisible(
            currentRowIndex.value,
            'top'
          );
        });
      });

      return {
        excludeAgGrid,
        rowData,
        resultCount,
        useDctnryId,
        useMetaMngInstId,
        handleScrollChanged,
        handleColumnStateChanged,
        handleSortChanged, // 정렬 이벤트 핸들러
        serarchDataBinding,
        onFilterWindowClosed,
        gridInfoDefs, // 그리드 Info
        newSetColumnDefs,
        handleSetGridApi,
        onSearchRemove, // 필터 및 정렬 삭제
        deleteGridSetState,
        onDeleteDctnrySrchWrdGridUserStng,
        updateGridData,
        getSortQuery,
        tab1GridId,
        handleBindQuery,
        chatbotWindowView,
        onOpenChatbotWindow,
        onCloseChatbotWindow,
        onSetUserGridSetting,
        columnDefs,
        saveGridSettingView,
        onSaveGridSettingWindow,

        // searhType 변경
        handleChangeSearchType,
        searchType,
        columnDefsUpdate,
        gridApi,
        searchInput,
        setTermViewSelectData,
        onSelectionChanged,
        selectDataBaseInfo,
        diagnosisExcludeState,
        onCloseDiagnosisExcludeWindow,
        onOpenDiagnosisExcludeWindow,
        onConfirmDiagnosisExclude,
        selectExcludeTables,
        getTableRowData,
        codeSearchInfo,
        getTooltipById,
      };
    },
  };
</script>

<style scoped>
  .content-top .title-s {
    font-size: 15px;
    font-weight: 600;
    height: 29px;
    display: flex;
    align-items: center;
  }
</style>
