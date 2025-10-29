<template>
  <div class="full-contents">
    <div class="content-top pt5">
      <div class="title-top">
        <div class="title-s">
          <div>테이블명 목록</div>
          <AppTooltip :htmlContent="getTooltipById('columnList')"> </AppTooltip>
        </div>
      </div>
      <div class="input-form" style="flex: 1">
        <table class="input-table">
          <colgroup>
            <col width="15%" />
            <col width="" />
          </colgroup>
          <tbody>
            <tr>
              <th>DB/스키마명</th>
              <td class="manage-input-form-td">
                <div class="td-col">
                  <div>
                    <select
                      class="input-select"
                      v-model="selectDbSchema"
                      style="width: 100%"
                    >
                      <option
                        v-for="schema in dbSchemaList"
                        :key="schema.dbSchema"
                        :value="schema.dbSchema"
                      >
                        {{ schema.dbSchema }}
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
    <div class="grid-wrap table-grid">
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
          @body-scroll="handleScrollChanged"
          @column-state-changed="handleColumnStateChanged"
          @gridApi="handleSetGridApi"
          :context="context"
          rowSelection="single"
          @rowClicked="onRowClicked"
          ref="agTableGrid"
        />
      </div>
    </div>
  </div>
</template>

<script>
  import {
    ref,
    reactive,
    watch,
    nextTick,
    onMounted,
    onBeforeMount,
    watchEffect,
  } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useUiStore } from '@/stores/ui';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { useAuthStore } from '@/stores/auth';
  import { useSchemaOptionStore } from '@/stores/schemaOption';

  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';

  import {
    getDbSchemaList,
    getTableList,
  } from '@/utils/mflexApi/dataMng/schemaOptionsApi';

  import { getUserGridSetting } from '@/utils/mflexApi/common/commonApi';

  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';

  export default {
    components: {
      GridSearch,
      AppTooltip,
      AppWindow,
    },
    data() {
      return {
        context: null,
        selectedRow: {},
        dbSchemaList: [],
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
          '.table-grid [class~="ag-row-selected"]'
        );
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        const clickedNode = document.querySelector(
          `.table-grid [row-id="${clickNode}"]`
        );
        clickedNode.classList.add('ag-row-selected');

        this.setSelectTableInfo(value);
      },
    },
    setup(props) {
      // === Store 초기화 ===
      const authStore = useAuthStore();
      const { userMetaMngInstListInfo, userStngInfo } = storeToRefs(authStore);
      const { useMetaMngInstId, useInfoSysId } = userStngInfo.value;

      const uiStore = useUiStore();
      const { getTooltipById } = useHelpToolTipStore();
      const { setSelectTableInfo } = useSchemaOptionStore();

      // === Refs 정의 ===
      const agTableGrid = ref(null);
      const gridApi = ref(null);
      const rowData = reactive({});
      const columnDefs = ref([]);
      const dbSchemaList = ref([]);
      const selectDbSchema = ref('');
      const selectedData = ref({});

      // === Grid 설정 ===
      const columnRefineGridId = ref('MFGRD510');
      const gridInfoDefs = ref({
        scrnGridId: columnRefineGridId,
        scrnId: '',
      });
      const resultCount = ref({
        count: 10,
        total: 20,
      });

      // === Search Body ===
      const searchBody = ref({
        instituteId: useMetaMngInstId,
        informationSystemId: useInfoSysId,
        dbSchema: selectDbSchema.value,
        lastItem: {},
        query: '',
        sort: '',
      });

      // === Grid API Handler ===
      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      // === Data Transform 함수 ===
      const transformGridData = (data) => {
        console.log('transformGridData-data : ', data);

        const fieldMapping = {
          NO: 'no',
          TBL_NM: 'tableName',
          TBL_KORN_NM: 'tableKoreanName',
          TBL_COL_CNT: 'tableColumnCount',
        };

        return data.map((item) => {
          const fieldName =
            fieldMapping[item.gridArticleName] ||
            item.gridArticleName.toLowerCase();

          const columnConfig = {
            cellClass:
              fieldName === 'no' || fieldName === 'tableColumnCount'
                ? 'grid-cell-centered'
                : 'ag-left-aligned-cell',
            field: fieldName,
            headerName: item.gridArticleKoreanName,
            hide: !item.articleDisplayYn,
            minWidth: item.articleColumnWidth,
            pinned: item.articleFixedCode || '',
            sort: item.articleDataSortCode,
            sortIndex: item.articleDataSortOrder,
            sortable: false,
            suppressSorting: !item.articleDataSortYn,
            width: item.articleColumnWidth,
          };
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
          console.log('Transformed Grid Data:', transformedData);
          return transformedData;
        } catch (error) {
          console.error('Error in getGridInfo:', error);
          throw error;
        }
      };

      // === 데이터 조회 ===
      const fetchData = async (requestBody) => {
        console.log('requestBody : ', requestBody);

        let response;
        if (requestBody) {
          response = await getTableList(requestBody);
        } else {
          response = await getTableList(searchBody.value);
        }

        resultCount.value.count = response.searchCount;
        resultCount.value.total = response.length;

        const tableList = response;
        const tempData = [];

        for (let i = 0; i < tableList.length; i++) {
          tempData.push({
            id: i,
            no: i + 1,
            instituteId: tableList[i].instituteId,
            informationSystemId: tableList[i].informationSystemId,
            tableColumnCount: tableList[i].columnCount,
            tableKoreanName: tableList[i].tableKoreanName,
            tableName: tableList[i].tableName,
            schemaName: tableList[i].schemaName,
            databaseId: tableList[i].databaseId,
            dbSchema: selectDbSchema.value,
            updateDateTime: tableList[i].updateDateTime,
            updater: tableList[i].updater,
          });
        }

        rowData.value = tempData;

        if (rowData.value.length > 0) {
          nextTick(async () => {
            const firstRowData =
              agTableGrid.value.gridApi.getDisplayedRowAtIndex(0);
            const nodesWithRowId0 = document.querySelector(
              '.table-grid [row-id="0"]'
            );

            if (nodesWithRowId0) {
              nodesWithRowId0.classList.add('ag-row-selected');
              nodesWithRowId0.classList.add('ag-row-focus');
              nodesWithRowId0.setAttribute('aria-selected', true);
            }

            selectedData.value = firstRowData.data;
            setSelectTableInfo(selectedData.value);
          });
        }
      };

      // === Lifecycle Hooks ===
      onBeforeMount(async () => {
        // DB 스키마 목록 조회
        const params = {
          instituteId: useMetaMngInstId,
          informationSystemId: useInfoSysId,
        };

        const dbSchemaListRes = await getDbSchemaList(params);
        dbSchemaList.value = dbSchemaListRes;
        selectDbSchema.value = dbSchemaList.value[0]?.dbSchema || '';

        console.log('dbSchemaList : ', dbSchemaList);

        // Grid 설정 초기화
        const gridStorage = JSON.parse(getGridInfoFromStorage());

        if (!gridStorage[columnRefineGridId.value]) {
          try {
            const transformedData = await getGridInfo();
            columnDefs.value = transformedData;

            uiStore.setGridColumnDefs('MFGRD510', columnDefs.value);
            gridStorage[columnRefineGridId.value] = transformedData;
            saveGridInfoToStorage(gridStorage);

            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', columnDefs.value);
            }

            console.log(
              '그리드데이터 할당 =============== : ',
              columnDefs.value
            );
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          columnDefs.value = gridStorage[columnRefineGridId.value];
        }

        // 초기 데이터 조회
        const searchParams = {
          instituteId: useMetaMngInstId,
          informationSystemId: useInfoSysId,
          dbSchema: selectDbSchema.value,
        };

        await fetchData(searchParams);
      });

      onMounted(async () => {
        await fetchData();
      });

      // === Watch Effects ===
      watchEffect(async () => {
        console.log('columnDefs 변경 감지');
        const uiStore = useUiStore();
        const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);

        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD510) {
          return;
        }

        columnDefs.value = gridColumnDefs.value.MFGRD510;

        console.log(
          'watchEffect - Grid 데이터 설정 전 : ',
          gridColumnDefs.value.MFGRD510
        );

        columnDefs.value = columnDefs.value.map((col) => {
          const fieldName = col.field;

          return {
            headerName: col.headerName,
            field: fieldName,
            hide: col.hide,
            pinned: col.pinned,
            sortable: false,
            cellClass: col.cellClass,
            width: col.width,
            sort: col.sort,
            sortIndex: col.sortIndex,
            minWidth: col.minWidth,
            suppressSorting: true,
            comparator: () => 0,
            valueFormatter: null,
            cellRenderer: null,
          };
        });
      });

      // === Watchers ===
      watch(selectDbSchema, async (newValue) => {
        console.log('selectDbSchema changed:', newValue);
        searchBody.value.dbSchema = newValue;
        searchBody.value.query = '';
        await fetchData(searchBody.value);
      });

      // === Return ===
      return {
        // Data
        rowData,
        columnDefs,
        dbSchemaList,
        selectDbSchema,
        selectedData,

        // Grid 설정
        columnRefineGridId,
        gridInfoDefs,
        resultCount,
        agTableGrid,
        gridApi,

        // 검색
        searchBody,

        // Functions
        fetchData,
        handleSetGridApi,
        setSelectTableInfo,
        getTooltipById,
      };
    },
  };
</script>
