<template>
  <div class="pop-window">
    <div class="window-header">도메인그룹 및 분류 검색</div>
    <div class="window-body">
      <div class="window-content pt15">
        <div class="search-top">
          <div>도메인그룹명 :</div>
          <div class="serach-input-div">
            <input class="input-text" type="text" />
            <button class="btn-s dark-gray ml5">검색</button>
          </div>
        </div>

        <div class="tab-comtent__row h-450">
          <div class="grid-wrap">
            <div class="grid-top">
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
                      :rowData="domainGroupRowData"
                      :columnDefs="domainGroupColumnDefs"
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
                      @rowClicked="onSelectDomainClass"
                      ref="agGrid"
                    />
                  </div>
                </div>
              </template>
            </DragCol>
            <div class="grid-bottom">
              <div class="grid-info__text">
                <i class="icon">!</i>
                원하는 도메인 그룹 및 분류가 없는 경우, 도메인 그룹 및 분류 입력
                시 자동 등록 가능
              </div>
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
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import { DragCol } from 'vue-resizer';
  import {
    getDomainGroupList,
    getDomainClassByGroup,
  } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import RadioCellRenderer from '@/utils/RadioCellRenderer';
  export default {
    components: { GridSearch, DragCol, TypeCellRenderer, RadioCellRenderer },

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
      async onRowClicked(value) {
        console.log('onRowClicked', value);
        const domainGropQuery = {
          dictionaryId: this.useDctnryId,
          domainGroupName: value.domainGroupName[0].label,
        };
        const response = await this.getDomainClassData(domainGropQuery);

        console.log('domainClass response', response);

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
      onSelectDomainClass(value) {
        console.log('onSelectDomainClass', value);
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
      },
      onSearchRemove() {
        console.log('onSearchRemove');
      },
      callDetailInfo(params) {
        // 필요한 로직 구현
        console.log('callDetailInfo called with params:', params);
      },
      onConfirm() {
        this.$emit('confirm', this.selectedRow);
        this.$emit('close');
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props, { emit }) {
      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);

      const { useDctnryId } = userStngInfo.value;

      const firstSelectRow = ref(null);
      const rowData = reactive({});

      // 도메인 그룹 rowData
      const domainGroupRowData = reactive([]);

      // 도메인 클래스 rowData
      const domainClassRowData = reactive([]);

      const domainGroupColumnDefs = reactive([
        {
          headerName: '도메인 그룹명',
          field: 'domainGroupName',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'TypeCellRenderer',
          dragStatus: false,
          valueFormatter: (params) => params.value,
          width: 200,
        },
      ]);

      const columnDefs = reactive([
        {
          headerName: '도메인 분류명',
          field: 'domainClassName',
          cellClass: 'grid-cell-centered',
          cellRenderer: 'TypeCellRenderer',
          dragStatus: false,
          valueFormatter: (params) => params.value,
          width: 200,
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

      // 도메인 그룹명 조회
      const getDomainGroupData = async () => {
        const response = await getDomainGroupList(useDctnryId);
        console.log('getDomainGroupData', response);

        const doaminGroupData = response.data;

        const tempData = [];

        // domainGroupName
        for (let i = 0; i < response.data.length; i++) {
          tempData.push({
            id: i,
            domainGroupName: [
              {
                id: 0,
                dictionaryId: doaminGroupData[i].domainGroup.dictionary.id,
                type: doaminGroupData[i].domainGroup.dictionary.type.name,
                label: doaminGroupData[i].domainGroup.name,
                color: doaminGroupData[i].domainGroup.dictionary.type.fontColor,
                bgColor:
                  doaminGroupData[i].domainGroup.dictionary.type
                    .backgroundColor,
                size: 60,
              },
            ],
          });
        }

        domainGroupRowData.value = tempData;

        firstRowSelectedEvent();

        console.log('tempData = ==', tempData);

        const domainClassParam = {
          dictionaryId: tempData[0].domainGroupName[0].dictionaryId,
          domainGroupName: tempData[0].domainGroupName[0].label,
        };
        console.log('domainClassParam : ', domainClassParam);

        await getDomainClassData(domainClassParam);
      };

      getDomainGroupData();

      // 도메인 클래스 조회
      const getDomainClassData = async (data) => {
        const response = await getDomainClassByGroup(data);
        console.log('getDomainClassData', response);

        const domainClassData = response.data;

        const tempData = [];

        // domainTypeName
        for (let i = 0; i < response.data.length; i++) {
          tempData.push({
            id: i,
            domainClassName: [
              {
                id: 0,
                dictionaryId: domainClassData[i].domainClass.dictionary.id,
                type: domainClassData[i].domainClass.dictionary.type.name,
                label: domainClassData[i].domainClass.name,
                color: domainClassData[i].domainClass.dictionary.type.fontColor,
                bgColor:
                  domainClassData[i].domainClass.dictionary.type
                    .backgroundColor,
                size: 60,
              },
            ],
          });
        }

        rowData.value = tempData;
      };

      // 상단 row 선택 이벤트
      const firstRowSelectedEvent = () => {
        if (domainGroupRowData.value.length > 0) {
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
        domainGroupRowData,
        domainClassRowData,
        rowData,
        domainGroupColumnDefs,
        getDomainClassData,
        firstSelectRow,
        useDctnryId,
        columnDefs,
        resultCount,
        onClose,
      };
    },
  };
</script>

<style scoped>
  .search-top {
    display: flex;
    margin-bottom: 10px;
    align-items: center;
  }

  .serach-input-div {
    display: flex;
    margin-left: 10px;
    width: 79%;
  }

  /* .pop-window .inputs-btns {
    justify-content: space-between;
  } */
</style>
