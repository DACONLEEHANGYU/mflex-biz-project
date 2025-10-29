<template>
  <div class="pop-window">
    <div class="window-header">타표준단어 조회</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row h-450">
          <div class="grid-wrap">
            <div class="grid-top">
              <div class="top-row">
                <div class="title-s">
                  표준단어 목록
                  <AppTooltip
                    :htmlContent="getTooltipById('searchExtendStandard')"
                  >
                  </AppTooltip>
                </div>
                <div class="top-apptext">
                  <span>단어영문약어명 : {{ wordAbbreviationName }}</span>
                </div>
                <!--   <GridSearch
                  :resultCount="resultCount"
                  @enter="onSearchEnter"
                  @save="onSearchSave"
                  @setup="onSearchSetup"
                  @remove="onSearchRemove"
                /> -->
              </div>
            </div>
            <div class="grid-list grid-radius">
              <AppGrid
                :rowData="rowData"
                :columnDefs="columnDefs"
                :context="context"
                rowSelection="single"
                @rowDoubleClicked="onRowDoubleClicked"
                @rowClicked="onRowClicked"
                @gridApi="handleSetGridApi"
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
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { getUnityCodeSimpleList } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import { getOtherStandardAbbreviationList } from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api';
  import RadioCellRenderer from '@/utils/RadioCellRenderer';
  import TypeCellRenderer from '@/utils/TypeCellRenderer';
  export default {
    props: {
      wordAbbreviationName: {
        type: String,
        default: () => {},
      },
    },
    components: { AppTooltip, RadioCellRenderer, TypeCellRenderer },

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

        if (this.agGrid && this.agGrid.api) {
          this.agGrid.gridApi.forEachNode((node) => {
            node.setDataValue('selected', node.data.id === value.id);
          });
        }

        // 그리드 새로고침
        this.agGrid.gridApi.refreshCells({
          columns: ['selected'],
          force: true,
        });

        const rowNode = this.agGrid.gridApi.getRowNode(value.id);

        console.log('rowNode', rowNode);

        if (rowNode) {
          rowNode.setDataValue('selected', true);
        }
      },
      // this.selectedData = value;
      onConfirm() {
        this.$emit('confirm', this.selectedRow);
        this.$emit('close');
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

      const agGrid = ref(null);
      const gridApi = ref(null);

      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      const rowData = reactive({});

      const storedMfgrd036ColumnDefs = ref([]);
      storedMfgrd036ColumnDefs.value = gridColumnDefs.value.MFGRD036;

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          width: 50,
        },
        {
          headerName: '사전명',
          field: 'dictionaryName',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          // cellRenderer: 'TypeCellRenderer',
          // valueFormatter: (params) => params.value,
          width: 190,
        },
        {
          headerName: '단어명',
          field: 'wordName',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          cellRenderer: 'TypeCellRenderer',
          valueFormatter: (params) => params.value,
          width: 190,
        },
        {
          headerName: '단어영문약어명',
          field: 'wordAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          dragStatus: false,
          width: 150,
        },
        {
          headerName: '단어유형',
          field: 'wordTypeName',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          width: 100,
        },
        {
          headerName: '도메인분류명',
          field: 'domainClassName',
          cellClass: 'ag-left-aligned-cell',
          dragStatus: false,
          width: 190,
        },
        // {
        //   headerName: '선택',
        //   field: 'selected',
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

      const fetchData = async () => {
        const otherStandardParams = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          wordAbbreviationName: props.wordAbbreviationName,
        };
        const otherStandardList = await getOtherStandardAbbreviationList(
          otherStandardParams
        );

        console.log('otherStandardList', otherStandardList);

        let sampleData = [];
        for (let i = 0; i < otherStandardList.length; i++) {
          sampleData.push({
            id: i,
            no: i + 1,
            domainClassName: otherStandardList[i].domainClassName,
            wordAbbreviationName: otherStandardList[i].wordAbbreviationName,
            wordDictionaryId: otherStandardList[i].wordDictionaryId,
            wordName: [
              {
                label: otherStandardList[i].wordName,
                type: otherStandardList[i].wordDictionaryTypeName,
                color: otherStandardList[i].wordDictionaryTypeFontColor,
                bgColor: otherStandardList[i].wordDictionaryTypeBackgroundColor,
                dictionaryName: otherStandardList[i].wordDictionaryName,
              },
            ],
            dictionaryName: otherStandardList[i].wordDictionaryName,
            wordTypeCode: otherStandardList[i].wordTypeCode,
            wordTypeName: otherStandardList[i].wordTypeName,
            wordExplain: otherStandardList[i].wordExplain,
            wordEnglishName: otherStandardList[i].wordEnglishName,
            selected: false,
          });
        }

        rowData.value = sampleData;
      };

      fetchData();

      const selectedData = ref({});

      const onClose = () => {
        emit('close', selectedData.value);
      };

      return {
        agGrid,
        rowData,
        gridApi,
        handleSetGridApi,
        columnDefs,
        selectedData,
        storedMfgrd036ColumnDefs,
        resultCount,
        onClose,
        getTooltipById,
      };
    },
  };
</script>

<style scoped>
  .grid-wrap .grid-top .top-row {
    display: block;
  }
  :deep(.ag-center-cols-container) {
    cursor: pointer;
  }
</style>
