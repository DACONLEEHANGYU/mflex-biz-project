<template>
  <div class="pop-window">
    <div class="window-header">통합코드명 검색</div>
    <div class="window-body">
      <div class="window-content pt10" style="height: 440px">
        <div class="input-top">
          <div class="title-top">
            <div class="title-s">
              통합코드명 목록
              <AppTooltip :htmlContent="getTooltipById('searchCodeName')">
              </AppTooltip>
            </div>
          </div>
        </div>
        <div class="search-top">
          <div class="search-title">통합코드한글명 :</div>
          <div class="serach-input-div">
            <input v-model="searchInput" class="input-text" type="text" />
            <button @click="onResearchUnityCode" class="btn-s dark-gray ml5">
              검색
            </button>
          </div>
        </div>
        <div class="tab-comtent__row h-450">
          <div class="grid-wrap" style="height: 340px">
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
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';
  import { getUnityCodeSimpleList } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import { getResearchUnityCodeListV2 } from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api.js';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';

  import RadioCellRenderer from '@/utils/RadioCellRenderer';
  import TypeCellRenderer from '@/utils/TypeCellRenderer';
  import GridSearch from '@/components/grid/GridSearch.vue';

  import AppTooltip from '@/components/ui/AppTooltip.vue';
  export default {
    components: { RadioCellRenderer, TypeCellRenderer, AppTooltip },

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
      onConfirm() {
        this.$emit('confirm', this.selectedRow);
        this.$emit('close');
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
      const { userInfo, userStngInfo } = storeToRefs(authStore);

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

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
          headerName: '통합코드한글명',
          field: 'unityCodeKoreanName',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          valueFormatter: (params) => params.value,
          width: 318,
        },
        {
          headerName: '통합코드명',
          field: 'unityCodeName',
          cellClass: 'ag-left-aligned-cell',
          dragStatus: false,
          width: 320,
        },
        // {
        //   headerName: '선택',
        //   field: 'radio',
        //   cellClass: 'grid-cell-centered',
        //   cellRenderer: 'RadioCellRenderer',
        //   valueFormatter: (params) => params.value,
        //   dragStatus: false,
        //   width: 100,
        // },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const fetchData = async (data) => {
        const termCodeQuery = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          unityCodeKoreanName: '',
        };

        // 검색 시
        if (data) {
          termCodeQuery.unityCodeKoreanName = data;
        }

        const unityCodeData = await getResearchUnityCodeListV2(termCodeQuery);

        console.log('unityCodeData : ', unityCodeData);

        let sampleData = [];

        for (let i = 0; i < 5; i++) {
          sampleData.push({
            unityCodeName: 'UNITY_CODE_NAME',
            unityCodeKoreanName: '통합코드명',
            discardYn: 'N',
            radio: '',
          });
        }

        rowData.value = sampleData;
      };

      fetchData();

      const agGrid = ref(null);

      const searchInput = ref('');

      const onResearchUnityCode = async () => {
        await fetchData(searchInput.value);
      };

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
        searchInput,
        resultCount,
        onResearchUnityCode,
        getTooltipById,
        onClose,
      };
    },
  };
</script>

<style scoped>
  .search-top {
    display: flex;
    /* justify-content: space-between; */
    margin-bottom: 10px;
    align-items: center;
    padding: 10px;
  }

  .search-title {
    font-size: 16px;
    margin-bottom: 2px;
  }

  .serach-input-div {
    display: flex;
    margin-left: 10px;
    width: 79%;
  }

  :deep(.ag-center-cols-container) {
    cursor: pointer;
  }
</style>
