<template>
  <div class="pop-window">
    <div class="window-header">연관 테이블 조회</div>
    <div class="window-body">
      <div class="window-content pt10">
        <div class="tab-comtent__row h-450">
          <div class="grid-wrap">
            <div class="grid-top">
              <div class="top-row">
                <div class="title-s">
                  연관 테이블 목록
                  <AppTooltip :htmlContent="getTooltipById('relatedTableList')">
                  </AppTooltip>
                </div>
                <div></div>
              </div>
            </div>
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
            <div class="grid-bottom"></div>
          </div>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m confirm" @click="onClose">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { reactive, ref } from 'vue';
  import {
    getActualizingColumnAssociation, // 컬럼 연관 테이블 조회
  } from '@/utils/mflexApi/actualizing/actualizingApi';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import { storeToRefs } from 'pinia';

  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import TypeCellRenderer from '@/utils/TypeCellRenderer';
  export default {
    props: {
      selectColumn: {
        type: Object,
        default: () => {},
      },
      selectCode: {
        type: Object,
        default: {},
      },
      columnDetails: {
        type: Object,
        default: {},
      },
    },
    components: { AppTooltip, TypeCellRenderer },

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
      const agGrid = ref(null);
      const rowData = reactive({});
      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 50,
        },
        {
          headerName: '스키마명',
          field: 'shemaName',
          cellClass: 'ag-left-aligned-cell',
          dragStatus: false,
          width: 150,
        },
        {
          headerName: '테이블명',
          field: 'tableName',
          cellClass: 'ag-left-aligned-cell',
          dragStatus: false,
          width: 200,
        },
        {
          headerName: '테이블한글명',
          field: 'tableKoreanName',
          cellClass: 'ag-left-aligned-cell',
          dragStatus: false,
          width: 200,
        },
        {
          headerName: '정제테이블한글명',
          field: 'refineTableKoreanName',
          cellClass: 'ag-left-aligned-cell',
          dragStatus: false,
          width: 240,
        },
        {
          headerName: '표준여부',
          field: 'columnStandardYn',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          width: 100,
        },
      ]);

      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      console.log('props.columnDetails : ', props.columnDetails);

      const fetchData = async () => {
        const list = await getActualizingColumnAssociation(props.columnDetails);

        console.log('getActualizingColumnAssociation response : ', list);

        let sampleData = [];
        for (let i = 0; i < list.length; i++) {
          sampleData.push({
            id: i,
            no: i + 1,
            columnName: list[i].columnName,
            shemaName: list[i].schemaName,
            tableName: list[i].tableName,
            tableKoreanName: list[i].tableKoreanName,
            refineTableKoreanName: list[i].refinedTableKoreanName,
            columnStandardYn: list[i].columnStandardYnName,
          });
        }
        rowData.value = sampleData;
      };

      fetchData();

      const onClose = () => {
        emit('close');
      };

      return {
        agGrid,
        rowData,
        columnDefs,
        onClose,
        getTooltipById,
      };
    },
  };
</script>
