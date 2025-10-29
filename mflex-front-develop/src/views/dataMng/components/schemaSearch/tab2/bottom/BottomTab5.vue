<template>
  <!-- <div v-if="!searchState" class="no-data">데이터가 없습니다.</div> -->
  <div class="tab-inner bottom-tab">
    <div
      class="col col-2 bottom-box"
      :class="{ 'highlight-grid': showAnimate }"
    >
      <div class="grid-wrap related-index-grid">
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
  import { reactive, ref, watch, nextTick, onActivated } from 'vue';
  import { DragCol } from 'vue-resizer';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';
  import { storeToRefs } from 'pinia';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';

  import {
    getColumnRelatedIndex,
    getColumnIndexDetails,
  } from '@/utils/mflexApi/dataMng/schemaSearchApi';

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

        const showAnimate = ref(false);

        // 오른쪽 그리드 데이터 조회 api 호출
        const tempData = [];

        const indexDetailQuery = {
          instituteId: value.instituteId,
          informationSystemId: value.informationSystemId,
          tableName: value.tableName,
          databaseId: value.databaseId,
          schemaName: value.schemaName,
          columnName: value.columnName,
          indexName: value.indexName,
        };

        const indexDetails = await this.getColumnIndexDetails(indexDetailQuery);

        console.log('indexDetails : ', indexDetails);

        this.fetchIndexDetails(indexDetails);

        const selectedRow = document.querySelectorAll(
          '.related-index-grid [class~="ag-row-selected"]'
        );

        // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        const clickedNode = document.querySelector(
          `.related-index-grid [row-id="${clickNode}"]`
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

      const { selectColumnData } = storeToRefs(useSchemaSearchTabStore());

      const rowData = reactive([]);
      const rightRowData = reactive([]);

      const leftColumnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 70,
          minWidth: 70,
        },
        {
          headerName: '테이블명',
          field: 'tableName',
          cellClass: 'grid-cell',
          width: 150,
          minWidth: 150,
        },
        {
          headerName: '테이블한글명',
          field: 'tableKoreanName',
          cellClass: 'grid-cell',
          width: 100,
          minWidth: 100,
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
          field: 'indexCompositionContent',
          cellClass: 'grid-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: 'Unique여부',
          field: 'uniqueFlag',
          cellClass: 'grid-cell',
          width: 130,
          minWidth: 130,
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
          cellClass: 'grid-cell-centered',
          width: 130,
          minWidth: 130,
        },
        {
          headerName: '컬럼한글명',
          field: 'indexColumnKoreanName',
          cellClass: 'grid-cell-centered',
          width: 130,
          minWidth: 130,
        },
        {
          headerName: '정렬방식',
          field: 'sortWayCode',
          cellClass: 'grid-cell-centered',
          width: 130,
          minWidth: 130,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const agGrid = ref(null);

      const fetchData = (columnIndexList, indexQuery) => {
        const tempData = [];

        for (let i = 0; i < columnIndexList.length; i++) {
          tempData.push({
            id: i,
            no: i + 1,
            instituteId: indexQuery.instituteId,
            informationSystemId: indexQuery.informationSystemId,
            databaseId: indexQuery.databaseId,
            schemaName: indexQuery.schemaName,
            columnName: indexQuery.columnName,
            tableName: columnIndexList[i].tableName,
            tableKoreanName: columnIndexList[i].tableKoreanName,
            indexName: columnIndexList[i].indexName,
            indexCompositionContent: columnIndexList[i].indexCompositionContent,
            uniqueFlag: columnIndexList[i].uniqueFlag,
          });
        }

        rowData.value = tempData;

        if (rowData.value.length > 0) {
          nextTick(() => {
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
            console.log('firstRowData =============', firstRowData);

            // 첫 행 select 효과
            const index = document.querySelector('.related-index-grid');

            const nodesWithRowId0 = document.querySelector(
              '.related-index-grid [row-id="0"]'
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

      const fetchIndexDetails = async (indexDetails) => {
        const tempData = [];

        console.log('fetchIndexDetails - indexDetails : ', indexDetails);

        for (let i = 0; i < indexDetails.length; i++) {
          tempData.push({
            indexColumnOrder: indexDetails[i].indexColumnOrder,
            indexColumnName: indexDetails[i].indexColumnName,
            indexColumnKoreanName: indexDetails[i].indexColumnKoreanName,
            sortWayCode: indexDetails[i].sortWayCode,
          });
        }

        rightRowData.value = tempData;
      };

      watch(
        selectColumnData,
        async (value) => {
          // 애니메이션 선 적용
          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 1000);

          console.log('BottomTab5 - selectColumnData', value);

          const indexQuery = {
            instituteId: value.instituteId,
            informationSystemId: value.informationSystemId,
            databaseId: value.databaseId,
            schemaName: value.schemaName,
            columnName: value.columnName,
            columnKoreanName: value.columnKoreanName,
            dataTypeName: value.dataTypeName,
          };

          const columnIndexList = await getColumnRelatedIndex(indexQuery);

          console.log('columnIndexList : ', columnIndexList);

          const firstData = fetchData(columnIndexList, indexQuery);

          console.log('firstData : ', firstData);

          if (firstData) {
            const indexDetailQuery = {
              instituteId: value.instituteId,
              informationSystemId: value.informationSystemId,
              tableName: firstData.tableName,
              databaseId: value.databaseId,
              schemaName: value.schemaName,
              columnName: value.columnName,
              indexName: firstData.indexName,
            };

            const indexDetails = await getColumnIndexDetails(indexDetailQuery);

            console.log('indexDetails : ', indexDetails);

            fetchIndexDetails(indexDetails);
          } else {
            rightRowData.value = [];
          }
        },
        { immediate: true }
      );

      onActivated(() => {
        console.log('BottomTab5 - onActivated');

        nextTick(() => {
          const selectedRow = document.querySelectorAll(
            '.related-index-grid [class~="ag-row-selected"]'
          );

          console.log('bottom6 - selectedRow : ', selectedRow);

          if (selectedRow.length > 0) {
            return;
          }

          const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
          console.log('firstRowData =============', firstRowData);
          // 첫 행 select 효과
          const indexGrid = document.querySelector('.related-index-grid');
          console.log('indexGrid ========', indexGrid);
          const nodesWithRowId0 = document.querySelector(
            '.related-index-grid [row-id="0"]'
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
        getColumnIndexDetails,
        fetchIndexDetails,
        showAnimate,
      };
    },
  };
</script>
