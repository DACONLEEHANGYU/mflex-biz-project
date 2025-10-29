<!-- <template>
  <div class="tab-inner">4</div>
</template>


<script></script> -->

<template>
  <div class="tab-inner">
    <!-- <ChatbotBtn @open-chatbot-window="onOpenChatbotWindow" /> -->
    <div class="grid-wrap">
      <div class="grid-top">
        <div class="top-row">
          <GridSearch
            ref="targetInputRef"
            :resultCount="resultCount"
            :modelValue="researchQuery.query"
            :columnFcDefs="columnDefs"
            :gridDefs="gridInfoDefs"
            @open-chatbot-window="onOpenChatbotWindow"
            @enter="onSearchEnter"
            @save="onSaveGridSettingWindow"
            @remove="onDeleteHeaderInfo"
            @filter-window-closed="onClosePopUpFilter"
            @column-state-changed="onColumnStateChanged"
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
          @rowClicked="onRowClicked"
          @gridApi="handleSetGridApi"
          @sort-changed="handleSortChanged"
          @body-scroll="handleScrollChanged"
          @column-state-changed="onColumnStateChanged"
          ref="agGrid"
        />
      </div>
      <AppDialog
        v-model:view="confirmDeleteHeaderInfo.view"
        :title="confirmDeleteHeaderInfo.title"
        :message="confirmDeleteHeaderInfo.message"
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
    @close="onCloseChatbotWindow"
    width="500px"
    height="auto"
  >
    <ChatbotWindow
      ref="chatbotWindow"
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
    watchEffect,
    onBeforeMount,
    computed,
  } from 'vue';

  import { useUiStore } from '@/stores/ui';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';

  import { columnDefsUpdate } from '@/utils/js/searchModule';
  import {
    handleColumnStateChanged,
    onSearchRemove,
    onFilterWindowClosed,
  } from '@/utils/js/searchModule';

  import { getTableList } from '@/utils/mflexApi/dataMng/schemaSearchApi';

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

        this.setTableData(value);
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

        const researchQuery = {
          instituteId: this.useMetaMngInstId,
          informationSystemId: this.useInfoSysId,
          query: transformedQuery,
          sort: this.getSortQuery(),
        };

        this.researchQuery.query = transformedQuery;

        this.rowData.value = [];

        const tableResearchResult = await getTableList(researchQuery);

        console.log('tableResearchResult : ', tableResearchResult);

        this.searchDataBinding(tableResearchResult);
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
      console.log('term beforeMount  ========================');
    },

    setup(props, { emit }) {
      const uiStore = useUiStore();
      const { gridColumnDefs } = storeToRefs(uiStore);
      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      const rowData = reactive({});
      const newSetColumnDefs = reactive([]);
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const { setTableData } = useSchemaSearchTabStore();

      const agGrid = ref(null);
      const gridApi = ref(null);

      // AG 그리드가 생성될 때 gridApi 에 params 를 할당
      const handleSetGridApi = (params) => {
        console.log('handleSetGridApi : ', params);

        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      const tab1GridId = 'MFGRD060';
      const gridInfoDefs = ref({
        scrnGridId: tab1GridId,
        scrnId: '',
      });

      const columnDefs = ref([]);

      const transformGridData = (data) => {
        console.log('transformGridData-data : ', data);

        const fieldMapping = {
          NO: 'no',
          TBL_NM: 'tableName',
          TBL_KORN_NM: 'tableKoreanName',
          TBL_COL_CNT: 'tableColumnCount',
          DB_SCHM_INFO: 'databaseSchemaInformation',
          SBJAR_NM: 'subjectAreaName',
          OCRN_CYC_NM: 'occurrenceCycleName',
          MNTH_GNRAMT_CN: 'monthlyGenerationAmountContent',
          PRSVN_PRD_NM: 'preservationPeriodName',
          UPDR_INFO: 'updater',
          UPD_DTM: 'updateDateTime',
        };

        return data.map((item) => {
          const fieldName =
            fieldMapping[item.gridArticleName] ||
            item.gridArticleName.toLowerCase();

          return {
            cellClass:
              fieldName === 'no' ||
              fieldName === 'databaseSchemaInformation' ||
              fieldName === 'subjectAreaName' ||
              fieldName === 'tableColumnCount' ||
              fieldName === 'occurrenceCycleName' ||
              fieldName === 'monthlyGenerationAmountContent' ||
              fieldName === 'preservationPeriodName' ||
              fieldName === 'updateDateTime'
                ? 'grid-cell-centered'
                : 'ag-left-aligned-cell',
            cellRenderer: null,
            field: fieldName,
            headerName: item.gridArticleKoreanName,
            hide: !item.articleDisplayYn,
            minWidth: item.articleColumnWidth,
            pinned: item.articleFixedCode || '',
            sort: item.articleDataSortCode,
            sortIndex: item.articleDataSortOrder,
            sortable: item.articleDataSortYn,
            suppressSorting: !item.articleDataSortYn,
            valueFormatter: null,
            width: item.articleColumnWidth,
          };
        });
      };

      const getGridInfo = async () => {
        try {
          const userGridData = await getUserGridSetting(tab1GridId);

          const transformedData = await transformGridData(userGridData);

          // // NO 항목 생성
          // const noColumn = {
          //   cellClass: 'grid-cell-centered',
          //   cellRenderer: null,
          //   field: 'no',
          //   headerName: '번호',
          //   hide: false,
          //   minWidth: 80,
          //   pinned: 'left',
          //   sort: null,
          //   sortIndex: null,
          //   sortable: false,
          //   suppressSorting: true,
          //   valueFormatter: null,
          //   width: 80,
          // };

          // const transformedDataWithNo = [noColumn, ...transformedData];
          const transformedDataWithNo = transformedData;

          console.log('Transformed Grid Data:', transformedData);
          return transformedDataWithNo; // transformedData를 반환
        } catch (error) {
          console.error('Error in getGridInfo:', error);
          throw error;
        }
      };

      onBeforeMount(async () => {
        const gridStorage = JSON.parse(getGridInfoFromStorage());

        if (!gridStorage[tab1GridId]) {
          try {
            // transformedData를 직접 받아서 처리
            const transformedData = await getGridInfo();

            // columnDefs 설정
            columnDefs.value = transformedData;

            // columnDefs가 설정된 후에 실행
            uiStore.setGridColumnDefs('MFGRD060', columnDefs.value);

            // gridApi 설정이 유효한지 확인
            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', columnDefs.value);
            }

            gridStorage[tab1GridId] = transformedData;
            saveGridInfoToStorage(gridStorage);

            console.log(
              '그리드데이터 할당 =============== : ',
              columnDefs.value
            );

            // 모든 설정이 완료된 후 용어 조회 실행
            // await updateGridData(termQuery);
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          columnDefs.value = gridStorage[tab1GridId];
        }
        fetchData();
      });

      // const initializeGridColumnDefs = () => {
      //   const storedColumnDefs = JSON.parse(getGridInfoFromStorage());
      //   if (storedColumnDefs && storedColumnDefs[tab1GridId]) {
      //     uiStore.setGridColumnDefs(tab1GridId, storedColumnDefs[tab1GridId]);
      //   }
      // };

      // initializeGridColumnDefs();

      columnDefs.value = gridColumnDefs.value.tab1GridId;

      const currentRowIndex = ref(0);

      const resultCount = ref({
        count: '',
        total: '',
      });

      // 테이블 데이터 조회 쿼리
      const researchQuery = reactive({
        instituteId: useMetaMngInstId,
        informationSystemId: useInfoSysId,
        lastItem: {},
        query: '',
        sort: '',
      });

      // 테이블 데이터 조회 함수
      const fetchData = async (filterSet) => {
        console.log('researchQuery : ', researchQuery);

        if (filterSet) {
          researchQuery.query = filterSet.searchQuery;
          researchQuery.sort = filterSet.orderQuery;
        } else {
          researchQuery.sort = getSortQuery();
        }

        console.log('researchQuery.sort : ', researchQuery.sort);

        const response = await getTableList(researchQuery);

        console.log('response : ', response);

        // 조회 결과 수를 설정
        resultCount.value.count = response.searchCount;
        resultCount.value.total = response.totalCount;

        const tableList = response.items;

        // 새로운 데이터 구조에 맞게 매핑
        const tempData = tableList.map((item, index) => ({
          id: index,
          no: index + 1,
          instituteId: item.instituteId, // 기관 ID
          informationSystemId: item.informationSystemId, // 정보시스템 ID
          databaseId: item.databaseId, // 데이터베이스 ID
          schemaName: item.schemaName,
          tableName: item.tableName || '', // 테이블명
          tableKoreanName: item.tableKoreanName || '', // 테이블 한글명
          tableColumnCount: item.tableColumnCount || 0, // 컬럼 수
          databaseSchemaInformation: item.databaseSchemaInformation || '', // 데이터베이스/스키마명
          subjectAreaName: item.subjectAreaName || null, // 주제 영역
          occurrenceCycleName: item.occurrenceCycleName || null, // 발생 주기
          monthlyGenerationAmountContent:
            item.monthlyGenerationAmountContent || null, // 월간 발생량
          preservationPeriodName: item.preservationPeriodName || null, // 보존 기간
          updater: item.updater || 'N/A', // 최종 수정자
          updateDateTime: item.updateDateTime || 'N/A', // 최종 수정일시
        }));

        rowData.value = tempData;

        // 데이터가 있는 경우 첫 번째 행 선택
        if (rowData.value.length > 0) {
          console.log('agGrid.value :', agGrid.value);

          nextTick(() => {
            console.log('agGrid.value.gridApi : ', agGrid.value.gridApi);
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);

            // 첫 번째 행에 선택 효과 추가
            const nodesWithRowId0 = document.querySelector('[row-id="0"]');
            nodesWithRowId0.classList.add('ag-row-selected', 'ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);

            setTableData(firstRowData.data);
          });
        }

        console.log('fetchData');
      };

      //그리드 칼럼 이동 및 사이즈 변경 등 이벤트 발생시 그리드 설정 값 업데이트
      const onColumnStateChanged = (newColumnState) => {
        // handleColumnStateChanged 호출 시 필요한 값을 전달
        handleColumnStateChanged(
          gridApi,
          newColumnState,
          tab1GridId,
          columnDefs
        );
      };

      // 그리드 스크롤 이벤트
      const onScrollChanged = (endScrollStaus) => {
        const lastItem = handleScrollChanged(
          endScrollStaus,
          rowData,
          columnDefs
        );
        console.log('lastItem ===', lastItem);
      };

      // 필터 팝업 닫힐 때 이벤트
      const onClosePopUpFilter = (filterSet) => {
        console.log('onClosePopUpFilter : ', filterSet);

        if (filterSet) {
          fetchData(filterSet);
        } else {
          return;
        }
      };

      const handleScrollChanged = (endScrollStaus) => {
        try {
          if (endScrollStaus === 'Y' && rowData.value != null) {
            const lastItem =
              rowData.value.length > 0
                ? rowData.value[rowData.value.length - 1]
                : null;
            console.log('lastItem ===', lastItem);

            addGridRowData(lastItem);
          }
        } catch (error) {
          console.error(error);
        }
      };

      // 필터 초기화 confirm 팝업
      const confirmDeleteHeaderInfo = reactive({
        view: false,
        message:
          '그리드 설정 정보를 <strong style="color:red">초기화</strong> 하시겠습니까?',
      });

      const onDeleteHeaderInfo = () => {
        confirmDeleteHeaderInfo.view = true;
      };

      const addGridRowData = async (lastItem) => {
        try {
          // 추가 조회 전 데이터 저장
          let oldGridData = rowData.value;

          // 인덱스로 핀별하므로 길이에서 -1
          const lastRowIndex = oldGridData.length - 1;
          const lastRowNode =
            agGrid.value.gridApi.getDisplayedRowAtIndex(lastRowIndex);
          console.log('마지막 node ===========', lastRowNode);

          const lastItem =
            rowData.value.length > 0
              ? rowData.value[rowData.value.length - 1]
              : null;

          researchQuery.lastItem = lastItem;
          researchQuery.sort = getSortQuery();

          const response = await getTableList(researchQuery);

          const tableList = response.items;

          const newGridData = [];

          for (let i = 0; i < tableList.length; i++) {
            newGridData.push({
              id: i + oldGridData.length,
              no: i + oldGridData.length + 1,
              instituteId: tableList[i].instituteId, // 기관 ID
              informationSystemId: tableList[i].informationSystemId, // 정보시스템 ID
              databaseId: tableList[i].databaseId, // 데이터베이스 ID
              schemaName: tableList[i].schemaName,
              tableName: tableList[i].tableName || '', // 테이블명
              tableKoreanName: tableList[i].tableKoreanName || '', // 테이블 한글명
              tableColumnCount: tableList[i].tableColumnCount || 0, // 컬럼 수
              databaseSchemaInformation:
                tableList[i].databaseSchemaInformation || '', // 데이터베이스/스키마명
              subjectAreaName: tableList[i].subjectAreaName || null, // 주제 영역
              occurrenceCycleName: tableList[i].occurrenceCycleName || null, // 발생 주기
              monthlyGenerationAmountContent:
                tableList[i].monthlyGenerationAmountContent || null, // 월간 발생량
              preservationPeriodName:
                tableList[i].preservationPeriodName || null, // 보존 기간
              updater: tableList[i].updater || 'N/A', // 최종 수정자
              updateDateTime: tableList[i].updateDateTime || 'N/A', // 최종 수정일시
            });
          }

          rowData.value = [...oldGridData, ...newGridData];

          resultCount.value.count = Number(rowData.value.length);

          // console.log('addresponse =================', response);

          // console.log('lastItem =================', lastItem);

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

      // // 정렬 핸들러
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
        console.log('rowData:', rowData);

        const lastItem =
          rowData.value.length > 0
            ? rowData.value[rowData.value.length - 1]
            : null;
        console.log('lastItem ===', lastItem);

        console.log('sortState :', sortState);

        // sort의 결과가 초기화 상태일 때,
        if (sortState.value.length == 0) {
          const sortResarchQuery = {
            instituteId: useMetaMngInstId,
            informationSystemId: useInfoSysId,
            query: researchQuery.query,
          };

          const termSortData = await getTableList(sortResarchQuery);

          console.log('termSortData : ', termSortData);

          // 정렬 조회결과 바인딩 및 rowData 할당
          searchDataBinding(termSortData);
        } else {
          // 정렬 순서 배열 생성
          const sortParts = sortState.value.map(
            (column) => `${column.headerName} ${column.sort}`
          );

          // 배열의 원소를 문자열로 병합
          sortQuery.value = sortParts.join(', ');

          const sortResearchQuery = {
            instituteId: useMetaMngInstId,
            informationSystemId: useInfoSysId,
            query: researchQuery.query,
            sort: sortQuery.value,
          };

          console.log('sortResearchQuery : ', sortResearchQuery);

          const tableSortData = await getTableList(sortResearchQuery);
          console.log('tableSortData : ', tableSortData);

          searchDataBinding(tableSortData);
        }

        // firstRowSelectedEvent();
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

      // 테이블 조회 ( 필터 리서치 )
      const searchDataBinding = (tableResearchResult) => {
        console.log('tableResearchResult : ', tableResearchResult);

        const tableList = tableResearchResult.items;

        if (tableList.length < 0) {
          resultCount.value.count = 0;
          resultCount.value.total = 0;
        } else {
          resultCount.value.count = tableResearchResult.searchCount;
          resultCount.value.total = tableResearchResult.totalCount;

          const tempData = [];

          for (let i = 0; i < tableList.length; i++) {
            tempData.push({
              id: i,
              no: i + 1,
              instituteId: tableList[i].instituteId, // 기관 ID
              informationSystemId: tableList[i].informationSystemId, // 정보시스템 ID
              databaseId: tableList[i].databaseId, // 데이터베이스 ID
              schemaName: tableList[i].schemaName,
              tableName: tableList[i].tableName || '', // 테이블명
              tableKoreanName: tableList[i].tableKoreanName || '', // 테이블 한글명
              tableColumnCount: tableList[i].tableColumnCount || 0, // 컬럼 수
              databaseSchemaInformation:
                tableList[i].databaseSchemaInformation || '', // 데이터베이스/스키마명
              subjectAreaName: tableList[i].subjectAreaName || null, // 주제 영역
              occurrenceCycleName: tableList[i].occurrenceCycleName || null, // 발생 주기
              monthlyGenerationAmountContent:
                tableList[i].monthlyGenerationAmountContent || null, // 월간 발생량
              preservationPeriodName:
                tableList[i].preservationPeriodName || null, // 보존 기간
              updater: tableList[i].updater || 'N/A', // 최종 수정자
              updateDateTime: tableList[i].updateDateTime || 'N/A', // 최종 수정일시
            });
          }

          rowData.value = tempData;

          if (rowData.value.length > 0) {
            nextTick(() => {
              const firstRowData =
                agGrid.value.gridApi.getDisplayedRowAtIndex(0);
              console.log('firstRowData =============', firstRowData);

              // 첫 행 select 효과
              const nodesWithRowId0 = document.querySelector('[row-id="0"]');
              console.log('nodeWithRowId0 ========', nodesWithRowId0);

              // .ag-row-selected 클래스를 추가합니다.
              nodesWithRowId0.classList.add('ag-row-selected');
              nodesWithRowId0.classList.add('ag-row-focus');
              nodesWithRowId0.setAttribute('aria-selected', true);

              setTableData(firstRowData.data);
            });
          }
        }
      };

      //valueFormatter 함수 설정
      watchEffect(() => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD060) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD060;

        columnDefs.value = columnDefs.value.map((col) => {
          let valueFormatter = null;
          let cellRenderer = null;
          // 필드 값에 따라 조건부로 valueFormatter 설정
          if (
            col.field === 'termName' ||
            col.field === 'domainName' ||
            col.field === 'relatedCodeName'
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
            cellRenderer = 'TypeCellRenderer';
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
            suppressSorting: true,
            comparator: () => 0,
            valueFormatter: valueFormatter,
            cellRenderer: cellRenderer,
          };
        });

        console.log('watchEffect 정상동작');
      });

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
        researchQuery.query = llmAnswer.where;

        await columnDefsUpdate(llmAnswer.sort, columnDefs, tab1GridId, gridApi);

        researchQuery.query = llmAnswer.where;
        researchQuery.sort = llmAnswer.sort;

        await fetchData();
      };

      const onSetUserGridSetting = async () => {
        console.log('columnDefs.value : ', columnDefs.value);

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log('gridStorage[tab1GridId] : ', gridStorage[tab1GridId]);
        const fieldMapping = {
          no: 'NO',
          tableName: 'TBL_NM',
          tableKoreanName: 'TBL_KORN_NM',
          tableColumnCount: 'TBL_COL_CNT',
          databaseSchemaInformation: 'DB_SCHM_INFO',
          subjectAreaName: 'SBJAR_NM',
          occurrenceCycleName: 'OCRN_CYC_NM',
          monthlyGenerationAmountContent: 'MNTH_GNRAMT_CN',
          preservationPeriodName: 'PRSVN_PRD_NM',
          updater: 'UPDR_INFO',
          updateDateTime: 'UPD_DTM',
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

        await setUserGridSetting(tab1GridId, newGridStting);
        // updateGridData(termQuery);
      };

      const saveGridSettingView = reactive({
        view: false,
        message: '그리드 설정 정보를 저장하시겠습니까?',
      });

      const onSaveGridSettingWindow = () => {
        saveGridSettingView.view = true;
      };

      // // 삭제 시 호출
      // const handleSearchReomve = async () => {
      //   const gridDefaultData = transformGridData(
      //     await getGridDefaultData(tab1GridId)
      //   );

      //   onSearchRemove(gridApi, tab1GridId, columnDefs, gridDefaultData);
      // };

      const onSearchRemove = async () => {
        console.log('onSearchRemove 함수 실행 ===');

        // 그리드 기본값 호출
        const gridDefaultData = await getGridDefaultData(tab1GridId);

        console.log('gridDefaultData : ', gridDefaultData);

        // 기본값 설정
        await setUserGridSetting(tab1GridId, gridDefaultData);

        const transformedData = transformGridData(gridDefaultData);

        console.log('transformedData : ', transformedData);

        columnDefs.value = transformedData;

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage[tab1GridId] = transformedData;
        saveGridInfoToStorage(gridStorage);

        uiStore.setGridColumnDefs(tab1GridId, columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        // await updateGridData(termQuery);
      };

      return {
        agGrid,
        rowData,
        gridApi,
        researchQuery,
        resultCount,
        newSetColumnDefs,
        handleSetGridApi,
        setTableData,
        columnDefs, // 테이블 그리드 컬럼 정보
        handleColumnStateChanged, // 컬럼 이동 및 사이즈 변경 이벤트 핸들러
        handleSortChanged, // 정렬 핸들러
        onScrollChanged,
        handleScrollChanged, // 그리드 스크롤
        confirmDeleteHeaderInfo,
        onDeleteHeaderInfo,
        onSearchRemove, // 필터 및 정렬 삭제
        onFilterWindowClosed,
        gridInfoDefs,
        onColumnStateChanged,
        onClosePopUpFilter,
        useMetaMngInstId, // 기관 id
        useInfoSysId, // 정보시스템 id
        getTableList, // 테이블 조회
        searchDataBinding,
        getSortQuery,
        chatbotWindowView,
        onOpenChatbotWindow,
        onCloseChatbotWindow,
        tab1GridId,
        handleBindQuery,
        onSetUserGridSetting,
        saveGridSettingView,
        onSaveGridSettingWindow,
      };
    },
  };
</script>
