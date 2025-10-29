<template>
  <div class="pop-window">
    <div class="window-header">연관컬럼 내역</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row h-450">
          <div class="grid-wrap">
            <div class="grid-top">
              <div class="top-row">
                <div class="title-s">
                  연관컬럼 목록
                  <AppTooltip>
                    <div>테스트 메세지입니다.</div>
                  </AppTooltip>
                </div>
              </div>
              <div class="top-termname-area">
                <span class="termname-label">용어명 : {{ termName }}</span>
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
          <button class="btn-m confirm" @click="onClose">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { reactive, ref } from 'vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  export default {
    props: {
      termRelationList: {
        type: Object,
        required: true,
      },
    },
    components: {
      AppTooltip,
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
      onConfirm() {
        this.$emit('confirm', this.selectedRow);
        this.$emit('close');
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
      callDetailInfo(params) {
        // 필요한 로직 구현
        console.log('callDetailInfo called with params:', params);
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props, { emit }) {
      const rowData = reactive({});
      //const rowData = ref([]);
      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 100,
          dragStatus: false,
        },
        {
          headerName: '테이블명',
          field: 'tableName',
          cellClass: 'ag-left-aligned-cell',
          width: 200,
          dragStatus: false,
        },
        {
          headerName: '테이블한글명',
          field: 'tableKoreanName',
          cellClass: 'ag-left-aligned-cell',
          width: 300,
          dragStatus: false,
        },
        {
          headerName: '구조유형',
          field: 'structureTypeName',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'RadioCellRenderer',
          width: 150,
          dragStatus: false,
        },
        {
          headerName: '스키마명',
          field: 'schemaName',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'RadioCellRenderer',
          width: 150,
          dragStatus: false,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      console.log('props.termRelationList', props.termRelationList);

      const termName = ref('');

      const fetchData = async () => {
        const list = props.termRelationList.value.termRelationList;

        // 용어명 할당
        termName.value =
          `${props.termRelationList.value.relatedColumData.termName}` +
          `[${props.termRelationList.value.relatedColumData.termAbbreviationName}]` +
          ` (${props.termRelationList.value.relatedColumData.logicalDataTypeName})`;
        // termName.value =  props.termRelationList.termName;

        console.log('fetchData', list);

        const relationColumnData = [];
        for (let i = 0; i < list.length; i++) {
          relationColumnData.push({
            no: i + 1,
            tableName: list[i].tableName,
            tableKoreanName: list[i].tableKoreanName,
            structureTypeName: list[i].structureTypeName,
            schemaName: list[i].schemaName,
          });
        }
        rowData.value = relationColumnData;
      };

      fetchData();

      const agGrid = ref(null);

      const onClose = () => {
        emit('close');
      };

      return {
        agGrid,
        rowData,
        columnDefs,
        resultCount,
        onClose,
        props,
        termName,
      };
    },
  };
</script>
