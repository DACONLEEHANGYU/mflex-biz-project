<template>
  <div class="pop-window">
    <div class="window-header">상위사전명 검색</div>
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
  import { reactive, ref } from 'vue';
  import AppWarningTooltip from '@/components/ui/AppWarningTooltip.vue';
  import StatusCellRenderer from '@/utils/StatusCellRenderer.js';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import RadioCellRenderer from '../../utils/RadioCellRenderer';

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
      },
      // 확인 클릭 시 선택된 row의 데이터 DictionarySetView.vue 로 전달
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
      console.log(
        'this.list ===============================',
        this.list.length
      );
    },

    setup(props, { emit }) {
      const parentRowData = ref(props.list);
      const rowData = reactive({});

      const columnDefs = reactive([
        {
          headerName: '사전명',
          field: 'wordName',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'TypeCellRenderer',
          valueFormatter: (params) => params.value,
          width: 730,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      let selectedRadioValue;

      const fetchData = async () => {
        console.log('parentRowData.value :', parentRowData.value);

        let tempData = [];
        for (let i = 0; i < parentRowData.value.length; i++) {
          // 같은 이름을 가진 값 할당
          let {
            dictionaryId,
            dictionaryName,
            dictionaryTypeName,
            dictionaryTypeBackgroundColorName,
            dictionaryTypeForegroundColorName,
          } = parentRowData.value[i];
          const wordName = reactive([
            {
              type: dictionaryTypeName,
              label: dictionaryName,
              color: dictionaryTypeForegroundColorName,
              bgColor: dictionaryTypeBackgroundColorName,
              size: dictionaryName === '사전 홈' ? 0 : 60,
            },
          ]);

          tempData.push({
            dictionaryId,
            /* radio: {
              id,
              wordName,
            }, */
            radio: '',
            wordName,
          });
        }

        rowData.value = tempData;
      };

      fetchData();

      // const uiStore = useUiStore();
      // const { setGridApis2 } = uiStore;

      const agGrid = ref(null);

      /*  const onConfirm = () => {
        emit('confirm', this.selectedRow);
        emit('close');
      }; */

      const onClose = () => {
        emit('close');
      };

      return {
        agGrid,
        rowData,
        columnDefs,
        resultCount,
        /* onConfirm, */
        onClose,
        parentRowData,
      };
    },
  };
</script>

<style scoped>
  :deep(.ag-center-cols-container) {
    cursor: pointer;
  }
</style>
