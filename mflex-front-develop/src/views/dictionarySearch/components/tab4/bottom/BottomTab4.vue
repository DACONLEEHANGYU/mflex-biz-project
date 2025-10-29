<template>
  <div class="tab-inner">
    <div v-if="view == true" class="col col-2">
      <div class="inputs-wrap" style="flex: 0 0 42%">
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
                <th>참조코드한글명</th>
                <td colspan="3">
                  <div class="td-col">
                    <AppStateText
                      v-model="referenceCodeName.referenceCodeKoreanName"
                    />
                  </div>
                </td>
              </tr>
              <tr>
                <th>참조코드명</th>
                <td colspan="3">
                  <div class="td-col">
                    {{ referenceCodeName.unityCodeName }}
                  </div>
                </td>
              </tr>
              <tr>
                <th>참조코드유형명</th>
                <td colspan="3">
                  <div class="td-col">
                    {{ referenceCodeName.referenceCodeTypeName }}
                  </div>
                </td>
              </tr>
              <tr>
                <th>데이터타입</th>
                <td colspan="3">
                  <div class="td-col">
                    {{ referenceCodeName.logicalDataType }}
                  </div>
                </td>
              </tr>
              <tr>
                <th>참조코드설명</th>
                <td colspan="3" class="pd0">
                  <div class="td-col">
                    <textarea
                      readonly
                      style="height: 50px"
                      v-model="referenceCodeName.referenceCodeExplain"
                    ></textarea>
                  </div>
                </td>
              </tr>
              <tr>
                <th>관리부서명</th>
                <td colspan="3">
                  <div class="td-col">
                    {{ referenceCodeName.managementDepartmentName }}
                  </div>
                </td>
              </tr>
              <tr>
                <th>제개정일자</th>
                <td>
                  <div class="td-col">{{ referenceCodeName.revisionInfo }}</div>
                </td>
              </tr>
              <tr>
                <th>최종수정자정보</th>
                <td>
                  <div class="td-col">{{ referenceCodeName.updater }}</div>
                </td>
                <th>최종수정일시</th>
                <td>
                  <div class="td-col">
                    {{ referenceCodeName.updateDateTime }}
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
    <div class="col col-2 noDataDiv" v-if="!view">
      <div>데이터가 없습니다.</div>
    </div>
  </div>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import {
    reactive,
    ref,
    onActivated,
    onDeactivated,
    onUnmounted,
    onMounted,
    inject,
    watch,
    watchEffect,
  } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import {
    getReferenceCodeNameInfo,
    getReferenceCodeValueInfo,
  } from '@/utils/mflexApi/dictionarySearchApi';
  import { $vxHttp } from '@/api';
  import { object } from 'yup';
  const apiUrl = import.meta.env.VITE_APP_API_URL;
  const defaultUrl = '/api/v1';

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

      const view = ref(false);

      //const selectTab4ValueData = inject('codeValueSelectData');
      const selectTab4ValueData = inject('codeValueSelectData');

      const columnDefs = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 70,
        },
        {
          headerName: '참조코드값',
          field: 'unityCodeValue',
          cellClass: 'ag-left-aligned-cell',
          width: 150,
        },
        {
          headerName: '참조코드값명',
          field: 'unityCodeName',
          cellClass: 'ag-left-aligned-cell',
        },
        {
          headerName: '최종수정자',
          field: 'updater',
          cellClass: 'grid-cell-centered',
          width: 120,
        },
        {
          headerName: '최종수정일시',
          field: 'updateDateTime',
          cellClass: 'grid-cell-centered',
          width: 120,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      const referenceCodeName = reactive({
        unityCodeName: '',
        referenceCodeKoreanName: {
          type: '',
          label: '',
          color: '',
          bgColor: '',
          size: 0,
        },
        referenceCodeTypeName: '',
        logicalDataType: '',
        referenceCodeExplain: '',
        managementDepartmentName: '',
        enactInfo: '',
        revisionInfo: '',
        updater: '',
        updateDateTime: '',
      });

      // 반응형 데이터 모니터링
      watchEffect(async () => {
        console.log('selectTab4ValueData :', selectTab4ValueData);

        if (selectTab4ValueData.value == null) {
          view.value = false;
          return;
        }

        console.log(
          'selectTab4ValueData.value.codeTypeName :',
          selectTab4ValueData.value.codeTypeName
        );

        if (
          selectTab4ValueData.value.codeTypeName == '참조코드' ||
          selectTab4ValueData.value.data.codeTypeName == '참조코드'
        ) {
          if (selectTab4ValueData.value.data) {
            // 렌더링
            view.value = true;

            let referenceCodeQuery = {
              dictionaryId: selectTab4ValueData.value.data.unityDictionaryId,
              referenceCodeName:
                selectTab4ValueData.value.data.referenceCode[0].name,
            };
            const referenceCodeTemp = await getReferenceCodeNameInfo(
              referenceCodeQuery
            );
            const referenceCodeValueTemp = await getReferenceCodeValueInfo(
              referenceCodeQuery
            );
            console.log('referenceCodeTemp.value : ', referenceCodeTemp);
            console.log('referenceCodeValueTemp : ', referenceCodeValueTemp);
            bindingReferenceCodeData(referenceCodeTemp);
            fetchData(referenceCodeValueTemp);
          } else {
            view.value = true;
            let referenceCodeQuery = {
              dictionaryId: selectTab4ValueData.value.unityDictionaryId,
              referenceCodeName:
                selectTab4ValueData.value.referenceCode[0].name,
            };
            const referenceCodeTemp = await getReferenceCodeNameInfo(
              referenceCodeQuery
            );
            const referenceCodeValueTemp = await getReferenceCodeValueInfo(
              referenceCodeQuery
            );
            console.log('referenceCodeTemp.value : ', referenceCodeTemp);
            console.log('referenceCodeValueTemp : ', referenceCodeValueTemp);
            bindingReferenceCodeData(referenceCodeTemp);
            fetchData(referenceCodeValueTemp);
          }
        } else {
          view.value = false;
          rowData.value = [];
        }
      });

      // 참조코드명 바인딩
      const bindingReferenceCodeData = (referenceCodeTemp) => {
        const resultData = referenceCodeTemp.data;
        console.log('resultData =================', resultData);

        // 참조통합코드명
        referenceCodeName.unityCodeName = resultData.unityCode.name;

        // 참조통합코드 한글명
        referenceCodeName.referenceCodeKoreanName.type =
          resultData.unityCode.dictionary.type.name;
        referenceCodeName.referenceCodeKoreanName.label =
          resultData.unityCode.koreanName;
        referenceCodeName.referenceCodeKoreanName.color =
          resultData.unityCode.dictionary.type.fontColor;
        referenceCodeName.referenceCodeKoreanName.bgColor =
          resultData.unityCode.dictionary.type.backgroundColor;
        referenceCodeName.referenceCodeKoreanName.size = 60;

        // 참조통합코드 유형명
        referenceCodeName.referenceCodeTypeName = resultData.unityCode.typeName;
        // 데이터 타입
        referenceCodeName.logicalDataType = resultData.dataTypeName;
        // 참조통합코드 설명
        referenceCodeName.referenceCodeExplain = resultData.unityCode.explain;
        referenceCodeName.managementDepartmentName =
          resultData.managementDepartmentName;

        if (resultData.enactCycle == null) {
          resultData.enactCycle = '';
        }
        // 제정 정보
        referenceCodeName.enactInfo = `${resultData.enactDate}(${resultData.enactCycle})`;

        // 개정 정보
        if (resultData.revisionCycle == null) {
          resultData.revisionCycle = '';
        }

        if (
          resultData.revisionCycle === null ||
          resultData.revisionCycle === ''
        ) {
          referenceCodeName.revisionInfo = `${resultData.revisionDate}`;
        } else {
          referenceCodeName.revisionInfo = `${resultData.revisionDate}(${resultData.revisionCycle})`;
        }
        //referenceCodeName.revisionInfo = `${resultData.revisionDate}(${resultData.revisionCycle})`;
        // 수정일시
        referenceCodeName.updateDateTime = resultData.updateDateTime;
        // 최종수정자
        referenceCodeName.updater = resultData.updater;

        console.log('referenceCodeName ================', referenceCodeName);
      };

      const fetchData = (referenceCodeValueTemp) => {
        console.log('referenceCodeValueTemp :', referenceCodeValueTemp);

        let codeValueTemp = [];
        const values = referenceCodeValueTemp.data;
        for (let i = 0; i < values.length; i++) {
          codeValueTemp.push({
            id: i,
            no: i + 1,
            unityCodeValue: values[i].unityCodeValue,
            unityCodeName: values[i].unityCodeValueName,
            revisionInfo: `${values[i].revisionDate}(${values[i].revisionCycle})`,
            updater: values[i].updater,
            updateDateTime: values[i].updateDateTime,
          });
        }
        rowData.value = codeValueTemp;
      };

      const gridDialogState = reactive({
        view: false,
        title: '선택 Cell',
        message: '',
        type: 'alert',
        selectCell: false,
      });

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
        referenceCodeName,
        view,
      };
    },
  };
</script>
