<template>
  <div class="schema-info-box">
    <div class="schema-info">
      <div class="tab-inner">
        <div class="inputs-wrap">
          <div class="input-form">
            <table class="input-table">
              <colgroup>
                <col width="9%" />
                <col width="10%" />
              </colgroup>
              <tbody>
                <tr>
                  <th>DB 연결정보명</th>
                  <td>
                    <div class="td-col">
                      {{ dbConnectionHeaderData.dbConnectionName }}
                    </div>
                  </td>
                  <th>DB명</th>
                  <td>
                    <div class="td-col">
                      {{ dbConnectionHeaderData.dbName }}
                    </div>
                  </td>
                  <th>DBMS명</th>
                  <td>
                    <div class="td-col">
                      {{ dbConnectionHeaderData.dbmsName }}
                    </div>
                  </td>
                  <th>DBMS정보</th>
                  <td>
                    <div class="td-col">
                      {{ dbConnectionHeaderData.dbmsInfo }}
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="schema-search-btn-area">
        <button class="btn-s">검색</button>
        <button class="btn-s">DB연결</button>
        <button class="btn-s">스키마수집</button>
      </div> -->
  </div>
  <div class="tab-inner">
    <!-- <ChatbotBtn @open-chatbot-window="onOpenChatbotWindow" /> -->

    <div class="grid-wrap">
      <div class="grid-top">
        <div class="top-row">
          <GridSearch
            ref="targetInputRef"
            :resultCount="resultCount"
            :modelValue="searchInput"
            :columnFcDefs="columnDefs"
            :gridDefs="gridInfoDefs"
            @search-type="handleChangeSearchType"
            @open-chatbot-window="onOpenChatbotWindow"
            @enter="onSearchEnter"
            @save="onSaveGridSettingWindow"
            @remove="onDeleteHeaderInfo"
            @filter-window-closed="onClosePopUpFilter"
            @column-state-changed="onColumnStateChanged"
          />
        </div>
      </div>
      <div class="grid-list collection-result-grid">
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
    :moveState="true"
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
    watch,
  } from 'vue';

  import { useUiStore } from '@/stores/ui';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';
  import { useSchemaCollectionStore } from '@/stores/schemaCollection';

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
  import {
    getSchemaCollectionList, // 수집결과 조회
  } from '@/utils/mflexApi/dataMng/schemaCollectionApi';
  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
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

        // this.setTableData(value);

        this.setSelectCollection(value);
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
            gridId: this.tab1GridId,
            query: transformedQuery,
          };
          const llmAnswer = await getCreateQuery(searchInfo);

          await columnDefsUpdate(
            llmAnswer.data.sort,
            this.columnDefs,
            this.tab1GridId,
            this.gridApi
          );

          this.researchQuery.query = llmAnswer.data.where;
          this.searchInput = value;

          const researchQuery = {
            instituteId: this.useMetaMngInstId,
            informationSystemId: this.useInfoSysId,
            query: llmAnswer.data.where,
            sort: llmAnswer.data.sort,
          };
          const tableResearchResult = await getTableList(researchQuery);

          console.log('tableResearchResult : ', tableResearchResult);

          this.searchDataBinding(tableResearchResult);
        } else {
          const researchQuery = {
            instituteId: this.useMetaMngInstId,
            databaseLinkId: this.selectDbInfo.databaseLinkId,
            query: transformedQuery,
            sort: this.getSortQuery(),
          };

          this.researchQuery.query = transformedQuery;
          this.searchInput = value;

          this.rowData.value = [];

          const collectionResearchResult = await getSchemaCollectionList(
            researchQuery
          );

          console.log('collectionResearchResult : ', collectionResearchResult);

          this.searchDataBinding(collectionResearchResult);
        }
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
      const { userStngInfo } = storeToRefs(authStore);
      const rowData = reactive({});
      const newSetColumnDefs = reactive([]);
      const { useMetaMngInstId, useInfoSysId } = userStngInfo.value;

      const { setTableData } = useSchemaSearchTabStore();

      // 선택 DB 연결정보
      const { selectDbInfo, selectDbDetails, updateManageDB } = storeToRefs(
        useSchemaCollectionStore()
      );

      const { setSelectCollection } = useSchemaCollectionStore();

      const agGrid = ref(null);
      const gridApi = ref(null);

      // AG 그리드가 생성될 때 gridApi 에 params 를 할당
      const handleSetGridApi = (params) => {
        console.log('handleSetGridApi : ', params);

        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      const tab1GridId = 'MFGRD070';
      const gridInfoDefs = ref({
        scrnGridId: tab1GridId,
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
          CLCT_DMND_DTM: 'requestDateTime',
          OL_LNKG_YN_NM: 'collectionWayName',
          CLCT_BGN_DTM: 'startDateTime',
          CLCT_END_DTM: 'endDateTime',
          CLCT_REQ_HR: 'elapsedTime',
          CLCT_STTS_NM: 'status',
          CLCT_ERR_YN: 'errorYn',
          CLCT_ERR_CN: 'errorContent',
          EXCN_DV_NM: 'executionDivisionName',
        };

        return data.map((item) => {
          const fieldName =
            fieldMapping[item.gridArticleName] ||
            item.gridArticleName.toLowerCase();

          return {
            cellClass:
              fieldName === 'no' ||
              fieldName === 'requestDateTime' ||
              fieldName === 'collectionWayName' ||
              fieldName === 'startDateTime' ||
              fieldName === 'endDateTime' ||
              fieldName === 'elapsedTime' ||
              fieldName === 'status' ||
              fieldName === 'errorContent' ||
              fieldName === 'executionDivisionName' ||
              fieldName === 'errorYn'
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

        console.log('gridStorage : ', gridStorage);

        if (!gridStorage[tab1GridId]) {
          try {
            // transformedData를 직접 받아서 처리
            const transformedData = await getGridInfo();

            console.log('transformedData : ', transformedData);

            // columnDefs 설정
            columnDefs.value = transformedData;

            // columnDefs가 설정된 후에 실행
            uiStore.setGridColumnDefs('MFGRD070', columnDefs.value);

            gridStorage[tab1GridId] = transformedData;
            // gridStorage[tab1GridId] = transformedData;
            saveGridInfoToStorage(gridStorage);

            // initializeGridColumnDefs();

            // gridApi 설정이 유효한지 확인
            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', columnDefs.value);
            }

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
        // await fetchData();
      });

      const initializeGridColumnDefs = () => {
        const storedColumnDefs = JSON.parse(getGridInfoFromStorage());
        if (storedColumnDefs && storedColumnDefs[tab1GridId]) {
          uiStore.setGridColumnDefs(tab1GridId, storedColumnDefs[tab1GridId]);
        }
      };

      const storedMfgrd070ColumnDefs = ref([]);
      storedMfgrd070ColumnDefs.value = gridColumnDefs.value.MFGRD070;

      console.log('storedMfgrd070ColumnDefs : ', storedMfgrd070ColumnDefs);
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
        databaseLinkId: selectDbInfo.value.databaseLinkId,
        lastItem: {},
        query: '',
        sort: '',
      });

      // 수집결과 데이터 조회 함수
      const fetchData = async (data) => {
        // 수집결과 항목 조회
        const response = await getSchemaCollectionList(data);

        console.log('response getSchemaCollectionList : ', response);

        resultCount.value.count = response.searchCount;
        resultCount.value.total = response.totalCount;

        const tempData = [];

        for (let i = 0; i < response.items.length; i++) {
          const item = response.items[i];
          tempData.push({
            id: i,
            no: i + 1,
            collectionId: item.collectionId,
            databaseLinkId: item.databaseLinkId,
            instituteId: item.instituteId,
            requestDateTime: item.collectionRequestDateTime,
            databaseId: item.databaseId,
            collectionWayName: item.collectionWayName,
            endDateTime: item.collectionEndDateTime || '',
            startDateTime: item.collectionBeginDateTime || '', // `collectionId`를 테이블 수로 가정
            elapsedTime: item.collectionTime || '00:00:00', // 기본값 "00:00:00" 설정
            status: item.collectionStatusName || '',
            errorContent: item.collectionErrorContents || null,
            errorYn: item.collectionErrorYn,
            executionDivisionName: item.executionDivisionName || '',
          });
        }

        rowData.value = tempData;

        setSelectCollection(rowData.value[0]);

        nextTick(() => {
          const collectionGrid = document.querySelector(
            '.collection-result-grid'
          );

          if (!collectionGrid) {
            console.error('Collection grid not found!');
            return;
          }

          const nodesWithRowId0 = collectionGrid.querySelector('[row-id="0"]');
          console.log('nodeWithRowId0 ========', nodesWithRowId0);

          if (nodesWithRowId0) {
            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);
          }
        });
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

          console.log('lastItem ===', lastItem);

          researchQuery.lastItem = {
            instituteId: lastItem.instituteId,
            collectionId: lastItem.collectionId,
            databaseLinkId: lastItem.databaseLinkId,
            collectionRequestDateTime: lastItem.requestDateTime,
            collectionWayName: lastItem.collectionWayName,
            executionDivisionName: lastItem.executionDivisionName,
            collectionBeginDateTime: lastItem.startDateTime,
            collectionEndDateTime: lastItem.endDateTime,
            collectionTime: lastItem.elapsedTime,
            collectionStatusName: lastItem.status,
            collectionErrorYn: lastItem.errorYn,
            collectionErrorContents: lastItem.errorContent,
          };
          researchQuery.sort = getSortQuery();
          const response = await getSchemaCollectionList(researchQuery);
          const collectionList = response.items;
          const newGridData = [];
          for (let i = 0; i < collectionList.length; i++) {
            newGridData.push({
              id: i + oldGridData.length,
              no: i + oldGridData.length + 1,
              collectionId: collectionList[i].collectionId,
              databaseLinkId: collectionList[i].databaseLinkId,
              instituteId: collectionList[i].instituteId,
              requestDateTime: collectionList[i].collectionRequestDateTime,
              databaseId: collectionList[i].databaseId,
              startDateTime: collectionList[i].collectionBeginDateTime || '', // `collectionId`를 테이블 수로 가정
              collectionWayName: collectionList[i].collectionWayName,
              endDateTime: collectionList[i].collectionEndDateTime || '',
              tableCount: collectionList[i].collectionId || '', // `collectionId`를 테이블 수로 가정
              elapsedTime: collectionList[i].collectionTime || '00:00:00', // 기본값 "00:00:00" 설정
              status: collectionList[i].collectionStatusName || '',
              errorYn: collectionList[i].collectionErrorYn,
              executionDivisionName:
                collectionList[i].executionDivisionName || '',
              errorContent: collectionList[i].collectionErrorContents || null,
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
            databaseLinkId: selectDbInfo.value.databaseLinkId,
            query: researchQuery.query,
          };

          const sortData = await getSchemaCollectionList(sortResarchQuery);

          console.log('sortData : ', sortData);

          // 정렬 조회결과 바인딩 및 rowData 할당
          searchDataBinding(sortData);
        } else {
          // 정렬 순서 배열 생성
          const sortParts = sortState.value.map(
            (column) => `${column.headerName} ${column.sort}`
          );

          // 배열의 원소를 문자열로 병합
          sortQuery.value = sortParts.join(', ');

          const sortResearchQuery = {
            instituteId: useMetaMngInstId,
            databaseLinkId: selectDbInfo.value.databaseLinkId,
            query: researchQuery.query,
            sort: sortQuery.value,
          };

          console.log('sortResearchQuery : ', sortResearchQuery);

          const sortData = await getSchemaCollectionList(sortResearchQuery);
          console.log('sortData : ', sortData);

          searchDataBinding(sortData);
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

        const collectionList = tableResearchResult.items;

        if (collectionList.length < 0) {
          resultCount.value.count = 0;
          resultCount.value.total = 0;
        } else {
          resultCount.value.count = tableResearchResult.searchCount;
          resultCount.value.total = tableResearchResult.totalCount;

          const tempData = [];

          for (let i = 0; i < collectionList.length; i++) {
            tempData.push({
              id: i,
              no: i + 1,
              collectionId: collectionList[i].collectionId,
              databaseLinkId: collectionList[i].databaseLinkId,
              instituteId: collectionList[i].instituteId,
              requestDateTime: collectionList[i].collectionRequestDateTime,
              databaseId: collectionList[i].databaseId,
              collectionWayName: collectionList[i].collectionWayName,
              startDateTime: collectionList[i].collectionBeginDateTime || '', // `collectionId`를 테이블 수로 가정
              endDateTime: collectionList[i].collectionEndDateTime || '',
              tableCount: collectionList[i].collectionId || '', // `collectionId`를 테이블 수로 가정
              elapsedTime: collectionList[i].collectionTime || '00:00:00', // 기본값 "00:00:00" 설정
              status: collectionList[i].collectionStatusName || '',
              errorYn: collectionList[i].collectionErrorYn,
              executionDivisionName:
                collectionList[i].executionDivisionName || '',
              errorContent: collectionList[i].collectionErrorContents || null,
            });
          }

          rowData.value = tempData;
        }
      };

      //valueFormatter 함수 설정
      watchEffect(() => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD070) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD070;

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
        searchInput.value = llmAnswer.where;

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
          requestDateTime: 'CLCT_DMND_DTM',
          collectionWayName: 'OL_LNKG_YN_NM',
          startDateTime: 'CLCT_BGN_DTM',
          endDateTime: 'CLCT_END_DTM',
          elapsedTime: 'CLCT_REQ_HR',
          status: 'CLCT_STTS_NM',
          errorContent: 'CLCT_ERR_CN',
          errorYn: 'CLCT_ERR_YN',
          executionDivisionName: 'EXCN_DV_NM',
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

      // DB 연결정보 헤더 데이터
      const dbConnectionHeaderData = ref({
        dbConnectionName: '',
        dbName: '',
        dbmsName: '',
        dbmsInfo: '',
      });

      watch(
        selectDbDetails,
        async () => {
          console.log('TopComp - selectDbDetails : ', selectDbDetails.value);

          dbConnectionHeaderData.value.dbName =
            selectDbDetails.value.logicalDatabaseName;
          dbConnectionHeaderData.value.dbConnectionName =
            selectDbDetails.value.databaseLinkName;
          dbConnectionHeaderData.value.dbmsName =
            selectDbDetails.value.dbmsKindName;
          dbConnectionHeaderData.value.dbmsInfo =
            selectDbDetails.value.dbmsInformationContent;
          dbConnectionHeaderData.value.targetSchemaAggregate =
            selectDbDetails.value.targetSchemaAggregate;

          const data = {
            instituteId: selectDbDetails.value.instituteId,
            databaseLinkId: selectDbDetails.value.databaseLinkId,
            sort: '',
            query: '',
            lastItem: {},
          };

          await fetchData(data);
        },
        { immediate: true }
      );

      watch(updateManageDB, async () => {
        console.log('TopComp - updateManageDB : ', updateManageDB.value);

        const data = {
          instituteId: selectDbDetails.value.instituteId,
          databaseLinkId: selectDbDetails.value.databaseLinkId,
          sort: '',
          query: '',
          lastItem: {},
        };

        await fetchData(data);
      });

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
        searchType,
        searchInput,
        handleChangeSearchType,
        storedMfgrd070ColumnDefs,
        dbConnectionHeaderData, // DB 연결정보 헤더 데이터
        setSelectCollection,
        selectDbInfo,
      };
    },
  };
</script>

<style scoped>
  .tab-inner {
    height: 90%;
  }
  .schema-info-box > .tab-inner {
    padding: 0;
  }

  .input-table {
    table-layout: fixed;
    width: 100%;
    border-collapse: collapse;
  }

  .input-table colgroup col:nth-child(1) {
    width: 9%;
    min-width: 100px; /* Adjust based on your content */
  }

  .input-table colgroup col:nth-child(2) {
    width: 10%;
    min-width: 110px; /* Adjust based on your content */
  }

  /* If you want to make the remaining columns distribute evenly */
  .input-table colgroup col:not(:nth-child(1)):not(:nth-child(2)) {
    width: calc((100% - 19%) / 6); /* Distributes remaining space evenly */
    min-width: 100px; /* Minimum width for other columns */
  }

  /* Add some basic styling for the cells */
  .input-table th,
  .input-table td {
    padding: 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* Ensure td-col maintains consistent sizing */
  .td-col {
    min-height: 1.2em; /* Provides minimum height when empty */
    display: block;
  }
</style>
