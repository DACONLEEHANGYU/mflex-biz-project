<template>
  <div class="pop-window">
    <div class="window-header">일괄 영문약어 생성</div>
    <div class="window-body">
      <div class="row col-2">
        <div class="col-box">
          <div class="window-title">
            <div class="title-text">용어 목록</div>
            <div class="title-btns"></div>
          </div>
          <div class="window-content">
            <div class="grid-wrap" style="height: 400px">
              <div class="grid-top"></div>
              <div class="grid-list">
                <AppGrid
                  class="check-single"
                  :rowData="rowData1"
                  :columnDefs="columnDefs1"
                  :context="context"
                  rowSelection="signle"
                  ref="agGrid"
                />
              </div>
            </div>
          </div>
        </div>
        <div class="col-box">
          <div class="window-title">
            <div class="title-text">추천 영문약어</div>
            <div class="title-btns">
              <button class="btn-s green">확인</button>
            </div>
          </div>
          <div class="window-content">
            <div class="grid-wrap" style="height: 400px">
              <div class="grid-top"></div>
              <div class="grid-list">
                <AppGrid
                  class="check-single"
                  :rowData="rowData2"
                  :columnDefs="columnDefs2"
                  :context="context"
                  rowSelection="signle"
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
          <button class="btn-m confirm" @click="onClose">저장</button>
          <button class="btn-m close" @click="onClose">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { ref, reactive } from 'vue';
  import RadioCellRenderer from '@/utils/RadioCellRenderer.js';

  import StatusCellRenderer from '@/utils/StatusCellRenderer.js';
  export default {
    components: {
      RadioCellRenderer,
      StatusCellRenderer,
      AppWarningTooltip,
    },
    data() {
      return {
        context: null,
      };
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    methods: {
      callDetailInfo(value) {
        console.log('[window callDetailInfo] ' + value);
      },
      onClose() {
        this.$emit('close');
      },
    },
    setup(props) {
      const rowData1 = reactive({});
      const columnDefs1 = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 50,
        },
        {
          headerName: '용어명',
          field: 'termName',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '용어영문 약어명',
          field: 'termEng',
          cellClass: 'grid-cell-centered',
          width: 200,
        },
        {
          headerName: '조합상태',
          field: 'combinationStatus',
          cellClass: 'grid-cell-centered',
          width: 80,
          cellRenderer: 'StatusCellRenderer',
        },
      ]);

      const rowData2 = reactive({});
      const columnDefs2 = reactive([
        {
          headerName: '조합 순번',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 80,
        },
        {
          headerName: '단어 한글명',
          field: 'wordKorName',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '단어 영문 약어명',
          field: 'wordEngName',
          cellClass: 'grid-cell-centered',
          width: 150,
        },
        {
          headerName: '선택',
          field: 'selected',
          cellClass: 'grid-cell-centered',
          width: 60,
          cellRenderer: 'RadioCellRenderer',
        },
      ]);

      const fetchData = async () => {
        // const { data } = await $vxHttp.get('./sampleData/ueMonitoringData.json');
        // rowData.value = data;
        const sampleData1 = [];
        for (let i = 0; i < 15; i++) {
          sampleData1.push({
            id: i,
            no: i + 1,
            termName: '대출일자',
            termEng: 'USER_PHONE_NO',
            combinationStatus: i < 7 ? '완료' : '미완료',
          });
        }
        rowData1.value = sampleData1;

        const sampleData2 = [];
        for (let i = 0; i < 10; i++) {
          sampleData2.push({
            id: i,
            no: i + 1,
            wordKorName: '자료',
            wordEngName: 'DATA',
            selected: 0,
          });
        }
        rowData2.value = sampleData2;
      };

      fetchData();

      return {
        rowData1,
        columnDefs1,
        rowData2,
        columnDefs2,
      };
    },
  };
</script>

<style lang="scss" scoped></style>
