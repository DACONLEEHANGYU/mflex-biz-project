<template>
  <!-- <div v-if="!searchState" class="no-data">데이터가 없습니다.</div> -->
  <div class="tab-inner bottom-tab">
    <div
      class="col col-2 bottom-box"
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
                <th>DB명/스키마명</th>
                <td colspan="3">
                  <div class="td-col">
                    {{ primaryKeyInfo.databaseSchemaName }}
                  </div>
                </td>
              </tr>
              <tr>
                <th>주제영역</th>
                <td colspan="3">
                  <div class="td-col">{{ primaryKeyInfo.subjectAreaName }}</div>
                </td>
              </tr>
              <tr>
                <th>테이블명</th>
                <td colspan="3">
                  <div class="td-col">
                    {{ primaryKeyInfo.tableInformation }}
                  </div>
                </td>
              </tr>
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
                    {{ primaryKeyInfo.primaryKeyCompositionContent }}
                  </div>
                </td>
              </tr>
              <tr>
                <th>수집일시</th>
                <td colspan="3">
                  <div class="td-col">
                    {{ primaryKeyInfo.primaryKeyCollectionDateTime }}
                  </div>
                </td>
              </tr>
              <tr>
                <th>최종수정자</th>
                <td colspan="3">
                  <div class="td-col">{{ primaryKeyInfo.updater }}</div>
                </td>
              </tr>
              <tr>
                <th>최종수정일시</th>
                <td colspan="3">
                  <div class="td-col">{{ primaryKeyInfo.updateDateTime }}</div>
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
  import { storeToRefs } from 'pinia';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';

  import {
    getPrimaryKeyBaseInfo,
    getPrimaryKeyColumn,
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
      // 데이터 변경 애니메이션 상태
      const showAnimate = ref(false);

      const searchState = ref(false);

      const { selectPrimaryKeyData } = storeToRefs(useSchemaSearchTabStore());

      const rowData = reactive([]);

      const columnDefs = reactive([
        {
          headerName: '키순서',
          field: 'primaryKeyColumnOrder',
          cellClass: 'grid-cell-centered',
          width: 100,
          minWidth: 100,
        },
        {
          headerName: '컬럼명',
          field: 'primaryKeyColumnName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '컬럼한글명',
          field: 'primaryKeyColumnKoreanName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minWidth: 250,
        },
      ]);

      const primaryKeyInfo = reactive({
        databaseSchemaName: '',
        columnName: '',
        tableInformation: '',
        subjectAreaName: '',
        primaryKeyName: '',
        primaryKeyCompositionContent: '',
        primaryKeyCollectionDateTime: '',
        updater: '',
        updateDateTime: '',
      });

      // rowData 에 조회된 데이터 할당
      const fetchData = async (primaryKeyColumn) => {
        const tempData = [];

        console.log('primaryKeyColumn : ', primaryKeyColumn);

        for (let i = 0; i < primaryKeyColumn.length; i++) {
          tempData.push({
            primaryKeyColumnOrder: primaryKeyColumn[i].primaryKeyColumnOrder,
            primaryKeyColumnName: primaryKeyColumn[i].primaryKeyColumnName,
            primaryKeyColumnKoreanName:
              primaryKeyColumn[i].primaryKeyColumnKoreanName,
          });
        }

        rowData.value = tempData;
      };

      const agGrid = ref(null);

      const bindPrimaryKeyBaseInfo = (primaryKeyBaseInfo) => {
        primaryKeyInfo.columnName = primaryKeyBaseInfo.columnName;
        primaryKeyInfo.databaseSchemaName =
          primaryKeyBaseInfo.databaseSchemaName;
        primaryKeyInfo.subjectAreaName = primaryKeyBaseInfo.subjectAreaName;
        primaryKeyInfo.tableInformation = primaryKeyBaseInfo.tableInformation;
        primaryKeyInfo.primaryKeyName = primaryKeyBaseInfo.primaryKeyName;
        primaryKeyInfo.primaryKeyCompositionContent =
          primaryKeyBaseInfo.primaryKeyCompositionContent;
        primaryKeyInfo.primaryKeyCollectionDateTime =
          primaryKeyBaseInfo.primaryKeyCollectionDateTime;
        primaryKeyInfo.updater = primaryKeyBaseInfo.updater;
        primaryKeyInfo.updateDateTime = primaryKeyBaseInfo.updateDateTime;
      };

      watch(
        selectPrimaryKeyData,
        async (value) => {
          console.log('selectPriamryKeyData', value);

          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 1000);

          if (value) {
            if (value.instituteId) {
              const primaryKeyQuery = {
                instituteId: value.instituteId,
                informationSystemId: value.informationSystemId,
                databaseId: value.databaseId,
                schemaName: value.schemaName,
                columnName: value.columnName,
                tableName: value.tableName,
                primaryKeyName: value.primaryKeyName,
              };

              // 기본정보 조회
              const primaryKeyBaseInfo = await getPrimaryKeyBaseInfo(
                primaryKeyQuery
              );
              console.log('primaryKeyBaseInfo', primaryKeyBaseInfo);

              bindPrimaryKeyBaseInfo(primaryKeyBaseInfo);

              // 기본키 컬럼 조회
              const primaryKeyColumn = await getPrimaryKeyColumn(
                primaryKeyQuery
              );
              fetchData(primaryKeyColumn);
            }
          } else {
            rowData.value = [];
            return;
          }
        },
        { immediate: true }
      );

      return {
        agGrid,
        rowData,
        columnDefs,
        searchState,
        DragCol,
        primaryKeyInfo,
        showAnimate,
      };
    },
  };
</script>
