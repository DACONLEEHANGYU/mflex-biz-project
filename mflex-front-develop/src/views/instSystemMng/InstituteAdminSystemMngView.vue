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
                <keep-alive :key="cacheKey">
                  <component :is="currentTab" />
                </keep-alive>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import {
    ref,
    onActivated,
    defineAsyncComponent,
    watch,
    shallowRef,
  } from 'vue';
  import { useSwipperStore } from '@/stores/swipper';
  import { storeToRefs } from 'pinia';

  defineOptions({ name: 'InstAdminView' });

  const { swipper } = storeToRefs(useSwipperStore());

  // const Tab1View = defineAsyncComponent(() =>
  //   import('@/views/instSystemMng/components/tab6/OrganizationSetView.vue')
  // );
  const Tab1View = defineAsyncComponent(() =>
    import('@/views/instSystemMng/components/tab1/DictionarySet.vue')
  );
  const Tab2View = defineAsyncComponent(() =>
    import('@/views/instSystemMng/components/tab2/WorkSet.vue')
  );
  const Tab3View = defineAsyncComponent(() =>
    import('@/views/instSystemMng/components/tab3/DatabaseSet.vue')
  );
  const Tab4View = defineAsyncComponent(() =>
    import(
      '@/views/instSystemMng/components/tab4/InstituteExternalDictionaryView.vue'
    )
  );
  const Tab5View = defineAsyncComponent(() =>
    import('@/views/instSystemMng/components/approvalMng/ApprovalMngView.vue')
  );
  const Tab6View = defineAsyncComponent(() =>
    import('@/views/instSystemMng/components/tab5/TopComp.vue')
  );

  const tabList = [
    // '조직설정',
    '사전설정',
    '업무설정',
    '데이터베이스설정',
    '공식사전관리',
    '결재선관리',
    '사용자현황',
  ];
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

  const currentTab = shallowRef(Tab1View);

  watch(activeTab, () => {
    if (activeTab.value == 1) {
      currentTab.value = Tab1View;
    } else if (activeTab.value == 2) {
      currentTab.value = Tab2View;
    } else if (activeTab.value == 3) {
      currentTab.value = Tab3View;
    } else if (activeTab.value == 4) {
      currentTab.value = Tab4View;
    } else if (activeTab.value == 5) {
      currentTab.value = Tab5View;
    } else if (activeTab.value == 6) {
      currentTab.value = Tab6View;
    }
  });
</script>

<style lang="scss" scoped></style>
