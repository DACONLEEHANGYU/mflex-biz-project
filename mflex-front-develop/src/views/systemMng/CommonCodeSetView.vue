<template>
  <section class="contents-wrap">
    <div class="content-box">
      <div class="content-area">
        <div class="search-row"></div>
        <div class="content-row">
          <div class="bg-box">
            <AppTab :tabList="tabList" v-model="activeTab" mode="if"> </AppTab>
            <div class="tab-comtent__row">
              <keep-alive>
                <component :is="currentTab" />
              </keep-alive>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, reactive, watch, shallowRef, defineAsyncComponent } from 'vue';
  const Tab1View = defineAsyncComponent(() =>
    import('@/views/systemMng/components/commonCodeSet/tab1/Tab1View.vue')
  );
  const Tab2View = defineAsyncComponent(() =>
    import('@/views/systemMng/components/commonCodeSet/tab2/Tab2View.vue')
  );

  const tabList = reactive(['공통코드', '공통코드값']);
  const activeTab = ref(1);

  const currentTab = shallowRef(Tab1View);

  watch(activeTab, () => {
    if (activeTab.value == 1) {
      currentTab.value = Tab1View;
    } else {
      currentTab.value = Tab2View;
    }
  });
</script>
