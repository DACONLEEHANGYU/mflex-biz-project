<template>
  <div class="tab-inner bottom-tab">
    <div class="grid-wrap" :class="{ 'highlight-grid': showAnimate }">
      <div class="grid-top"></div>
      <div class="grid-list">
        <AppGrid
          :rowData="wrdRelTrmListRowData"
          :columnDefs="columnDefs"
          :context="context"
          rowSelection="single"
          @cellClicked="onCellClicked"
          @rowDoubleClicked="onRowDoubleClicked"
          ref="agGrid"
        />
      </div>
      <AppDialog
        v-model:view="gridDialogState.view"
        :title="gridDialogState.title"
        :message="gridDialogState.message"
        :type="gridDialogState.type"
        :selectCellTypeObject="gridDialogState.selectCell"
      />
      <!-- <div class="grid-bottom"></div> -->
    </div>
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { reactive, ref, inject, watchEffect, watch } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch';
  import { getWordRelatedTermList } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2';
  import { $vxHttp } from '@/api';

  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const wrdRelTrmListRowData = reactive({});

  const showAnimate = ref(false);

  export const getWrdRelTrmList = async (srchParamTab3WrdData) => {
    if (
      srchParamTab3WrdData.paramWrdNm != null &&
      srchParamTab3WrdData.paramWrdNm != '' &&
      srchParamTab3WrdData.paramWrdEabbrNm != null &&
      srchParamTab3WrdData.paramWrdEabbrNm != ''
    ) {
      //연관 용어 조회
      const wrdRelTrmInfoListData = await $vxHttp.post(
        `${apiUrl}/dcntry/wrd/reltrmlist`,
        srchParamTab3WrdData
      );
      try {
        console.log('wrdRelTrmInfoListData', wrdRelTrmInfoListData.data);

        const wrdTab3FormatData = [];
        if (wrdRelTrmInfoListData.data.gridRelTermList != null) {
          const relTrmData = wrdRelTrmInfoListData.data.gridRelTermList;
          for (let rti = 0; rti < relTrmData.length; rti++) {
            wrdTab3FormatData.push({
              id: rti,
              relTrmNo: rti + 1,
              relTrmName: [
                {
                  id: 0,
                  type: relTrmData[rti].trmDctnryTypeNm,
                  label: relTrmData[rti].trmNm,
                  color: relTrmData[rti].trmDctnryTypeFclrNm,
                  bgColor: relTrmData[rti].trmDctnryTypeBclrNm,
                  size: 53,
                },
              ],
              relTrmEngAbbrName: relTrmData[rti].trmEabbrNm,
              relTrmEngName: relTrmData[rti].trmEngNm,
              relTrmExplan: relTrmData[rti].trmExpln,
              relTrmTypeName: relTrmData[rti].trmTypeNm,
              relTrmDomainName: [
                {
                  id: 0,
                  type: relTrmData[rti].dmnDctnryTypeNm,
                  label: relTrmData[rti].dmnNm,
                  color: relTrmData[rti].dmnDctnryTypeFclrNm,
                  bgColor: relTrmData[rti].DMNDctnryTypeBclrNm,
                  size: 53,
                },
              ],
              relTrmEnactInfo: relTrmData[rti].enactInfo,
              relTrmRvsnInfo: relTrmData[rti].rvsnInfo,
              relTrmMdfrInfo: relTrmData[rti].updrInfo,
              relTrmMdfDtm: relTrmData[rti].updDtm,
            });
          }
        }
        wrdRelTrmListRowData.value = wrdTab3FormatData;
      } catch (error) {
        console.error('Error getWrdRelTrmList info:', error);
        // 에러 처리 로직
      }
    } else {
      console.error('getWrdRelTrmList: 데이터가 유효하지 않습니다.');
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
      onCellClicked(value) {
        console.log('onCellClicked', value);
        this.selectedRow = value;
        this.onClickCellData(value);
      },
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

      const { wordViewSelectData } = storeToRefs(useDictionarySearchStore());

      // 클릭 시 다이얼로그 바인딩 함수
      const onClickCellData = (data) => {
        console.log('data.value ===', data.value[0]);

        // 용어 설명
        if (data.column.colId === 'termExplain') {
          gridDialogState.view = true;
          gridDialogState.message = data.value;
          gridDialogState.title = data.column.userProvidedColDef.headerName;
        }
      };

      const gridDialogState = reactive({
        view: false,
        title: '선택 Cell',
        message: '',
        type: 'alert',
        selectCell: false,
      });

      const srchParamTab3WrdData = reactive({});

      const selectedTab3Data = inject('selectedData');

      // 임시 저장 데이터
      let tempRelationTerm = reactive({});

      // watchEffect(async () => {
      //   if (selectedTab3Data.value === null) {
      //     wrdRelTrmListRowData.value = [];
      //     return;
      //   }
      //   // firstRowData 변경에 대한 추가적인 처리가 필요하다면 여기에 로직 추가

      //   if (selectedTab3Data.value.data) {
      //     let wordRelationQuery;

      //     wordRelationQuery = {
      //       dictionaryId: useDctnryId,
      //       wordAbbreviationName:
      //         selectedTab3Data.value.data.wordAbbreviationName,
      //     };

      //     tempRelationTerm.value = await getWordRelationTermInfo(
      //       wordRelationQuery
      //     );
      //   } else {
      //     let wordRelationQuery = {
      //       dictionaryId: useDctnryId,
      //       wordAbbreviationName: selectedTab3Data.value.wordAbbreviationName,
      //     };
      //     tempRelationTerm.value = await getWordRelationTermInfo(
      //       wordRelationQuery
      //     );
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
        },
        {
          headerName: '용어명',
          field: 'termName',
          cellClass: 'ag-left-aligned-cell',

          width: 250,
          minWidth: 250,
        },
        {
          headerName: '용어영문약어명',
          field: 'termAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '표준구분',
          field: 'standardYnName',
          cellClass: 'grid-cell-centered',
          width: 100,
          minWidth: 100,
        },
        {
          headerName: '용어유형',
          field: 'termTypeName',
          cellClass: 'grid-cell-centered',
          width: 100,
          minWidth: 100,
        },
        {
          headerName: '도메인명',
          field: 'domainName',
          cellClass: 'ag-left-aligned-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '코드유형',
          field: 'codeTypeName',
          cellClass: 'ag-left-aligned-cell',
          tooltipField: 'wordEngName',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '코드명',
          field: 'codeName',
          cellClass: 'ag-left-aligned-cell',
          tooltipField: 'wordEngName',
          width: 200,
          minWidth: 200,
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
          width: 150,
          minWidth: 150,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      // rowData에 조회한 연관용어 push
      const fetchData = (relatedTermList) => {
        const sampleData = [];

        console.log('relatedTermList ===============', relatedTermList);

        for (let i = 0; i < relatedTermList.length; i++) {
          sampleData.push({
            id: i,
            no: i + 1,
            instituteId: relatedTermList[i].instituteId,
            dictionaryId: relatedTermList[i].dictionaryId,
            discardYn: relatedTermList[i].discardYn,
            standardYnName: relatedTermList[i].termStandardYnName,
            codeTypeName: relatedTermList[i].codeTypeName,
            codeName: relatedTermList[i].codeName,
            termName: relatedTermList[i].termName,
            termAbbreviationName: relatedTermList[i].termAbbreviationName,
            termEnglishName: relatedTermList[i].termEnglishName,
            termExplain: relatedTermList[i].termExplain,
            termTypeName: relatedTermList[i].termTypeName,
            domainName: relatedTermList[i].domainName,
            revisionInfo: relatedTermList[i].revisionDate,
            updater: relatedTermList[i].updater,
            updateDateTime: relatedTermList[i].updateDateTime,
          });
        }
        wrdRelTrmListRowData.value = sampleData;
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
          console.log('연관용어 조회 =============', newVal);

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
            wordAbbreviationName: extractBracketData(
              newVal.wordAbbreviationName
            ),
            wordTypeCode: wordTypeCode,
          };

          const relatedTermList = await getWordRelatedTermList(requestParams);
          // 연관용어 조회
          fetchData(relatedTermList);

          showAnimate.value = true;

          setTimeout(() => {
            showAnimate.value = false;
          }, 1000);
        },
        { immediate: true }
      );

      return {
        agGrid,
        wrdRelTrmListRowData,
        srchParamTab3WrdData,
        columnDefs,
        resultCount,
        selectedTab3Data,
        getWrdRelTrmList,
        onClickCellData,
        gridDialogState,
        showAnimate,
      };
    },
  };
</script>
