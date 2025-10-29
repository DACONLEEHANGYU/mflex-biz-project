<template>
  <div class="tab-inner">
    <!-- <ChatbotBtn @open-chatbot-window="onOpenChatbotWindow" /> -->
    <div class="grid-wrap">
      <div class="grid-top">
        <div class="top-row">
          <GridSearch
            :resultCount="resultCount"
            :modelValue="searchInput"
            :columnFcDefs="columnDefs"
            :gridDefs="gridInfoDefs"
            @search-type="handleChangeSearchType"
            @open-chatbot-window="onOpenChatbotWindow"
            @enter="onSearchEnter"
            @save="onSaveGridSettingWindow"
            @remove="onDeleteHeaderInfo"
            @filter-window-closed="onFilterWindowClosed"
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
          @rowDoubleClicked="onRowDoubleClicked"
          @gridApi="handleSetGridApi"
          @rowClicked="onRowClicked"
          @body-scroll="handleScrollChanged"
          @sort-changed="handleSortChanged"
          @column-state-changed="onColumnStateChanged"
          ref="agGrid"
        />
      </div>
      <AppDialog
        v-model:view="confirmDeleteHeaderInfo.view"
        :title="confirmDeleteHeaderInfo.title"
        :message="confirmDeleteHeaderInfo.message"
        @confirm="onSearchRemove(gridApi, tab2GridId, columnDefs)"
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
    @close="onCloseChatbotWindow"
    :moveState="true"
    width="500px"
    height="auto"
  >
    <ChatbotWindow
      :gridId="tab2GridId"
      @bind-query="handleBindQuery"
      @confirm="onConfirmChatbot"
      @close="onCloseChatbotWindow"
    />
  </AppWindow>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  // ============================
  // IMPORTS
  // ============================
  import {
    reactive,
    ref,
    nextTick,
    watchEffect,
    onBeforeMount,
    onActivated,
  } from 'vue';

  // 분리된 컴포저블들
  import { useSchemaSearchTab2State } from '@/composables/dataMng/schemaSearch/tab2/useSchemaSearchTab2State.js';
  import { useSchemaSearchTab2Data } from '@/composables/dataMng/schemaSearch/tab2/useSchemaSearchTab2Data.js';
  import { useSchemaSearchTab2Handlers } from '@/composables/dataMng/schemaSearch/tab2/useSchemaSearchTab2Handlers.js';
  import { useSchemaSearchTab2Utils } from '@/composables/dataMng/schemaSearch/tab2/useSchemaSearchTab2Utils.js';

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
      ChatbotBtn,
      AppWindow,
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

        this.$emit('row-selected', value);
        this.setColumnData(value);
      },
      async onSearchEnter(value) {
        await this.handleSearchEnter(value);
      },
    },

    beforeMount() {
      this.context = { componentParent: this };
      console.log('column beforeMount  ========================');
    },

    emits: ['first-row-selected', 'row-selected', 'open-filter-window'],

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

      const { setColumnData } = useSchemaSearchTabStore();

      // AG 그리드 API 할당
      const agGrid = ref(null);
      const gridApi = ref(null);

      // ============================
      // COMPOSABLES
      // ============================
      const state = useSchemaSearchTab2State();
      const dataHandlers = useSchemaSearchTab2Data();
      const eventHandlers = useSchemaSearchTab2Handlers();
      const utils = useSchemaSearchTab2Utils();

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
        setColumnData,
        agGrid,
        searchInput: state.searchInput,
        currentRowIndex: state.currentRowIndex,
        emit,
      };

      const handlerParams = {
        gridApi,
        columnDefs: state.columnDefs,
        tab2GridId: state.tab2GridId,
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
        onColumnStateChanged:
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
          rowData: state.rowData,
        }),
        onFilterWindowClosed: utils.onFilterWindowClosed({
          fetchData,
          columnDefs: state.columnDefs,
          gridApi,
        }),
        onSetUserGridSetting: utils.onSetUserGridSetting(utilParams),
        onSearchRemove: utils.onSearchRemove(utilParams),
        handleBindQuery: utils.handleBindQuery({
          ...utilParams,
          gridApi,
          fetchData,
          getSortQuery,
        }),
        getGridInfo: utils.getGridInfo(state.tab2GridId),
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
        if (storedColumnDefs && storedColumnDefs[state.tab2GridId.value]) {
          uiStore.setGridColumnDefs(
            state.tab2GridId.value,
            storedColumnDefs[state.tab2GridId.value]
          );
        }
      };

      initializeGridColumnDefs();
      state.columnDefs.value =
        gridColumnDefs.value[state.tab2GridId.value] || [];

      // ============================
      // LIFECYCLE HOOKS
      // ============================
      onBeforeMount(async () => {
        console.log('column beforeMount  ========================');

        const gridStorage = JSON.parse(getGridInfoFromStorage());

        if (!gridStorage[state.tab2GridId.value]) {
          try {
            const transformedData = await handlers.getGridInfo();
            state.columnDefs.value = transformedData;

            uiStore.setGridColumnDefs('MFGRD061', state.columnDefs.value);

            if (gridApi.value) {
              gridApi.value.setGridOption('columnDefs', state.columnDefs.value);
            }

            gridStorage[state.tab2GridId.value] = transformedData;
            saveGridInfoToStorage(gridStorage);

            console.log(
              '그리드데이터 할당 =============== : ',
              state.columnDefs.value
            );
          } catch (error) {
            console.error('Error in onBeforeMount:', error);
          }
        } else {
          state.columnDefs.value = gridStorage[state.tab2GridId.value];
        }
        fetchData();
      });

      // ============================
      // WATCHERS
      // ============================
      watchEffect(() => {
        console.log('columnDefs 변경 감지');

        if (!gridColumnDefs.value || !gridColumnDefs.value.MFGRD061) {
          return;
        }
        state.columnDefs.value = gridColumnDefs.value.MFGRD061;

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
        setColumnData,
        useMetaMngInstId,
        useInfoSysId,
      };
    },
  };
</script>
