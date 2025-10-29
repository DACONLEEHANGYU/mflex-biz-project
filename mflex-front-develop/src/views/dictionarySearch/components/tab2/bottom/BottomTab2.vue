<template>
  <div class="tab-inner bottom-tab">
    <div class="grid-wrap" :class="{ 'highlight-grid': showAnimate }">
      <div class="grid-top"></div>
      <div class="grid-list">
        <AppGrid
          :rowData="wrdSmlListRowData"
          :columnDefs="columnDefs"
          :context="context"
          rowSelection="single"
          @cellWasClicked="onCellClicked"
          @rowDoubleClicked="onRowDoubleClicked"
          @rowClicked="onRowClicked"
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
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { getWordSynonymInfo } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2';
  import { storeToRefs } from 'pinia';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch';
  import { getWordSimilarInfo } from '@/utils/mflexApi/dictionarySearchApi';

  export default {
    components: {
      TypeCellRenderer,
      GridSearch,
    },

    data() {
      return {
        context: null,
        selectedRow: {},
        selectCell: {},
      };
    },
    methods: {
      onCellClicked(value) {
        console.log('onCellClicked', value);
        this.selecteCell = value;
        console.log('====================', this.selecteCell);
      },
      onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedRow = value;
      },
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked 구성단어', value);
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
      const uiStore = useUiStore();
      const { setGridApis2 } = uiStore;
      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);
      // 사전ID
      const useDctnryId = userStngInfo.value.useDctnryId;

      const wrdSmlListRowData = reactive({});

      const { wordViewSelectData } = storeToRefs(useDictionarySearchStore());

      const showAnimate = ref(false);

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
          minWidth: 60,
        },
        {
          headerName: '단어명',
          field: 'wordName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '단어영문약어명',
          field: 'wordEngAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '단어영문명',
          field: 'wordEnglishName',
          cellClass: 'ag-left-aligned-cell',
          tooltipField: 'wordEngName',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '단어유형',
          field: 'wordType',
          cellClass: 'grid-cell-centered',
          width: 150,
          minWidth: 150,
        },
        {
          headerName: '도메인분류명',
          field: 'domainClassName',
          cellClass: 'ag-left-aligned-cell',
          width: 130,
          minWidth: 130,
        },
        {
          headerName: '단어설명',
          field: 'wordExplain',
          cellClass: 'ag-left-aligned-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '제개정일자',
          field: 'revisionInfo',
          cellClass: 'grid-cell-centered',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '최종수정자',
          field: 'updater',
          cellClass: 'grid-cell-centered',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '최종수정일시',
          field: 'updateDateTime',
          cellClass: 'grid-cell-centered',
          width: 200,
          minWidth: 200,
        },
      ]);

      const resultCount = ref({
        count: 0,
        total: 0,
      });

      // rowData 에 조회된 데이터 할당
      const fetchData = async (synonymList) => {
        const sampleData = [];

        for (let i = 0; i < synonymList.length; i++) {
          sampleData.push({
            id: i,
            no: i + 1,
            instituteId: synonymList[i].instituteId,
            dictionaryId: synonymList[i].dictionaryId,
            wordName: synonymList[i].wordName,
            wordEngAbbreviationName: synonymList[i].wordAbbreviationName,
            wordEnglishName: synonymList[i].wordEnglishName,
            wordType: synonymList[i].wordTypeName,
            wordExplain: synonymList[i].wordExplain,
            discardYn: synonymList[i].discardYn,
            domainClassName: synonymList[i].domainClassName,
            revisionInfo: synonymList[i].revisionDate,
            updater: synonymList[i].updater,
            updateDateTime: synonymList[i].updateDateTime,
          });
        }
        wrdSmlListRowData.value = sampleData;
      };

      function extractBracketData(input) {
        // 입력값이 문자열이 아니면 null 반환
        if (typeof input !== 'string') {
          return null;
        }

        // 정규식을 사용하여 대괄호 안의 내용 추출
        const regex = /\[(.*?)\]/;
        const match = input.match(regex);

        // 매치된 결과가 있으면 첫 번째 그룹(대괄호 안의 내용) 반환
        if (match && match[1]) {
          return match[1];
        } else {
          return input;
        }
      }

      const agGrid = ref(null);

      watch(
        wordViewSelectData,
        async (newVal) => {
          console.log('단어 이음동의어 조회 =============', newVal);

          let wordTypeCode;

          switch (newVal.wordTypeName) {
            case '일반어':
              wordTypeCode = 'GENERAL';
              break;
            case '분류어':
              wordTypeCode = 'CLASSIFICATION';
              break;
            case '이음동의어':
              wordTypeCode = 'SYNONYM';
              break;
            case '대체어':
              wordTypeCode = 'ALTERNATIVE';
              break;
            case '금칙어':
              wordTypeCode = 'PROHIBITIVE';
              break;
            default:
              wordTypeCode = newVal.wordTypeCode;
          }

          const requestParams = {
            instituteId: newVal.instituteId,
            dictionaryId: newVal.dictionaryId,
            wordName: newVal.wordName[0].label,
            wordAbbreviationName: newVal.wordAbbreviationName,
            wordTypeCode: wordTypeCode,
          };

          const synonymList = await getWordSynonymInfo(requestParams);

          fetchData(synonymList);

          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 500);
        },
        { immediate: true }
      );

      return {
        agGrid,
        wrdSmlListRowData,
        columnDefs,
        resultCount,
        showAnimate,
      };
    },
  };
</script>
