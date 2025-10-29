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

  import { columnDefsUpdate } from '@/utils/js/searchModule';
  import {
    handleColumnStateChanged,
    onSearchRemove,
    onFilterWindowClosed,
  } from '@/utils/js/searchModule';

  import GridSearch from '@/components/grid/GridSearch.vue';

  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';

  import { getCreateQuery } from '@/utils/mflexApi/llm/gridPromptTemplateApi.js';
  import { getTableCollectionList } from '@/utils/mflexApi/dataMng/schemaCollectionApi';

  import {
    getUserGridSetting, // 사용자별 Grid 세팅 조회
    setUserGridSetting, // 사용자별 Grid 세팅 설정
    getGridDefaultData, // 그리드 기본값 조회
  } from '@/utils/mflexApi/common/commonApi'; // 공통 API 모듈

  export default {
    components: {
      TypeCellRenderer,
      GridSearch,
    },

    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },
    methods: {
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
            gridId: this.tab1GridId,
            query: value,
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
            collectionId: this.selectCollection.collectionId,
            query: llmAnswer.data.where,
            sort: llmAnswer.data.sort,
          };
          const tableResearchResult = await getTableCollectionList(
            researchQuery
          );

          console.log('tableResearchResult : ', tableResearchResult);

          this.searchDataBinding(tableResearchResult);
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

          const collectionResearchResult = await getTableCollectionList(
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

      const { selectCollection, isExcludeTable } = storeToRefs(
        useSchemaCollectionStore()
      );
      const { setSelectTableList, setIsExcludeTable } =
        useSchemaCollectionStore();

      const agGrid = ref(null);
      const gridApi = ref(null);

      const tab1GridId = 'MFGRD071';
      const gridInfoDefs = ref({
        scrnGridId: tab1GridId,
        scrnId: '',
      });

      const searchInput = ref('');

      const onGridReady = (params) => {
        console.log('params: ', params);
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);

        console.log('선택 노드 : ', gridApi.value.getSelectedNodes());
      };

      const gridDialogState = reactive({
        view: false,
        title: '선택 Cell',
        message: '',
        type: 'alert',
        selectCell: false,
      });

      const researchQuery = reactive({
        instituteId: useMetaMngInstId,
        collectionId: '',
        query: '',
        sort: '',
        lastItem: {},
      });

      const rowData = reactive({});

      const resultCount = ref({
        count: 0,
        total: 0,
      });

      const transformGridData = (data) => {
        console.log('transformGridData-data : ', data);

        const fieldMapping = {
          NO: 'no',
          CLCT_EXCL_RSN_CD: 'collectionExclusionReasonCode',
          SCHM_NM: 'schemaName',
          TBL_NM: 'tableName',
          TBL_KORN_NM: 'tableKoreanName',
          TBL_PHYS_TYPE_NM: 'tablePhysicalTypeName',
          TBL_OWNR_NAME: 'tableOwnerName',
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
          // valueGetter: (params) => {
          //   // Return boolean value based on data
          //   return (
          //     params.data.checkbox === true || params.data.checkbox === 'Y'
          //   );
          // },
          // valueSetter: (params) => {
          //   // Update data when checkbox is toggled
          //   params.data.checkbox = params.newValue;
          //   return true;
          // },
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
              fieldName === 'tablePhysicalTypeName' ||
              fieldName === 'collectionExclusionReasonCode' ||
              fieldName === 'collectionExcludeYnName' ||
              fieldName === 'checkbox' ||
              fieldName === 'tableOwnerName'
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
          const userGridData = await getUserGridSetting(tab1GridId);

          const transformedData = await transformGridData(userGridData);

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
            uiStore.setGridColumnDefs('MFGRD071', columnDefs.value);

            gridStorage[tab1GridId] = transformedData;
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
            // await updateGridData(termQuery);
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          columnDefs.value = gridStorage[tab1GridId];
        }

        researchQuery.sort = getSortQuery();

        await fetchData(researchQuery);
      });

      const fetchData = async (data) => {
        const response = await getTableCollectionList(data);

        console.log('response-getTableCollectionList ', response);

        resultCount.value.total = response.totalCount;
        resultCount.value.count = response.searchCount;

        const tempData = [];

        for (let i = 0; i < response.items.length; i++) {
          const item = response.items[i];

          tempData.push({
            no: i + 1,
            id: i,
            instituteId: item.instituteId,
            collectionId: item.collectionId,
            databaseId: item.databaseId,
            schemaName: item.schemaName,
            tableName: item.tableName,
            tableKoreanName: item.tableKoreanName,
            tablePhysicalTypeName: item.tablePhysicalTypeName,
            tableOwnerName: item.tableOwnerName,
            collectionExcludeYnName: item.collectionExcludeYnName,
            collectionExcludeReasonContent: item.collectionExcludeReasonContent,
            collectionExclusionReasonCode: item.collectionExclusionReasonCode,
            collectionExclusionReasonName: item.collectionExclusionReasonName,
          });
        }

        rowData.value = tempData;
      };

      // fetchData();

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
          const response = await getTableCollectionList(researchQuery);
          const collectionList = response.items;
          const newGridData = [];
          for (let i = 0; i < collectionList.length; i++) {
            newGridData.push({
              id: i + oldGridData.length,
              no: i + oldGridData.length + 1,
              instituteId: collectionList[i].instituteId,
              collectionId: collectionList[i].collectionId,
              databaseId: collectionList[i].databaseId,
              schemaName: collectionList[i].schemaName,
              tableName: collectionList[i].tableName,
              tableKoreanName: collectionList[i].tableKoreanName,
              tablePhysicalTypeName: collectionList[i].tablePhysicalTypeName,
              tableOwnerName: collectionList[i].tableOwnerName,
              collectionExcludeYnName:
                collectionList[i].collectionExcludeYnName,
              collectionExcludeReasonContent:
                collectionList[i].collectionExcludeReasonContent,
              collectionExclusionReasonCode:
                collectionList[i].collectionExclusionReasonCode,
              collectionExclusionReasonName:
                collectionList[i].collectionExclusionReasonName,
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

      watch(
        selectTableData,
        async (value) => {
          console.log('bottomTab1 selectTableData.value ===', value);

          const tableBaseQuery = {
            instituteId: value.instituteId,
            informationSystemId: value.informationSystemId,
            databaseId: value.databaseId,
            schemaName: value.schemaName,
            tableName: value.tableName,
          };

          // const tableColumnData = await getTableColumnInfo(tableBaseQuery);

          researchQuery.sort = getSortQuery();

          fetchData(researchQuery);
          // rowData.value = [];
          // console.log('tableColumnData ===', tableColumnData);

          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 1000);
        },
        { immediate: true }
      );

      const columnDefs = ref([]);

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
              instituteId: collectionList[i].instituteId,
              collectionId: collectionList[i].collectionId,
              databaseId: collectionList[i].databaseId,
              schemaName: collectionList[i].schemaName,
              tableName: collectionList[i].tableName,
              tableKoreanName: collectionList[i].tableKoreanName,
              tablePhysicalTypeName: collectionList[i].tablePhysicalTypeName,
              tableOwnerName: collectionList[i].tableOwnerName,
              collectionExcludeYnName:
                collectionList[i].collectionExcludeYnName,
              collectionExcludeReasonContent:
                collectionList[i].collectionExcludeReasonContent,
              collectionExclusionReasonCode:
                collectionList[i].collectionExclusionReasonCode,
              collectionExclusionReasonName:
                collectionList[i].collectionExclusionReasonName,
            });
          }

          rowData.value = tempData;
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
            collectionId: selectCollection.value.collectionId,
            query: researchQuery.query,
          };

          const sortData = await getTableCollectionList(sortResarchQuery);

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

          const sortData = await getTableCollectionList(sortResearchQuery);
          console.log('sortData : ', sortData);

          searchDataBinding(sortData);
        }

        // firstRowSelectedEvent();
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

          // const data = {
          //   instituteId: value.instituteId,
          //   collectionId: value.collectionId,
          // };

          researchQuery.collectionId = value.collectionId;

          await fetchData(researchQuery);
        },
        { immediate: true }
      );

      //valueFormatter 함수 설정
      watchEffect(() => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { gridColumnDefs } = storeToRefs(uiStore);

        // gridColumnDefs가 초기화되지 않았다면 watchEffect 중단
        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD071) {
          return;
        }

        columnDefs.value = gridColumnDefs.value.MFGRD071;

        columnDefs.value = columnDefs.value.map((col) => {
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
            // valueFormatter:
            //   col.field === 'checkbox'
            //     ? (params) => {
            //         // 'Y' 또는 true이면 체크, 그 외에는 미체크
            //         return true;
            //       }
            //     : null,
            cellRenderer: cellRenderer,
          };
        });

        console.log('columnDefs 변경 감지 후 columnDefs : ', columnDefs);
        console.log('watchEffect 정상동작');
      });

      const onSetUserGridSetting = async () => {
        console.log('columnDefs.value : ', columnDefs.value);

        const gridStorage = JSON.parse(getGridInfoFromStorage());
        console.log('gridStorage[tab1GridId] : ', gridStorage[tab1GridId]);
        const fieldMapping = {
          no: 'NO',
          checkbox: 'CLCT_EXCL_RSN_CD',
          schemaName: 'SCHM_NM',
          tableName: 'TBL_NM',
          tableKoreanName: 'TBL_KORN_NM',
          tablePhysicalTypeName: 'TBL_PHYS_TYPE_NM',
          tableOwnerName: 'TBL_OWNR_NAME',
          collectionExcludeYnName: 'CLCT_EXCL_YN',
          collectionExclusionReasonName: 'CLCT_EXCL_YN',
          collectionExcludeReasonContent: 'CLCT_EXCL_RSN_CN',
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

      const onSelectionChanged = (selectRow) => {
        const selectedRows = gridApi.value.getSelectedRows();
        console.log('selectedRows : ', selectedRows);
        setSelectTableList(selectedRows);
      };

      // 수집제외 설정 시 재조회
      watch(isExcludeTable, async (value) => {
        console.log('isExcludeTable.value ===', value);
        if (value) {
          await fetchData(researchQuery);
          setIsExcludeTable(false);
        }
      });

      return {
        agGrid,
        gridApi,
        rowData,
        columnDefs,
        gridDialogState,
        onGridReady,
        handleSortChanged,
        showAnimate,
        searchInput,
        resultCount,
        handleScrollChanged,
        getTableCollectionList,
        selectCollection,
        getSortQuery,
        researchQuery,
        searchDataBinding,
        useMetaMngInstId,
        gridInfoDefs,
        onSetUserGridSetting,
        saveGridSettingView,
        onSaveGridSettingWindow,
        confirmDeleteHeaderInfo,
        onDeleteHeaderInfo,
        onSearchRemove,
        onFilterWindowClosed,
        onColumnStateChanged,
        onSelectionChanged,
      };
    },
  };
</script>

<style scoped>
  .tab-inner {
    height: 90%;
  }
</style>
