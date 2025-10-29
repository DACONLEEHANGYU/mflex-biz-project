<template>
  <div class="tab-inner">
    <!-- <ChatbotBtn @open-chatbot-window="onOpenChatbotWindow" /> -->
    <div class="grid-wrap">
      <div class="grid-top">
        <div class="top-row">
          <GridSearch
            ref="targetInputRef"
            :resultCount="resultCount"
            :modelValue="searchInput"
            :columnFcDefs="columnDefs"
            :gridDefs="gridInfoDefs"
            @search-type="handleChangeSearchType"
            @open-chatbot-window="onOpenChatbotWindow"
            @enter="onSearchEnter"
            @save="onSaveGridSettingWindow"
            @remove="onDeleteHeaderInfo"
            @filter-window-closed="onClosePopUpFilter"
            @column-state-changed="onColumnStateChanged"
          />
        </div>
      </div>
      <div class="grid-list">
        <AppGrid
          :rowData="rowData"
          :columnDefs="columnDefs"
          :context="context"
          :resultCount="resultCount"
          rowSelection="single"
          @rowClicked="onRowClicked"
          @gridApi="handleSetGridApi"
          @sort-changed="handleSortChanged"
          @body-scroll="handleScrollChanged"
          @column-state-changed="onColumnStateChanged"
          ref="agGrid"
        />
      </div>
      <AppDialog
        v-model:view="confirmDeleteHeaderInfo.view"
        :title="confirmDeleteHeaderInfo.title"
        :message="confirmDeleteHeaderInfo.message"
        @confirm="onSearchRemove"
      />
      <AppDialog
        v-model:view="saveGridSettingView.view"
        :title="saveGridSettingView.title"
        :message="saveGridSettingView.message"
        @confirm="onSetUserGridSetting"
      />
    </div>
  </div>

  <AppWindow
    :view="chatbotWindowView"
    :moveState="true"
    @close="onCloseChatbotWindow"
    width="500px"
    height="auto"
  >
    <ChatbotWindow
      ref="chatbotWindow"
      :gridId="tab1GridId"
      @bind-query="handleBindQuery"
      @confirm="onConfirmChatbot"
      @close="onCloseChatbotWindow"
    />
  </AppWindow>
</template>

<script>
  // ============================
  // IMPORTS
  // ============================
  import { ref, watchEffect, onBeforeMount, nextTick, onActivated } from 'vue';

  // 분리된 컴포저블들
  import { useSchemaSearchState } from '@/composables/dataMng/schemaSearch/tab1/useSchemaSearchState.js';
  import { useSchemaSearchData } from '@/composables/dataMng/schemaSearch/tab1/useSchemaSearchData.js';
  import { useSchemaSearchHandlers } from '@/composables/dataMng/schemaSearch/tab1/useSchemaSearchHandlers.js';
  import { useSchemaSearchUtils } from '@/composables/dataMng/schemaSearch/tab1/useSchemaSearchUtils.js';

  // 기존 imports
  import { useUiStore } from '@/stores/ui';
  import { useSchemaSearchTabStore } from '@/stores/schemaSearchTab';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import { storeToRefs } from 'pinia';
  import { useAuthStore } from '@/stores/auth';
  import {
    saveGridInfoToStorage,
    getGridInfoFromStorage,
  } from '@/utils/cookies';

  import AppWindow from '@/components/ui/AppWindow.vue';
  import ChatbotBtn from '@/components/common/ChatbotBtn.vue';
  import ChatbotWindow from '@/components/popWindow/ChatbotWindow.vue';

  export default {
    // ============================
    // COMPONENT DEFINITION
    // ============================
    components: {
      TypeCellRenderer,
      GridSearch,
      AppWindow,
      ChatbotBtn,
      ChatbotWindow,
    },

    data() {
      return {
        context: null,
        selectedRow: {},
      };
    },

    // ============================
    // METHODS (Options API)
    // ============================
    methods: {
      onRowDoubleClicked(value) {
        console.log('onRowDoubleClicked ', value);
        this.selectedRow = value;
      },
      onRowClicked(value) {
        console.log('onRowClicked', value);
        this.selectedRow = value;
        const selectedRow = document.querySelectorAll(
          '[class~="ag-row-selected"]'
        );
        selectedRow.forEach((node) => {
          node.classList.remove('ag-row-selected');
        });

        const clickNode = value.id;
        const clickedNode = document.querySelector(`[row-id="${clickNode}"]`);
        clickedNode.classList.add('ag-row-selected');

        this.setTableData(value);
      },
      async onSearchEnter(value) {
        await this.handleSearchEnter(value);
      },
    },

    beforeMount() {
      this.context = { componentParent: this };
      console.log('term beforeMount  ========================');
    },

    // ============================
    // COMPOSITION API SETUP
    // ============================
    setup(props, { emit }) {
      // ============================
      // STORES & AUTH
      // ============================
      const uiStore = useUiStore();
      const { gridColumnDefs } = storeToRefs(uiStore);

      const authStore = useAuthStore();
      const { userInfo, userStngInfo } = storeToRefs(authStore);
      const { useMetaMngInstId, useInfoSysId, useDctnryId, useSbjarId } =
        userStngInfo.value;

      const { setTableData } = useSchemaSearchTabStore();

      // AG 그리드 API 할당
      const agGrid = ref(null);
      const gridApi = ref(null);

      // ============================
      // COMPOSABLES
      // ============================
      const state = useSchemaSearchState();
      const dataHandlers = useSchemaSearchData();
      const eventHandlers = useSchemaSearchHandlers();
      const utils = useSchemaSearchUtils();

      // 상태 초기화
      state.researchQuery.instituteId = useMetaMngInstId;
      state.researchQuery.informationSystemId = useInfoSysId;

      // ============================
      // 매개변수 객체들 생성
      // ============================
      const dataParams = {
        researchQuery: state.researchQuery,
        resultCount: state.resultCount,
        rowData: state.rowData,
        setTableData,
        agGrid,
        searchInput: state.searchInput,
        currentRowIndex: state.currentRowIndex,
      };

      const handlerParams = {
        gridApi,
        columnDefs: state.columnDefs,
        tab1GridId: state.tab1GridId,
        useMetaMngInstId,
        useInfoSysId,
        researchQuery: state.researchQuery,
        rowData: state.rowData,
        currentRowIndex: state.currentRowIndex,
        resultCount: state.resultCount,
      };

      const utilParams = {
        ...handlerParams,
        searchType: state.searchType,
        searchInput: state.searchInput,
        chatbotWindowView: state.chatbotWindowView,
        uiStore,
      };

      // ============================
      // 실제 핸들러 함수들 생성
      // ============================
      const getSortQuery = utils.getSortQuery(state.columnDefs);

      const fetchData = dataHandlers.fetchData({
        ...dataParams,
        getSortQuery,
      });

      const addGridRowData = dataHandlers.addGridRowData({
        ...dataParams,
        getSortQuery,
      });

      const searchDataBinding = dataHandlers.searchDataBinding({
        ...dataParams,
      });

      const handlers = {
        handleSetGridApi: eventHandlers.handleSetGridApi(gridApi),
        handleChangeSearchType: eventHandlers.handleChangeSearchType(
          state.searchType
        ),
        handleColumnStateChanged:
          eventHandlers.handleColumnStateChanged(handlerParams),
        handleSortChanged: eventHandlers.handleSortChanged({
          ...handlerParams,
          searchDataBinding,
        }),
        handleScrollChanged: eventHandlers.handleScrollChanged({
          ...handlerParams,
          addGridRowData,
        }),
        handleSearchEnter: utils.onSearchEnter({
          ...utilParams,
          getSortQuery,
          gridApi,
          searchDataBinding,
        }),
        onClosePopUpFilter: utils.onClosePopUpFilter({
          fetchData,
        }),
        onSetUserGridSetting: utils.onSetUserGridSetting(utilParams),
        onSearchRemove: utils.onSearchRemove(utilParams),
        handleBindQuery: utils.handleBindQuery({
          ...utilParams,
          gridApi,
          fetchData,
        }),
        getGridInfo: utils.getGridInfo(state.tab1GridId),
        transformGridData: utils.transformGridData,
      };

      // ============================
      // 팝업 핸들러들
      // ============================
      const onDeleteHeaderInfo = () => {
        state.confirmDeleteHeaderInfo.view = true;
      };

      const onSaveGridSettingWindow = () => {
        state.saveGridSettingView.view = true;
      };

      const onOpenChatbotWindow = () => {
        state.chatbotWindowView.value = true;
      };

      const onCloseChatbotWindow = () => {
        state.chatbotWindowView.value = false;
      };

      // ============================
      // 그리드 헤더 초기화
      // ============================
      const initializeGridColumnDefs = () => {
        const storedColumnDefs = JSON.parse(getGridInfoFromStorage());
        if (storedColumnDefs && storedColumnDefs[state.tab1GridId.value]) {
          uiStore.setGridColumnDefs(
            state.tab1GridId.value,
            storedColumnDefs[state.tab1GridId.value]
          );
        }
      };

      initializeGridColumnDefs();
      state.columnDefs.value =
        gridColumnDefs.value[state.tab1GridId.value] || [];

      // ============================
      // LIFECYCLE HOOKS
      // ============================
      onBeforeMount(async () => {
        const gridStorage = JSON.parse(getGridInfoFromStorage());

        if (!gridStorage[state.tab1GridId.value]) {
          try {
            const transformedData = await handlers.getGridInfo();
            state.columnDefs.value = transformedData;

            uiStore.setGridColumnDefs('MFGRD060', state.columnDefs.value);

            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', state.columnDefs.value);
            }

            gridStorage[state.tab1GridId.value] = transformedData;
            saveGridInfoToStorage(gridStorage);

            console.log(
              '그리드데이터 할당 =============== : ',
              state.columnDefs.value
            );
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          state.columnDefs.value = gridStorage[state.tab1GridId.value];
        }
        fetchData();
      });

      // ============================
      // WATCHERS
      // ============================
      watchEffect(() => {
        console.log('columnDefs 변경 감지');

        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD060) {
          return;
        }
        state.columnDefs.value = gridColumnDefs.value.MFGRD060;

        state.columnDefs.value = state.columnDefs.value.map((col) => {
          let valueFormatter = null;
          let cellRenderer = null;

          if (
            col.field === 'termName' ||
            col.field === 'domainName' ||
            col.field === 'relatedCodeName'
          ) {
            valueFormatter = (params) => {
              if (
                params.value &&
                Array.isArray(params.value) &&
                params.value.length > 0
              ) {
                return params.value[0].excVal;
              }
              return '';
            };
            cellRenderer = 'TypeCellRenderer';
          }

          return {
            headerName: col.headerName,
            field: col.field,
            hide: col.hide,
            pinned: col.pinned,
            sortable: col.sortable,
            cellClass: col.cellClass,
            width: col.width,
            sort: col.sort,
            sortIndex: col.sortIndex,
            minWidth: col.minWidth,
            suppressSorting: true,
            comparator: () => 0,
            valueFormatter: valueFormatter,
            cellRenderer: cellRenderer,
          };
        });

        console.log('watchEffect 정상동작');
      });

      onActivated(() => {
        nextTick(() => {
          agGrid.value.gridApi.ensureIndexVisible(
            dataParams.currentRowIndex.value,
            'top'
          );
        });
      });

      // ============================
      // RETURN
      // ============================
      return {
        // State
        ...state,
        agGrid,

        // Handlers
        ...handlers,

        // Popup Handlers
        onDeleteHeaderInfo,
        onSaveGridSettingWindow,
        onOpenChatbotWindow,
        onCloseChatbotWindow,

        // Store
        setTableData,
        useMetaMngInstId,
        useInfoSysId,

        // Legacy support (기존 template에서 사용하는 속성들)
        onColumnStateChanged: handlers.handleColumnStateChanged,
        onScrollChanged: handlers.handleScrollChanged,
      };
    },
  };
</script>
