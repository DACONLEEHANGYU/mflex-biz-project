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
  import { reactive, ref, inject, watch, watchEffect } from 'vue';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { getCodeRelationTermInfo } from '@/utils/mflexApi/dictionarySearchApi';

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
      const agGrid = ref(null);
      const rowData = reactive({});

      const showAnimate = ref(false);

      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);
      // 사전ID
      const useDctnryId = userStngInfo.value.useDctnryId;

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 70,
        },
        {
          headerName: '용어명',
          field: 'termName',
          cellClass: 'ag-left-aligned-cell',
          cellRenderer: 'TypeCellRenderer',
          valueFormatter: (params) => params.value,
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '용어영문약어명',
          field: 'termAbbreviationName',
          cellClass: 'ag-left-aligned-cell',
          width: 200,
          minWidth: 200,
        },
        {
          headerName: '용어유형',
          field: 'termTypeName',
          cellClass: 'grid-cell-centered',
          width: 200,
          minWidth: 200,
        },

        {
          headerName: '도메인명',
          field: 'domainName',
          cellClass: 'ag-left-aligned-cell',
          cellRenderer: 'TypeCellRenderer',
          valueFormatter: (params) => params.value,
          width: 250,
          minWidth: 250,
        },
        {
          headerName: '용어설명',
          field: 'termExplain',
          cellClass: 'grid-cell-centered',
          width: 200,
          minWidth: 200,
        },

        {
          headerName: '제개정일자',
          field: 'revisionInfo',
          cellClass: 'grid-cell-centered',
          tooltipField: 'wordExplan',
          width: 130,
          minWidth: 130,
        },
        {
          headerName: '최종수정자',
          field: 'updater',
          cellClass: 'grid-cell-centered',

          width: 230,
          minWidth: 230,
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

      const gridDialogState = reactive({
        view: false,
        title: '선택 Cell',
        message: '',
        type: 'alert',
        selectCell: false,
      });

      const selectedTab2Data = inject('selectedData');

      let codeRelationTerm = reactive({});

      /*  watch(selectedTab2Data, async (newTab3Value, oldTab3Value) => {
        // selectedTab3Data의 변화가 있을 경우
        if (newTab3Value !== oldTab3Value) {
          let unityRelationTermQuery = {
            dictionaryId: useDctnryId,
            unityCodeName: newTab3Value.unityCodeName[0].label,
          };
          codeRelationTerm.value = await getCodeRelationTermInfo(
            unityRelationTermQuery
          );
          fetchData();
        }
      }); */

      watchEffect(async () => {
        // firstRowData 변경에 대한 추가적인 처리가 필요하다면 여기에 로직 추가

        if (selectedTab2Data.value === null) {
          rowData.value = [];
          return;
        }

        if (selectedTab2Data.value.data) {
          let unityRelationTermQuery = {
            dictionaryId: useDctnryId,
            unityCodeName: selectedTab2Data.value.data.unityCodeName,
          };
          codeRelationTerm.value = await getCodeRelationTermInfo(
            unityRelationTermQuery
          );
        } else {
          let unityRelationTermQuery = {
            dictionaryId: useDctnryId,
            unityCodeName: selectedTab2Data.value.unityCodeName,
          };
          codeRelationTerm.value = await getCodeRelationTermInfo(
            unityRelationTermQuery
          );
        }

        fetchData();

        showAnimate.value = true;

        setTimeout(() => {
          showAnimate.value = false;
        }, 1000);
      });

      // rowData에 조회한 연관용어 push
      const fetchData = () => {
        const relationTermList = codeRelationTerm.value.data;

        const sampleData = [];

        console.log('relationTermList ===============', relationTermList);

        for (let i = 0; i < relationTermList.length; i++) {
          let revisionInfos = '';
          if (
            relationTermList[i].revisionCycle === null ||
            relationTermList[i].revisionCycle === ''
          ) {
            revisionInfos = `${relationTermList[i].revisionDate}`;
          } else {
            revisionInfos = `${relationTermList[i].revisionDate}(${relationTermList[i].revisionCycle})`;
          }

          sampleData.push({
            id: i,
            no: i + 1,
            termName: [
              {
                id: 0,
                type: relationTermList[i].term.dictionary.type.name,
                label: relationTermList[i].term.name,
                color: relationTermList[i].term.dictionary.type.fontColor,
                bgColor:
                  relationTermList[i].term.dictionary.type.backgroundColor,
                size: 60,
              },
            ],
            termAbbreviationName: relationTermList[i].term.abbreviationName,
            termEnglishName: relationTermList[i].term.englishName,
            termExplain: relationTermList[i].term.explain,
            termTypeName: relationTermList[i].term.typeName,
            domainName: [
              {
                id: 0,
                type: relationTermList[i].domain.dictionary.type.name,
                label: relationTermList[i].domain.name,
                color: relationTermList[i].domain.dictionary.type.fontColor,
                bgColor:
                  relationTermList[i].domain.dictionary.type.backgroundColor,
                size: 60,
              },
            ],
            enactInfo: `${relationTermList[i].enactDate}(${relationTermList[i].enactCycle})`,
            revisionInfo: revisionInfos,
            updater: relationTermList[i].updater,
            updateDateTime: relationTermList[i].updateDateTime,
          });
        }
        rowData.value = sampleData;
      };

      const onClickCellData = (data) => {
        console.log('data.value ===', data.value[0]);

        // 단어설명
        if (data.column.colId === 'wordExplan') {
          gridDialogState.view = true;
          gridDialogState.message = data.value;
          gridDialogState.selectCell = false;
          gridDialogState.title = data.column.userProvidedColDef.headerName;
          /* if (typeof data === 'object') {
            gridDialogState.selectCell = true;
          } else {
            gridDialogState.selectCell = false;
          } */

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

      return {
        agGrid,
        rowData,
        columnDefs,
        resultCount,
        gridDialogState,
        onClickCellData,
        showAnimate,
      };
    },
  };
</script>
