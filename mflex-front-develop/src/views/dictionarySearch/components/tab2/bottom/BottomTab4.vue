<template>
  <div class="tab-inner bottom-tab">
    <div class="grid-wrap" :class="{ 'highlight-grid': showAnimate }">
      <div class="grid-top"></div>
      <div class="grid-list">
        <AppGrid
          :rowData="wrdChgHstryListRowData"
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
  import { reactive, ref, inject, watchEffect, watch } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { getWordHistoryInfo } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch';
  import { $vxHttp } from '@/api';

  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const wrdChgHstryListRowData = reactive({});

  const showAnimate = ref(false);

  export const getWrdChgHstryList = async (srchParamTab4WrdData) => {
    if (
      srchParamTab4WrdData.paramWrdNm != null &&
      srchParamTab4WrdData.paramWrdNm != '' &&
      srchParamTab4WrdData.paramWrdEabbrNm != null &&
      srchParamTab4WrdData.paramWrdEabbrNm != ''
    ) {
      //변경 이력 조회
      const wrdChgHstryInfoListData = await $vxHttp.post(
        `${apiUrl}/dcntry/wrd/chghstrylist`,
        srchParamTab4WrdData
      );
      try {
        console.log(
          'wrdChgHstryInfoListData :',
          wrdChgHstryInfoListData.data.gridWrdChgHstryList
        );
        const wrdTab4FormatData = [];

        if (wrdChgHstryInfoListData.data.gridWrdChgHstryList != null) {
          const wordChgHstryData =
            wrdChgHstryInfoListData.data.gridWrdChgHstryList;
          for (let chi = 0; chi < wordChgHstryData.length; chi++) {
            wrdTab4FormatData.push({
              id: chi,
              chNo: chi + 1,
              chHistDivName: wordChgHstryData[chi].histDvNm,
              chWordName: [
                {
                  id: 0,
                  type: wordChgHstryData[chi].wrdDctnryTypeNm,
                  label: wordChgHstryData[chi].wrdNm,
                  color: wordChgHstryData[chi].wrdDctnryTypeFclrNm,
                  bgColor: wordChgHstryData[chi].wrdDctnryTypeBclrNm,
                  size: 53,
                },
              ],
              chWordEngAbbrName: wordChgHstryData[chi].wrdEabbrNm,
              chWordEngName: wordChgHstryData[chi].wrdEngNm,
              chWordTypeName: wordChgHstryData[chi].wrdTypeNm,
              chDmnClsName: [
                {
                  id: 0,
                  type: wordChgHstryData[chi].dmnClsDctnryTypeNm,
                  label: wordChgHstryData[chi].dmnClsNm,
                  color: wordChgHstryData[chi].dmnClsDctnryTypeFclrNm,
                  bgColor: wordChgHstryData[chi].dmnClsDctnryTypeBclrNm,
                  size: 53,
                },
              ],
              chSmlWordDivNm: wordChgHstryData[chi].wrdSmlwrdDvNm,
              chSynymList: wordChgHstryData[chi].wrdSynymList,
              chFrbwrdList: wordChgHstryData[chi].wrdFrbwrdList,
              chRvsnInfo: wordChgHstryData[chi].rvsnInfo,
              chEnactContents: wordChgHstryData[chi].enactCn,
              chMdfrInfo: wordChgHstryData[chi].updrInfo,
              chMdfDtm: wordChgHstryData[chi].updDtm,
            });
          }
        }
        wrdChgHstryListRowData.value = wrdTab4FormatData;
      } catch (error) {
        console.error('Error getWrdChgHstryList info:', error);
        // 에러 처리 로직
      }
    } else {
      console.error('getWrdChgHstryList: 데이터가 유효하지 않습니다.');
    }
  };

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
      const uiStore = useUiStore();
      const { setGridApis2 } = uiStore;

      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);
      // 사전ID
      const useDctnryId = userStngInfo.value.useDctnryId;

      const srchParamTab4WrdData = reactive({});

      const selectedTab4Data = inject('selectedData');

      const { wordViewSelectData } = storeToRefs(useDictionarySearchStore());

      // 임시 저장 데이터
      let tempHistory = reactive({});

      console.log('selectedTab4Data read:', selectedTab4Data);

      // watchEffect(async () => {
      //   if (selectedTab4Data.value === null) {
      //     wrdChgHstryListRowData.value = [];
      //     return;
      //   }

      //   if (selectedTab4Data.value.data) {
      //     let wordHistoryQuery;

      //     wordHistoryQuery = {
      //       wordDictionaryId: selectedTab4Data.value.data.wordDictionaryId,
      //       wordAbbreviationName:
      //         selectedTab4Data.value.data.wordAbbreviationName,
      //       wordName: selectedTab4Data.value.data.wordName[0].label,
      //     };

      //     console.log('wordHistoryQuery ============', wordHistoryQuery);
      //     tempHistory.value = await getWordHistoryInfo(wordHistoryQuery);
      //   } else {
      //     let wordHistoryQuery = {
      //       wordDictionaryId: selectedTab4Data.value.wordDictionaryId,
      //       wordAbbreviationName: selectedTab4Data.value.wordAbbreviationName,
      //       wordName: selectedTab4Data.value.wordName[0].label,
      //     };

      //     console.log('wordHistoryQuery ============', wordHistoryQuery);
      //     tempHistory.value = await getWordHistoryInfo(wordHistoryQuery);
      //   }

      //   fetchData();

      //   showAnimate.value = true;

      //   setTimeout(() => {
      //     showAnimate.value = false;
      //   }, 1000);
      // });

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
          minWidth: 60,
        },
        {
          headerName: '구분',
          field: 'historyType',
          cellClass: 'grid-cell-centered',
          width: 120,
          minWidth: 120,
        },
        {
          headerName: '단어명',
          field: 'wordName',
          cellClass: 'ag-left-aligned-cell',
          width: 220,
          minWidth: 220,
        },
        {
          headerName: '단어영문약어명',
          field: 'wordAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 220,
          minWidth: 220,
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
          field: 'wordTypeName',
          cellClass: 'grid-cell-centered',
          width: 150,
          minWidth: 150,
        },
        {
          headerName: '도메인분류명',
          field: 'domainClassName',
          cellClass: 'grid-cell-centered',
          width: 150,
          minWidth: 150,
        },
        {
          headerName: '단어설명',
          field: 'wordExplain',
          cellClass: 'grid-cell-centered',
          width: 150,
          minWidth: 150,
        },
        {
          headerName: '제개정일자',
          field: 'revisionInfo',
          cellClass: 'grid-cell-centered',
          width: 130,
          minWidth: 130,
        },
        {
          headerName: '최종수정자',
          field: 'updater',
          cellClass: 'grid-cell-centered',
          width: 120,
          minWidth: 120,
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
        count: 10,
        total: 20,
      });

      // rowData에 변경이력 조회 데이터 할당
      const fetchData = (historyList) => {
        const sampleData = [];

        for (let i = 0; i < historyList.length; i++) {
          sampleData.push({
            id: i,
            no: i + 1,
            historyType: historyList[i].historyDivisionName,
            wordName: historyList[i].wordName,
            wordAbbreviationName: historyList[i].wordAbbreviationName,
            wordEnglishName: historyList[i].wordEnglishName,
            wordTypeName: historyList[i].wordTypeName,
            domainClassName: historyList[i].domainClassName,
            discardYn: historyList[i].discardYn,
            wordExplain: historyList[i].wordExplain,

            revisionInfo: historyList[i].revisionDate,

            updater: historyList[i].updater,
            updateDateTime: historyList[i].updateDateTime,
          });
        }

        console.log('sampleData ===========', sampleData);
        wrdChgHstryListRowData.value = sampleData;
      };

      const agGrid = ref(null);

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

      watch(
        wordViewSelectData,
        async (newVal) => {
          const requestParams = {
            instituteId: newVal.instituteId,
            dictionaryId: newVal.dictionaryId,
            wordName: newVal.wordName[0].label,
            wordAbbreviationName: extractBracketData(
              newVal.wordAbbreviationName
            ),
          };

          const historyList = await getWordHistoryInfo(requestParams);

          fetchData(historyList);

          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 500);
        },
        { immediate: true }
      );

      return {
        agGrid,
        wrdChgHstryListRowData,
        srchParamTab4WrdData,
        columnDefs,
        resultCount,
        selectedTab4Data,
        getWrdChgHstryList,
        showAnimate,
      };
    },
  };
</script>
