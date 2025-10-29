<template>
  <!-- <div v-if="!searchState" class="no-data">데이터가 없습니다.</div> -->
  <div class="tab-inner bottom-tab">
    <div
      class="col col-2 bottom-box"
      :class="{ 'highlight-grid': showAnimate }"
    >
      <div class="grid-wrap relation-trigger-grid">
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

      <div class="trigger-area">
        <div class="trigger-top">
          <span class="trigger-title"> 트리거 소스 </span>
        </div>

        <textarea
          class="trigger-text"
          v-model="triggerSource"
          readonly
        ></textarea>
        <!-- <div class="grid-bottom"></div> -->
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { reactive, ref, nextTick, watch, onActivated } from 'vue';
  import { DragCol } from 'vue-resizer';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';
  import { storeToRefs } from 'pinia';

  import {
    getTableTrigger, // 테이블 트리거 정보 조회
    getTableTriggerSource, // 트리거 소스 조회
  } from '@/utils/mflexApi/dataMng/schemaSearchApi';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';

  export default {
    components: {
      TypeCellRenderer,
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

        // 선택된 row의 데이터를 기반으로 트리거 소스 생성
        const tableName = value.triggerName.replace(/\d+$/, ''); // 숫자 제거

        const triggerSourceQuery = {
          instituteId: value.instituteId,
          informationSystemId: value.informationSystemId,
          databaseId: value.databaseId,
          schemaName: value.schemaName,
          tableName: value.tableName,
          triggerName: value.triggerName,
        };

        const triggerSourceData = await this.getTableTriggerSource(
          triggerSourceQuery
        );

        console.log('triggerSourceData :', triggerSourceData);

        // this.triggerSource = triggerSourceData.triggerSourceContent;

        const selectedRow = document.querySelectorAll(
          '.relation-trigger-grid [class~="ag-row-selected"]'
        );

        // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        const clickedNode = document.querySelector(
          `.relation-trigger-grid [row-id="${clickNode}"]`
        );
        clickedNode.classList.add('ag-row-selected');

        // this.triggerSource = `CREATE OR REPLACE TRIGGER ${value.triggerName}
        // // AFTER INSERT OR UPDATE OR DELETE ON ${tableName}
        // // FOR EACH ROW
        // // DECLARE
        // //     v_user_id VARCHAR2(100);
        // //     v_current_date DATE;
        // // BEGIN
        // //     -- 현재 사용자 ID와 날짜 가져오기
        // //     SELECT USER, SYSDATE
        // //     INTO v_user_id, v_current_date
        // //     FROM DUAL;

        // //     IF INSERTING THEN
        // //         -- 입력 작업 시 로그 기록
        // //         INSERT INTO ${tableName}_AUDIT (
        // //             operation_type,
        // //             table_name,
        // //             record_id,
        // //             modified_by,
        // //             modified_date
        // //         ) VALUES (
        // //             'INSERT',
        // //             '${tableName}',
        // //             :NEW.ID,
        // //             v_user_id,
        // //             v_current_date
        // //         );
        // //     ELSIF UPDATING THEN
        // //         -- 수정 작업 시 로그 기록
        // //         INSERT INTO ${tableName}_AUDIT (
        // //             operation_type,
        // //             table_name,
        // //             record_id,
        // //             modified_by,
        // //             modified_date
        // //         ) VALUES (
        // //             'UPDATE',
        // //             '${tableName}',
        // //             :OLD.ID,
        // //             v_user_id,
        // //             v_current_date
        // //         );
        // //     ELSIF DELETING THEN
        // //         -- 삭제 작업 시 로그 기록
        // //         INSERT INTO ${tableName}_AUDIT (
        // //             operation_type,
        // //             table_name,
        // //             record_id,
        // //             modified_by,
        // //             modified_date
        // //         ) VALUES (
        // //             'DELETE',
        // //             '${tableName}',
        // //             :OLD.ID,
        // //             v_user_id,
        // //             v_current_date
        // //         );
        // //     END IF;
        // // END;`;
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

      const { selectTableData } = storeToRefs(useSchemaSearchTabStore());

      const rowData = reactive([]);

      const showAnimate = ref(false);

      const triggerSource = ref('');

      const leftColumnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
          minWidth: 60,
        },
        {
          headerName: '트리거명',
          field: 'triggerName',
          cellClass: 'grid-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '트리거설명',
          field: 'triggerDescription',
          cellClass: 'grid-cell',
          width: 250,
          minWidth: 250,
        },
      ]);

      const columnDefs = reactive([
        {
          headerName: '키순서',
          field: 'keyOrder',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '컬럼명',
          field: 'columnName',
          cellClass: 'grid-cell-centered',
          width: 130,
        },
        {
          headerName: '컬럼한글명',
          field: 'columnKoreanName',
          cellClass: 'grid-cell-centered',
          width: 130,
        },
        {
          headerName: '정렬방식',
          field: 'sortMethod',
          cellClass: 'grid-cell-centered',
          width: 130,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      // rowData 에 조회된 데이터 할당
      const fetchData = (tableTrigger, tableTriggerQuery) => {
        // 트리거 조회 API 호출
        // const response = getTriggerList(tableTriggerQuery);

        console.log('tableTriggerQuery :', tableTriggerQuery);

        const tempData = [];

        for (let i = 0; i < tableTrigger.length; i++) {
          tempData.push({
            id: i,
            no: i + 1,
            instituteId: tableTriggerQuery.instituteId,
            informationSystemId: tableTriggerQuery.informationSystemId,
            databaseId: tableTriggerQuery.databaseId,
            schemaName: tableTriggerQuery.schemaName,
            tableName: tableTriggerQuery.tableName,
            triggerName: tableTrigger[i].triggerName,
            triggerDescription: tableTrigger[i].triggerDescription,
          });
        }

        rowData.value = tempData;

        if (rowData.value.length > 0) {
          nextTick(() => {
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
            console.log('firstRowData =============', firstRowData);

            // 첫 행 select 효과
            const indexGrid = document.querySelector('.relation-trigger-grid');

            console.log('indexGrid ========', indexGrid);

            const nodesWithRowId0 = document.querySelector(
              '.relation-trigger-grid [row-id="0"]'
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

      const agGrid = ref(null);

      watch(
        selectTableData,
        async (value) => {
          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 1000);

          console.log('BottomTab7 - selectTableData', value);

          const tableTriggerQuery = {
            instituteId: value.instituteId,
            informationSystemId: value.informationSystemId,
            databaseId: value.databaseId,
            schemaName: value.schemaName,
            tableName: value.tableName,
          };

          // const tableTriggerQuery = {
          //   instituteId: 6,
          //   informationSystemId: 6,
          //   databaseId: 6,
          //   schemaName: 'SBCWEB',
          //   tableName: 'MFCG035D',
          // };

          const tableTrigger = await getTableTrigger(tableTriggerQuery);

          console.log('tableTrigger :', tableTrigger);

          const firstTrigger = fetchData(tableTrigger, tableTriggerQuery);

          console.log('firstTrigger :', firstTrigger);

          if (!tableTrigger.length) {
            triggerSource.value = '';
            return;
          } else {
            const triggerSourceQuery = {
              instituteId: value.instituteId,
              informationSystemId: value.informationSystemId,
              databaseId: value.databaseId,
              schemaName: value.schemaName,
              tableName: value.tableName,
              triggerName: firstTrigger.triggerName,
            };

            /* const triggerSourceQuery = {
            instituteId: 6,
            informationSystemId: 6,
            databaseId: 6,
            schemaName: 'SBCWEB',
            tableName: 'MFCG035D',
            triggerName: 'MFCG035D_TR_IA',
          }; */

            const triggerSourceData = await getTableTriggerSource(
              triggerSourceQuery
            );

            triggerSource.value = triggerSourceData.triggerSourceContent;
          }
        },
        { immediate: true }
      );

      onActivated(() => {
        console.log('BottomTab7 - onActivated');

        nextTick(() => {
          const selectedRow = document.querySelectorAll(
            '.relation-trigger-grid [class~="ag-row-selected"]'
          );

          console.log('bottom7 - selectedRow : ', selectedRow);

          if (selectedRow.length > 0) {
            return;
          }

          const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);
          console.log('firstRowData =============', firstRowData);
          // 첫 행 select 효과
          const triggerGrid = document.querySelector('.relation-trigger-grid');
          console.log('indexGrid ========', triggerGrid);
          const nodesWithRowId0 = document.querySelector(
            '.relation-trigger-grid [row-id="0"]'
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
        leftColumnDefs,
        columnDefs,
        resultCount,
        searchState,
        DragCol,
        triggerSource,
        getTableTriggerSource,
        showAnimate,
      };
    },
  };
</script>

<style>
  .trigger-area {
    display: flex;
    flex-direction: column;
    height: 100%; /* 부모 요소 크기에 맞춤 */
  }

  .trigger-text {
    flex-grow: 1; /* 남은 공간을 모두 차지 */
    resize: none; /* 사용자가 크기 조정 못 하게 설정 */
    width: 100%;
    height: 300px;
    padding: 10px;
    font-family: monospace;
    white-space: pre;
    overflow-y: auto;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
</style>
