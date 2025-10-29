<template>
  <div class="tab-inner">
    <div class="content-top pt5">
      <div class="title-s" style="display: flex; margin-bottom: 10px">
        표준진단이력
        <AppTooltip :htmlContent="getTooltipById('diagnosisHistory')">
        </AppTooltip>
      </div>
    </div>

    <div style="display: flex">
      <div class="input-form" style="flex: 1">
        <table class="input-table" style="margin-bottom: 20px">
          <colgroup>
            <col width="20%" />
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
              <th>스키마</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <div>
                    <select
                      class="input-select"
                      style="width: 100%"
                      v-model="selectedSchema"
                    >
                      <option
                        v-for="option in schemaOptions"
                        :key="option.schemaId"
                        :value="option.schemaName"
                      >
                        {{ option.schemaName }}
                      </option>
                    </select>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- <ChatbotBtn @open-chatbot-window="onOpenChatbotWindow" /> -->
    <div class="grid-wrap" style="height: 85%">
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
            :rowSelectDisabled="true"
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
          @rowDoubleClicked="onRowDoubleClicked"
          @rowClicked="onRowClicked"
          @body-scroll="handleScrollChanged"
          @sort-changed="handleSortChanged"
          @column-state-changed="handleColumnStateChanged"
          @gridApi="handleSetGridApi"
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
  // import { getResaerchTerm } from '@/utils/mflexApi/dictionarySearchApi';
  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import { columnDefsUpdate } from '@/utils/js/searchModule';
  import { useSpinnerStore } from '@/stores/spinner.js';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch.js';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { getDiagnosisHistory } from '@/utils/mflexApi/diagnosis/diagnosisApi.js';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import ChatbotBtn from '@/components/common/ChatbotBtn.vue';
  import ChatbotWindow from '@/components/popWindow/ChatbotWindow.vue';

  import { useDiagnosisStore } from '@/stores/diagnosis.js';

  import {
    getSearchDbName,
    getSchemaListByDatabase,
  } from '@/utils/mflexApi/dataMng/schemaCollectionApi';

  import {
    getDbListBySystem,
    getSchemaListBySystem,
  } from '@/utils/mflexApi/systemMng/systemManagementApi.js';

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
          this.termQuery.query = llmAnswer.data.where;
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

          await this.updateGridData();
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
      const { useDctnryId, useMetaMngInstId, useInfoSysId } =
        userStngInfo.value;

      const { setSpinnerStatus } = useSpinnerStore();

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      const gridApi = ref(null);

      // 사전조회 사전표시 범위 상태
      const { termDictionarySearchCode } = storeToRefs(
        useDictionarySearchStore()
      );
      const { setTermViewSelectData } = useDictionarySearchStore();

      const {
        setSelectDiagnosisHistory,
        setSelectHistoryDatabaseId,
        setSelectHistorySchemaName,
      } = useDiagnosisStore();

      // AG 그리드가 생성될 때 gridApi 에 params 를 할당
      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      const searchType = ref('query');
      const searchInput = ref('');

      const selectedDatabase = ref('');
      // setup 함수 내부에 추가
      const databaseList = ref([]);
      // 데이터베이스 옵션을 위한 computed 속성 - 기본 옵션 제거
      const databaseOptions = computed(() => {
        return databaseList.value.map((db) => ({
          databaseId: db.databaseId,
          logicalDatabaseName: db.logicalDatabaseName,
        }));
      });

      const selectedSchema = ref('');
      const schemaList = ref([]);
      const schemaOptions = computed(() => {
        // 문자열 배열을 객체 배열로 변환
        return schemaList.value.map((schemaName, index) => ({
          schemaId: index === 0 ? 'all' : `schema_${index}`, // 첫 번째 항목("전체")은 "all", 나머지는 인덱스 기반 ID
          schemaName: schemaName,
        }));
      });

      const handleChangeSearchType = (searchTypeData) => {
        console.log('handleChangeSearchType : ', searchTypeData);
        searchType.value = searchTypeData;
      };

      const tab1GridId = ref('MFGRD330');
      const gridInfoDefs = ref({
        scrnGridId: tab1GridId,
        scrnId: '',
      });

      const columnDefs = ref([]);

      // 데이터 변환 함수
      const transformGridData = (data) => {
        console.log('transformGridData-data : ', data);

        const fieldMapping = {
          NO: 'no',
          DGNS_DTM: 'diagnosisDateTime',
          DGNS_ARTCL_NM: 'diagnosisMetricName',
          DGNS_ERR_CNT: 'diagnosisErrorCount',
          DGNS_COL_CNT: 'diagnosisColumnCount',
          DGNS_ERR_RT: 'diagnosisErrorRate',
          DGNS_CCRNC_RT: 'diagnosisConcordanceRate',
        };

        // Map the rest of the columns normally
        const columnDefs = data.map((item) => {
          const fieldName =
            fieldMapping[item.gridArticleName] ||
            item.gridArticleName.toLowerCase();

          console.log('transformGridData-fieldName : ', fieldName);

          return {
            cellClass:
              fieldName === 'no' ||
              fieldName === 'diagnosisDateTime' ||
              fieldName === 'diagnosisColumnCount' ||
              fieldName === 'diagnosisErrorCount' ||
              fieldName === 'diagnosisErrorRate' ||
              fieldName === 'diagnosisConcordanceRate'
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

        return [...columnDefs];
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

        const dbData = {
          instituteId: useMetaMngInstId,
          informationSystemId: useInfoSysId,
        };

        // 데이터베이스 목록 조회
        const dbList = await getDbListBySystem(dbData);

        console.log('dbList : ', dbList);

        databaseList.value = dbList;

        // 데이터가 있으면 첫 번째 항목을 기본 선택
        if (databaseList.value && databaseList.value.length > 0) {
          selectedDatabase.value = databaseList.value[0].databaseId;
          setSelectHistoryDatabaseId(databaseList.value[0].databaseId);
        }

        const data = {
          instituteId: useMetaMngInstId,
          informationSystemId: useInfoSysId,
          databaseId: selectedDatabase.value,
        };

        const schemaListData = await getSchemaListBySystem(data);

        console.log('schemaListData : ', schemaListData);

        const schmaNames = schemaListData.map((schema) => schema.schemaName);

        schemaList.value = schmaNames;

        if (schemaList.value && schemaList.value.length > 0) {
          selectedSchema.value = schemaList.value[0];
          setSelectHistorySchemaName(schemaList.value[0]);
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
            uiStore.setGridColumnDefs('MFGRD330', columnDefs.value);
            // localStorage에 gridData json 파싱, MFGRD330에 대한 값 변경
            gridStorage.MFGRD330 = transformedData;
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
      const bindHistoryData = (historyData) => {
        const tempData = [];

        console.log('historyData : ', historyData);

        try {
          const items = historyData.items;
          resultCount.value.count = Number(historyData.searchCount);
          resultCount.value.total = Number(historyData.totalCount);

          for (let t = 0; t < items.length; t++) {
            tempData.push({
              id: t,
              no: t + 1,
              instituteId: items[t].instituteId,
              databaseId: items[t].databaseId,
              diagnosisDateTime: items[t].diagnosisDateTime,
              diagnosisMetricName: items[t].diagnosisMetricName,
              diagnosisMetricCode: items[t].diagnosisMetricCode,
              diagnosisColumnCount: items[t].diagnosisColumnCount,
              diagnosisErrorCount: items[t].diagnosisErrorCount,
              diagnosisErrorRate: items[t].diagnosisErrorRate,
              diagnosisConcordanceCount: items[t].diagnosisConcordanceCount,
              diagnosisConcordanceRate: items[t].diagnosisConcordanceRate,
            });
          }

          return tempData; // 변환된 데이터 반환

          // 조회 결과
        } catch (error) {
          console.error(error);
        }
      };

      const currentRowIndex = ref(0);

      const updateGridData = async () => {
        console.log('updateGridData  실행');

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
          databaseId: selectedDatabase.value,
          schemaName: selectedSchema.value,
          query: searchInput.value,
          sort: sortQuery,
        };

        const diagnosisHistory = await getDiagnosisHistory(researchQuery);
        const historys = await bindHistoryData(diagnosisHistory);
        console.log('historys : ', historys);

        rowData.value = historys;

        if (rowData.value.length > 0) {
          nextTick(() => {
            console.log(
              'termmSearch - agGrid.value.gridApi =========',
              agGrid.value.gridApi
            );
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
            // 첫 행 select 효과
            const nodesWithRowId0 = document.querySelector('[row-id="0"]');
            // .ag-row-selected 클래스를 추가합니다.
            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);
            if (firstRowData) {
              emit('row-selected', firstRowData);
              setSelectDiagnosisHistory(firstRowData.data);
            }
          });
        } else {
          setSelectDiagnosisHistory(null);
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

            const researchQuery = {
              instituteId: useMetaMngInstId,
              databaseId: selectedDatabase.value,
              schemaName: selectedSchema.value,
              lastItem: {
                databaseId: lastItem.databaseId,
                diagnosisDateTime: lastItem.diagnosisDateTime,
                diagnosisMetricCode: lastItem.diagnosisMetricCode,
                diagnosisMetricName: lastItem.diagnosisMetricName,
                diagnosisColumnCount: lastItem.diagnosisColumnCount,
                diagnosisErrorCount: lastItem.diagnosisErrorCount,
                diagnosisErrorRate: lastItem.diagnosisErrorRate,
                diagnosisConcordanceCount: lastItem.diagnosisConcordanceCount,
                diagnosisConcordanceRate: lastItem.diagnosisConcordanceRate,
              },
              query: searchInput.value,
              sort: sortQuery,
            };

            addGridRowData(researchQuery);
          }
        } catch (error) {
          console.error(error);
        }
      };

      // 그리드 데이터 추가 함수
      const addGridRowData = async (researchQuery) => {
        try {
          // 추가 조회 전 데이터 저장
          let oldGridData = rowData.value;

          // 인덱스로 핀별하므로 길이에서 -1
          const lastRowIndex = oldGridData.length - 1;
          const lastRowNode =
            agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);

          const reloadData = await getDiagnosisHistory(researchQuery);

          const items = reloadData.items;

          const newGridData = [];

          for (let n = 0; n < items.length; n++) {
            newGridData.push({
              id: oldGridData.length + n,
              no: oldGridData.length + n + 1,
              instituteId: items[n].instituteId,
              databaseId: items[n].databaseId,
              diagnosisDateTime: items[n].diagnosisDateTime,
              diagnosisMetricName: items[n].diagnosisMetricName,
              diagnosisMetricCode: items[n].diagnosisMetricCode,
              diagnosisColumnCount: items[n].diagnosisColumnCount,
              diagnosisErrorCount: items[n].diagnosisErrorCount,
              diagnosisErrorRate: items[n].diagnosisErrorRate,
              diagnosisConcordanceCount: items[n].diagnosisConcordanceCount,
              diagnosisConcordanceRate: items[n].diagnosisConcordanceRate,
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
      onActivated(() => {
        console.log('term search onActivated ========================');
      });

      // 정렬 핸들러
      const handleSortChanged = async (newSortedState) => {
        console.log('newSortedState : ', newSortedState);

        // 컬럼 정의 업데이트 (명시적)
        columnDefs.value = columnDefs.value.map((col) => {
          const sortState = newSortedState.find(
            (state) => state.colId === col.field
          );
          if (sortState) {
            return {
              ...col,
              sort: sortState.sort,
              sortIndex: sortState.sortIndex,
            };
          }
          return {
            ...col,
            sort: null,
            sortIndex: null,
          };
        });

        // 이후 getSortQuery 호출
        const sortQuery = getSortQuery();
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

        // sort의 결과가 초기화 상태일 때,
        if (sortState.value.length == 0) {
          await updateGridData();
        } else {
          await updateGridData();
        }
        firstRowSelectedEvent();
      };

      //그리드 칼럼 이동 및 사이즈 변경 등 이벤트 발생시 그리드 설정 값 업데이트
      function handleColumnStateChanged(newColumnState) {
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

        // localStorage에 에서 gridData json 파싱, MFGRD330에 대한 값 변경
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage.MFGRD330 = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);
        // 스토어에 저장
        uiStore.setGridColumnDefs('MFGRD330', newColumnFcDefs);
      }

      //valueFormatter 함수 설정
      watchEffect(() => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD330) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD330;

        columnDefs.value = columnDefs.value.map((col) => {
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
            suppressSorting: true,
            comparator: () => 0,
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
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
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
            .filter((col) => col.sortIndex !== null && col.sort !== null)
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

          const researchQuery = {
            instituteId: useMetaMngInstId,
            databaseId: selectedDatabase.value,
            schemaName: selectedSchema.value,
            query: filterSet.searchQuery,
            sort: filterSortQuery,
          };

          const filterData = await getDiagnosisHistory(researchQuery);
          if (filterData.items.length === 0) {
            resultCount.value.count = 0;
            resultCount.value.total = 0;
            rowData.value = [];
            return;
          }
          const filterSearchData = bindHistoryData(filterData);
          searchInput.value = filterSet.searchQuery;
          rowData.value = filterSearchData;
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());
          console.log('gridStorage.MFGRD330 : ', gridStorage.MFGRD330);
          columnDefs.value = gridStorage.MFGRD330;
          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD330);
        }
      };

      // 필터 초기화 confirm 팝업
      const confirmDeleteDctnrySrchTab2State = reactive({
        view: false,
        message:
          '그리드 설정 정보를 <strong style="color:red">초기화</strong> 하시겠습니까?',
      });

      const onDeleteDctnrySrchWrdGridUserStng = () => {
        confirmDeleteDctnrySrchTab2State.view = true;
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

        uiStore.setGridColumnDefs('MFGRD330', columnDefs.value);
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
        searchInput.value = llmAnswer.where;

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
          diagnosisDateTime: 'DGNS_DTM',
          diagnosisMetricName: 'DGNS_ARTCL_NM',
          diagnosisErrorCount: 'DGNS_ERR_CNT',
          diagnosisColumnCount: 'DGNS_COL_CNT',
          diagnosisErrorRate: 'DGNS_ERR_RT',
          diagnosisConcordanceRate: 'DGNS_CCRNC_RT',
        };
        const newGridStting = columnDefs.value.map((item, index) => {
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
        await updateGridData();
      };

      const saveGridSettingView = reactive({
        view: false,
        message: '그리드 설정 정보를 저장하시겠습니까?',
      });

      const onSaveGridSettingWindow = () => {
        saveGridSettingView.view = true;
      };

      // 데이터베이스 변경 시 재조회
      watch(selectedDatabase, async (newValue) => {
        setSelectHistoryDatabaseId(newValue);

        const data = {
          instituteId: useMetaMngInstId,
          informationSystemId: useInfoSysId,
          databaseId: newValue,
        };

        const schemaListData = await getSchemaListBySystem(data);

        const schmaNames = schemaListData.map((schema) => schema.schemaName);
        schemaList.value = schmaNames;

        if (schemaList.value && schemaList.value.length > 0) {
          selectedSchema.value = schemaList.value[0];
          setSelectHistorySchemaName(schemaList.value[0]);
        }

        await updateGridData();
      });
      // 스키마 변경 시 재조회
      watch(selectedSchema, async (newVal) => {
        setSelectHistorySchemaName(newVal);
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
        serarchDataBinding,
        onFilterWindowClosed,
        gridInfoDefs, // 그리드 Info
        newSetColumnDefs,
        handleSetGridApi,
        onSearchRemove, // 필터 및 정렬 삭제
        confirmDeleteDctnrySrchTab2State,
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
        handleChangeSearchType,
        searchType,
        columnDefsUpdate,
        gridApi,
        searchInput,
        setTermViewSelectData,
        termDictionarySearchCode,
        selectedDatabase,
        databaseOptions,
        selectedSchema,
        schemaList,
        schemaOptions,
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
