<template>
  <div class="tab-inner">
    <div class="content-top pt5">
      <div class="title-s" style="display: flex; margin-bottom: 10px">
        진단대상테이블
        <AppTooltip :htmlContent="getTooltipById('diagnosisTargetTable')">
        </AppTooltip>
      </div>
    </div>

    <div style="display: flex; margin-bottom: 10px">
      <div class="input-form" style="flex: 1">
        <table class="input-table">
          <colgroup>
            <col width="15%" />
            <col width="" />
          </colgroup>
          <tbody>
            <tr>
              <th>DB</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <div>
                    <select
                      class="input-select"
                      style="width: 100%"
                      v-model="selectedDatabase"
                    >
                      <option
                        v-for="option in databaseOptions"
                        :key="option.databaseId"
                        :value="option.databaseId"
                      >
                        {{ option.logicalDatabaseName }}
                      </option>
                    </select>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="padding-top: 3px; margin-left: 10px">
        <button
          class="btn-s"
          style="background-color: #30b678; color: white"
          @click="onOpenConfirmWindow"
        >
          진단대상 테이블 수집 <i class="database-icon"></i>
        </button>
      </div>
    </div>

    <!-- <ChatbotBtn @open-chatbot-window="onOpenChatbotWindow" /> -->
    <div class="grid-wrap" style="height: 88.5%">
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
          ref="agGrid"
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

  <!-- 진단대상 테이블 수집 -->
  <AppWindow
    :view="confirmWindowView"
    @close="onCloseConfirmWindow"
    width="650px"
    height="auto"
  >
    <ConfirmWindow
      :popInfo="popInfo"
      @confirm="onCollectTable"
      @close="onCloseConfirmWindow"
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
    computed,
  } from 'vue';

  import { useUiStore } from '@/stores/ui';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';

  import { getSearchDbName } from '@/utils/mflexApi/dataMng/schemaCollectionApi.js';
  import { getDbListBySystem } from '@/utils/mflexApi/systemMng/systemManagementApi.js';

  import {
    getTableInclude,
    postSchemaCopy,
  } from '@/utils/mflexApi/diagnosis/diagnosisApi.js';
  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import { columnDefsUpdate } from '@/utils/js/searchModule';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';

  import { useDiagnosisStore } from '@/stores/diagnosis.js';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';

  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';

  import AppWindow from '@/components/ui/AppWindow.vue';
  import ChatbotBtn from '@/components/common/ChatbotBtn.vue';
  import ChatbotWindow from '@/components/popWindow/ChatbotWindow.vue';

  import {
    getUserGridSetting, // 사용자별 Grid 세팅 조회
    setUserGridSetting, // 사용자별 Grid 세팅 설정
    getGridDefaultData, // 그리드 기본값 조회
  } from '@/utils/mflexApi/common/commonApi'; // 공통 API 모듈

  export default {
    components: {
      TypeCellRenderer,
      GridSearch,
      AppWindow,
      AppTooltip,
      ChatbotBtn,
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
            databaseId: this.selectedDatabase,
            query: transformedQuery,
            sort: this.getSortQuery(),
          };

          this.searchInput = transformedQuery;

          this.rowData.value = [];
          const researchResult = await getTableInclude(researchQuery);
          this.rowData.value = this.getTableRowData(researchResult);
        }
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    emits: ['first-row-selected', 'row-selected', 'open-filter-window'],
    setup(props, { emit }) {
      const uiStore = useUiStore();
      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);
      const rowData = reactive({});
      const newSetColumnDefs = reactive([]);
      const { useDctnryId, useMetaMngInstId, useInfoSysId } =
        userStngInfo.value;

      const {
        setSelectTargetTable,
        setTableExcludeStatus,
        setSelectDataBaseInfo,
        setTableIncludeStatus,
      } = useDiagnosisStore();
      const { tableExcludeStatus, tableIncludeStatus } = storeToRefs(
        useDiagnosisStore()
      );

      // setup 함수 내부에 추가
      const databaseList = ref([]);

      // 데이터베이스 옵션을 위한 computed 속성 - 기본 옵션 제거
      const databaseOptions = computed(() => {
        return databaseList.value.map((db) => ({
          databaseId: db.databaseId,
          logicalDatabaseName: db.logicalDatabaseName,
        }));
      });

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      const gridApi = ref(null);

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

      const tab1GridId = ref('MFGRD300');
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
              fieldName === 'no' || fieldName === 'checkbox'
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
        // 데이터베이스 목록 조회

        const data = {
          instituteId: useMetaMngInstId,
          informationSystemId: useInfoSysId,
        };

        const dbList = await getDbListBySystem(data);

        databaseList.value = dbList;

        // 데이터가 있으면 첫 번째 항목을 기본 선택
        if (databaseList.value && databaseList.value.length > 0) {
          selectedDatabase.value = databaseList.value[0].databaseId;
          setSelectDataBaseInfo(databaseList.value[0].databaseId);
        }

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
            uiStore.setGridColumnDefs('MFGRD300', columnDefs.value);
            // localStorage에 gridData json 파싱, MFGRD300에 대한 값 변경
            gridStorage.MFGRD300 = transformedData;
            saveGridInfoToStorage(gridStorage);

            // gridApi 설정이 유효한지 확인
            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', columnDefs.value);
            }

            console.log(
              '그리드데이터 할당 =============== : ',
              columnDefs.value
            );

            // 모든 설정이 완료된 후 용어 조회 실행
            await updateGridData();
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          columnDefs.value = gridStorage[tab1GridId.value];
          console.log('columnDefs.value : ', columnDefs.value);
          // 모든 설정이 완료된 후 용어 조회 실행
          await updateGridData();
        }
      });

      const resultCount = ref({
        count: '',
        total: '',
      });

      // 데이터 조회 결과값 바인딩 함수
      const getTableRowData = (tableData) => {
        const tableGridData = [];

        console.log('tableData : ', tableData);

        try {
          const tables = tableData.items;
          resultCount.value.count = Number(tableData.searchCount);
          resultCount.value.total = Number(tableData.totalCount);

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
          console.log('termGridData ===================', tableGridData);

          return tableGridData;
        } catch (error) {
          console.error(error);
        }
      };

      const selectedDatabase = ref('');

      const currentRowIndex = ref(0);

      const updateGridData = async () => {
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

        console.log('selectedDatabase : ', selectedDatabase);

        const tableResearchQuery = {
          instituteId: useMetaMngInstId,
          databaseId: selectedDatabase.value,
          query: '',
          sort: sortQuery,
        };

        let tempData = [];

        console.log('updateGridData 실행여부 확인 ======================');
        const tableList = await getTableInclude(tableResearchQuery);
        console.log('tableList : ', tableList);

        // 건수
        resultCount.value.count = tableList.searchCount;
        resultCount.value.total = tableList.totalCount;

        const tableData = tableList.items;

        for (let i = 0; i < tableData.length; i++) {
          tempData.push({
            id: i,
            no: i + 1,
            instituteId: tableData[i].instituteId,
            databaseId: tableData[i].databaseId,
            schemaName: tableData[i].schemaName,
            tableName: tableData[i].tableName,
            tableKoreanName: tableData[i].tableKoreanName,
          });
        }

        rowData.value = tempData;

        if (rowData.value.length > 0) {
          nextTick(() => {
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);

            // 첫 행 select 효과
            const nodesWithRowId0 = document.querySelector('[row-id="0"]');

            // .ag-row-selected 클래스를 추가합니다.
            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);
            if (firstRowData) {
              emit('row-selected', firstRowData);
            }
          });
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
              .filter((col) => col.sortIndex !== null && col.sort !== null)
              .sort((a, b) => a.sortIndex - b.sortIndex)
              .map(
                (col) =>
                  `${col.headerName} ${col.sort === 'desc' ? 'desc' : 'asc'}`
              );

            const sortQuery = sortedColumns.join(', ');

            const tableQuery = {
              instituteId: useMetaMngInstId,
              databaseId: selectedDatabase.value,
              lastItem: {
                instituteId: lastItem.instituteId,
                databaseId: selectedDatabase.value,
                schemaName: lastItem.schemaName,
                tableName: lastItem.tableName,
                tableKoreanName: lastItem.tableKoreanName,
              },
              query: searchInput.value,
              sort: sortQuery,
            };

            addGridRowData(tableQuery);
          }
        } catch (error) {
          console.error(error);
        }
      };

      // 용어 그리드 데이터 추가 함수
      const addGridRowData = async (tableQuery) => {
        try {
          // 추가 조회 전 데이터 저장
          let oldGridData = rowData.value;

          // 인덱스로 핀별하므로 길이에서 -1
          const lastRowIndex = oldGridData.length - 1;
          const lastRowNode =
            agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);
          console.log('마지막 node ===========', lastRowNode);

          const reloadData = await getTableInclude(tableQuery);

          const table = reloadData.items;

          const newGridData = [];

          for (let n = 0; n < table.length; n++) {
            newGridData.push({
              id: oldGridData.length + n,
              no: oldGridData.length + n + 1,
              instituteId: table[n].instituteId,
              databaseId: table[n].databaseId,
              schemaName: table[n].schemaName,
              tableName: table[n].tableName,
              tableKoreanName: table[n].tableKoreanName,
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
          agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
        } catch (error) {
          console.error(error);
        }
      };

      const agGrid = ref(null);

      // keep-alive로 살아있을때,
      onActivated(() => {});

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

        const lastItem =
          rowData.value.length > 0
            ? rowData.value[rowData.value.length - 1]
            : null;
        console.log('lastItem ===', lastItem);

        console.log('sortState :', sortState);

        // sort의 결과가 초기화 상태일 때,
        if (sortState.value.length == 0) {
          const researchQuery = {
            instituteId: useMetaMngInstId,
            databaseId: selectedDatabase.value,
            query: searchInput.value,
            sort: getSortQuery(),
          };

          const tableSortData = await getTableInclude(researchQuery);

          // 정렬 조회결과 바인딩 및 rowData 할당
          const sortTableGridData = getTableRowData(tableSortData);
          rowData.value = sortTableGridData;
        } else {
          // 단일 정렬 조건 및 순서 설정 (기존 코드)
          /* sortQuery.value = `${sortState.value[0].headerName} ${sortState.value[0].sort}`;
        sortStateQuery.value = sortQuery.value; */

          // 정렬 순서 배열 생성
          const sortParts = sortState.value.map(
            (column) => `${column.headerName} ${column.sort}`
          );

          // 배열의 원소를 문자열로 병합
          sortQuery.value = sortParts.join(', ');
          sortStateQuery.value = sortQuery.value;

          const researchQuery = {
            instituteId: useMetaMngInstId,
            databaseId: selectedDatabase.value,
            query: searchInput.value,
            sort: sortQuery.value,
          };

          const tableSortData = await getTableInclude(researchQuery);
          const sortTableGridData = getTableRowData(tableSortData);

          rowData.value = sortTableGridData;
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

            // valueFormatter 및 cellRenderer 초기화
            let valueFormatter = null;
            let cellRenderer = null;

            console.log('colDef.field : ', colDef.field);

            // 필드 값에 따라 조건부로 valueFormatter 및 cellRenderer 설정

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
            };
          })
          .filter((colDef) => colDef != null);

        console.log('newColumnFcDefs : ', newColumnFcDefs);

        gridApi.value.setGridOption('columnDefs', newColumnFcDefs);

        columnDefs.value = newColumnFcDefs;

        // localStorage에 에서 gridData json 파싱, MFGRD300에 대한 값 변경
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage.MFGRD300 = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);
        // 스토어에 저장
        uiStore.setGridColumnDefs('MFGRD300', newColumnFcDefs);
      }

      //valueFormatter 함수 설정
      watchEffect(() => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD300) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD300;

        columnDefs.value = columnDefs.value.map((col) => {
          let valueFormatter = null;
          let cellRenderer = null;

          // 수집여부 필드인 경우 특별 처리
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

      // 상단 row
      const firstRowSelectedEvent = () => {
        if (rowData.value.length > 0) {
          nextTick(() => {
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
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
                col.headerName !== ''
            ) // headerName이 빈 문자열인 항목 제외
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
            databaseId: selectedDatabase.value,
            query: filterSet.searchQuery,
            sort: filterSortQuery,
          };

          const tableFilterData = await getTableInclude(researchQuery);

          console.log('tableFilterData : ', tableFilterData);

          if (tableFilterData.items.length === 0) {
            resultCount.value.count = 0;
            resultCount.value.total = 0;
            rowData.value = [];
            return;
          }
          const filterSearchData = getTableRowData(tableFilterData);

          searchInput.value = filterSet.searchQuery;

          console.log('filterSearchData : ', filterSearchData);
          rowData.value = filterSearchData;
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());
          console.log('gridStorage.MFGRD300 : ', gridStorage.MFGRD300);
          columnDefs.value = gridStorage.MFGRD300;

          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD300);
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

        uiStore.setGridColumnDefs('MFGRD300', columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        // 필터 초기화 시 검색 쿼리 초기화 추가 24/06/14
        searchInput.value = '';

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
        searchInput.value = llmAnswer.query;

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
          schemaName: 'SCHEMA_NM',
          tableName: 'TBL_NM',
          tableKoreanName: 'TBL_KR_NM',
        };

        // articleName이 undefined인 항목 제외하기
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

      const popInfo = ref({
        state: 'confirm',
        popTitle: '진단대상 테이블 수집 확인',
        popMessages: `DB스키마에서<span style="font-weight : 900;"> 진단대상테이블</span>을 수집하는 단계입니다.
    <div style="margin-top: 10px;"><span style="font-weight : 900;">진단대상 테이블</span>을 다시 수집 하시겠습니까?</div>`,
        confirmBtnText: '진단대상테이블 수집',
        cancelBtnText: '닫기',
      });

      const confirmWindowView = ref(false);

      const onOpenConfirmWindow = () => {
        confirmWindowView.value = true;
      };

      const onCloseConfirmWindow = () => {
        console.log('onCloseConfirmWindow');
        confirmWindowView.value = false;
      };

      const onCollectTable = async () => {
        console.log('onCollectTable 실행');

        const data = {
          instituteId: useMetaMngInstId,
          databaseId: selectedDatabase.value,
        };

        await postSchemaCopy(data);

        await updateGridData();

        confirmWindowView.value = false;
      };

      const onSelectionChanged = (selectRow) => {
        const selectedRows = gridApi.value.getSelectedRows();
        console.log('selectedRows : ', selectedRows);

        setSelectTargetTable(selectedRows);
      };

      // 제외 시
      watch(tableExcludeStatus, async (value) => {
        console.log('tableExcludeStatus : ', value);

        // 재조회
        await updateGridData();
        setTableExcludeStatus(false);
      });

      // 포함 시
      watch(tableIncludeStatus, async (value) => {
        console.log('tableExcludeStatus : ', value);

        // 재조회
        await updateGridData();
        setTableIncludeStatus(false);
      });

      // 데이터베이스 변경 시
      watch(selectedDatabase, async (value) => {
        console.log('change - selectedDatabase : ', value);

        setSelectDataBaseInfo(value);

        // 재조회
        await updateGridData();
      });

      onActivated(() => {
        nextTick(() => {
          agGrid.value.gridApi.ensureIndexVisible(currentRowIndex.value, 'top');
        });
      });

      return {
        agGrid,
        rowData,
        resultCount,
        useDctnryId,
        useMetaMngInstId,
        handleScrollChanged,
        handleColumnStateChanged,
        handleSortChanged, // 정렬 이벤트 핸들러
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

        ///// 표준진단 추가
        databaseOptions,
        selectedDatabase,
        confirmWindowView,
        popInfo,
        onOpenConfirmWindow,
        onCloseConfirmWindow,
        getTableRowData,
        onCollectTable,
        onSelectionChanged,
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
