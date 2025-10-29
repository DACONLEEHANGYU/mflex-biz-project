<template>
  <div class="tab-inner pb0">
    <DragCol width="100%" height="100%" :leftPercent="35" :sliderWidth="10">
      <template #left>
        <div class="full-contents">
          <div class="content-top pt5">
            <div class="title-s">
              공통코드
              <AppTooltip>
                <div>테스트 메세지입니다.<br />메세지를 입력하세요.</div>
              </AppTooltip>
            </div>
          </div>
          <div class="grid-wrap">
            <div class="grid-top"></div>
            <div class="grid-list">
              <AppGrid
                :rowData="rowDataCommonCode"
                :columnDefs="columnDefsCommonCode"
                :context="context"
                rowSelection="single"
                @rowDoubleClicked="onRowDoubleClicked"
                ref="agGrid"
              />
            </div>
          </div>
        </div>
      </template>
      <template #right>
        <div class="full-contents pl10">
          <div class="content-top pt5">
            <div class="title-s">
              공통코드값 정보
              <AppTooltip>
                <div>테스트 메세지입니다.<br />메세지를 입력하세요.</div>
              </AppTooltip>
            </div>
          </div>
          <div class="grid-wrap">
            <div class="grid-top">
              <div class="title-btns__row_btween">
                <div class="btns">
                  <button class="btn-s add-reg" title="신규">신규</button>
                  <button class="btn-s remove-reg" title="삭제">삭제</button>
                </div>
                <div class="btns">
                  <button class="btn-s green" @click="onSaveConfirm">
                    저장
                  </button>
                  <button class="btn-s" @click="onResetConfirm">취소</button>
                </div>
              </div>
            </div>
            <div class="grid-list">
              <AppGrid
                :rowData="rowDataCommonCodeInfo"
                :columnDefs="columnDefsCommonCodeInfo"
                :context="context"
                rowSelection="multiple"
                @rowDoubleClicked="onRowDoubleClicked"
                ref="agGridCommonInfo"
              />
            </div>
            <div class="grid-bottom">
              <div class="grid-set__bottom">
                <button class="btn-gridfn top" title="최상단으로">
                  <i class="icon"></i></button
                ><button class="btn-gridfn up" title="상단으로">
                  <i class="icon"></i></button
                ><button class="btn-gridfn down" title="하단으로">
                  <i class="icon"></i></button
                ><button class="btn-gridfn bottom" title="최하단으로">
                  <i class="icon"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </DragCol>
    <!-- 저장 알림창 -->
    <AppDialog
      v-model:view="saveConfirmState.view"
      :title="saveConfirmState.title"
      :message="saveConfirmState.message"
      @confirm="onSave"
      @cancel="onCancel"
    />
    <!-- 취소 확인창 -->
    <AppDialog
      v-model:view="cancelConfirmState.view"
      :title="cancelConfirmState.title"
      :message="cancelConfirmState.message"
      @confirm="onReCancel"
    />

    <!-- 공통코드 조회 -->
    <AppWindow
      :view="commonCodeSearchWindowView"
      @close="onCloseCommonCodeSearchWindow"
      width="800px"
      height="auto"
    >
      <CommonCodeSearchWindow
        @confirm="onCommonCodeConfirm"
        @close="onCloseCommonCodeSearchWindow"
      />
    </AppWindow>
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
  } from 'vue';
  import InputCellRenderer from '@/utils/InputCellRenderer.js';
  import autoCodeInputCellRenderer from '@/utils/autoCodeInputCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import { DragCol } from 'vue-resizer';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import CommonCodeSearchWindow from '@/views/systemMng/components/commonCodeSet/tab2/CommonCodeSearchWindow.vue';

  export default {
    components: {
      InputCellRenderer,
      autoCodeInputCellRenderer,
      GridSearch,
      AppTooltip,
      DragCol,
      AppWindow,
      CommonCodeSearchWindow,
    },

    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },
    methods: {
      onRowClicked(value) {
        console.log('onRowClicked ', value);
      },
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
        this.selectedRow = value;
      },
      cellAutocompleteChange(rowIndex, colId) {
        this.openCommonCodeWindow(rowIndex, colId);
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props) {
      const rowDataCommonCode = reactive({});
      const columnDefsCommonCode = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'grid-cell-centered',
          width: 60,
        },
        {
          headerName: '코드명',
          field: 'codeName',
          cellClass: 'grid-cell-centered',
          width: 150,
        },
        {
          headerName: '코드ID',
          field: 'codeId',
          cellClass: 'grid-cell-centered',
          width: 150,
        },
        {
          headerName: '코드유형',
          field: 'codeType',
          cellClass: 'grid-cell-centered',
          width: 150,
        },
      ]);

      const rowDataCommonCodeInfo = reactive({});
      const columnDefsCommonCodeInfo = reactive([
        {
          headerName: '',
          field: '',
          cellClass: 'grid-cell-centered',
          width: 30,
          headerCheckboxSelection: true,
          checkboxSelection: true,
        },
        {
          headerName: '코드값',
          field: 'codeValue',
          cellClass: 'grid-cell-centered',
          width: 140,
          cellRenderer: 'InputCellRenderer',
          cellRendererParams: {
            textAlign: 'center',
            textColor: '#444',
            useDisable: true,
          },
          valueFormatter: (params) => params.value,
        },
        {
          headerName: '코드값 명',
          field: 'codeValueName',
          cellClass: 'grid-cell-centered',
          width: 150,
          cellRenderer: 'InputCellRenderer',
          cellRendererParams: {
            textAlign: 'center',
            textColor: '#444',
            useDisable: false,
          },
          valueFormatter: (params) => params.value,
        },
        {
          headerName: '코드값 설명',
          field: 'codeValueInfo',
          cellClass: 'grid-cell-centered',
          width: 300,
          cellRenderer: 'InputCellRenderer',
          cellRendererParams: {
            textAlign: 'left',
            textColor: '#444',
            useDisable: false,
          },
          valueFormatter: (params) => params.value,
        },
        {
          headerName: '상위 코드값 명',
          field: 'topCodeValueName',
          cellClass: 'grid-cell-centered',
          width: 180,
          cellRenderer: 'autoCodeInputCellRenderer',
          cellRendererParams: {
            textAlign: 'center',
            textColor: '#444',
          },
        },
        {
          headerName: '참조 코드값 명',
          field: 'referenceCodeValueName',
          cellClass: 'grid-cell-centered',
          width: 180,
          cellRenderer: 'autoCodeInputCellRenderer',
          cellRendererParams: {
            textAlign: 'center',
            textColor: '#444',
          },
        },
      ]);

      const fetchData = async () => {
        rowDataCommonCode.value = [
          {
            id: 0,
            no: 1,
            codeName: '직급코드',
            codeId: 'JBGD_CD',
            codeType: '일반코드',
          },
        ];

        const sampleData = [];
        for (let i = 0; i < 8; i++) {
          sampleData.push({
            id: i,
            codeValue: i + 1,
            codeValueName: '대표이사',
            codeValueInfo: '',
            topCodeValueName: '',
            referenceCodeValueName: '',
          });
        }
        rowDataCommonCodeInfo.value = sampleData;
      };

      fetchData();

      //저장
      const saveConfirmState = reactive({
        view: false,
        message: '작업 내용을 저장하시겠습니까?',
      });
      const onSaveConfirm = () => {
        saveConfirmState.view = true;
      };
      const onSave = () => {
        console.log('저장 실행');
      };
      const onCancel = () => {
        console.log('취소 실행 확인');
        setTimeout(() => {
          onCancelConfirm();
        }, 300);
      };

      //취소 확인
      const cancelConfirmState = reactive({
        view: false,
        message: '작업 내용을 취소하시겠습니까?',
      });
      const onCancelConfirm = () => {
        cancelConfirmState.view = true;
      };
      const onReCancel = () => {
        console.log('취소 실행');
      };

      const agGridCommonInfo = ref(null);
      const rowNode = ref('');
      const rowColId = ref('');
      const openCommonCodeWindow = (rowIndex, colId) => {
        rowNode.value = agGridCommonInfo.value.gridApi.getRowNode(
          rowDataCommonCodeInfo.value[rowIndex].id
        );
        rowColId.value = colId;
        onOpenCommonCodeSearchWindow();
        // rowNode.setDataValue(colId, 'icemaker');
      };

      //공통코드 조회
      const commonCodeSearchWindowView = ref(false);
      const onOpenCommonCodeSearchWindow = () => {
        commonCodeSearchWindowView.value = true;
      };
      const onCloseCommonCodeSearchWindow = () => {
        commonCodeSearchWindowView.value = false;
      };
      const onCommonCodeConfirm = (value) => {
        const { codeValue, codeValueName } = value;
        rowNode.value.setDataValue(rowColId.value, codeValueName);
      };

      // const mountedActive = ref(false);
      // onMounted(() => {
      //   console.log('그리드 onMounted 실행?');
      //   mountedActive.value = true;
      //   setTimeout(() => {
      //     setGridApis2([agGrid.value.gridApi]);
      //   }, 200);
      // });
      // onActivated(() => {
      //   if (!mountedActive.value) {
      //     console.log('그리드 onActivated 실행?');
      //     setTimeout(() => {
      //       setGridApis2([agGrid.value.gridApi]);
      //     }, 200);
      //   }
      // });

      // onDeactivated(() => {
      //   console.log('그리드 onDeactivated 실행?');
      //   setGridApis2(null);
      //   mountedActive.value = false;
      // });
      // onUnmounted(() => {
      //   console.log('그리드 onUnmounted 실행?');
      //   setGridApis2(null);
      //   mountedActive.value = false;
      // });

      return {
        agGridCommonInfo,
        rowDataCommonCode,
        columnDefsCommonCode,
        rowDataCommonCodeInfo,
        columnDefsCommonCodeInfo,
        saveConfirmState,
        cancelConfirmState,
        openCommonCodeWindow,
        onSaveConfirm,
        onSave,
        onCancel,
        onReCancel,
        commonCodeSearchWindowView,
        onOpenCommonCodeSearchWindow,
        onCloseCommonCodeSearchWindow,
        onCommonCodeConfirm,
      };
    },
  };
</script>
