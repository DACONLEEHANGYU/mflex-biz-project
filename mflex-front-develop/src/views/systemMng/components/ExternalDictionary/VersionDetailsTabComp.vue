<template>
  <section>
    <div>
      <div class="content-box" style="height: 725px">
        <div class="content-area">
          <div class="content-row">
            <section class="row-wrap">
              <div class="bg-box">
                <AppTab :tabList="tabList" v-model="activeTab" mode="if">
                </AppTab>
                <div class="tab-comtent__row">
                  <keep-alive exclude="Tab1View,Tab2View,Tab3View,Tab4View">
                    <component :is="currentTab" />
                  </keep-alive>
                  <!-- <keep-alive :key="cacheKey">
                  <component :is="currentTab" />
                </keep-alive> -->
                </div>
              </div>
              <!-- <AppWindow :view="filterWindowView" @close="onCloseFilterWindow" width="1000px" height="auto">
              <FilterSetWindow @confirm="onFilterConfirm" @close="onCloseFilterWindow" />
            </AppWindow> -->
            </section>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import {
    ref,
    reactive,
    watch,
    shallowRef,
    defineAsyncComponent,
    onActivated,
    onMounted,
  } from 'vue';
  import { useRoute } from 'vue-router';
  import { storeToRefs } from 'pinia';
  import { useSwipperStore } from '@/stores/swipper';
  import { useDictionarySaerchTabStore } from '@/stores/dictionarySearchTab';
  import { getUserMenuFromStorage, getUserStateStorage } from '@/utils/cookies';

  const userMenuList = JSON.parse(getUserMenuFromStorage());

  const Tab1View = defineAsyncComponent(() =>
    import(
      '@/views/systemMng/components/ExternalDictionary/versionDetailsTab/Tab1View.vue'
    )
  );
  const Tab2View = defineAsyncComponent(() =>
    import(
      '@/views/systemMng/components/ExternalDictionary/versionDetailsTab/Tab2View.vue'
    )
  );
  const Tab3View = defineAsyncComponent(() =>
    import(
      '@/views/systemMng/components/ExternalDictionary/versionDetailsTab/Tab3View.vue'
    )
  );
  const Tab4View = defineAsyncComponent(() =>
    import('@/views/dictionarySearch/components/tab4/Tab4View.vue')
  );

  // const tabList = reactive(['용어', '단어', '도메인', '코드']);
  // 국기원 시연용
  const tabList = reactive(['용어', '단어', '도메인']);
  const activeTab = ref(1);

  const cacheKey = ref(0);
  function resetCache() {
    cacheKey.value = Math.random();
  }
  onActivated(() => {
    // 초기화 시 activeTab을 1로 설정
    console.log('dictionary Search === onActivated');
    resetCache();
    // activeTab.value = 1;
  });

  const dictionarySearchTabStore = useDictionarySaerchTabStore();
  const { searchTabState } = storeToRefs(dictionarySearchTabStore);

  const route = useRoute();

  // 라우트에서 searchType 파라미터를 받아와 탭 선택
  const searchTypeToTabIndex = {
    term: 1,
    word: 2,
    domain: 3,
    code: 4,
  };

  // watch(
  //   () => route.params.searchType,
  //   console.log('dictionarySearch-route :', route),
  //   (newSearchType) => {
  //     activeTab.value = searchTypeToTabIndex[newSearchType] || 1;
  //   },
  //   { immediate: true }
  // );

  console.log('searchTabState : ', searchTabState);

  // 사이드바에서 선택한 탭에 따라 탭 선택
  // watch(
  //   () => searchTabState.value,
  //   (newVal) => {
  //     console.log('newVal ============================', newVal);
  //     if (newVal === 'term') {
  //       activeTab.value = 1;
  //     } else if (newVal === 'word') {
  //       activeTab.value = 2;
  //     } else if (newVal === 'domain') {
  //       activeTab.value = 3;
  //     } else {
  //       activeTab.value = 4;
  //     }
  //   },
  //   {
  //     immediate: true,
  //   }
  // );

  const currentTab = shallowRef(Tab1View);

  watch(
    activeTab,
    () => {
      if (activeTab.value == 1) {
        currentTab.value = Tab1View;
      } else if (activeTab.value == 2) {
        currentTab.value = Tab2View;
        console.log('선택 탭 2 ======================');
      } else if (activeTab.value == 3) {
        currentTab.value = Tab3View;
      } else {
        currentTab.value = Tab4View;
      }
    },
    {
      immediate: true,
    }
  );

  // // 현재 경로 확인
  // onMounted(() => {
  //   console.log('dictionary Search === onMounted');

  //   console.log('getRoutes() : ', route);

  //   if (route.meta.location === '단어조회') {
  //     activeTab.value = 2;
  //   } else if (route.meta.location === '도메인조회') {
  //     activeTab.value = 3;
  //   } else if (route.meta.location === '코드조회') {
  //     activeTab.value = 4;
  //   }
  // });

  const { swipper } = storeToRefs(useSwipperStore());

  watch(swipper, (value) => {
    console.log('TermView swipperState watch', value);
    // updateHeaderStyle(value);
  });
</script>

<style lang="scss" scoped></style>
