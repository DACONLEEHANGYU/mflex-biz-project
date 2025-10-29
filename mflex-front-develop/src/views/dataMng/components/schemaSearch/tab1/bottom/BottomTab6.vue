<template>
  <!-- <div v-if="!searchState" class="no-data">데이터가 없습니다.</div> -->
  <div class="tab-inner bottom-tab">
    <div
      class="col col-2 bottom-box"
      :class="{ 'highlight-grid': showAnimate }"
    >
      <div class="grid-wrap relation-index-grid">
        <div class="grid-top"></div>
        <div class="grid-list">
          <AppGrid
            :rowData="rowData"
            :columnDefs="leftColumnDefs"
            :context="context"
            rowSelection="single"
            @rowClicked="onRowClicked"
            @rowDoubleClicked="onRowDoubleClicked"
            ref="agGrid"
          />
        </div>
        <!-- <div class="grid-bottom"></div> -->
      </div>

      <div class="grid-wrap">
        <div class="grid-top"></div>
        <div class="grid-list">
          <AppGrid
            :rowData="rightRowData"
            :columnDefs="columnDefs"
            :context="context"
            rowSelection="single"
            @rowDoubleClicked="onRowDoubleClicked"
            ref="agGrid"
          />
        </div>
        <!-- <div class="grid-bottom"></div> -->
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { reactive, ref, nextTick, watch, onActivated } from 'vue';
  import { DragCol } from 'vue-resizer';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';
  import { storeToRefs } from 'pinia';

  import {
    getTableIndex, // 테이블 인덱스 정보 조회
    getTableIndexDetail, // 테이블 인덱스 상세
  } from '@/utils/mflexApi/dataMng/schemaSearchApi';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';

  const { selectTableData } = storeToRefs(useSchemaSearchTabStore());

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
      async onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedRow = value;

        const indexDetailQuery = {
          instituteId: value.instituteId,
          informationSystemId: value.informationSystemId,
          databaseId: value.databaseId,
          schemaName: value.schemaName,
          tableName: value.tableName,
          indexName: value.indexName,
        };

        const indexDetailData = await getTableIndexDetail(indexDetailQuery);

        this.fetchIndexDetails(indexDetailData);

        const selectedRow = document.querySelectorAll(
          '.relation-index-grid [class~="ag-row-selected"]'
        );

        // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        const clickedNode = document.querySelector(
          `.relation-index-grid [row-id="${clickNode}"]`
        );
        clickedNode.classList.add('ag-row-selected');
      },
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
        this.selectedRow = value;
      },
      onSearchEnter(value) {
        console.log('onSearchEnter', value);
      },
      onSearchSave() {
        console.log('onSearchSave');
      },
      onSearchSetup() {
        console.log('onSearchSetup');
        this.$emit('searchSetup');
      },
      onSearchRemove() {
        console.log('onSearchRemove');
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props) {
      const searchState = ref(false);

      const showAnimate = ref(false);

      const rowData = reactive([]);
      const rightRowData = reactive([]);

      const leftColumnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
          minWidth: 60,
        },
        {
          headerName: '인덱스명',
          field: 'indexName',
          cellClass: 'grid-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '인덱스 컬럼 구성 내역',
          field: 'indexComposition',
          cellClass: 'grid-cell',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: 'Unique여부',
          field: 'isUnique',
          cellClass: 'grid-cell',
          width: 120,
          minWidth: 120,
        },
      ]);

      const columnDefs = reactive([
        {
          headerName: '키순서',
          field: 'indexColumnOrder',
          cellClass: 'grid-cell-centered',
          width: 100,
          minWidth: 100,
        },
        {
          headerName: '컬럼명',
          field: 'indexColumnName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '컬럼한글명',
          field: 'indexColumnKoreanName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '정렬방식',
          field: 'sortWayCode',
          cellClass: 'grid-cell-centered',
          width: 200,
          minWidth: 200,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      // rowData 에 조회된 데이터 할당
      const fetchData = (tableIndexData, tableIndexQuery) => {
        showAnimate.value = true;

        setTimeout(() => {
          showAnimate.value = false;
        }, 1000);

        const tempData = [];

        for (let i = 0; i < tableIndexData.length; i++) {
          tempData.push({
            id: i,
            no: i + 1,
            databaseId: tableIndexQuery.databaseId,
            schemaName: tableIndexQuery.schemaName,
            tableName: tableIndexQuery.tableName,
            instituteId: tableIndexQuery.instituteId,
            informationSystemId: tableIndexQuery.informationSystemId,
            indexName: tableIndexData[i].indexName,
            indexComposition: tableIndexData[i].indexComposition,
            isUnique: tableIndexData[i].isUnique,
          });
        }

        rowData.value = tempData;

        console.log('rowData :', rowData);

        // getIndexDetails();
        // 오른쪽 그리드 데이터 조회 api 호출
        // 함수로 분리할 것

        if (rowData.value.length > 0) {
          nextTick(() => {
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
            console.log('firstRowData =============', firstRowData);

            // 첫 행 select 효과
            const indexGrid = document.querySelector('.relation-index-grid');

            console.log('indexGrid ========', indexGrid);

            const nodesWithRowId0 = document.querySelector(
              '.relation-index-grid [row-id="0"]'
            );

            console.log('nodeWithRowId0 ========', nodesWithRowId0);

            // .ag-row-selected 클래스를 추가합니다.
            nodesWithRowId0.classList.add('ag-row-selected');
            nodesWithRowId0.classList.add('ag-row-focus');
            nodesWithRowId0.setAttribute('aria-selected', true);
          });
        }

        return tempData[0];
      };

      // 인덱스 상정보
      const fetchIndexDetails = (indexDetailData) => {
        console.log('indexDetailData :', indexDetailData);

        const tempData = [];

        for (let i = 0; i < indexDetailData.length; i++) {
          tempData.push({
            indexColumnOrder: indexDetailData[i].indexColumnOrder,
            indexColumnName: indexDetailData[i].indexColumnName,
            indexColumnKoreanName: indexDetailData[i].indexColumnKoreanName,
            sortWayCode: indexDetailData[i].sortWayCode,
          });
        }

        rightRowData.value = tempData;
      };

      const agGrid = ref(null);

      watch(
        selectTableData,
        async (value) => {
          console.log('BottomTab5 - selectTableData', value);

          rightRowData.value = [];

          const tableIndexQuery = {
            instituteId: value.instituteId,
            informationSystemId: value.informationSystemId,
            databaseId: value.databaseId,
            schemaName: value.schemaName,
            tableName: value.tableName,
          };

          const tableIndexData = await getTableIndex(tableIndexQuery);

          const firstData = fetchData(tableIndexData, tableIndexQuery);

          console.log('firstData :', firstData);

          if (tableIndexData.length > 0) {
            const indexDetailQuery = {
              instituteId: value.instituteId,
              informationSystemId: value.informationSystemId,
              databaseId: value.databaseId,
              schemaName: value.schemaName,
              tableName: value.tableName,
              indexName: firstData.indexName,
            };

            const indexDetailData = await getTableIndexDetail(indexDetailQuery);

            fetchIndexDetails(indexDetailData);
            console.log('indexDetailData :', indexDetailData);
          }
        },
        { immediate: true }
      );

      onActivated(() => {
        console.log('BottomTab6 - onActivated');

        nextTick(() => {
          const selectedRow = document.querySelectorAll(
            '.relation-index-grid [class~="ag-row-selected"]'
          );

          console.log('bottom6 - selectedRow : ', selectedRow);

          if (selectedRow.length > 0) {
            return;
          }

          const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
          console.log('firstRowData =============', firstRowData);
          // 첫 행 select 효과
          const indexGrid = document.querySelector('.relation-index-grid');
          console.log('indexGrid ========', indexGrid);
          const nodesWithRowId0 = document.querySelector(
            '.relation-index-grid [row-id="0"]'
          );
          console.log('nodeWithRowId0 ========', nodesWithRowId0);
          // .ag-row-selected 클래스를 추가합니다.
          nodesWithRowId0.classList.add('ag-row-selected');
          nodesWithRowId0.classList.add('ag-row-focus');
          nodesWithRowId0.setAttribute('aria-selected', true);
        });
      });

      return {
        agGrid,
        rowData,
        rightRowData,
        leftColumnDefs,
        columnDefs,
        resultCount,
        searchState,
        DragCol,
        getTableIndexDetail,
        fetchIndexDetails,
        showAnimate,
      };
    },
  };
</script>
