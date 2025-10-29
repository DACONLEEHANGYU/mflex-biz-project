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
              <div class="tab-comtent__row">
                <Tab3View />
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
  import { ref, reactive, watch, shallowRef, defineAsyncComponent } from 'vue';
  import Tab3View from '@/views/diagnosis/components/history/Tab3View.vue';

  import { useSwipperStore } from '@/stores/swipper';
  import { storeToRefs } from 'pinia';
  import { useTabNaviStore } from '@/stores/tabNavi';
  import { useRouter } from 'vue-router';

  defineOptions({ name: 'DiagnosisStatisticsView' });

  const tabList = reactive(['테이블진단', '진단결과']);

  const activeTab = ref(1);

  const router = useRouter();
  const tabNaviStore = useTabNaviStore();
  const { setTabNaviData, setDictionaryMngState } = tabNaviStore;

  const { swipper } = storeToRefs(useSwipperStore());

  const Tab1View = defineAsyncComponent(() =>
    import('@/views/diagnosis/components/table/Tab1View.vue')
  );
  const Tab2View = defineAsyncComponent(() =>
    import('@/views/diagnosis/components/result/Tab2View.vue')
  );

  const currentTab = shallowRef(Tab1View);

  watch(
    activeTab,
    () => {
      if (activeTab.value == 1) {
        currentTab.value = Tab1View;
      } else if (activeTab.value == 2) {
        currentTab.value = Tab2View;
        console.log('선택 탭 2 ======================');
      }
    },
    {
      immediate: true,
    }
  );
</script>

<style lang="scss" scoped>
  .contents-wrap {
    height: none;
  }
</style>
