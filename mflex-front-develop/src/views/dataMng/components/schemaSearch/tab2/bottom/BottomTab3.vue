<template>
  <!-- <div v-if="!searchState" class="no-data">데이터가 없습니다.</div> -->
  <div class="tab-inner bottom-tab">
    <div
      class="col col-2 bottom-box"
      :class="{ 'highlight-grid': showAnimate }"
    >
      <div class="grid-wrap relation-pk-grid">
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

  import {
    getColumnRelatedPrimaryKey,
    getColumnPKDetails,
  } from '@/utils/mflexApi/dataMng/schemaSearchApi';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';

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

        // 오른쪽 그리드 데이터 조회 api 호출
        // const tempData = [];

        // for (let i = 0; i < 10; i++) {
        //   tempData.push({
        //     keyOrder: i + 1,
        //     columnName: value.tableName + i,
        //     columnKoreanName: '컬럼한글명' + i,
        //     sortMethod: '정렬방식' + i,
        //   });
        // }

        const researchQuery = {
          instituteId: value.instituteId,
          informationSystemId: value.informationSystemId,
          databaseId: value.databaseId,
          schemaName: value.schemaName,
          columnName: value.columnName,
          columnKoreanName: value.columnKoreanName,
          dataTypeName: value.dataTypeName,
          tableName: value.tableName,
          primaryKeyName: value.primaryKeyName,
        };

        //   const researchQuery = {
        //   instituteId: 6,
        //   informationSystemId: 6,
        //   databaseId: 6,
        //   schemaName: 'SBCWEB',
        //   tableName: '',
        //   dataTypeName: value.dataTypeName,
        //   primaryKeyName: value.primaryKeyName,
        // };

        const primaryKeyDetials = await this.getColumnPKDetails(researchQuery);

        console.log('primaryKeyDetials : ', primaryKeyDetials);

        this.fetchPKDetails(primaryKeyDetials);

        const selectedRow = document.querySelectorAll(
          '.relation-pk-grid [class~="ag-row-selected"]'
        );

        // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        const clickedNode = document.querySelector(
          `.relation-pk-grid [row-id="${clickNode}"]`
        );
        clickedNode.classList.add('ag-row-selected');

        // this.rightRowData.value = tempData;
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

      const { selectColumnData } = storeToRefs(useSchemaSearchTabStore());

      const showAnimate = ref(false);

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
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '테이블한글명',
          field: 'tableKoreanName',
          cellClass: 'grid-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '기본키명',
          field: 'primaryKeyName',
          cellClass: 'grid-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '기본키 컬럼 구성 내역',
          field: 'primaryKeyCompositionContent',
          cellClass: 'grid-cell',
          width: 200,
          minWidth: 200,
        },
      ]);

      const columnDefs = reactive([
        {
          headerName: '키순서',
          field: 'keyOrder',
          cellClass: 'grid-cell-centered',
          width: 100,
          minWidth: 100,
        },
        {
          headerName: '컬럼명',
          field: 'columnName',
          cellClass: 'grid-cell',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '컬럼한글명',
          field: 'columnKoreanName',
          cellClass: 'grid-cell',
          width: 200,
          minWidth: 200,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      // rowData 에 조회된 데이터 할당
      const fetchData = (primaryKeyList, columnTableInfo) => {
        const tempData = [];

        console.log('BottomTab3 - primaryKeyList', primaryKeyList);

        for (let i = 0; i < primaryKeyList.length; i++) {
          tempData.push({
            id: i,
            no: i + 1,
            instituteId: columnTableInfo.instituteId,
            informationSystemId: columnTableInfo.informationSystemId,
            databaseId: columnTableInfo.databaseId,
            schemaName: columnTableInfo.schemaName,
            columnName: columnTableInfo.columnName,
            columnKoreanName: columnTableInfo.columnKoreanName,
            dataTypeName: columnTableInfo.dataTypeName,
            tableName: primaryKeyList[i].tableName,
            tableKoreanName: primaryKeyList[i].tableKoreanName,
            primaryKeyName: primaryKeyList[i].primaryKeyName,
            primaryKeyCompositionContent:
              primaryKeyList[i].primaryKeyCompositionContent,
          });
        }

        rowData.value = tempData;

        if (rowData.value.length > 0) {
          nextTick(() => {
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
            console.log('firstRowData =============', firstRowData);

            // 첫 행 select 효과
            const pkGrid = document.querySelector('.relation-pk-grid');

            const nodesWithRowId0 = document.querySelector(
              '.relation-pk-grid [row-id="0"]'
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

      // 기본키 상세 바인딩
      const fetchPKDetails = (primaryKeyData) => {
        const tempData = [];

        for (let i = 0; i < primaryKeyData.length; i++) {
          tempData.push({
            keyOrder: primaryKeyData[i].primaryKeyOrder,
            columnName: primaryKeyData[i].primaryKeyColumnName,
            columnKoreanName: primaryKeyData[i].primaryKeyColumnKoreanName,
          });
        }

        rightRowData.value = tempData;
      };

      const agGrid = ref(null);

      watch(
        selectColumnData,
        async (value) => {
          console.log('BottomTab3 - selectColumnData', value);

          // 애니메이션 선 적용
          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 1000);

          const columnTableInfo = {
            instituteId: value.instituteId,
            informationSystemId: value.informationSystemId,
            databaseId: value.databaseId,
            schemaName: value.schemaName,
            columnName: value.columnName,
            columnKoreanName: value.columnKoreanName,
            dataTypeName: value.dataTypeName,
          };

          const primaryKeyList = await getColumnRelatedPrimaryKey(
            columnTableInfo
          );

          if (primaryKeyList.length === 0) {
            rowData.value = [];
            rightRowData.value = [];
            return;
          }

          const firstData = fetchData(primaryKeyList, columnTableInfo);

          const researchQuery = {
            instituteId: firstData.instituteId,
            informationSystemId: firstData.informationSystemId,
            databaseId: firstData.databaseId,
            schemaName: firstData.schemaName,
            columnName: firstData.columnName,
            columnKoreanName: firstData.columnKoreanName,
            dataTypeName: firstData.dataTypeName,
            tableName: firstData.tableName,
            primaryKeyName: firstData.primaryKeyName,
          };

          const primaryKeyDetials = await getColumnPKDetails(researchQuery);
          fetchPKDetails(primaryKeyDetials);
        },
        { immediate: true }
      );

      onActivated(() => {
        console.log('BottomTab6 - onActivated');

        nextTick(() => {
          const selectedRow = document.querySelectorAll(
            '.relation-pk-grid [class~="ag-row-selected"]'
          );

          if (selectedRow.length > 0) {
            return;
          }

          const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
          console.log('firstRowData =============', firstRowData);
          // 첫 행 select 효과
          const indexGrid = document.querySelector('.relation-pk-grid');
          console.log('indexGrid ========', indexGrid);
          const nodesWithRowId0 = document.querySelector(
            '.relation-pk-grid [row-id="0"]'
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
        getColumnPKDetails,
        fetchPKDetails,
        showAnimate,
      };
    },
  };
</script>
