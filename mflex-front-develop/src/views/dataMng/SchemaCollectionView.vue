<template>
  <section
    :class="{
      'contents-wrap': swipper === true,
      'contents-wrap-none-history': swipper === false,
    }"
  >
    <div class="content-box">
      <div class="content-area">
        <div class="content-row">
          <section class="row-wrap">
            <div class="bg-box">
              <AppTab :tabList="tabList" v-model="activeTab" mode="if">
              </AppTab>
              <div class="tab-comtent__row">
                <keep-alive exclude="Tab1View,Tab2View">
                  <component :is="currentTab" />
                </keep-alive>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>

    <!-- 데이터베이스 연결정보 알림 팝업 -->
    <AppWindow
      :view="dbConnectionAlertWindowView"
      @close="onCloseDbConnectionAlertWindow"
      width="530px"
      height="auto"
    >
      <ConfirmWindow
        :popInfo="popInfo"
        @confirm="onConfirmDbConnectionAlert"
        @close="onCloseDbConnectionAlertWindow"
      />
    </AppWindow>
  </section>
</template>

<script setup>
  import {
    ref,
    onActivated,
    onDeactivated,
    onUnmounted,
    defineAsyncComponent,
    watch,
    shallowRef,
    nextTick,
    computed,
  } from 'vue';

  import { useSwipperStore } from '@/stores/swipper';
  import { useSchemaCollectionStore } from '@/stores/schemaCollection';
  import { storeToRefs } from 'pinia';

  import AppWindow from '@/components/ui/AppWindow.vue';
  import ConfirmWindow from '@/components/popWindow/ConfirmWindow.vue';

  defineOptions({ name: 'SchemaCollectionView' });

  const { swipper } = storeToRefs(useSwipperStore());

  // 탭 상태
  const { tabState, connectionList } = storeToRefs(useSchemaCollectionStore());

  const Tab1View = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaCollection/tab1/Tab1View.vue')
  );

  const Tab2View = defineAsyncComponent(() =>
    import('@/views/dataMng/components/schemaCollection/tab2/Tab2View.vue')
  );

  const tabList = ['DB연결정보', 'DB수집결과'];
  const activeTab = ref(1);

  const cacheKey = ref(0);
  function resetCache() {
    cacheKey.value = Math.random();
  }

  onActivated(() => {
    console.log('SchemaCollection === onActivated');
    resetCache();
  });

  const currentTab = shallowRef(Tab1View);

  // Tab2로 이동 가능한지 여부 확인
  const canSwitchToTab2 = computed(() => {
    return connectionList.value && connectionList.value.length > 0;
  });

  // 알림창 관련 상태
  const dbConnectionAlertWindowView = ref(false);
  const popInfo = ref({
    state: 'error',
    popTitle: 'DB 연결정보 알림',
    popMessages:
      'DB 연결정보가 없습니다. <br>DB 연결정보를 먼저 등록해 주세요.',
    confirmBtnText: '확인',
    cancelBtnText: '연결정보 등록하러가기',
  });

  // 알림창 닫기
  const onCloseDbConnectionAlertWindow = () => {
    dbConnectionAlertWindowView.value = false;
    ensureTab1IsSelected();
  };

  // Tab1이 선택되도록 하는 함수
  const ensureTab1IsSelected = () => {
    activeTab.value = 1;
    currentTab.value = Tab1View;
    tabState.value = 1;
    console.log('Tab1으로 설정됨');
  };

  // 알림창 확인 버튼 클릭
  const onConfirmDbConnectionAlert = () => {
    dbConnectionAlertWindowView.value = false;
    nextTick(() => {
      ensureTab1IsSelected();
    });
  };

  // 컴포넌트가 비활성화될 때 실행
  onDeactivated(() => {
    console.log('SchemaCollection 컴포넌트 비활성화');
    resetComponentState();
  });

  // 컴포넌트가 언마운트될 때 실행
  onUnmounted(() => {
    console.log('SchemaCollection 컴포넌트 언마운트');
    resetComponentState();
  });

  // 컴포넌트 상태 초기화 함수
  const resetComponentState = () => {
    // 탭 상태 초기화
    activeTab.value = 1;
    tabState.value = 1;
    currentTab.value = Tab1View;
    dbConnectionAlertWindowView.value = false;
  };

  // activeTab 변경 감시 (단일 통합 watch)
  watch(
    activeTab,
    (newValue) => {
      console.log('activeTab 변경됨:', newValue);

      // tabState와의 무한 루프 방지
      if (tabState.value !== newValue) {
        if (newValue === 1) {
          currentTab.value = Tab1View;
          tabState.value = 1;
        } else if (newValue === 2) {
          // Tab2로 이동하려고 할 때 connectionList 체크
          if (canSwitchToTab2.value) {
            currentTab.value = Tab2View;
            tabState.value = 2;
          } else {
            // connectionList가 비어있으면 알림창 표시
            dbConnectionAlertWindowView.value = true;
            // 탭은 Tab1으로 유지
            nextTick(() => {
              activeTab.value = 1;
              currentTab.value = Tab1View;
              tabState.value = 1;
            });
          }
        }
      }
    },
    { immediate: true }
  );

  // tabState 변경 감시 (단일 통합 watch)
  watch(tabState, (newValue) => {
    console.log('tabState 변경됨:', newValue);

    // activeTab과의 무한 루프 방지
    if (activeTab.value !== newValue) {
      if (newValue === 2 && !canSwitchToTab2.value) {
        // Tab2로 이동하려고 하지만 connectionList가 비어있는 경우
        popInfo.value.popMessages =
          'DB 연결정보가 없습니다. DB 연결정보를 먼저 등록해 주세요.';
        dbConnectionAlertWindowView.value = true;

        nextTick(() => {
          tabState.value = 1;
          activeTab.value = 1;
          currentTab.value = Tab1View;
        });
      } else {
        // 유효한 탭 전환인 경우 activeTab과 currentTab 업데이트
        activeTab.value = newValue;
        if (newValue === 1) {
          currentTab.value = Tab1View;
        } else if (newValue === 2) {
          currentTab.value = Tab2View;
        }
      }
    }
  });

  // connectionList 변경 감시
  watch(connectionList, (newValue) => {
    if (newValue.length === 0 && activeTab.value === 2) {
      // connectionList가 비어있고 현재 Tab2에 있으면 알림창 표시
      popInfo.value.popMessages =
        'DB 연결정보가 없어 DB수집결과 탭을 볼 수 없습니다.';
      dbConnectionAlertWindowView.value = true;

      // Tab1으로 전환
      nextTick(() => {
        ensureTab1IsSelected();
      });
    }
  });
</script>

<style lang="scss" scoped>
  .schema-info-box {
    display: flex;
    position: absolute;
    width: 1700px;
    right: 20px;
    top: 13px;
    z-index: 9999;
  }

  .schema-info {
    flex: 1;
  }

  /* 탭 비활성화 시 시각적 표시 (선택사항) */
  .tabs-list .tab-item:nth-child(2) {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.05);
      pointer-events: none;
      opacity: v-bind('!canSwitchToTab2 ? 1 : 0');
      transition: opacity 0.3s ease;
    }
  }
</style>
