<template>
  <div class="pop-window">
    <div class="window-header">도메인분류명 검색</div>
    <div class="window-body">
      <div class="window-content pt10" style="height: 440px">
        <div class="input-top">
          <div class="title-top">
            <div class="title-s">
              도메인분류명 목록
              <AppTooltip
                :htmlContent="getTooltipById('searchDomainClassification')"
              >
              </AppTooltip>
            </div>
          </div>
        </div>
        <div class="search-top">
          <div class="search-title">도메인그룹명 :</div>
          <div class="serach-input-div">
            <input v-model="searchInput" class="input-text" type="text" />
            <button @click="onSearchDomainClass" class="btn-s dark-gray ml5">
              검색
            </button>
          </div>
        </div>
        <div class="tab-comtent__row h-450">
          <DragCol
            width="100%"
            height="67%"
            :leftPercent="30"
            :sliderWidth="10"
          >
            <template #left>
              <div class="grid-wrap" style="height: 300px">
                <div class="grid-top">
                  <div class="top-row"></div>
                </div>
                <div class="grid-list grid-radius domain-group-grid">
                  <AppGrid
                    :rowData="domainGroupRowData"
                    :columnDefs="domainGroupColumnDefs"
                    :context="context"
                    rowSelection="single"
                    @rowDoubleClicked="onRowDoubleClicked"
                    @rowClicked="selectDomainGroup"
                    @gridApi="handleSetGridApi"
                    ref="agGrid"
                  />
                </div>
              </div>
            </template>
            <template #right>
              <div class="grid-wrap" style="height: 300px">
                <div class="grid-top">
                  <div class="top-row"></div>
                </div>
                <div class="grid-list grid-radius">
                  <AppGrid
                    :rowData="domainClassRowData"
                    :columnDefs="domainClassColumnDefs"
                    :context="context"
                    rowSelection="single"
                    @rowDoubleClicked="onRowDoubleClicked"
                    @rowClicked="onRowClicked"
                  />
                </div>
              </div>
            </template>
          </DragCol>
        </div>
      </div>
    </div>
    <div class="window-footer">
      <div class="inputs-btns">
        <div>
          <!-- <button class="btn-s dark-gray ml5">도메인명 신규등록</button> -->
        </div>
        <div class="btns__r">
          <button class="btn-m confirm" @click="onConfirm">저장</button>
          <button class="btn-m close" @click="onClose">취소</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import { reactive, ref, nextTick, onMounted } from 'vue';
  import { useUiStore } from '@/stores/ui';
  import { useAuthStore } from '@/stores/auth';
  import { storeToRefs } from 'pinia';
  import { getGridInfoFromStorage } from '@/utils/cookies';
  import {
    getDomainClassList,
    getDomainSimpleList,
  } from '@/utils/mflexApi/dictionaryManagementApi.js';
  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import {
    getResearchDomainClassListV2,
    getResearchDomainNameListV2,
  } from '@/utils/mflexApi/dictionaryMng/dictionaryV2Api.js';
  import {
    getDomainClassByGroup, // 도메인분류명 조회
    getDomainGroup, // 도메인그룹명 조회
  } from '@/utils/mflexApi/actualizing/actualizingApi.js';

  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import RadioCellRenderer from '@/utils/RadioCellRenderer';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { DragCol } from 'vue-resizer';

  import AppTooltip from '@/components/ui/AppTooltip.vue';
  export default {
    components: {
      GridSearch,
      TypeCellRenderer,
      RadioCellRenderer,
      DragCol,
      AppTooltip,
    },

    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },

    methods: {
      onRowDoubleClicked(value) {
        this.selectedRow = value;
      },
      onRowClicked(value) {
        console.log('onRowClicked', value);
        console.log('firstSelectRow', this.firstSelectRow);

        const selectDomain = {
          domainClassName: value.domainClassName,
        };

        this.selectedRow = selectDomain;

        // const domainSimpleParam = {
        //   dictionaryId: value.domainClassName[0].dictionaryId,
        //   domainClassDictionaryId: value.domainClassName[0].id,
        //   domainClassName: value.domainClassName[0].label,
        // }

        // getDomainSimpleList();
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
      onConfirm() {
        this.$emit('confirm', this.selectedRow);
        this.$emit('close');
      },
      callDetailInfo(params) {
        // 필요한 로직 구현
        console.log('callDetailInfo called with params:', params);
      },
    },
    beforeMount() {
      this.context = { componentParent: this };
    },
    props: {
      requestPrams: {
        type: Object,
        default: () => ({}),
      },
    },
    setup(props, { emit }) {
      const { tooltipList } = storeToRefs(useHelpToolTipStore());
      const { getTooltipById } = useHelpToolTipStore();

      const uiStore = useUiStore();
      const { gridColumnDefs } = storeToRefs(uiStore);
      const authStore = useAuthStore();
      const { userStngInfo } = storeToRefs(authStore);

      const { useDctnryId, useMetaMngInstId } = userStngInfo.value;

      const agGrid = ref(null);
      const gridApi = ref(null);

      const firstSelectRow = ref(null);

      // gridApi 사용 handler
      const handleSetGridApi = (params) => {
        gridApi.value = params;
        console.log('gridApi.value : ', gridApi.value);
      };

      const initializeGridColumnDefs = () => {
        const storedColumnDefs = JSON.parse(getGridInfoFromStorage());
        if (storedColumnDefs && storedColumnDefs.MFGRD036) {
          uiStore.setGridColumnDefs('MFGRD036', storedColumnDefs.MFGRD036);
        }
      };

      initializeGridColumnDefs();

      const domainGroupRowData = reactive({});
      const domainClassRowData = reactive({});
      const domainRowData = reactive({});

      const storedMfgrd036ColumnDefs = ref([]);
      storedMfgrd036ColumnDefs.value = gridColumnDefs.value.MFGRD036;

      const domainGroupColumnDefs = reactive([
        {
          headerName: '도메인그룹명',
          field: 'domainGroupName',
          cellClass: 'ag-left-aligned-cell',
          dragStatus: false,
          valueFormatter: (params) => params.value,
          width: 150,
          minWidth: 150,
          maxWidth: 150,
        },
      ]);

      const domainClassColumnDefs = reactive([
        {
          headerName: '도메인분류명',
          field: 'domainClassName',
          cellClass: 'ag-left-aligned-cell',
          dragStatus: false,
          valueFormatter: (params) => params.value,
          width: 300,
          minWidth: 300,
          maxWidth: 300,
        },
        // {
        //   headerName: '선택',
        //   field: 'radio',
        //   cellClass: 'grid-cell-centered',
        //   cellRenderer: 'RadioCellRenderer',
        //   dragStatus: false,
        //   width: 60,
        //   minWidth: 60,
        //   maxWidth: 60,
        // },
      ]);

      const fetchData = async () => {
        console.log('props.requestPrams : ', props.requestPrams);

        const domainGroupList = await getDomainGroup(props.requestPrams);

        console.log('domainGroupList : ', domainGroupList);

        const domainGroups = domainGroupList;
        let domainGroupData = [];
        for (let i = 0; domainGroups.length > i; i++) {
          domainGroupData.push({
            id: i,
            domainGroupName: domainGroups[i].domainGroupName,
            jobDivisionCode: domainGroups[i].jobDivisionCode,
            jobDivisionName: domainGroups[i].jobDivisionName,
            discardYn: domainGroups[i].discardYn,
          });
        }

        // for (let i = 0; 3 > i; i++) {
        //   domainClassData.push({
        //     id: i,
        //     domainClassName: '가격',
        //     jobDivisionCode: '1',
        //     jobDivisionName: '가격',
        //     discardYn: 'N',
        //   });
        // }

        domainGroupRowData.value = domainGroupData;

        firstRowSelectedEvent();

        const domainSimpleParam = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          domainGroupName: domainGroupData[0].domainGroupName,
          jobTypeCode: props.requestPrams.jobTypeCode,
        };

        const domainSimpleList = await getDomainClassByGroup(domainSimpleParam);

        fetchDomainClass(domainSimpleList);
      };

      onMounted(() => {
        fetchData();
      });

      // fetchData();

      /* 도메인분류 그리드 선택 */
      const selectDomainGroup = async (value) => {
        console.log('value : ', value);
        firstSelectRow.value = value;
        const dialogContainer = document.querySelector('.domain-group-grid');
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

        const domainSimpleParam = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          domainGroupName: value.domainGroupName,
          jobTypeCode: props.requestPrams.jobTypeCode,
        };

        const domainSimpleList = await getDomainClassByGroup(domainSimpleParam);

        fetchDomainClass(domainSimpleList);
      };

      // 상단 row 선택 이벤트
      const firstRowSelectedEvent = () => {
        if (domainGroupRowData.value.length > 0) {
          nextTick(() => {
            const dialogContainer =
              document.querySelector('.domain-group-grid');
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

      const fetchDomainClass = async (domainSimpleList) => {
        console.log('fetchDomainClass domainSimpleList', domainSimpleList);

        const domainsClass = domainSimpleList;
        let domainData = [];
        for (let i = 0; domainsClass.length > i; i++) {
          domainData.push({
            id: i,
            domainClassName: domainsClass[i].domainClassName,
            jobDivisionCode: domainsClass[i].jobDivisionCode,
            jobDivisionName: domainsClass[i].jobDivisionName,
            discardYn: domainsClass[i].discardYn,
          });
        }

        // for (let i = 0; 3 > i; i++) {
        //   domainData.push({
        //     id: i,
        //     domainName: '가격V10',
        //     jobDivisionCode: '1',
        //     jobDivisionName: '가격',
        //     discardYn: 'N',
        //   });
        // }

        domainClassRowData.value = domainData;
      };

      /*  const onConfirm = () => {
        emit('confirm');
        emit('close');
      }; */

      const searchInput = ref('');

      const onSearchDomainClass = async () => {
        const domainClassParam = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          domainClassName: searchInput.value,
          jobTypeCode: props.requestPrams.jobTypeCode,
        };

        const domainClassList = await getResearchDomainClassListV2(
          domainClassParam
        );

        const domainClass = domainClassList.data;
        let domainClassData = [];

        for (let i = 0; domainClass.length > i; i++) {
          domainClassData.push({
            id: i,
            domainClassName: domainClass[i].domainClassName,
            jobDivisionCode: domainClass[i].jobDivisionCode,
            jobDivisionName: domainClass[i].jobDivisionName,
            discardYn: domainClass[i].discardYn,
          });
        }

        domainClassRowData.value = domainClassData;

        firstRowSelectedEvent();

        const domainSimpleParam = {
          instituteId: useMetaMngInstId,
          dictionaryId: useDctnryId,
          domainClassName: domainClassData[0].domainGroupName,
          jobTypeCode: props.requestPrams.jobTypeCode,
        };

        const domainSimpleList = await getResearchDomainNameListV2(
          domainSimpleParam
        );

        fetchDomainClass(domainSimpleList);
      };

      const onClose = () => {
        emit('close');
      };

      return {
        agGrid,
        domainRowData,
        domainClassRowData,
        domainGroupRowData,
        domainGroupColumnDefs,
        domainClassColumnDefs,
        storedMfgrd036ColumnDefs,
        onClose,
        getDomainSimpleList,
        selectDomainGroup,
        fetchDomainClass,
        handleSetGridApi,
        firstSelectRow, // 최초 선택 row
        searchInput, // 검색어
        onSearchDomainClass, // 도메인명 검색
        getTooltipById,
      };
    },
  };
</script>

<style scoped>
  .search-title {
    font-size: 16px;
    margin-bottom: 2px;
  }

  .search-top {
    display: flex;
    margin-bottom: 10px;
    align-items: center;
    padding: 10px;
  }

  .serach-input-div {
    display: flex;
    margin-left: 10px;
    width: 79%;
  }

  .pop-window .inputs-btns {
    justify-content: space-between;
  }

  :deep(.ag-center-cols-container) {
    cursor: pointer;
  }
</style>
