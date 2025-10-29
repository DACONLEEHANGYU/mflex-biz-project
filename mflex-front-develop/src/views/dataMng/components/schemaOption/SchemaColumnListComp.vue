<template>
  <div class="full-contents">
    <div class="content-top pt5">
      <div class="title-top">
        <div class="title-s">
          컬럼명 목록
          <AppTooltip :htmlContent="getTooltipById('columnList')"> </AppTooltip>
        </div>
      </div>
    </div>
    <div class="grid-wrap column-grid">
      <div class="grid-top">
        <div class="grid-search">
          <div class="search-result">
            <i class="icon"></i><span class="result-title">조회결과 :</span
            ><strong>{{ resultCount.total }}</strong
            >건
          </div>
        </div>
      </div>
      <div class="grid-list">
        <AppGrid
          :rowData="rowData"
          :columnDefs="columnDefs"
          :defaultColDef="defaultColDef"
          @body-scroll="handleScrollChanged"
          @sort-changed="handleSortChanged"
          @column-state-changed="handleColumnStateChanged"
          @cell-value-changed="handleCellValueChanged"
          @gridApi="handleSetGridApi"
          :context="context"
          rowSelection="single"
          @rowClicked="onRowClicked"
          ref="agGrid"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import {
    ref,
    reactive,
    computed,
    watch,
    nextTick,
    onMounted,
    onBeforeMount,
    watchEffect,
  } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useUiStore } from '@/stores/ui';
  import { useActualizingStore } from '@/stores/actualizing';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useAuthStore } from '@/stores/auth';
  import { useSchemaOptionStore } from '@/stores/schemaOption';

  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';

  import {
    getColumnList,
    patchChangeColumn,
  } from '@/utils/mflexApi/dataMng/schemaOptionsApi';

  import {
    getUserGridSetting,
    setUserGridSetting,
    getGridDefaultData,
  } from '@/utils/mflexApi/common/commonApi';

  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import CheckboxCellrenderer from '@/utils/CheckboxCellrenderer';

  export default {
    components: {
      GridSearch,
      AppTooltip,
      AppWindow,
      CheckboxCellrenderer,
    },
    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    methods: {
      onRowClicked(value) {
        console.log('onRowClicked ', value);
        this.selectedRow = value;

        const selectedRow = document.querySelectorAll(
          '.column-grid [class~="ag-row-selected"]'
        );
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        const clickedNode = document.querySelector(
          `.column-grid [row-id="${clickNode}"]`
        );
        clickedNode.classList.add('ag-row-selected');

        this.setSelectColumnData(value);
      },
    },
    setup(props) {
      // === Store 초기화 ===
      const actualizingStore = useActualizingStore();
      const { setSelectColumnData, setIsSaveColumnRefine } = actualizingStore;
      const { isSaveColumnRefine } = storeToRefs(actualizingStore);

      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);
      const { useMetaMngInstId, useInfoSysId, useDctnryId } =
        userStngInfo.value;

      const uiStore = useUiStore();
      const { getTooltipById } = useHelpToolTipStore();
      const { selectTableInfo } = storeToRefs(useSchemaOptionStore());

      // === Refs 정의 ===
      const agGrid = ref(null);
      const gridApi = ref(null);
      const rowData = reactive({});
      const columnDefs = ref([]);
      const selectedData = ref({});

      // === Grid 설정 ===
      const columnRefineGridId = ref('MFGRD520');
      const gridInfoDefs = ref({
        scrnGridId: columnRefineGridId,
        scrnId: '',
      });
      const resultCount = ref({
        count: 10,
        total: 20,
      });
      const defaultColDef = ref({
        flex: 1,
        minWidth: 100,
        resizable: true,
        sortable: true,
        filter: true,
        editable: false,
      });

      // === Search Body ===
      const searchBody = ref({
        instituteId: useMetaMngInstId,
        informationSystemId: useInfoSysId,
        lastItem: {},
        query: '',
        sort: '',
      });

      // === Grid API Handler ===
      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      // === 셀 값 변경 이벤트 핸들러 ===
      const handleCellValueChanged = async (event) => {
        const { data, colDef, newValue, oldValue } = event;

        console.log('Cell value changed:', {
          field: colDef.field,
          oldValue: oldValue,
          newValue: newValue,
          rowData: data,
        });

        // columnExplain 필드만 처리
        if (colDef.field === 'columnExplain') {
          try {
            const apiData = {
              instituteId: data.instituteId,
              databaseId: data.databaseId,
              table: data.table,
              column: data.originalColumnName,
              columnExplain: newValue,
              schemaName: data.schemaName,
              privacyYn: data.privacyYn || false,
              encryptYn: data.encryptYn || false,
              releaseYn: data.releaseYn || false,
            };

            console.log('columnExplain 업데이트 API 호출:', apiData);

            const response = await patchChangeColumn(apiData);

            // if (
            //   response &&
            //   (response.status === 200 || response.success !== false)
            // ) {
            //   console.log('columnExplain 업데이트 성공:', newValue);
            //   data.columnExplain = newValue;
            // } else {
            //   throw new Error(response.message || 'API 호출 실패');
            // }
          } catch (error) {
            console.error('columnExplain 업데이트 오류:', error);
            event.node.setDataValue('columnExplain', oldValue);
            data.columnExplain = oldValue;
            // alert(
            //   `컬럼 설명 업데이트 실패: ${error.message || '알 수 없는 오류'}`
            // );
          }
        }
      };

      // === Data Transform 함수 ===
      const transformGridData = (data) => {
        console.log('transformGridData data : ', data);

        const fieldMapping = {
          NO: 'no',
          COL_NM: 'columnName',
          PWD_YN: 'encryptYn',
          PUB_YN: 'releaseYn',
          PER_YN: 'privacyYn',
          COL_EXPN: 'columnExplain',
        };

        return data.map((item) => {
          const fieldName =
            fieldMapping[item.gridArticleName] ||
            item.gridArticleName.toLowerCase();

          // 기본 설정
          const columnConfig = {
            field: fieldName,
            headerName: item.gridArticleKoreanName,
            hide: !item.articleDisplayYn,
            minWidth: item.articleColumnWidth,
            pinned: item.articleFixedCode || '',
            sort: item.articleDataSortCode,
            sortIndex: item.articleDataSortOrder,
            suppressSorting: !item.articleDataSortYn,
            maxWidth: item.articleColumnWidth,
            filter: true,
            valueFormatter: (params) => {
              return params.value;
            },
            editable: fieldName === 'columnExplain',
          };

          // 체크박스 필드에 CheckboxCellrenderer 적용
          if (['encryptYn', 'releaseYn', 'privacyYn'].includes(fieldName)) {
            columnConfig.cellClass = 'grid-cell-centered';
            columnConfig.cellRenderer = CheckboxCellrenderer;
            columnConfig.editable = false;
          } else {
            columnConfig.cellClass =
              fieldName === 'refinedColumnKoreanNameErrorYn' ||
              fieldName === 'no' ||
              fieldName === 'updateDateTime'
                ? 'grid-cell-centered'
                : 'ag-left-aligned-cell';
          }

          return columnConfig;
        });
      };

      // === Grid 정보 조회 ===
      const getGridInfo = async () => {
        try {
          const userGridData = await getUserGridSetting(
            columnRefineGridId.value
          );
          const transformedData = await transformGridData(userGridData);
          return transformedData;
        } catch (error) {
          console.error('Error in getGridInfo:', error);
          throw error;
        }
      };

      // === 데이터 조회 ===
      const fetchData = async (requestBody) => {
        let response;
        if (requestBody) {
          response = await getColumnList(requestBody);
        } else {
          response = await getColumnList(searchBody.value);
        }

        console.log('fetchData response: ', response);

        resultCount.value.count = response.searchCount;
        resultCount.value.total = response.length;

        const columnList = response;
        const tempData = [];

        for (let i = 0; i < columnList.length; i++) {
          tempData.push({
            id: i,
            no: i + 1,
            instituteId: columnList[i].instituteId,
            informationSystemId: columnList[i].informationSystemId,
            table: columnList[i].tableName,
            columnKoreanName: columnList[i].columnKoreanName,
            databaseId: columnList[i].databaseId,
            columnName: columnList[i].columnKoreanName
              ? `${columnList[i].columnKoreanName}(${columnList[i].columnName})`
              : columnList[i].columnName,
            originalColumnName: columnList[i].columnName,
            encryptYn: columnList[i].encryptYn,
            releaseYn: columnList[i].releaseYn,
            privacyYn: columnList[i].privacyYn,
            schemaName: columnList[i].schemaName,
            columnExplain: columnList[i].columnExplain,
            updateDateTime: columnList[i].updateDateTime,
          });
        }

        rowData.value = tempData;

        if (rowData.value.length > 0) {
          nextTick(async () => {
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
            const nodesWithRowId0 = document.querySelector(
              '.column-grid [row-id="0"]'
            );

            if (nodesWithRowId0) {
              nodesWithRowId0.classList.add('ag-row-selected');
              nodesWithRowId0.classList.add('ag-row-focus');
              nodesWithRowId0.setAttribute('aria-selected', true);
            }

            selectedData.value = firstRowData.data;
          });
        }

        setSelectColumnData(selectedData.value);
      };

      // === Lifecycle Hooks ===
      onBeforeMount(async () => {
        const gridStorage = JSON.parse(getGridInfoFromStorage());

        if (!gridStorage[columnRefineGridId.value]) {
          try {
            const transformedData = await getGridInfo();
            columnDefs.value = transformedData;

            uiStore.setGridColumnDefs('MFGRD520', columnDefs.value);
            gridStorage[columnRefineGridId.value] = transformedData;
            saveGridInfoToStorage(gridStorage);

            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', columnDefs.value);
            }
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          columnDefs.value = gridStorage[columnRefineGridId.value];
        }
      });

      onMounted(async () => {
        // 초기 데이터 조회
        fetchData();
      });

      // === Watch Effects ===
      watchEffect(async () => {
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD520) {
          return;
        }

        columnDefs.value = gridColumnDefs.value.MFGRD520;

        columnDefs.value = columnDefs.value.map((col) => {
          const fieldName = col.field;

          const updatedCol = {
            headerName: col.headerName,
            field: fieldName,
            hide: col.hide,
            pinned: col.pinned,
            cellClass: col.cellClass,
            width: col.width,
            sort: col.sort,
            sortIndex: col.sortIndex,
            minWidth: col.minWidth,
            maxWidth: col.maxWidth,
            suppressSorting: true,
            comparator: () => 0,
            valueFormatter: null,
            filter: true,
          };

          // 체크박스 필드에 CheckboxCellrenderer 적용
          if (['encryptYn', 'releaseYn', 'privacyYn'].includes(fieldName)) {
            updatedCol.cellRenderer = CheckboxCellrenderer;
            updatedCol.editable = false;
          } else if (fieldName === 'columnExplain') {
            updatedCol.cellRenderer = null;
            updatedCol.editable = true;
          } else {
            updatedCol.cellRenderer = null;
            updatedCol.editable = false;
          }

          return updatedCol;
        });

        console.log('watchEffect - Grid 데이터 설정 후 : ', columnDefs.value);
      });

      // === Watchers ===
      watch(selectTableInfo, async (newValue) => {
        const params = {
          instituteId: newValue.instituteId,
          informationSystemId: newValue.informationSystemId,
          dbSchema: newValue.dbSchema,
          table: newValue.tableName,
        };

        await fetchData(params);
      });

      // === Return ===
      return {
        // Data
        rowData,
        columnDefs,
        defaultColDef,
        selectedData,

        // Grid 설정
        columnRefineGridId,
        gridInfoDefs,
        resultCount,

        agGrid,
        gridApi,

        // 검색
        searchBody,

        // Functions
        fetchData,
        handleSetGridApi,
        handleCellValueChanged,
        setSelectColumnData,
        getTooltipById,
        useSchemaOptionStore,
      };
    },
  };
</script>
