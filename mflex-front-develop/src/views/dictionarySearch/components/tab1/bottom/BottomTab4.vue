<template>
  <div class="tab-inner bottom-tab">
    <div class="grid-wrap" :class="{ 'highlight-grid': showAnimate }">
      <div class="grid-top"></div>
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
      <!-- <div class="grid-bottom"></div> -->
    </div>
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { reactive, ref, watch } from 'vue';
  import { getTermSynonymInfo } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2.js';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch.js';
  import { storeToRefs } from 'pinia';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';

  export default {
    components: {
      TypeCellRenderer,
      GridSearch,
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
      onSearchEnter(value) {
        console.log('onSearchEnter', value);
      },
      onSearchSave() {
        console.log('onSearchSave');
      },
      onSearchSetup() {
        console.log('onSearchSetup');
        this.$emit('searchSetup');
      },
      onSearchRemove() {
        console.log('onSearchRemove');
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    setup(props) {
      const showAnimate = ref(false);

      const agGrid = ref(null);

      const { termViewSelectData } = storeToRefs(useDictionarySearchStore());

      const rowData = reactive({});

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 70,
          minwidth: 70,
        },
        {
          headerName: '용어명',
          field: 'termName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minwidth: 250,
        },
        {
          headerName: '용어영문약어명',
          field: 'termAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minwidth: 250,
        },
        {
          headerName: '도메인명',
          field: 'domainName',
          cellClass: 'grid-cell-centered',
          width: 250,
          minwidth: 250,
        },
        {
          headerName: '용어설명',
          field: 'termExplain',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minwidth: 250,
        },
        {
          headerName: '제개정일자',
          field: 'revisionInfo',
          cellClass: 'grid-cell-centered',
          width: 130,
          minwidth: 130,
        },
        {
          headerName: '최종수정자',
          field: 'updater',
          cellClass: 'grid-cell-centered',
          width: 200,
          minwidth: 200,
        },
        {
          headerName: '최종수정일시',
          field: 'updateDateTime',
          cellClass: 'grid-cell-centered',
          width: 200,
          minwidth: 200,
        },
      ]);

      const resultCount = ref({
        count: '',
        total: '',
      });

      let termSynonym = reactive({});

      const fetchData = async (termSynonymList) => {
        console.log('termSynonym ==========', termSynonymList);
        const tempData = [];

        for (let i = 0; i < termSynonymList.length; i++) {
          tempData.push({
            id: i,
            no: i + 1,
            instituteId: termSynonymList[i].instituteId,
            dictionaryId: termSynonymList[i].dictionaryId,
            termName: termSynonymList[i].termName,
            termExplain: termSynonymList[i].termExplain,
            termAbbreviationName: termSynonymList[i].termAbbreviationName,
            domainName: termSynonymList[i].domainName,
            revisionInfo: termSynonymList[i].revisionDate,
            discardYn: termSynonymList[i].discardYn,
            updateDateTime: termSynonymList[i].updateDateTime,
            updater: termSynonymList[i].updater,
          });
        }

        rowData.value = tempData;
      };

      watch(
        termViewSelectData,
        async (newVal) => {
          console.log('termViewSelectData ===', newVal);
          if (newVal) {
            const requestParams = {
              instituteId: newVal.instituteId,
              dictionaryId: newVal.dictionaryId,
              termName: newVal.termName[0].label,
              termAbbreviationName: newVal.termEngAbbreviationName,
              domainName: newVal.domainName,
            };

            const response = await getTermSynonymInfo(requestParams);
            console.log('termSynonym 조회  ===', response);
            await fetchData(response);
          } else {
            rowData.value = [];
          }

          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 1000);
        },
        { immediate: true }
      );

      return {
        agGrid,
        rowData,
        columnDefs,
        resultCount,
        showAnimate, // 애니메이션 효과
      };
    },
  };
</script>
