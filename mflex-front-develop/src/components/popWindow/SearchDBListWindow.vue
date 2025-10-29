<template>
  <div class="pop-window">
    <div class="window-header">DB명 검색</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row h-450">
          <div class="grid-wrap">
            <div class="grid-top">
              <div class="top-row"></div>
            </div>
            <div class="grid-list grid-radius">
              <AppGrid
                :rowData="rowData"
                :columnDefs="columnDefs"
                :context="context"
                rowSelection="single"
                @rowDoubleClicked="onRowDoubleClicked"
                @rowClicked="onRowClicked"
                ref="agGrid"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m confirm" @click="onConfirm">저장</button>
          <button class="btn-m close" @click="onClose">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import { reactive, ref, computed } from 'vue';
  import { storeToRefs } from 'pinia';
  import RadioCellRenderer from '@/utils/RadioCellRenderer';
  import { useAuthStore } from '@/stores/auth';
  import {
    getSearchDbName,
    getDatabaseList,
  } from '@/utils/mflexApi/dataMng/schemaCollectionApi';

  export default {
    components: {
      RadioCellRenderer,
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
      onConfirm() {
        this.$emit('confirm', this.selectedRow);
        this.$emit('close');
      },
      callDetailInfo(params) {
        // 필요한 로직 구현
        console.log('callDetailInfo called with params:', params);
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    setup(props, { emit }) {
      const authStore = useAuthStore();
      const {
        userMetaMngInstListInfo,
        userDctnryList,
        userInfo,
        userStngInfo,
      } = storeToRefs(authStore);

      const selectInstituted = computed(() => {
        return userMetaMngInstListInfo.value.find(
          (item) => item.selected === true
        );
      });

      const { useDctnryId, useMetaMngInstId, useInfoSysId } =
        userStngInfo.value;

      const rowData = reactive({});

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 50,
        },
        {
          headerName: '논리DB명',
          field: 'logicalDbName',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          width: 320,
        },
        {
          headerName: '물리DB명',
          field: 'physicalDbName',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          width: 320,
        },
        {
          headerName: 'DBMS종류',
          field: 'dbmsKindCode',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          width: 250,
        },        
      ]);

      //
      const fetchData = async () => {
        const response = await getDatabaseList(useMetaMngInstId);

        console.log('fetchData response:', response);

        const tempData = [];

        if (response && Array.isArray(response)) {
          // delYn이 true인 항목을 필터링하여 제외
          const filteredResponse = response.filter(
            (item) => item.delYn !== true
          );

          for (let i = 0; i < filteredResponse.length; i++) {
            tempData.push({
              no: i + 1,
              databaseId: filteredResponse[i].databaseId,
              logicalDbName: filteredResponse[i].logicalDatabaseName,
              physicalDbName: filteredResponse[i].physicalDatabaseName,
              dbmsKindCode: filteredResponse[i].dbmsKindCode,
              instituteId: filteredResponse[i].instituteId,
              radio: i,
            });
          }
        }

        rowData.value = tempData;
      };
      fetchData();

      const onClose = () => {
        emit('close');
      };

      return {
        rowData,
        columnDefs,
        onClose,
      };
    },
  };
</script>

<style scoped>
  :deep(.ag-center-cols-container) {
    cursor: pointer;
  }
</style>
