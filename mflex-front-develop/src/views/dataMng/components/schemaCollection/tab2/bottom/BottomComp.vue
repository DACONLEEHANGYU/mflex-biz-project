<template>
  <section class="row-wrap">
    <div class="tab-header">
      <div class="title-s">
        DB 수집결과 내역
        <AppTooltip :htmlContent="getTooltipById('dbCollectionResultList')">
        </AppTooltip>
      </div>

      <div class="btn-area">
        <button class="btn-s" @click="onOpenCollectionExclude">수집제외</button>
        <button class="btn-s" @click="onOpenApplyDatabase">관리 DB 적용</button>
      </div>
    </div>
    <AppTab :tabList="tabList" v-model="activeTab" mode="if"> </AppTab>
    <div class="tab-comtent__row">
      <keep-alive>
        <component :is="currentTab" />
      </keep-alive>
    </div>
  </section>

  <AppWindow
    v-model:view="collectionExcludeState.view"
    @close="onCloseCollectionExclude"
    width="800px"
    height="auto"
  >
    <CollectionExcludeWindow
      :selectData="
        activeTab == 1
          ? selectTableList
          : activeTab == 2
          ? selectFunctionList
          : selectProcedureList
      "
      @confirm="onConfirmCollectionExclude"
      @close="onCloseCollectionExclude"
    />
  </AppWindow>

  <!-- 관리 DB 적용  -->
  <AppDialog
    v-model:view="applyConfirmState.view"
    :title="applyConfirmState.title"
    :message="applyConfirmState.message"
    @confirm="onApplyDatabase"
  />

  <!-- 사전표준화(테이블정제 페이지) 이동 -->
  <AppWindow
    :view="confirmWindowView"
    @close="onCloseConfirmWindow"
    width="600px"
    height="auto"
  >
    <ConfirmWindow
      :popInfo="popInfo"
      @confirm="onRedirectTableRefine"
      @close="onCloseConfirmWindow"
    />
  </AppWindow>
</template>

<script setup>
  import { storeToRefs } from 'pinia';
  import { useRouter } from 'vue-router';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { useSchemaCollectionStore } from '@/stores/schemaCollection';
  import { ref, reactive, defineAsyncComponent, shallowRef, watch } from 'vue';
  import {
    applyManageDb,
    getDbConnectionDetails,
  } from '@/utils/mflexApi/dataMng/schemaCollectionApi';
  import AppWindow from '@/components/ui/AppWindow.vue';

  import { useHelpToolTipStore } from '@/stores/helpToolTip';
  import CollectionExcludeWindow from '@/components/popWindow/CollectionExcludeWindow.vue';
  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';
  import AppTooltip from '@/components/ui/AppTooltip.vue';

  const { tooltipList } = storeToRefs(useHelpToolTipStore());
  const { getTooltipById } = useHelpToolTipStore();

  const router = useRouter();

  const tabNaviStore = useTabNaviStore();
  const { setTabNaviData } = tabNaviStore;

  const {
    selectCollection,
    selectTableList,
    selectFunctionList,
    selectProcedureList,
  } = storeToRefs(useSchemaCollectionStore());
  const {
    setUpdateManageDB,
    setIsExcludeTable,
    setIsExcludeFunction,
    setIsExcludeProcedure,
  } = useSchemaCollectionStore();

  const Bottomtab1 = defineAsyncComponent(() => import('./BottomTab1.vue'));
  const BottomTab2 = defineAsyncComponent(() => import('./BottomTab2.vue'));
  const BottomTab3 = defineAsyncComponent(() => import('./BottomTab3.vue'));

  const tabList = reactive(['테이블', '함수', '프로시저']);
  const activeTab = ref(1);

  const collectionExcludeState = reactive({
    view: false,
  });

  const onOpenCollectionExclude = () => {
    collectionExcludeState.view = true;
  };

  const onConfirmCollectionExclude = () => {
    // 테이블 탭의 경우
    if (activeTab.value == 1) {
      console.log('테이블 탭의 경우', selectTableList.value);
      setIsExcludeTable(true);
    } else if (activeTab.value == 2) {
      // 함수 탭의 경우
      console.log('함수 탭의 경우', selectFunctionList.value);
      setIsExcludeFunction(true);
    } else if (activeTab.value == 3) {
      // 프로시저 탭의 경우
      console.log('프로시저 탭의 경우', selectProcedureList.value);
      setIsExcludeProcedure(true);
    }
    collectionExcludeState.view = false;
  };
  const onCloseCollectionExclude = () => {
    collectionExcludeState.view = false;
  };

  // 관리 DB 적용 confirm 및 상태값 저장
  const applyConfirmState = reactive({
    view: false,
    title: '관리 DB 적용',
    message: '수집된 스키마를 관리 DB에 적용 하시겠습니까?',
  });

  const onOpenApplyDatabase = () => {
    applyConfirmState.view = true;
  };

  // 관리 DB 적용 API 호출
  const onApplyDatabase = async () => {
    const data = {
      instituteId: selectCollection.value.instituteId,
      databaseId: selectCollection.value.databaseId,
      collectionId: selectCollection.value.collectionId,
    };

    const response = await applyManageDb(data);

    if (response.status === 200) {
      // 성공
      setUpdateManageDB(true);
    } else {
      // 실패
      popInfo.value.state = 'error';
      popInfo.value.popTitle = '관리영역 반영 알림';
      popInfo.value.popMessages = '관리영역 반영이 실패하였습니다.';
    }
    onOpenRedirectTableRefine();
    applyConfirmState.view = false;
  };

  const popInfo = ref({
    state: 'redirect',
    popTitle: '관리영역 반영 알림',
    popMessages: `<span style="font-weight : 900;">관리영역 반영이 완료되었습니다.</span>
    테이블 정제 페이지로 이동하여 정제를 진행하실 수 있습니다.
    <div style="margin-top: 10px; font-size:18px;">※ 관리영역 정보는 <span style="font-weight : 900;">'스키마조회'</span> 에서도 확인하실 수 있습니다.</div>`,

    confirmBtnText: '테이블정제 이동',
    cancelBtnText: '닫기',
  });

  const confirmWindowView = ref(false);

  const onOpenRedirectTableRefine = () => {
    confirmWindowView.value = true;
  };
  const onCloseConfirmWindow = () => {
    console.log('onCloseConfirmWindow');
    confirmWindowView.value = false;
  };

  const onRedirectTableRefine = () => {
    console.log('onRedirectTableRefine');
    confirmWindowView.value = false;
    // 테이블 정제 페이지로 이동
    setTabNaviData({ title: '테이블정제', path: '/actualizing/table' });
    router.replace('/actualizing/table');
  };

  watch(selectCollection, () => {
    console.log('selectCollection:', selectCollection.value);
  });
  const currentTab = shallowRef(Bottomtab1);
  watch(activeTab, () => {
    if (activeTab.value == 1) {
      currentTab.value = Bottomtab1;
    } else if (activeTab.value == 2) {
      currentTab.value = BottomTab2;
    } else if (activeTab.value == 3) {
      currentTab.value = BottomTab3;
    }
  });
</script>
