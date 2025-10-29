<template>
  <div class="pop-window">
    <div class="window-header">단어검색</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row h-450">
          <div class="grid-wrap">
            <div class="grid-top">
              <div class="top-row">
                <GridSearch
                  :resultCount="resultCount"
                  @enter="onSearchEnter"
                  @save="onSearchSave"
                  @setup="onSearchSetup"
                  @remove="onSearchRemove"
                />
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
  import GridSearch from '@/components/grid/GridSearch.vue';
  export default {
    components: { GridSearch },

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
      onSelectDictionary(value) {
        console.log('onSelectDictionary', value);
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
      onSearchRemove() {
        console.log('onSearchRemove');
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props, { emit }) {
      const rowData = reactive({});
      const columnDefs = reactive([
        {
          headerName: '선택',
          field: 'radio',
          cellClass: 'grid-cell-centered',
          checkboxSelection: true,
          width: 50,
        },
        {
          headerName: '단어명',
          field: 'wordName',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'TypeCellRenderer',
          valueFormatter: (params) => params.value,
          width: 180,
        },
        {
          headerName: '단어 영문명',
          field: 'wordEngName',
          cellClass: 'grid-cell-centered',
          width: 180,
        },
        {
          headerName: '단어설명',
          field: 'wordInfo',
          cellClass: 'ag-left-aligned-cell',
          tooltipField: 'wordInfo',
          width: 410,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const fetchData = async () => {
        let sampleData = [];
        for (let i = 0; i < 20; i++) {
          sampleData.push({
            id: i,
            radio: '',
            wordName: [
              {
                id: 0,
                type: '범정부',
                label: '간접비',
                color: '#ffffff',
                bgColor: '#24459e',
                size: 52,
              },
            ],
            wordEngName: 'IDRT',
            wordInfo:
              '테스트입니다. 테스트입니다. 테스트입니다. 테스트입니다. ',
          });
        }
        rowData.value = sampleData;
      };

      fetchData();

      const agGrid = ref(null);

      const onConfirm = () => {
        emit('confirm');
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
      };
    },
  };
</script>
