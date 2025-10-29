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
          @cellClicked="onCellClicked"
          @rowClicked="onRowClicked"
          ref="agGrid"
        />
      </div>
      <!-- <div class="grid-bottom"></div> -->
      <AppDialog
        v-model:view="gridDialogState.view"
        :title="gridDialogState.title"
        :message="gridDialogState.message"
        :type="gridDialogState.type"
        :selectCellTypeObject="gridDialogState.selectCell"
      />
    </div>
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { reactive, ref, inject, watch, watchEffect, nextTick } from 'vue';

  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { getTermStructureWord } from '@/utils/mflexApi/dictionarySearchApi';
  import { getTermWordInfo } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2.js';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch.js';

  const { termViewSelectData } = storeToRefs(useDictionarySearchStore());

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
      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);

      const showAnimate = ref(false);

      const onClickCellData = (data) => {
        console.log('data.value ===', data.value[0]);

        // 단어설명
        if (data.column.colId === 'wordExplan') {
          gridDialogState.view = true;
          gridDialogState.message = data.value;
          gridDialogState.selectCell = false;
          gridDialogState.title = data.column.userProvidedColDef.headerName;

          // 이음동의어 목록
        } else if (
          data.column.colId === 'jointSynonymList' &&
          data.value[0] != null
        ) {
          gridDialogState.view = true;
          gridDialogState.selectCell = true;
          gridDialogState.message = data.value;
          gridDialogState.title = data.column.userProvidedColDef.headerName;
        } else if (
          data.column.colId === 'forbiddenList' &&
          data.value[0] != null
        ) {
          gridDialogState.view = true;
          gridDialogState.selectCell = true;
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

      const rowData = reactive({});

      // 초기 데이터, 선택 용어 데이터 상위에서 inject
      const termSelectTab2Data = inject('selectedData');
      const useDctnryId = userStngInfo.value.useDctnryId;

      let termStructureWord = reactive({});

      watchEffect(async () => {
        await nextTick();
        console.log(rowData.value);

        showAnimate.value = true;

        setTimeout(() => {
          showAnimate.value = false;
        }, 1000);
      });

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 70,
          minWidth: 70,
        },

        {
          headerName: '단어영문약어명',
          field: 'wordEngAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '단어명',
          field: 'wordName',
          cellClass: 'grid-cell-centered',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '단어유형',
          field: 'wordType',
          cellClass: 'grid-cell-centered',
          width: 100,
          minWidth: 100,
        },
        {
          headerName: '도메인분류명',
          field: 'domainClassificationName',
          cellClass: 'grid-cell-centered',
          width: 170,
          minWidth: 170,
        },
        {
          headerName: '단어영문명',
          field: 'wordEnglishName',
          cellClass: 'ag-left-aligned-cell',
          tooltipField: 'wordEnglishName',
          width: 130,
          minWidth: 130,
        },
        {
          headerName: '이음동의어목록',
          field: 'jointSynonymList',
          cellClass: 'grid-cell-centered',
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '제개정일자',
          field: 'revisionInfo',
          cellClass: 'grid-cell-centered',
          tooltipField: 'revisionInfo',
          width: 120,
          minWidth: 120,
        },
        {
          headerName: '최종수정자',
          field: 'lastModifiedInfo',
          cellClass: 'grid-cell-centered',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '최종수정일시',
          field: 'lastChangeDate',
          cellClass: 'grid-cell-centered',
          width: 200,
          minWidth: 200,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const fetchData = async (data) => {
        console.log('termStructureWord.value ===', data);
        const wordList = data;
        console.log('wordList : ', wordList);
        const sampleData = [];

        for (let i = 0; i < wordList.length; i++) {
          if (
            wordList[i].revisionCycle === null ||
            wordList[i].revisionCycle === ''
          ) {
            wordList[i].revisionCycle = '';
          } else {
            wordList[i].revisionCycle = `(${wordList[i].revisionCycle})`;
          }
          sampleData.push({
            id: i,
            no: i + 1,
            wordEngAbbreviationName: wordList[i].wordAbbreviationName,
            wordEnglishName: wordList[i].wordEnglishName,
            wordName: wordList[i].wordName,
            wordType: wordList[i].wordTypeName,
            jointSynonymList: wordList[i].synonymList,
            domainClassificationName: wordList[i].domainClassName,
            revisionInfo: `${wordList[i].revisionDate}`,
            lastModifiedInfo: wordList[i].updater,
            lastChangeDate: wordList[i].updateDateTime,
          });
        }

        console.log('sampleData =====================', sampleData);
        rowData.value = sampleData;
      };

      const agGrid = ref(null);

      watch(
        termViewSelectData,
        async (newValue) => {
          // 데이터가 없을 시
          if (!newValue) {
            rowData.value = [];
            return;
          }

          console.log('termViewSelectData ===', newValue);

          const requestParams = {
            instituteId: newValue.instituteId,
            dictionaryId: newValue.dictionaryId,
            termName: newValue.termName[0].label,
            termAbbreviationName: newValue.termEngAbbreviationName,
            domainName: newValue.domainName,
          };

          const response = await getTermWordInfo(requestParams);
          console.log('구성단어 조회  ===', response);
          fetchData(response);
        },
        { immediate: true }
      );

      return {
        agGrid,
        rowData,
        columnDefs,
        resultCount,
        gridDialogState,
        onClickCellData,
        showAnimate, // 애니메이션 효과
      };
    },
  };
</script>
