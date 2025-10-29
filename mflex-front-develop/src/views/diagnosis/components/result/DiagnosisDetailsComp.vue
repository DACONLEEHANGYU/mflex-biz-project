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
          표준진단항목상세
          <AppTooltip :htmlContent="getTooltipById('diagnosisItemDetail')">
          </AppTooltip>
        </div>
        <div>
          <div>
            <button
              class="btn-s"
              style="background-color: #30b678; color: white"
            >
              오류정보 다운로드 <i class="download-icon"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- <ChatbotBtn @open-chatbot-window="onOpenChatbotWindow" /> -->
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
  } from 'vue';

  import { useUiStore } from '@/stores/ui';

  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';
  import { getDiagnosisDetail } from '@/utils/mflexApi/diagnosis/diagnosisApi.js';

  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import { columnDefsUpdate } from '@/utils/js/searchModule';
  import { useSpinnerStore } from '@/stores/spinner.js';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch.js';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useDiagnosisStore } from '@/stores/diagnosis';

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
          this.searchInput = llmAnswer.data.where;
          this.searchInput = value;

          await this.updateGridData();
        } else {
          const transformedQuery = transformQuery(value);

          this.searchInput = transformedQuery;

          this.rowData.value = [];
          // const termResearchResult = await getDiagnosisDetail(researchQuery);
          // console.log('termResearchResult : ', termResearchResult);

          // this.serarchDataBinding(termResearchResult);
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
      const { useDctnryId, useMetaMngInstId } = userStngInfo.value;

      const { setSpinnerStatus } = useSpinnerStore();

      const gridApi = ref(null);

      // 사전조회 사전표시 범위 상태
      const { termDictionarySearchCode } = storeToRefs(
        useDictionarySearchStore()
      );
      const { setTermViewSelectData } = useDictionarySearchStore();

      const {
        selectTab2DatabaseId,
        selectTab2SchemaName,
        selectDiagnosisMetricCode,
      } = storeToRefs(useDiagnosisStore());

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

      const tab1GridId = ref('MFGRD320');
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
          COL_NM: 'columnName',
          COL_KORN_NM: 'columnKoreanName',
          DATA_TYP_NM: 'dataTypeName',
          DGNS_STTS_NM: 'diagnosisStateName',
          DGNS_RSLT_NM: 'diagnosisResultName',
        };

        // Map the rest of the columns normally
        const columnDefs = data.map((item) => {
          const fieldName =
            fieldMapping[item.gridArticleName] ||
            item.gridArticleName.toLowerCase();

          console.log('transformGridData-fieldName : ', fieldName);

          // 기본 열 정의 객체 생성
          const colDef = {
            cellClass:
              fieldName === 'no' || fieldName === 'dataTypeName'
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

          // diagnosisStateName 필드에 조건부 스타일 적용
          if (fieldName === 'diagnosisStateName') {
            colDef.cellStyle = (params) => {
              if (params.value === '오류') {
                return { color: 'red', fontWeight: 'bold' };
              }
              return null;
            };
            // 중앙 정렬도 적용
            colDef.cellClass = 'grid-cell-centered';
          }

          return colDef;
        });

        // Return array with checkbox column as the first item
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
            uiStore.setGridColumnDefs('MFGRD320', columnDefs.value);
            // localStorage에 gridData json 파싱, MFGRD320에 대한 값 변경
            gridStorage.MFGRD320 = transformedData;
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
            // await updateGridData();
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          columnDefs.value = gridStorage[tab1GridId.value];
          console.log('columnDefs.value : ', columnDefs.value);
          // 모든 설정이 완료된 후 용어 조회 실행
          // await updateGridData();
        }
      });

      const resultCount = ref({
        count: '',
        total: '',
      });

      // 용어 사전 데이터 조회 쿼리 객체
      const termQuery = reactive({
        dictionaryId: useDctnryId,
        domainName: '',
        termName: '',
        termAbbreviationName: '',
        termDictionaryId: '',
        query: '',
        sort: '',
      });

      // 데이터 조회 결과값 바인딩 함수
      const bindDiagnosisDetails = (diagnosisDetails) => {
        const tempData = [];

        try {
          const items = diagnosisDetails.items;
          resultCount.value.count = Number(diagnosisDetails.searchCount);
          resultCount.value.total = Number(diagnosisDetails.totalCount);

          for (let t = 0; t < items.length; t++) {
            tempData.push({
              id: t,
              no: t + 1,
              instituteId: items[t].instituteId,
              databaseId: items[t].databaseId,
              schemaName: items[t].schemaName,
              tableName: items[t].tableName,
              columnName: items[t].columnName,
              columnKoreanName: items[t].columnKoreanName,
              dataTypeName: items[t].dataTypeName,
              diagnosisStateName: items[t].diagnosisStateName,
              diagnosisResultName: items[t].diagnosisResultName,
            });
          }

          return tempData;
        } catch (error) {
          console.error(error);
        }
      };

      const currentRowIndex = ref(0);

      const updateGridData = async () => {
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
          databaseId: selectTab2DatabaseId.value,
          schemaName: selectTab2SchemaName.value,
          diagnosisMetricCode: selectDiagnosisMetricCode.value,
          query: searchInput.value,
          sort: sortQuery,
        };

        // API 호출 전 검증

        if (
          researchQuery.databaseId === '' ||
          researchQuery.schemaName === '' ||
          researchQuery.diagnosisMetricCode === ''
        ) {
          console.log('DB 또는 스키마가 선택되지 않았습니다.');
          return;
        }

        console.log('updateGridData 실행여부 확인 ======================');
        const diagnosisDetails = await getDiagnosisDetail(researchQuery);
        const bindDetails = bindDiagnosisDetails(diagnosisDetails);

        rowData.value = bindDetails;
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
              databaseId: selectTab2DatabaseId.value,
              schemaName: selectTab2SchemaName.value,
              diagnosisMetricCode: 'STANDARD',
              lastItem: {
                databaseId: lastItem.databaseId,
                schemaName: lastItem.schemaName,
                tableName: lastItem.tableName,
                columnName: lastItem.columnName,
                columnKoreanName: lastItem.columnKoreanName,
                dataTypeName: lastItem.dataTypeName,
                diagnosisStateName: lastItem.diagnosisStateName,
                diagnosisResultName: lastItem.diagnosisResultName,
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

      // 용어 그리드 데이터 추가 함수
      const addGridRowData = async (researchQuery) => {
        try {
          // 추가 조회 전 데이터 저장
          let oldGridData = rowData.value;

          // 인덱스로 핀별하므로 길이에서 -1
          const lastRowIndex = oldGridData.length - 1;
          const lastRowNode =
            agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);
          console.log('마지막 node ===========', lastRowNode);

          const reloadData = await getDiagnosisDetail(researchQuery);
          console.log('reloadData : ', reloadData);

          const items = reloadData.items;

          const newGridData = [];

          for (let n = 0; n < items.length; n++) {
            newGridData.push({
              id: oldGridData.length + n,
              no: oldGridData.length + n + 1,
              instituteId: items[n].instituteId,
              databaseId: items[n].databaseId,
              schemaName: items[n].schemaName,
              tableName: items[n].tableName,
              columnName: items[n].columnName,
              columnKoreanName: items[n].columnKoreanName,
              dataTypeName: items[n].dataTypeName,
              diagnosisStateName: items[n].diagnosisStateName,
              diagnosisResultName: items[n].diagnosisResultName,
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
        const sortQuery = ref('');
        const sortState = reactive({});

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
        console.log('rowData.value.length:', rowData.value.length);

        const lastItem =
          rowData.value.length > 0
            ? rowData.value[rowData.value.length - 1]
            : null;
        console.log('lastItem ===', lastItem);

        console.log('sortState :', sortState);

        // sort의 결과가 초기화 상태일 때,
        if (sortState.value.length == 0) {
          await updateGridData();
        } else {
          // 정렬 순서 배열 생성
          const sortParts = sortState.value.map(
            (column) => `${column.headerName} ${column.sort}`
          );

          // 배열의 원소를 문자열로 병합
          sortQuery.value = sortParts.join(', ');
          sortStateQuery.value = sortQuery.value;

          await updateGridData();
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
            if (
              colDef.field === 'termName' ||
              colDef.field === 'domainName' ||
              colDef.field === 'relatedCodeName'
            ) {
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
            }
            // else if (colDef.field === 'rvsnDt') {
            //   valueFormatter = (params) => {
            //     const value = params.value;
            //     if (value && value.length === 8) {
            //       return `${value.substring(0, 4)}-${value.substring(
            //         4,
            //         6
            //       )}-${value.substring(6)}`;
            //     }
            //     return value;
            //   };
            // }

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
                colDef.field === 'termName' ||
                colDef.field === 'domainName' ||
                colDef.field === 'relatedCodeName'
                  ? cellRenderer
                  : null,
            };
          })
          .filter((colDef) => colDef != null);

        //columnFcDefs.value = newColumnFcDefs; */

        console.log('newColumnFcDefs : ', newColumnFcDefs);

        gridApi.value.setGridOption('columnDefs', newColumnFcDefs);

        columnDefs.value = newColumnFcDefs;

        // localStorage에 에서 gridData json 파싱, MFGRD320에 대한 값 변경
        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage.MFGRD320 = newColumnFcDefs;
        // 로컬스토레지에 저장
        saveGridInfoToStorage(gridStorage);
        // 스토어에 저장
        uiStore.setGridColumnDefs('MFGRD320', newColumnFcDefs);
      }

      //valueFormatter 함수 설정
      watchEffect(() => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD320) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD320;

        columnDefs.value = columnDefs.value.map((col) => {
          let valueFormatter = null;
          let cellRenderer = null;
          let cellStyle = null;

          // diagnosisStateName 필드에 조건부 스타일 적용
          if (col.field === 'diagnosisStateName') {
            cellStyle = (params) => {
              if (params.value === '오류') {
                return { color: 'red', fontWeight: 'bold' };
              }
              return null;
            };
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
            cellStyle: cellStyle, // 조건부 스타일 추가
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
            databaseId: selectTab2DatabaseId.value,
            schemaName: selectTab2SchemaName.value,
            diagnosisMetricCode: 'STANDARD',
            query: filterSet.searchQuery,
            sort: filterSortQuery,
          };
          const filterData = await getDiagnosisDetail(researchQuery);
          console.log('filterData : ', filterData);

          if (filterData.items.length === 200) {
            resultCount.value.count = 0;
            resultCount.value.total = 0;
            rowData.value = [];
            return;
          }
          const filterSearchData = bindDiagnosisDetails(filterData);
          searchInput.value = filterSet.searchQuery;
          rowData.value = filterSearchData;
        } else {
          const gridStorage = JSON.parse(getGridInfoFromStorage());
          console.log('gridStorage.MFGRD320 : ', gridStorage.MFGRD320);
          columnDefs.value = gridStorage.MFGRD320;

          gridApi.value.setGridOption('columnDefs', gridStorage.MFGRD320);
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

        uiStore.setGridColumnDefs('MFGRD320', columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        // 필터 초기화 시 검색 쿼리 초기화 추가 24/06/14
        searchInput.value = '';

        await updateGridData(termQuery);
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

        console.log('handleBindQuery-termQuery : ', termQuery);

        await updateGridData(termQuery);
      };

      const onSetUserGridSetting = async () => {
        console.log('columnDefs.value : ', columnDefs.value);

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log(
          'gridStorage[tab1GridId.value] : ',
          gridStorage[tab1GridId.value]
        );

        const fieldMapping = {
          dctnryId: 'DCTNRY_ID',
          no: 'NO',
          termName: 'TRM_NM',
          termEngAbbreviationName: 'TRM_EABBR_NM',
          termEngName: 'TRM_ENG_NM',
          termType: 'TRM_TYPE_NM',
          termStandardYnName: 'TRM_STND_YN_NM',
          relationCodeName: 'REL_CD_NM',
          domainName: 'DMN_NM',
          codeTypeName: 'CD_TYPE_NM',
          relatedCodeName: 'REL_CD_NM',
          revisionInfo: 'REVISION_INFO',
          revisionDate: 'RVSN_DT',
          lastChangeInfo: 'UPDR_INFO',
          lastChangeDate: 'UPD_DTM',
        };
        const newGridStting = columnDefs.value.map((item, index) => {
          const articleName = fieldMapping[item.field];

          return {
            gridArticleName: articleName,
            gridArticleKoreanName: item.headerName,
            articlePositionOrder: index + 1,
            articleColumnWidth: item.width,
            articleDisplayYn: item.hide,
            articleFixedCode: item.pinned,
            articleDataSortYn: item.sortable,
            articleDataSortOrder: item.sortIndex,
            articleDataSortCode: item.sort,
          };
        });

        console.log('newGridStting : ', newGridStting);

        await setUserGridSetting(tab1GridId.value, newGridStting);
        updateGridData(termQuery);
      };

      const saveGridSettingView = reactive({
        view: false,
        message: '그리드 설정 정보를 저장하시겠습니까?',
      });

      const onSaveGridSettingWindow = () => {
        saveGridSettingView.view = true;
      };

      // 사전표시 범위 감지
      watch(termDictionarySearchCode, async (newVal) => {
        console.log('termDictionarySearchCode : ', newVal);

        await updateGridData(termQuery);
      });

      watch(
        selectTab2DatabaseId,
        async (newVal) => {
          console.log('selectTab2DatabaseId : ', newVal);
          // termQuery.databaseId = newVal;
          // await updateGridData(termQuery);

          updateGridData();
        },
        {
          immediate: true,
        }
      );

      watch(
        selectTab2SchemaName,
        (newVal) => {
          console.log('selectTab2SchemaName ', newVal);
          updateGridData();
        },
        {
          immediate: true,
        }
      );

      watch(selectDiagnosisMetricCode, async (newValue) => {
        console.log('selectDiagnosisMetricCode : ', newValue);

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
        termQuery,
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
        // searhType 변경
        handleChangeSearchType,
        searchType,
        columnDefsUpdate,
        gridApi,
        searchInput,
        setTermViewSelectData,
        termDictionarySearchCode,
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

  .download-icon {
    width: 20px;
    height: 20px;
    background-image: url(/src/assets/images/icon_download.png);
    background-size: cover;
    display: inline-block;
    vertical-align: middle;
    position: relative;
    top: -1px;
    margin-left: 2px;
  }
</style>
