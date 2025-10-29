<template>
  <div class="pop-window">
    <div class="window-header">공통코드 조회</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row h-450">
          <div class="col col-2">
            <div class="grid-wrap" style="flex: 0 0 40%">
              <div class="grid-top"></div>
              <div class="grid-list br">
                <AppGrid
                  :rowData="rowDataCodeName"
                  :columnDefs="columnDefsCodeName"
                  :context="context"
                  rowSelection="single"
                  @rowClicked="onRowCodeNameClicked"
                  @rowDoubleClicked="onRowDoubleClicked"
                  ref="agGrid"
                />
              </div>
            </div>
            <div class="grid-wrap">
              <div class="grid-top"></div>
              <div class="grid-list br">
                <AppGrid
                  :rowData="rowDataResult"
                  :columnDefs="columnDefsResult"
                  :context="context"
                  rowSelection="single"
                  @rowClicked="onRowResultClicked"
                  @rowDoubleClicked="onRowDoubleClicked"
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
          <button class="btn-m confirm" @click="onConfirm">확인</button>
          <button class="btn-m close" @click="onClose">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
import {
  reactive,
  ref,
  onActivated,
  onDeactivated,
  onUnmounted,
  onMounted,
} from 'vue';
import AppWarningTooltip from '@/components/ui/AppWarningTooltip.vue';
import StatusCellRenderer from '@/utils/StatusCellRenderer.js';
export default {
  components: {
    AppWarningTooltip,
    StatusCellRenderer,
  },

  data() {
    return {
      context: null,
      selectedRow: {},
    };
  },
  methods: {
    onRowCodeNameClicked(value) {
      console.log('onRowCodeNameClicked ', value);
    },
    onRowResultClicked(value) {
      this.selectRowData(value);
      console.log('onRowResultClicked ', value);
    },
    onRowDoubleClicked(value) {
      console.log('onRowDoubleClicked ', value);
      this.selectedRow = value;
    },
  },
  beforeMount() {
    this.context = { componentParent: this };
  },

  setup(props, { emit }) {
    //코드명(왼쪽)
    const rowDataCodeName = reactive({});
    const columnDefsCodeName = reactive([
      {
        headerName: '코드명',
        field: 'codeName',
        cellClass: 'grid-cell-centered',
        width: 290,
      },
    ]);

    //코드값, 코드값명(오른쪽)
    const rowDataResult = reactive({});
    const columnDefsResult = reactive([
      {
        headerName: '코드값',
        field: 'codeValue',
        cellClass: 'grid-cell-centered',
        width: 170,
      },
      {
        headerName: '코드값명',
        field: 'codeValueName',
        cellClass: 'grid-cell-centered',
        width: 240,
      },
    ]);

    const fetchData = async () => {
      rowDataCodeName.value = [{ id: 0, codeName: '직급코드' }];
      let sampleData = [];
      let sampleLevel = [
        '대표이사',
        '전무이사',
        '상무이사',
        '이사',
        '부장',
        '차장',
        '과장',
        '대리',
        '사원',
      ];
      for (let i = 0; i < 9; i++) {
        sampleData.push({
          id: i,
          codeValue: `0${i + 1}`,
          codeValueName: sampleLevel[i],
        });
      }
      rowDataResult.value = sampleData;
    };

    fetchData();

    const agGrid = ref(null);

    const selectData = ref({});
    const selectRowData = value => {
      selectData.value = value;
    };

    const onConfirm = () => {
      emit('confirm', selectData.value);
      emit('close');
    };

    const onClose = () => {
      emit('close');
    };

    return {
      agGrid,
      rowDataCodeName,
      columnDefsCodeName,
      rowDataResult,
      columnDefsResult,
      selectRowData,
      onConfirm,
      onClose,
    };
  },
};
</script>
