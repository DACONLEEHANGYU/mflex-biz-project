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
                  <div class="td-col">{{ triggerInfo.databaseSchemaName }}</div>
                </td>
              </tr>
              <tr>
                <th>주제영역</th>
                <td colspan="3">
                  <div class="td-col">{{ triggerInfo.subjectAreaName }}</div>
                </td>
              </tr>
              <tr>
                <th>테이블명</th>
                <td colspan="3">
                  <div class="td-col">{{ triggerInfo.tableInformation }}</div>
                </td>
              </tr>
              <tr>
                <th>트리거명</th>
                <td colspan="3">
                  <div class="td-col">{{ triggerInfo.triggerName }}</div>
                </td>
              </tr>
              <tr>
                <th>트리거설명</th>
                <td colspan="3">
                  <div class="td-col">{{ triggerInfo.triggerExplain }}</div>
                </td>
              </tr>
              <tr>
                <th>수집일시</th>
                <td colspan="3">
                  <div class="td-col">
                    {{ triggerInfo.triggerCollectionDateTime }}
                  </div>
                </td>
              </tr>
              <tr>
                <th>최종수정자</th>
                <td colspan="3">
                  <div class="td-col">{{ triggerInfo.updater }}</div>
                </td>
              </tr>
              <tr>
                <th>최종수정일시</th>
                <td colspan="3">
                  <div class="td-col">{{ triggerInfo.updateDateTime }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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
  import { reactive, ref, inject, watch, watchEffect } from 'vue';
  import { DragCol } from 'vue-resizer';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';

  import {
    getTriggerBaseInfo,
    getTriggerSource,
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

      const { selectTriggerData } = storeToRefs(useSchemaSearchTabStore());

      const rowData = reactive([]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const triggerSource = ref('');

      const triggerInfo = reactive({
        databaseSchemaName: '',
        subjectAreaName: null,
        tableInformation: '',
        triggerCollectionDateTime: '',
        triggerExplain: '',
        triggerName: '',
        updateDateTime: '',
        updater: '',
      });

      const bindingTriggerBaseInfo = (value) => {
        triggerInfo.databaseSchemaName = value.databaseSchemaName;
        triggerInfo.subjectAreaName = value.subjectAreaName;
        triggerInfo.tableInformation = value.tableInformation;
        triggerInfo.triggerCollectionDateTime = value.triggerCollectionDateTime;
        triggerInfo.triggerExplain = value.triggerExplain;
        triggerInfo.triggerName = value.triggerName;
        triggerInfo.updateDateTime = value.updateDateTime;
        triggerInfo.updater = value.updater;
      };

      watch(
        selectTriggerData,
        async (value) => {
          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 1000);

          if (value.instituteId) {
            const triggerBaseQuery = {
              instituteId: value.instituteId,
              informationSystemId: value.informationSystemId,
              databaseId: value.databaseId,
              schemaName: value.schemaName,
              tableName: value.tableName,
              triggerName: value.triggerName,
            };

            const triggerBaseData = await getTriggerBaseInfo(triggerBaseQuery);

            console.log('triggerBaseData', triggerBaseData);

            bindingTriggerBaseInfo(triggerBaseData);

            const triggerSourceData = await getTriggerSource(triggerBaseQuery);

            triggerSource.value = triggerSourceData.triggerSourceContent;
          } else {
            triggerSource.value = '';
          }

          // triggerSource.value = '트리거 소스';
        },
        { immediate: true }
      );

      const agGrid = ref(null);

      return {
        agGrid,
        rowData,
        resultCount,
        searchState,
        DragCol,
        triggerInfo,
        triggerSource,
        showAnimate,
      };
    },
  };
</script>
