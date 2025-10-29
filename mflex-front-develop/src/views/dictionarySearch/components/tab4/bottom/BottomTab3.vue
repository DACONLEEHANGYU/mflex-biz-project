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
    </div>
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { reactive, ref, inject, watchEffect } from 'vue';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { getHierarchyCodeValueInfo } from '@/utils/mflexApi/dictionarySearchApi';

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

      const selectTab3ValueData = inject('codeValueSelectData');

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 70,
        },
        {
          headerName: '통합코드값명',
          field: 'unityCodeValueName',
          cellClass: 'ag-left-aligned-cell',
          cellRenderer: 'TypeCellRenderer',
          valueFormatter: (params) => params.value,
          width: 700,
        },
        {
          headerName: '레벨',
          field: 'unityCodeLevel',
          cellClass: 'grid-cell-centered',
          width: 100,
        },
        {
          headerName: '제개정일자',
          field: 'revisionInfo',
          cellClass: 'grid-cell-centered',
          width: 200,
        },
        {
          headerName: '최종수정자',
          field: 'updater',
          cellClass: 'grid-cell-centered',
          width: 130,
        },
        {
          headerName: '최종수정일시',
          field: 'updateDateTime',
          cellClass: 'grid-cell-centered',
          width: 200,
        },
      ]);

      let structureCodeData = reactive({});

      // 반응형 데이터 모니터링
      watchEffect(async () => {
        console.log('selectTab3ValueData ==', selectTab3ValueData);

        if (!selectTab3ValueData.value) {
          rowData.value = [];
          return;
        }

        if (
          selectTab3ValueData.value.codeTypeName == '계층코드' ||
          selectTab3ValueData.value.data.codeTypeName == '계층코드'
        ) {
          if (selectTab3ValueData.value.data) {
            let structuredCodeValueQuery = {
              unityCodeDictionaryId:
                selectTab3ValueData.value.data.unityDictionaryId,
              unityCodeName: selectTab3ValueData.value.data.unityCodeName,
              unityCodeValue: selectTab3ValueData.value.data.unityCodeValue,
            };
            structureCodeData.value = await getHierarchyCodeValueInfo(
              structuredCodeValueQuery
            );
            fetchData();
          } else {
            let structuredCodeValueQuery = {
              unityCodeDictionaryId:
                selectTab3ValueData.value.unityDictionaryId,
              unityCodeName: selectTab3ValueData.value.unityCodeName,
              unityCodeValue: selectTab3ValueData.value.unityCodeValue,
            };
            structureCodeData.value = await getHierarchyCodeValueInfo(
              structuredCodeValueQuery
            );
            console.log('structureCodeData.value ==', structureCodeData.value);
            fetchData();
          }
        } else {
          rowData.value = [];
        }
        showAnimate.value = true;

        setTimeout(() => {
          showAnimate.value = false;
        }, 1000);
      });

      const fetchData = () => {
        const structureCodeList = structureCodeData.value;

        console.log('structureCodeList ===', structureCodeList);
        const codes = structureCodeList.data;
        const structureTemp = [];

        for (let i = 0; i < codes.length; i++) {
          let revisionInfos = '';

          if (
            codes[i].revisionCycle === null ||
            codes[i].revisionCycle === ''
          ) {
            revisionInfos = `${codes[i].revisionDate}`;
          } else {
            revisionInfos = `${codes[i].revisionDate}(${codes[i].revisionCycle})`;
          }

          structureTemp.push({
            id: i,
            no: i + 1,
            unityCodeLevel: codes[i].unityCode.level,
            unityCodeValueName: [
              {
                id: 0,
                type: codes[i].unityCode.dictionary.type.name,
                label: codes[i].unityCode.valueName,
                color: codes[i].unityCode.dictionary.type.fontColor,
                bgColor: codes[i].unityCode.dictionary.type.backgroundColor,
                size: 60,
                unityCodeLevel: codes[i].unityCode.level,
              },
            ],
            revisionInfo: revisionInfos,
            updater: codes[i].updater,
            updateDateTime: codes[i].updateDateTime,
          });
        }

        rowData.value = structureTemp;
      };

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      return {
        agGrid,
        rowData,
        columnDefs,
        resultCount,
        showAnimate,
      };
    },
  };
</script>
