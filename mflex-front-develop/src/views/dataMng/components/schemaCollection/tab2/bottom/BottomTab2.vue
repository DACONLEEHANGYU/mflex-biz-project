<template>
  <div class="tab-inner bottom-tab">
    <div class="grid-wrap" :class="{ 'highlight-grid': showAnimate }">
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
      <div class="grid-list">
        <AppGrid
          :rowData="rowData"
          :columnDefs="columnDefs"
          :context="context"
          rowSelection="multiple"
          @gridApi="onGridReady"
          @rowDoubleClicked="onRowDoubleClicked"
          @selectionChanged="onSelectionChanged"
          @sort-changed="handleSortChanged"
          @cellClicked="onCellClicked"
          @rowClicked="onRowClicked"
          @body-scroll="handleScrollChanged"
          @column-state-changed="onColumnStateChanged"
          :rowSelectDisabled="true"
          ref="agGrid"
        />
      </div>
      <!-- <div class="grid-bottom"></div> -->
      <AppDialog
        v-model:view="gridDialogState.view"
        :title="gridDialogState.title"
        :message="gridDialogState.message"
        :type="gridDialogState.type"
        :selectCellTypeObject="gridDialogState.selectCell"
      />

      <!-- 그리드 삭제 -->
      <AppDialog
        v-model:view="confirmDeleteHeaderInfo.view"
        :title="confirmDeleteHeaderInfo.title"
        :message="confirmDeleteHeaderInfo.message"
        @confirm="onSearchRemove"
      />

      <!-- 그리드 저장 -->
      <AppDialog
        v-model:view="saveGridSettingView.view"
        :title="saveGridSettingView.title"
        :message="saveGridSettingView.message"
        @confirm="onSetUserGridSetting"
      />
    </div>
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { reactive, ref, watch, onBeforeMount, watchEffect } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';
  import { useSchemaCollectionStore } from '@/stores/schemaCollection';
  import { storeToRefs } from 'pinia';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import {
    columnDefsUpdate,
    handleColumnStateChanged,
    onSearchRemove,
    onFilterWindowClosed,
  } from '@/utils/js/searchModule';
  import { getTableColumnInfo } from '@/utils/mflexApi/dataMng/schemaSearchApi';

  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';

  import {
    getUserGridSetting, // 사용자별 Grid 세팅 조회
    setUserGridSetting, // 사용자별 Grid 세팅 설정
    getGridDefaultData, // 그리드 기본값 조회
  } from '@/utils/mflexApi/common/commonApi'; // 공통 API 모듈

  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import { getFunctionCollectionList } from '@/utils/mflexApi/dataMng/schemaCollectionApi';

  export default {
    components: {
      TypeCellRenderer,
      // agCheckboxCellRenderer,
      GridSearch,
    },

    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },
    methods: {
      onCellClicked(value) {
        console.log('onCellClicked', value);
        this.selectedRow = value;
        this.onClickCellData(value);
      },
      onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedRow = value;
      },
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked 구성단어', value);
        this.selectedRow = value;
      },
      async onSearchEnter(value) {
        console.log('onSearchEnter', value);

        if (this.searchType === 'natural-query' && value !== '') {
          const searchInfo = {
            gridId: this.tab2GridId,
            query: value,
          };
          const llmAnswer = await getCreateQuery(searchInfo);

          await columnDefsUpdate(
            llmAnswer.data.sort,
            this.columnDefs,
            this.tab2GridId,
            this.gridApi
          );

          this.researchQuery.query = llmAnswer.data.where;
          this.searchInput = value;

          const researchQuery = {
            instituteId: this.useMetaMngInstId,
            collectionId: this.selectCollection.collectionId,
            query: llmAnswer.data.where,
            sort: llmAnswer.data.sort,
          };
          const functionResearchResult = await getFunctionCollectionList(
            researchQuery
          );

          console.log('functionResearchResult : ', functionResearchResult);

          this.searchDataBinding(functionResearchResult);
        } else {
          const researchQuery = {
            instituteId: this.useMetaMngInstId,
            collectionId: this.selectCollection.collectionId,
            query: value,
            sort: this.getSortQuery(),
          };

          this.researchQuery.query = value;
          this.searchInput = value;

          this.rowData.value = [];

          const collectionResearchResult = await getFunctionCollectionList(
            researchQuery
          );

          console.log('collectionResearchResult : ', collectionResearchResult);

          this.searchDataBinding(collectionResearchResult);
        }
      },
      onSearchSave() {
        console.log('onSearchSave');
      },
      onSearchSetup() {
        console.log('onSearchSetup');
        this.$emit('searchSetup');
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props) {
      const uiStore = useUiStore();
      const { gridColumnDefs } = storeToRefs(uiStore);

      const showAnimate = ref(false);

      const { selectTableData } = storeToRefs(useSchemaSearchTabStore());

      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);
      const { useMetaMngInstId, useInfoSysId } = userStngInfo.value;

      const { selectCollection, isExcludeFunction } = storeToRefs(
        useSchemaCollectionStore()
      );
      const { setSelectFunctionList, setIsExcludeFunction } =
        useSchemaCollectionStore();

      const gridApi = ref(null);

      const onGridReady = (params) => {
        console.log('params: ', params);
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);

        console.log('선택 노드 : ', gridApi.value.getSelectedNodes());
      };

      const onClickCellData = (data) => {
        console.log('data.value ===', data.value[0]);

        // 단어설명
        if (data.column.colId === 'wordExplan') {
          gridDialogState.view = true;
          gridDialogState.message = data.value;
          gridDialogState.selectCell = false;
          gridDialogState.title = data.column.userProvidedColDef.headerName;
          /* if (typeof data === 'object') {
            gridDialogState.selectCell = true;
          } else {
            gridDialogState.selectCell = false;
          } */

          // 이음동의어 목록
        } else if (
          data.column.colId === 'jointSynonymList' &&
          data.value[0] != null
        ) {
          gridDialogState.view = true;
          gridDialogState.selectCell = true;
          gridDialogState.message = data.value;
          gridDialogState.title = data.column.userProvidedColDef.headerName;
        } else if (
          data.column.colId === 'forbiddenList' &&
          data.value[0] != null
        ) {
          gridDialogState.view = true;
          gridDialogState.selectCell = true;
          gridDialogState.message = data.value;
          gridDialogState.title = data.column.userProvidedColDef.headerName;
        }
      };

      const tab2GridId = 'MFGRD072';
      const gridInfoDefs = ref({
        scrnGridId: tab2GridId,
        scrnId: '',
      });

      const transformGridData = (data) => {
        console.log('transformGridData-data : ', data);

        const fieldMapping = {
          NO: 'no',
          SCHM_NM: 'schemaName',
          FUNCTN_NM: 'functionName',
          FUNCTN_EXPLN: 'functionExplain',
          CLCT_EXCL_YN: 'collectionExcludeYnName',
          CLCT_EXCL_RSN_CN: 'collectionExcludeReasonContent',
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
          pinned: 'left',
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
              fieldName === 'no' ||
              fieldName === 'tableType' ||
              fieldName === 'collectionExclusionReasonCode' ||
              fieldName === 'collectionExcludeYnName'
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

        // Return array with checkbox column as the first item
        return [checkboxColumn, ...columnDefs];
      };

      // const transformGridData = (data) => {
      //   console.log('transformGridData-data : ', data);

      //   const fieldMapping = {
      //     NO: 'no',
      //     SCHM_NM: 'schemaName',
      //     FUNCTN_NM: 'functionName',
      //     FUNCTN_EXPLN: 'functionExplain',
      //     CLCT_EXCL_YN: 'collectionExcludeYnName',
      //     CLCT_EXCL_RSN_CN: 'collectionExcludeReasonContent',
      //   };

      //   return data.map((item) => {
      //     const fieldName =
      //       fieldMapping[item.gridArticleName] ||
      //       item.gridArticleName.toLowerCase();

      //     console.log('transformGridData-fieldName : ', fieldName);

      //     // 수집여부인 경우 체크박스 속성 추가
      //     if (fieldName === 'collectionExclusionReasonCode') {
      //       return {
      //         field: 'checkbox',
      //         headerName: '',
      //         headerCheckboxSelection: true,
      //         checkboxSelection: true,
      //         cellRenderer: 'agCheckboxCellRenderer',
      //         hide: !item.articleDisplayYn,
      //         width: item.articleColumnWidth,
      //         minWidth: item.articleColumnWidth,
      //         maxWidth: item.articleColumnWidth,
      //         pinned: item.articleFixedCode || '',
      //         sort: item.articleDataSortCode,
      //         sortIndex: item.articleDataSortOrder,
      //         sortable: item.articleDataSortYn,
      //         suppressSorting: !item.articleDataSortYn,
      //       };
      //     }

      //     return {
      //       cellClass:
      //         fieldName === 'no' ||
      //         fieldName === 'tableType' ||
      //         fieldName === 'collectionExclusionReasonCode'
      //           ? 'grid-cell-centered'
      //           : 'ag-left-aligned-cell',
      //       cellRenderer: null,
      //       field: fieldName,
      //       headerName: item.gridArticleKoreanName,
      //       hide: !item.articleDisplayYn,
      //       minWidth: item.articleColumnWidth,
      //       pinned: item.articleFixedCode || '',
      //       sort: item.articleDataSortCode,
      //       sortIndex: item.articleDataSortOrder,
      //       sortable: item.articleDataSortYn,
      //       suppressSorting: !item.articleDataSortYn,
      //       valueFormatter: null,
      //       width: item.articleColumnWidth,
      //     };
      //   });
      // };

      const getGridInfo = async () => {
        try {
          const userGridData = await getUserGridSetting(tab2GridId);

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

        if (!gridStorage[tab2GridId]) {
          try {
            // transformedData를 직접 받아서 처리
            const transformedData = await getGridInfo();

            console.log('transformedData : ', transformedData);

            // columnDefs 설정
            columnDefs.value = transformedData;

            // columnDefs가 설정된 후에 실행
            uiStore.setGridColumnDefs('MFGRD072', columnDefs.value);

            gridStorage[tab2GridId] = transformedData;
            // gridStorage[tab2GridId] = transformedData;
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
          columnDefs.value = gridStorage[tab2GridId];
        }

        researchQuery.sort = getSortQuery();

        await fetchData(researchQuery);
      });

      const gridDialogState = reactive({
        view: false,
        title: '선택 Cell',
        message: '',
        type: 'alert',
        selectCell: false,
      });

      const resultCount = ref({
        count: 0,
        total: 0,
      });

      const researchQuery = reactive({
        instituteId: useMetaMngInstId,
        collectionId: '',
        query: '',
        sort: '',
        lastItem: {},
      });

      const rowData = reactive({});

      const fetchData = async (data) => {
        const tempData = [];

        const response = await getFunctionCollectionList(data);

        resultCount.value.total = response.totalCount;
        resultCount.value.count = response.searchCount;

        console.log('response-getFunctionCollectionList ', response);

        for (let i = 0; i < response.items.length; i++) {
          const item = response.items[i];
          tempData.push({
            no: i + 1,
            collectionId: item.collectionId,
            databaseId: item.databaseId,
            instituteId: item.instituteId,
            schemaName: item.schemaName,
            functionName: item.functionName,
            functionExplain: item.functionExplain,
            collectionExcludeYnName: item.collectionExcludeYnName,
            collectionExcludeReasonContent: item.collectionExcludeReasonContent,
          });
        }
        rowData.value = tempData;
      };

      const columnDefs = ref([]);

      // const columnDefs = reactive([
      //   {
      //     headerName: '번호',
      //     field: 'no',
      //     cellClass: 'grid-cell-centered',
      //     width: 70,
      //     minWidth: 70,
      //   },
      //   {
      //     headerName: '',
      //     field: 'checkbox',
      //     cellClass: 'grid-cell-centered',
      //     sort: null,
      //     sortIndex: null,
      //     hide: false,
      //     width: 30,
      //     headerCheckboxSelection: true,
      //     checkboxSelection: true,
      //     minWidth: 30,
      //   },
      //   {
      //     headerName: '스키마명',
      //     field: 'schemaName',
      //     cellClass: 'grid-cell',
      //     sortable: true,
      //     sort: null,
      //     sortIndex: null,
      //     hide: false,
      //     width: 200,
      //     minWidth: 200,
      //   },
      //   {
      //     headerName: '함수명',
      //     field: 'functionName',
      //     cellClass: 'grid-cell',
      //     sortable: true,
      //     sort: null,
      //     sortIndex: null,
      //     hide: false,
      //     width: 200,
      //     minWidth: 200,
      //   },
      //   {
      //     headerName: '함수설명',
      //     field: 'functionExplain',
      //     cellClass: 'ag-left-aligned-cell',
      //     sortable: true,
      //     sort: null,
      //     sortIndex: null,
      //     hide: false,
      //     width: 200,
      //     minWidth: 200,
      //   },
      //   {
      //     headerName: '수집제외',
      //     field: 'collectionExcludeYnName',
      //     cellClass: 'grid-cell-centered',
      //     sortable: true,
      //     sort: null,
      //     sortIndex: null,
      //     hide: false,
      //     width: 200,
      //     minWidth: 200,
      //   },
      //   {
      //     headerName: '수집제외사유',
      //     field: 'collectionExcludeReasonContent',
      //     cellClass: 'grid-cell-centered',
      //     sortable: true,
      //     sort: null,
      //     sortIndex: null,
      //     hide: false,
      //     width: 130,
      //     minWidth: 70,
      //   },
      // ]);

      const searchDataBinding = (resultData) => {
        console.log('resultData : ', resultData);

        const collectionList = resultData.items;

        if (collectionList.length < 0) {
          resultCount.value.count = 0;
          resultCount.value.total = 0;
        } else {
          resultCount.value.count = resultData.searchCount;
          resultCount.value.total = resultData.totalCount;

          const tempData = [];

          for (let i = 0; i < collectionList.length; i++) {
            tempData.push({
              id: i,
              no: i + 1,
              instituteId: collectionList[i].instituteId,
              collectionId: collectionList[i].collectionId,
              databaseId: collectionList[i].databaseId,
              schemaName: collectionList[i].schemaName,
              functionName: collectionList[i].functionName,
              functionExplain: collectionList[i].functionExplain,
              collectionExcludeYnName:
                collectionList[i].collectionExcludeYnName,
              collectionExcludeReasonContent:
                collectionList[i].collectionExcludeReasonContent,
            });
          }

          rowData.value = tempData;
        }
      };

      const currentRowIndex = ref(0);

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

          researchQuery.lastItem = lastItem;
          researchQuery.sort = getSortQuery();
          const response = await getFunctionCollectionList(researchQuery);
          const collectionList = response.items;
          const newGridData = [];
          for (let i = 0; i < collectionList.length; i++) {
            newGridData.push({
              id: i + oldGridData.length,
              no: i + oldGridData.length + 1,
              collectionId: collectionList[i].collectionId,
              databaseId: collectionList[i].databaseId,
              schemaName: collectionList[i].schemaName,
              tableName: collectionList[i].tableName,
              tableKoreanName: collectionList[i].tableKoreanName,
              tableType: collectionList[i].tablePhysicalTypeName,
              tableOwnerName: collectionList[i].tableOwnerName,
              collectionExcludeYnName:
                collectionList[i].collectionExcludeYnName,
              collectionExcludeReasonContent:
                collectionList[i].collectionExcludeReasonContent,
              collectionExclusionReasonCode:
                collectionList[i].collectionExclusionReasonCode,
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
            collectionId: selectCollection.value.collectionId,
            query: researchQuery.query,
          };

          const sortData = await getFunctionCollectionList(sortResarchQuery);

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
            collectionId: selectCollection.value.collectionId,
            query: researchQuery.query,
            sort: sortQuery.value,
          };

          console.log('sortResearchQuery : ', sortResearchQuery);

          const sortData = await getFunctionCollectionList(sortResearchQuery);
          console.log('sortData : ', sortData);

          searchDataBinding(sortData);
        }

        // firstRowSelectedEvent();
      };

      const agGrid = ref(null);

      const onSetUserGridSetting = async () => {
        console.log('columnDefs.value : ', columnDefs.value);

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log('gridStorage[tab1GridId] : ', gridStorage[tab2GridId]);
        const fieldMapping = {
          no: 'NO',
          schemaName: 'SCHM_NM',
          functionName: 'FUNCTN_NM',
          functionExplain: 'FUNCTN_EXPLN',
          collectionExcludeYnName: 'CLCT_EXCL_YN',
          collectionExcludeReasonContent: 'CLCT_EXCL_RSN_CN',
        };

        const newGridStting = columnDefs.value.map((item, index) => {
          console.log('item.newGridStting : ', item);

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

        await setUserGridSetting(tab2GridId, newGridStting);
        // updateGridData(termQuery);
      };

      const saveGridSettingView = reactive({
        view: false,
        message: '그리드 설정 정보를 저장 하시겠습니까?',
      });

      const onSaveGridSettingWindow = () => {
        saveGridSettingView.view = true;
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

      const onSearchRemove = async () => {
        console.log('onSearchRemove 함수 실행 ===');

        // 그리드 기본값 호출
        const gridDefaultData = await getGridDefaultData(tab2GridId);

        console.log('gridDefaultData : ', gridDefaultData);

        // 기본값 설정
        await setUserGridSetting(tab2GridId, gridDefaultData);

        const transformedData = transformGridData(gridDefaultData);

        console.log('transformedData : ', transformedData);

        columnDefs.value = transformedData;

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        gridStorage[tab2GridId] = transformedData;
        saveGridInfoToStorage(gridStorage);

        uiStore.setGridColumnDefs(tab2GridId, columnDefs.value);
        gridApi.value.setGridOption('columnDefs', columnDefs.value);

        // await updateGridData(termQuery);
      };

      // 감시
      watch(
        () => selectCollection.value,
        async (value) => {
          console.log('Bottom1-selectCollection.value ===', value);

          if (!value) {
            rowData.value = [];
            return;
          }

          researchQuery.collectionId = value.collectionId;

          await fetchData(researchQuery);
        },
        { immediate: true }
      );

      //valueFormatter 함수 설정
      watchEffect(() => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD072) {
          return;
        }
        columnDefs.value = gridColumnDefs.value.MFGRD072;

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

          // 수집여부 필드인 경우 특별 처리
          if (col.field === 'checkbox') {
            col.field = 'checkbox';
            col.headerCheckboxSelection = true;
            col.checkboxSelection = true;
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

        console.log('columnDefs 변경 감지 후 columnDefs : ', columnDefs);
        console.log('watchEffect 정상동작');
      });

      //그리드 칼럼 이동 및 사이즈 변경 등 이벤트 발생시 그리드 설정 값 업데이트
      const onColumnStateChanged = (newColumnState) => {
        // handleColumnStateChanged 호출 시 필요한 값을 전달
        handleColumnStateChanged(
          gridApi,
          newColumnState,
          tab2GridId,
          columnDefs
        );
      };

      const onSelectionChanged = (selectRow) => {
        const selectedRows = gridApi.value.getSelectedRows();
        console.log('selectedRows : ', selectedRows);
        setSelectFunctionList(selectedRows);
      };

      // 수집제외 설정 시 재조회
      watch(isExcludeFunction, async (value) => {
        console.log('isExcludeTable.value ===', value);
        if (value) {
          await fetchData(researchQuery);
          setIsExcludeFunction(false);
        }
      });

      return {
        agGrid,
        rowData,
        columnDefs,
        gridDialogState,
        onClickCellData,
        showAnimate,
        onGridReady,
        handleSortChanged,
        resultCount,
        selectCollection,
        handleScrollChanged,
        useMetaMngInstId,
        searchDataBinding,
        getSortQuery,
        researchQuery,
        tab2GridId,
        gridInfoDefs,
        onSetUserGridSetting,
        saveGridSettingView,
        onSaveGridSettingWindow,
        onColumnStateChanged,
        onDeleteHeaderInfo,
        onSearchRemove,
        confirmDeleteHeaderInfo,
        onSelectionChanged,
      };
    },
  };
</script>
