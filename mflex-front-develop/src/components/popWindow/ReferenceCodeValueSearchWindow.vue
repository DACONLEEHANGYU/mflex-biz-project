<template>
  <div class="pop-window">
    <div class="window-header">참조코드값 검색</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="tab-comtent__row h-450">
          <div class="grid-wrap">
            <div class="grid-top grid-top-flex">
              <div class="title-s">통합코드값 목록</div>
              <AppTooltip>
                <div>테스트 메세지입니다.</div>
              </AppTooltip>
              <!-- <div class="top-row">
                <GridSearch
                  :resultCount="resultCount"
                  @enter="onSearchEnter"
                  @save="onSearchSave"
                  @setup="onSearchSetup"
                  @remove="onSearchRemove"
                />
              </div> -->
            </div>
            <DragCol
              width="100%"
              height="100%"
              :leftPercent="40"
              :sliderWidth="10"
            >
              <template #left>
                <div class="grid-wrap">
                  <div class="grid-top">
                    <div class="top-row"></div>
                  </div>
                  <div class="grid-list grid-radius">
                    <AppGrid
                      :rowData="unityCodeKoreanNameData"
                      :columnDefs="codeKoreanNameColumnDefs"
                      :context="context"
                      rowSelection="single"
                      @rowDoubleClicked="onRowDoubleClicked"
                      @rowClicked="onRowClicked"
                      ref="agGrid"
                    />
                  </div>
                </div>
              </template>
              <template #right>
                <div class="grid-wrap">
                  <div class="grid-top">
                    <div class="top-row"></div>
                  </div>
                  <div class="grid-list grid-radius">
                    <AppGrid
                      :rowData="rowData"
                      :columnDefs="columnDefs"
                      :context="context"
                      rowSelection="single"
                      @rowDoubleClicked="onRowDoubleClicked"
                      @rowClicked="onSelectReferenceCode"
                      ref="agGrid"
                    />
                  </div>
                </div>
              </template>
            </DragCol>
            <div class="grid-bottom">
              <div class="grid-info__text"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div class="btns__r">
          <button class="btn-m confirm" @click="onConfirm">저장</button>
          <button class="btn-m close" @click="onClose">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { reactive, ref, nextTick } from 'vue';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import { getGridInfoFromStorage } from '@/utils/cookies';
  import { DragCol } from 'vue-resizer';
  import {
    getParentCodeKoreanNameList,
    getParentCodeList,
    getReferenceCodeKoreanNameList,
  } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import RadioCellRenderer from '@/utils/RadioCellRenderer';
  import TypeCellRenderer from '@/utils/TypeCellRenderer';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  export default {
    components: {
      GridSearch,
      AppTooltip,
      DragCol,
      RadioCellRenderer,
      TypeCellRenderer,
    },

    data() {
      return {
        context: null,
        //selectedRow: {},
      };
    },
    methods: {
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
        this.selectedRow = value;
      },
      async onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedRow = value;
        const referenceCodeParams = {
          managementInstituteId: this.useMetaMngInstId,
          userId: this.userId,
          dictionaryId: value.unityCodeKoreanName[0].dictionaryId,
          unityCodeName: value.unityCodeName,
          unityCodeValue: null,
        };

        const response = await this.getReferenceCodeData(referenceCodeParams);

        console.log('referenceCode response', response);

        const dialogContainer = document.querySelector('.dialog-wrapper');
        const selectedRow = dialogContainer.querySelectorAll(
          '[class~="ag-row-selected"]'
        );
        // 선택된 모든 요소에서 ag-row-selected 클래스를 제거합니다.
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        const clickedNode = dialogContainer.querySelector(
          `[row-id="${clickNode}"]`
        );
        clickedNode.classList.add('ag-row-selected');
      },
      onSelectReferenceCode(value) {
        console.log('onSelectParentCode', value);
        console.log('변경 전 : ', this.selectedRow);

        this.selectReferenceCodeValue = {
          unityCode: {
            dictionary: {
              id: this.selectedRow.unityCodeKoreanName[0].dictionaryId,
              type: {
                name: this.selectedRow.unityCodeKoreanName[0].type,
                color: this.selectedRow.unityCodeKoreanName[0].color,
                bgColor: this.selectedRow.unityCodeKoreanName[0].bgColor,
              },
            },
            koreanName: this.selectedRow.unityCodeKoreanName[0].label,
            name: this.selectedRow.unityCodeName,
          },
          codeValue: value,
        };

        console.log(
          'this.selectReferenceCodeValue : ',
          this.selectReferenceCodeValue
        );

        //this.selectedRow = value;
      },
      onSearchEnter(value) {
        console.log('onSearchEnter', value);
      },
      onSearchSave() {
        console.log('onSearchSave');
      },
      onSearchSetup() {
        console.log('onSearchSetup');
      },
      onSearchRemove() {
        console.log('onSearchRemove');
      },
      callDetailInfo(params) {
        // 필요한 로직 구현
        console.log('callDetailInfo called with params:', params);
      },
      onConfirm() {
        this.$emit('confirm', this.selectReferenceCodeValue);
        this.$emit('close');
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props, { emit }) {
      const authStore = useAuthStore();

      const { userInfo, userStngInfo } = storeToRefs(authStore);
      const { userId, userNm } = userInfo.value;

      //사용자 사용 시스템 정보
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const firstSelectRow = ref(null);
      const selectedRow = ref(null);

      const selectReferenceCodeValue = ref(null);

      const rowData = reactive({});

      // 통합코드한글명 그리드
      const codeKoreanNameColumnDefs = reactive([
        {
          headerName: '통합코드한글명',
          field: 'unityCodeKoreanName',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'TypeCellRenderer',
          dragStatus: false,
          valueFormatter: (params) => params.value,
          width: 250,
        },
      ]);

      // 도메인 그룹 rowData
      const unityCodeKoreanNameData = reactive([]);

      // 도메인 클래스 rowData
      const domainClassRowData = reactive([]);

      const columnDefs = reactive([
        {
          headerName: '코드값',
          field: 'codeValue',
          cellClass: 'ag-left-aligned-cell',
          dragStatus: false,
          width: 130,
        },
        {
          headerName: '코드값명',
          field: 'codeValueName',
          cellClass: 'ag-left-aligned-cell',
          dragStatus: false,
          width: 190,
        },
        {
          headerName: '선택',
          field: 'radio',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'RadioCellRenderer',
          dragStatus: false,
          width: 60,
          minWidth: 60,
          maxWidth: 60,
        },
      ]);

      const resultCount = ref({
        count: 10,
        total: 20,
      });

      // 상위코드 통합코드명 조회
      const getUnityCodeKoreanName = async () => {
        const unityCodeKoreanNameParmas = {
          dictionaryId: useDctnryId,
          managementInstituteId: useMetaMngInstId,
          userId: userId,
          unityCodeName: null,
        };

        const response = await getReferenceCodeKoreanNameList(
          unityCodeKoreanNameParmas
        );
        console.log('getParenCodeData', response);

        const unityCodeKoreanName = response.data;

        console.log('unityCodeKoreanName', unityCodeKoreanName);

        const tempData = [];

        for (let i = 0; i < unityCodeKoreanName.length; i++) {
          tempData.push({
            id: i,
            unityCodeKoreanName: [
              {
                id: 0,
                dictionaryId: unityCodeKoreanName[i].unityCode.dictionary.id,
                type: unityCodeKoreanName[i].unityCode.dictionary.type.name,
                label: unityCodeKoreanName[i].unityCode.koreanName,
                color:
                  unityCodeKoreanName[i].unityCode.dictionary.type.fontColor,
                bgColor:
                  unityCodeKoreanName[i].unityCode.dictionary.type
                    .backgroundColor,
                size: 60,
              },
            ],
            unityCodeName: unityCodeKoreanName[i].unityCode.name,
          });
        }

        unityCodeKoreanNameData.value = tempData;

        // 첫행

        firstRowSelectedEvent(tempData[0]);

        console.log('tempData = ==', tempData);

        const referenceCodeParams = {
          managementInstituteId: useMetaMngInstId,
          userId: userId,
          dictionaryId: tempData[0].unityCodeKoreanName[0].dictionaryId,
          unityCodeName: tempData[0].unityCodeName,
          unityCodeValue: null,
        };

        // const domainClassParam = {
        //   dictionaryId: tempData[0].domainGroupName[0].dictionaryId,
        //   domainGroupName: tempData[0].domainGroupName[0].label,
        // };
        // console.log('domainClassParam : ', domainClassParam);

        await getReferenceCodeData(referenceCodeParams);
      };

      getUnityCodeKoreanName();

      // 상위코드 조회
      const getReferenceCodeData = async (data) => {
        const response = await getParentCodeList(data);
        console.log('getParentCodeData', response);

        const parentCodeList = response.data;

        console.log('parentCodeList', parentCodeList);

        const tempData = [];

        // domainTypeName
        for (let i = 0; i < parentCodeList.length; i++) {
          tempData.push({
            id: i,
            codeValue: parentCodeList[i].unityCodeValue,
            codeValueName: parentCodeList[i].unityCodeValueName,
          });
        }

        rowData.value = tempData;
      };

      // 상단 row 선택 이벤트
      const firstRowSelectedEvent = (firstRowData) => {
        selectedRow.value = firstRowData;
        if (unityCodeKoreanNameData.value.length > 0) {
          nextTick(() => {
            const dialogContainer = document.querySelector('.dialog-wrapper');
            const firstRowData = agGrid.value.gridApi.getDisplayedRowAtIndex(0);

            // 첫 행 select 효과
            const nodesWithRowId0 =
              dialogContainer.querySelector('[row-id="0"]');

            // .ag-row-selected 클래스를 추가합니다.
            if (nodesWithRowId0) {
              nodesWithRowId0.classList.add('ag-row-selected');
              nodesWithRowId0.classList.add('ag-row-focus');
              nodesWithRowId0.setAttribute('aria-selected', true);
            }

            if (firstRowData) {
              firstSelectRow.value = firstRowData.data;
              return firstRowData.data;
            }
          });
        }
      };

      const agGrid = ref(null);

      // const onConfirm = () => {
      //   emit('confirm');
      //   emit('close');
      // };

      const onClose = () => {
        emit('close');
      };

      return {
        agGrid,
        unityCodeKoreanNameData,
        codeKoreanNameColumnDefs,
        domainClassRowData,
        rowData,
        firstSelectRow,
        useDctnryId,
        columnDefs,
        resultCount,
        onClose,
        getReferenceCodeData,
        useMetaMngInstId,
        userId,
        selectedRow,
        selectReferenceCodeValue,
      };
    },
  };
</script>
