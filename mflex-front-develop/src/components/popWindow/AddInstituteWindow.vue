<template>
  <div class="pop-window">
    <div class="window-header">조직 할당</div>
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
  import { reactive, ref } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import { getGridInfoFromStorage } from '@/utils/cookies';
  import {
    setResourceInfoSystem,
    setResourceInstitute, // 기관할당
  } from '@/utils/mflexApi/userManagementApi.js';

  import {
    getInfoSystemList,
    getGroupList,
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  import RadioCellRenderer from '@/utils/RadioCellRenderer';
  import TypeCellRenderer from '@/utils/TypeCellRenderer';
  export default {
    props: {
      systemId: {
        type: String,
        default: '',
      },
      instituteId: {
        type: String,
        default: '',
      },
      userId: {
        type: String,
        default: '',
      },
    },
    components: { RadioCellRenderer, TypeCellRenderer },

    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },

    methods: {
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
        this.selectedRow = value;
      },
      onRowClicked(value) {
        console.log('onRowClicked', value);
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
      },
      async onConfirm() {
        const resourceInfo = {
          userId: this.userId,
          instituteId: this.selectedRow.instituteId,
        };

        console.log('onConfirm - resourceInfo : ', resourceInfo);

        const response = await setResourceInstitute(resourceInfo);
        console.log('change - response : ', response);

        if (response.status === 200) {
          this.$emit('confirm', this.selectedRow);
          this.$emit('close');
        }
      },
      onSearchRemove() {
        console.log('onSearchRemove');
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
      const uiStore = useUiStore();
      const { setGridApis, gridColumnDefs } = storeToRefs(uiStore);
      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);

      const { useMetaMngInstId } = userStngInfo.value;

      const initializeGridColumnDefs = () => {
        const storedColumnDefs = JSON.parse(getGridInfoFromStorage());
        if (storedColumnDefs && storedColumnDefs.MFGRD036) {
          uiStore.setGridColumnDefs('MFGRD036', storedColumnDefs.MFGRD036);
        }
      };

      initializeGridColumnDefs();
      const rowData = reactive({});

      const storedMfgrd036ColumnDefs = ref([]);
      storedMfgrd036ColumnDefs.value = gridColumnDefs.value.MFGRD036;

      const columnDefs = reactive([
        {
          headerName: '조직명',
          field: 'instituteName',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          width: 445,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const fetchData = async () => {
        const groupList = await getGroupList(useMetaMngInstId);

        console.log('groupList : ', groupList);

        let sampleData = [];
        for (let i = 0; i < groupList.length; i++) {
          if (groupList[i].delYn === false) {
            sampleData.push({
              instituteId: groupList[i].instituteId,
              instituteName: groupList[i].instituteName,
              radio: '',
            });
          }
        }

        rowData.value = sampleData;
      };

      fetchData();

      const agGrid = ref(null);

      /*     const onConfirm = () => {
        emit('confirm');
        emit('close');
      }; */

      const onClose = () => {
        emit('close');
      };

      return {
        agGrid,
        rowData,
        columnDefs,
        storedMfgrd036ColumnDefs,
        useMetaMngInstId,
        resultCount,
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
