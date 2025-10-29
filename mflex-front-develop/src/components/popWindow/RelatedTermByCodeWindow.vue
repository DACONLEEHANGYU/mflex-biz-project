<template>
  <div class="pop-window">
    <div class="window-header">연관용어 내역</div>
    <div class="window-body">
      <div class="window-content pt10">
        <div class="tab-comtent__row h-450">
          <div class="grid-wrap">
            <div class="grid-top">
              <div class="top-row">
                <div class="title-s">
                  연관용어 목록
                  <AppTooltip>
                    <div>테스트 메세지입니다.<br />메세지를 입력하세요.</div>
                  </AppTooltip>
                </div>
                <div>
                  <!-- <div class="info-warning">
                  <i class="icon"></i>
                  연관용어가 있어 해당 작업은 실행이 불가능합니다. 작업을
                  취소하고 연관용어에 대한 변경/삭제 처리를 먼저 수행해주세요.
                </div> -->
                </div>
              </div>
              <div class="top-row" style="border-top: none">
                <div class="top-apptext">
                  <span>통합코드명 :</span>
                  &nbsp;&nbsp;
                  <AppStateText v-model="selectedCode.unityCodeKoreanName" />
                </div>
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
          <button class="btn-m confirm" @click="onConfirm">확인</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { reactive, ref } from 'vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import TypeCellRenderer from '@/utils/TypeCellRenderer';
  export default {
    props: {
      propsRelatedTermList: {
        type: Array,
        default: () => [],
      },
      selectCode: {
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
      console.log('propsRelatedTermList : ', props.propsRelatedTermList);
      console.log('props.selectDomain : ', props.selectCode);

      const selectedCode = props.selectCode;
      console.log('selectedCode : ', selectedCode);
      const rowData = reactive({});
      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 50,
        },
        {
          headerName: '용어명',
          field: 'termName',
          cellClass: 'ag-left-aligned-cell',
          cellRenderer: 'TypeCellRenderer',
          valueFormatter: (params) => params.value,
          dragStatus: false,
          width: 200,
        },
        {
          headerName: '용어영문약어명',
          field: 'termEngAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          dragStatus: false,
          width: 200,
        },
        {
          headerName: '용어유형',
          field: 'termType',
          cellClass: 'grid-cell-centered',
          dragStatus: false,
          width: 130,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const fetchData = async () => {
        const list = props.propsRelatedTermList;

        console.log('list : ', list);
        console.log('list.length : ', list.length);

        let sampleData = [];
        for (let i = 0; i < list.length; i++) {
          sampleData.push({
            id: i,
            no: i + 1,
            termName: [
              {
                id: 0,
                type: list[i].term.dictionary.type.name,
                label: list[i].term.name,
                color: list[i].term.dictionary.type.fontColor,
                bgColor: list[i].term.dictionary.type.backgroundColor,
                size: 60,
              },
            ],
            termEngAbbreviationName: list[i].term.abbreviationName,
            termType: list[i].term.typeName,
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
        selectedCode,
      };
    },
  };
</script>
