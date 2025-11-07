<template>
  <div class="tab-inner pb0">
    <!-- DB 연결정보 목록 -->
    <!-- <DbConnectionListComp @no-data="handleNoData" /> -->

    <button
      class="btn-s blue mb10 mt5"
      @click="onCollectionConfrim"
      :disabled="!dbConnectionTestState || regState != 0"
      title="온라인 스키마 수집"
    >
      온라인 스키마 수집
    </button>
    <button
      class="btn-s dark-blue mb10 mt5"
      @click="onOpenOfflineSchemaView"
      :disabled="regState != 0"
      title="오프라인 스키마 수집"
    >
      오프라인 스키마 수집
    </button>

    <div class="full-contents pl10 details-wrap">
      <!-- DB 상세정보 -->
      <div class="db-connection-details">
        <DbConnectionDetailsComp />
      </div>
      <!-- DB 스키마 연결 -->
      <DbSchemaSelectComp />
    </div>

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
  </div>

  <!-- 온라인 스키마수집 알림창 -->
  <AppDialog
    v-model:view="collectionConfirmState.view"
    :title="collectionConfirmState.title"
    :message="collectionConfirmState.message"
    @confirm="onCollection()"
  />

  <AppWindow
    :view="offlineSchemaView"
    @close="onCloseOfflineSchemaView"
    width="600px"
    height="auto"
  >
    <OfflineSchemaWindow
      :selectDbInfo="selectDbInfo"
      @close="onCloseOfflineSchemaView"
    />
  </AppWindow>
</template>

<!-- eslint-disable vue/no-unused-components -->
<script>
  import { ref, reactive, watch } from 'vue';
  import { storeToRefs } from 'pinia';
  import { useSchemaCollectionStore } from '@/stores/schemaCollection';
  import { getOnlineSchemaCollection } from '@/utils/mflexApi/dataMng/schemaCollectionApi';
  import DbConnectionListComp from './DbConnectionListComp.vue';
  import DbConnectionDetailsComp from './DbConnectionDetailsComp.vue';
  import OfflineSchemaWindow from '@/components/popWindow/OfflineSchemaWindow.vue';
  import DbSchemaSelectComp from './DbSchemaSelectComp.vue';
  import AppWindow from '@/components/ui/AppWindow.vue';
  import TypeCellRenderer from '@/utils/TypeCellRenderer.js';
  import GridSearch from '@/components/grid/GridSearch.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';
  import { DragCol } from 'vue-resizer';

  export default {
    components: {
      DbConnectionListComp, // (화면좌측) DB 연결정보 목록
      DbConnectionDetailsComp, // (화면우측 상단) DB연결 상세 정보
      DbSchemaSelectComp, // (화면우측 하단) DB 스키마 선택
      OfflineSchemaWindow, // 오프라인 스키마 수집 팝업
      AppWindow, // 공통 팝업
      TypeCellRenderer,
      GridSearch,
      AppTooltip,
      DragCol,
    },

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
    },
    beforeMount() {
      this.context = { componentParent: this };
    },

    setup(props) {
      const { selectDbInfo, selectDbDetails, dbConnectionTestState, regState } =
        storeToRefs(useSchemaCollectionStore());

      const { setTabState, setRegState } = useSchemaCollectionStore();

      const rowDataMenuGroup = reactive({});
      const columnDefsConnectionDB = reactive([
        {
          headerName: '번호',
          field: 'no',
          cellClass: 'ag-left-aligned-cell',
          width: 60,
        },
        {
          headerName: 'DB 연결정보명',
          field: 'dbConnectionName',
          cellClass: 'ag-left-aligned-cell',
          width: 335,
        },
        {
          headerName: 'DBMS',
          field: 'dbms',
          cellClass: 'grid-cell-centered',
          width: 180,
        },
      ]);

      const offlineSchemaView = ref(false);

      const onOpenOfflineSchemaView = () => {
        offlineSchemaView.value = true;
        console.log('오프라인 스키마 수집 클릭');
      };
      const onCloseOfflineSchemaView = () => {
        offlineSchemaView.value = false;
        console.log('오프라인 스키마 수집 닫기 클릭');
      };

      const rowDataLeft = reactive({});

      const collectionConfirmState = reactive({
        view: false,
        title: '온라인 스키마 수집',
        message: '온라인 스키마 수집을 실행하시겠습니까?',
      });

      const onCollectionConfrim = () => {
        collectionConfirmState.view = true;
      };

      const onOfflineCollectionConfrim = () => {
        setTabState(2);
      };

      const onCollection = async () => {
        const response = await getOnlineSchemaCollection({
          databaseLinkId: selectDbInfo.value.databaseLinkId,
          instituteId: selectDbInfo.value.instituteId,
        });
        // 완료 시 DB 수집결과로 변경
        setTabState(2);
      };

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

      const handleNoData = (value) => {
        console.log('handleNoData', value);
        // regState.value = 1;
        setRegState(1);
      };

      // 작업구분 변경
      watch(regState, (newValue) => {
        console.log('작업구분 변경', newValue);
      });

      return {
        dbConnectionTestState,
        onCollection,
        onCollectionConfrim,
        columnDefsConnectionDB,
        collectionConfirmState,
        rowDataMenuGroup,
        rowDataLeft,
        saveConfirmState,
        cancelConfirmState,
        onSaveConfirm,
        onSave,
        onCancel,
        onReCancel,
        offlineSchemaView,
        onOpenOfflineSchemaView,
        onCloseOfflineSchemaView,
        onOfflineCollectionConfrim,
        selectDbInfo,
        handleNoData,
        regState,
      };
    },
  };
</script>

<style scoped>
  .db-btn-area {
    display: flex;
    justify-content: space-between;
    margin-top: 5px;
  }
  .inputs-wrap {
    height: 90%;
  }
  .input-form .input-table td {
    padding: 0px 0px 3px 10px;
  }
  .grid-move__data {
    height: 90%;
  }
  /* .db-connection-details {
    border: 1px solid #ccc;
    padding: 5px;
  } */
  /* .db-schema-connections .menugroup-bottom .grid-move__data {
    border: 2px solid;
    height: 100%;
  } */
  .details-wrap {
    border: 1px solid #ccc;
  }
  .full-contents {
    height: 95%;
  }
</style>
