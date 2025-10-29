<template>
  <!-- <div v-if="!searchState" class="no-data">데이터가 없습니다.</div> -->
  <div class="tab-inner bottom-tab">
    <div
      class="bottom-box col col-2"
      :class="{ 'highlight-grid': showAnimate }"
    >
      <div class="inputs-wrap" style="flex: 0 0 42%">
        <div class="input-form">
          <table class="input-table">
            <colgroup>
              <col width="20%" />
              <col width="30%" />
              <col width="20%" />
              <col width="" />
            </colgroup>
            <tbody>
              <tr>
                <th>기본키명</th>
                <td colspan="3">
                  <div class="td-col">{{ primaryKeyInfo.primaryKeyName }}</div>
                </td>
              </tr>
              <tr>
                <th>기본키컬럼구성</th>
                <td colspan="3">
                  <div class="td-col">
                    {{ primaryKeyInfo.primaryKeyComposition }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid-wrap">
        <div class="grid-top"></div>
        <div class="grid-list">
          <AppGrid
            :rowData="rowData"
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
  import { reactive, ref, watch } from 'vue';
  import { DragCol } from 'vue-resizer';
  import { useUiStore } from '@/stores/ui';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';

  import {
    getTablePrimaryKey, // 테이블 기본키 조회
    getTablePrimaryKeyDetail, // 테이블 기본키 상세 조회
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
      onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedRow = value;
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

      const columnDefs = reactive([
        {
          headerName: '키순서',
          field: 'primaryKeyColumnOrder',
          cellClass: 'grid-cell-centered',
          width: 130,
          minWidth: 130,
        },
        {
          headerName: '컬럼명',
          field: 'primaryKeyColumnName',
          cellClass: 'ag-left-aligned-cell',
          width: 300,
          minWidth: 300,
        },
        {
          headerName: '컬럼한글명',
          field: 'primaryKeyColumnKoreanName',
          cellClass: 'ag-left-aligned-cell',
          width: 300,
          minWidth: 300,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const primaryKeyInfo = reactive({
        primaryKeyName: '',
        primaryKeyComposition: '',
      });

      const fetchData = async (tablePrimaryKeyDetails) => {
        // 기본키 조회 API 호출
        // const response = getPrimaryKeyList(primaryKeyQuery);

        console.log('tablePrimaryKeyDetails :', tablePrimaryKeyDetails);

        const tempData = [];

        for (let i = 0; i < tablePrimaryKeyDetails.length; i++) {
          tempData.push({
            primaryKeyColumnOrder:
              tablePrimaryKeyDetails[i].primaryKeyColumnOrder,
            primaryKeyColumnName:
              tablePrimaryKeyDetails[i].primaryKeyColumnName,
            primaryKeyColumnKoreanName:
              tablePrimaryKeyDetails[i].primaryKeyColumnKoreanName,
          });
        }

        rowData.value = tempData;
      };

      const agGrid = ref(null);

      // 테이블 선택 데이터 감지
      watch(
        selectTableData,
        async (value) => {
          console.log('BottomTab3 - selectTableData', value);

          // 애니메이션 선 적용
          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 1000);

          const tableBaseQuery = {
            instituteId: value.instituteId,
            informationSystemId: value.informationSystemId,
            databaseId: value.databaseId,
            schemaName: value.schemaName,
            tableName: value.tableName,
          };

          const tablePrimarykeyData = await getTablePrimaryKey(tableBaseQuery);

          console.log('tablePrimarykeyData : ', tablePrimarykeyData);

          if (tablePrimarykeyData.data) {
            primaryKeyInfo.primaryKeyName = '';
            primaryKeyInfo.primaryKeyComposition = '';

            rowData.value = [];

            return;
          } else {
            // 데이터 바인딩
            primaryKeyInfo.primaryKeyName = tablePrimarykeyData.primaryKeyName;
            primaryKeyInfo.primaryKeyComposition =
              tablePrimarykeyData.primaryKeyComposition;

            // 기본키 상세정보 바인딩
            if (tablePrimarykeyData.primaryKeyName) {
              const tableBaseQuery = {
                instituteId: value.instituteId,
                informationSystemId: value.informationSystemId,
                databaseId: value.databaseId,
                schemaName: value.schemaName,
                tableName: value.tableName,
                primaryKeyName: tablePrimarykeyData.primaryKeyName,
              };
              const tablePrimaryKeyDetails = await getTablePrimaryKeyDetail(
                tableBaseQuery
              );

              fetchData(tablePrimaryKeyDetails);
            } else {
              rowData.value = [];
            }
          }
        },
        { immediate: true }
      );

      return {
        agGrid,
        rowData,
        columnDefs,
        resultCount,
        searchState,
        primaryKeyInfo,
        DragCol,
        showAnimate,
      };
    },
  };
</script>
