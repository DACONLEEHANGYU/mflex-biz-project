<template>
  <div v-if="!searchState" class="no-data">데이터가 없습니다.</div>
  <div class="tab-inner bottom-tab" v-else-if="searchState">
    <!-- <div class="tab-inner bottom-tab"> -->
    <div class="col col-2">
      <div
        class="inputs-wrap"
        style="flex: 0 0 42%"
        :class="{ 'highlight-effect': showAnimate }"
      >
        <div class="input-form">
          <table class="input-table">
            <colgroup>
              <col width="20%" />
              <col width="30%" />
              <col width="20%" />
              <col width="" />
            </colgroup>
            <tbody>
              <tr>
                <th>통합코드한글명</th>
                <td colspan="3">
                  <div class="td-col">
                    {{ termRelationCodeData.koreanName }}
                  </div>
                </td>
              </tr>
              <tr>
                <th>통합코드명</th>
                <td colspan="3">
                  <div class="td-col">
                    <AppStateText
                      v-model="termRelationCodeData.unityCodeName"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th>통합코드유형</th>
                <td colspan="3">
                  <div class="td-col">{{ termRelationCodeData.typeName }}</div>
                </td>
              </tr>
              <tr>
                <th>데이터타입</th>
                <td colspan="3">
                  <div class="td-col">
                    {{ termRelationCodeData.dataTypeName }}
                  </div>
                </td>
              </tr>
              <tr>
                <th>통합코드설명</th>
                <td colspan="3" class="pd0">
                  <div class="td-col">
                    <textarea
                      readonly
                      style="height: 50px"
                      v-model="termRelationCodeData.explain"
                    ></textarea>
                  </div>
                </td>
              </tr>
              <tr>
                <th>관리부서명</th>
                <td colspan="3">
                  <div class="td-col">
                    {{ termRelationCodeData.managementDepartmentName }}
                  </div>
                </td>
              </tr>
              <tr>
                <th>제개정일자</th>
                <td colspan="3">
                  <div class="td-col">
                    {{ termRelationCodeData.revisionInfo }}
                  </div>
                </td>
              </tr>
              <tr>
                <th>최종수정자</th>
                <td>
                  <div class="td-col">{{ termRelationCodeData.updater }}</div>
                </td>
                <th>최종수정일시</th>
                <td>
                  <div class="td-col">
                    {{ termRelationCodeData.updateDateTime }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div class="grid-wrap">
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
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { reactive, ref, inject, watchEffect, watch } from 'vue';
  import { DragCol } from 'vue-resizer';
  import {
    getTermCodeNameInfo,
    getTermCodeValueInfo,
  } from '@/utils/mflexApi/dictionarySearch/dictionarySearchV2.js';
  import { useDictionarySearchStore } from '@/stores/dictionarySearch.js';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
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
      onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedRow = value;
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
      const searchState = ref(false);

      const { termViewSelectData } = storeToRefs(useDictionarySearchStore());

      const rowData = reactive([]);

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 70,
          minWidth: 70,
        },
        {
          headerName: '통합코드값',
          field: 'unityCodeValue',
          cellClass: 'grid-cell-centered',
          width: 150,
          minWidth: 150,
        },
        {
          headerName: '통합코드값명',
          field: 'unityCodeName',
          cellClass: 'grid-cell-centered',
          width: 150,
          minWidth: 150,
        },
        {
          headerName: '통합코드값설명',
          field: 'unityCodeExplain',
          cellClass: 'grid-cell-centered',
          width: 130,
          minWidth: 130,
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
          field: 'lastModifiedDate',
          cellClass: 'grid-cell-centered',
          width: 200,
          minWidth: 200,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const termSelectTab5Data = inject('selectedData');
      const termFirstTab5Data = inject('first-row-selected');

      const useDctnryId = userStngInfo.value.useDctnryId;

      let termRelationCodeValue = reactive({});

      const termRelationCodeData = reactive({
        unityCodeName: {
          type: '',
          label: '',
          color: '',
          bgColor: '',
          size: 60,
        },
        explain: '',
        koreanName: '',
        typeName: '',
        dataTypeName: '',
        managementDepartmentName: '',
        enactInfo: '',
        revisionInfo: '',
        updateDateTime: '',
        updater: '',
      });

      // 임시 저장 데이터
      let tempData;

      // rowData 에 조회된 데이터 할당
      const fetchData = async (codeList) => {
        // const { data } = await $vxHttp.get('./sampleData/ueMonitoringData.json');
        // rowData.value = data;

        const sampleData = [];
        for (let i = 0; i < codeList.length; i++) {
          sampleData.push({
            id: i,
            no: i + 1,
            instituteId: codeList[i].instituteId,
            dictionaryId: codeList[i].dictionaryId,

            unityCodeValue: codeList[i].unityCodeValue,
            unityCodeValueName: codeList[i].unityCodeValueName,
            unityCodeName: codeList[i].unityCodeName,
            discardYn: codeList[i].discardYn,
            revisionDate: codeList[i].revisionDate,
            lastModifiedInfo: codeList[i].updater,
            lastModifiedDate: codeList[i].updateDateTime,
          });
        }
        rowData.value = sampleData;
      };

      // 연관통합코드 바인딩
      const bindingCodeData = (tempData) => {
        const resultData = tempData.data;
        console.log('연관통합코드 resultData=================', resultData);
        if (resultData.code == 1021) {
          searchState.value = false;
          return null;
        } else {
          // 조회결과에 따른 렌더링
          searchState.value = true;

          termRelationCodeData.instituteId = resultData.instituteId;
          termRelationCodeData.dictionaryId = resultData.dictionaryId;
          termRelationCodeData.unityCodeName = resultData.unityCodeName; // 통합코드명
          termRelationCodeData.unityCodeNameKoreanName =
            resultData.unityCodeKoreanName; // 통합코드 한글명
          termRelationCodeData.explain = resultData.unityCodeExplain; // 통합코드 설명
          termRelationCodeData.dataTypeName = resultData.dataTypeName; // 데이터 타입명
          termRelationCodeData.managementDepartmentName =
            resultData.managementDepartmentName; // 관리 부서 명
          termRelationCodeData.revisionInfo = resultData.revisionDate; // 제개정일자
          // 최종 수정자 Info
          termRelationCodeData.updateDateTime = resultData.updateDateTime;
          termRelationCodeData.updater = resultData.updater;
        }
      };

      const agGrid = ref(null);

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

            const codeNameInfo = await getTermCodeNameInfo(requestParams);
            const codeValueInfo = await getTermCodeValueInfo(requestParams);

            bindingCodeData(codeNameInfo);
            fetchData(codeValueInfo);
            console.log('codeNameInfo 조회  ===', codeNameInfo);
            console.log('codeValueInfo 조회  ===', codeValueInfo);
          } else {
            rowData.value = [];
            termRelationCodeData.unityCodeName.label = '';
            termRelationCodeData.explain = '';
            termRelationCodeData.dataTypeName = '';
            termRelationCodeData.managementDepartmentName = '';
            termRelationCodeData.revisionInfo = '';
            termRelationCodeData.updateDateTime = '';
            termRelationCodeData.updater = '';
          }

          // showAnimate.value = true;

          setTimeout(() => {
            // showAnimate.value = false;
          }, 1000);
        },
        { immediate: true }
      );

      return {
        agGrid,
        rowData,
        columnDefs,
        resultCount,
        termRelationCodeData,
        searchState,
        DragCol,
      };
    },
  };
</script>
