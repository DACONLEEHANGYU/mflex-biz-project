<template>
  <div class="pop-window">
    <div class="window-header">공식사전 검색</div>
    <div class="window-body">
      <div class="window-content pt15" style="height: 100px">
        <div class="tab-comtent__row" style="height: 200px">
          <div class="col col-2">
            <div class="grid-wrap" style="flex: 0 0 100%">
              <div class="grid-top"></div>
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

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { storeToRefs } from 'pinia';
  import { reactive, ref } from 'vue';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import RadioCellRenderer from '../../utils/RadioCellRenderer';
  import StatusCellRenderer from '@/utils/StatusCellRenderer.js';
  import AppWarningTooltip from '@/components/ui/AppWarningTooltip.vue';
  import { useExternalDictionaryStore } from '@/stores/externalDictionary';
  import {
    getCommonDictionaryList,
    getCommonDictionaryTree,
  } from '@/utils/mflexApi/systemMng/systemManagementApi';

  export default {
    props: {
      height: {
        type: String,
        default: 'auto',
      },
      list: {
        type: Array,
        required: true,
      },
      searchType: {
        type: String,
        default: 'basic',
      },
      externalDictionaryId: {
        type: String,
      },
    },
    components: {
      AppWarningTooltip,
      StatusCellRenderer,
      TypeCellRenderer,
      RadioCellRenderer,
    },

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
        this.selectDictionary = value;
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
      const parentRowData = ref(props.list);
      const rowData = reactive({});

      const { externalDictionaryByInst, selectInstituteId } = storeToRefs(
        useExternalDictionaryStore()
      );

      const selectDictionary = ref({});

      const columnDefs = reactive([
        {
          headerName: '공식사전명',
          field: 'externalDictionaryName',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'TypeCellRenderer',
          valueFormatter: (params) => params.value,
          width: 735,
          maxWidth: 735,
          minWidth: 735,
        },
        // {
        //   headerName: '선택',
        //   field: 'radio',
        //   cellClass: 'grid-cell-centered',
        //   cellRenderer: 'RadioCellRenderer',
        //   valueFormatter: (params) => params.value,
        //   width: 100,
        // },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      let selectedRadioValue;

      const fetchData = async () => {
        console.log(
          'props.externalDictionaryId : ',
          props.externalDictionaryId
        );

        try {
          // 모든 사전 목록 가져오기
          const list = await getCommonDictionaryList();
          console.log('list : ', list);

          // 필터링에 사용할 ID 배열
          let filterDictionaryIds = [];

          // props.externalDictionaryId가 없는 경우에만 트리 데이터 로드하여 필터링
          if (!props.externalDictionaryId) {
            // 트리 데이터 가져오기
            const tree = await getCommonDictionaryTree(selectInstituteId.value);
            console.log('tree : ', tree);

            // 트리에 있는 사전 ID 목록 추출
            filterDictionaryIds = tree.map((item) => item.dictionaryId);
            console.log('filterDictionaryIds : ', filterDictionaryIds);
          } else {
            // props.externalDictionaryId가 있는 경우에는 해당 ID만 필터링
            filterDictionaryIds = [parseInt(props.externalDictionaryId, 10)];
          }

          let tempData = [];

          // discardYn이 true이거나 필터링된 ID에 포함된 사전은 제외
          for (let i = 0; i < list.length; i++) {
            const currentDictionaryId = list[i].dictionaryId;
            const isDiscarded =
              list[i].discardYn === true ||
              list[i].discardYn === 'Y' ||
              list[i].discardYn === 'y';

            // discardYn이 true가 아니고, 필터링 ID에 포함되지 않은 사전만 추가
            if (
              !isDiscarded &&
              !filterDictionaryIds.includes(currentDictionaryId)
            ) {
              tempData.push({
                radio: '',
                externalDictionaryName: [
                  {
                    id: 0,
                    dictionaryId: list[i].dictionaryId,
                    type: list[i].dictionaryTypeName,
                    label: list[i].dictionaryName,
                    color: list[i].dictionaryTypeForegroundColorName,
                    bgColor: list[i].dictionaryTypeBackgroundColorName,
                    size: 60,
                  },
                ],
                // 필요시 추가 데이터도 포함 가능
                data: list[i],
              });
            }
          }

          rowData.value = tempData;
        } catch (error) {
          console.error('사전 데이터 로드 중 오류 발생:', error);
          rowData.value = [];
        }
      };

      fetchData();

      // const uiStore = useUiStore();
      // const { setGridApis2 } = uiStore;

      const agGrid = ref(null);

      // 확인 클릭 시 선택된 row의 데이터 DictionarySetView.vue 로 전달
      const onConfirm = () => {
        emit('confirm', selectDictionary.value.data, props.searchType);
        emit('close');
      };

      const onClose = () => {
        emit('close');
      };

      return {
        agGrid,
        rowData,
        columnDefs,
        resultCount,
        onConfirm,
        onClose,
        parentRowData,
        selectDictionary,
      };
    },
  };
</script>

<style scoped>
  :deep(.ag-center-cols-container) {
    cursor: pointer;
  }
</style>
